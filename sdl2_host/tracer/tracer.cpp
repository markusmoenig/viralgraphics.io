/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Luis Jimenez <kuko@kvbits.com>.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#include "tracer.h"

#include <embree2/rtcore.h>
#include <embree2/rtcore_ray.h>

#include "math/affinespace.h"
#include "math/linearspace3.h"
#include "math/vec3.h"

#include "scene.h"

#include <stdint.h>
#include <stdio.h>
#include <assert.h>

#include "renderers/debugrenderer.h"
#include "renderers/integratorrenderer.h"
#include "cameras/depthoffieldcamera.h"
#include "cameras/pinholecamera.h"
#include "api/scene_flat.h"
#include "tonemappers/defaulttonemapper.h"
#include "sys/taskscheduler.h"
#include "sys/sync/mutex.h"
#include "shapes/sphere.h"
#include "shapes/disk.h"
#include "shapes/triangle.h"
#include "lights/ambientlight.h"
#include "lights/distantlight.h"
#include "lights/directionallight.h"
#include "materials/metal.h"
#include "materials/plastic.h"

#include "util.h"

#include "jswrapper.hpp"

using namespace embree;

/* error reporting function */
void error_handler(const RTCError code, const int8* str)
{
    printf("Embree: ");
    switch (code) {
    case RTC_UNKNOWN_ERROR: printf("RTC_UNKNOWN_ERROR"); break;
    case RTC_INVALID_ARGUMENT: printf("RTC_INVALID_ARGUMENT"); break;
    case RTC_INVALID_OPERATION: printf("RTC_INVALID_OPERATION"); break;
    case RTC_OUT_OF_MEMORY: printf("RTC_OUT_OF_MEMORY"); break;
    case RTC_UNSUPPORTED_CPU: printf("RTC_UNSUPPORTED_CPU"); break;
    default: printf("invalid error code"); break;
    }
    if (str) {
        printf(" (");
        while (*str) putchar(*str++);
        printf(")\n");
    }
    abort();
}


#define RT_COMMAND_HEADER Lock<MutexSys> lock(mutex); g_time++;

namespace embree
{
    int g_serverCount = 1;
    int g_serverID = 0;
    size_t g_time = 0;
}

MutexSys mutex;

Tracer* Tracer::instancePtr = nullptr;

Tracer* Tracer::instance()
{
    if (!instancePtr)
        instancePtr = new Tracer();
    return instancePtr;
}

Tracer::Tracer()
{
    rtcInit(NULL);
    rtcSetErrorFunction(error_handler);

    m_pRenderer = new IntegratorRenderer(embree::Parms());
    //m_pRenderer = new DebugRenderer(embree::Parms());
    m_pRenderer->refInc();

    TaskScheduler::create(0);
}

Tracer::~Tracer()
{
    m_pRenderer->refDec();
    rtcExit();
}

void Tracer::cleanUp()
{
    if (!instancePtr) return;

    delete instancePtr;
    instancePtr = nullptr;
}

Tracer::Context* Tracer::getContextById(int32_t id) const
{
    ContextMap::const_iterator it = m_contexts.find(id);
    
    if (it != m_contexts.end())
    {
        return it->second;
    }

    return nullptr;
}

Tracer::Context* Tracer::getContextByJSObject( JSWrapperObject *traceContextObject )
{
    int32_t id = 0;

    JSWrapperData data;
    traceContextObject->get( "id", &data );

    id = data.toNumber();

    Tracer::Context* pContext = getContextById(id);

    if (!pContext)
    {
        pContext = new Tracer::Context();
        pContext->id = generateUniqueId();

        //make sure it's null
        pContext->pSwapChain = nullptr;

        pContext->pToneMapper = new DefaultToneMapper(embree::Parms());
        pContext->pToneMapper->refInc();

        data.setNumber(pContext->id);
        traceContextObject->set( "id", data );

        m_contexts.insert(ContextMap::value_type(pContext->id, pContext));
    }

    return pContext;
}

uint32_t Tracer::generateUniqueId() const
{
    int32_t id = std::rand();
    
    Context* pContext = getContextById(id);
    if (pContext)
        id = generateUniqueId();
    
    return id;
}

void Tracer::resizeFrameBuffer(Context* pContext) const
{
    assert(pContext != nullptr);

    bool recreate = false;

    const Output& output = pContext->output;
    SwapChain* pSwapChain = pContext->pSwapChain;

    if (pSwapChain && (pSwapChain->getWidth() != output.width || pSwapChain->getHeight() != output.height))
    {
        recreate = true;
    }

    if (recreate || !pSwapChain)
    {
        //New swapchain
        pContext->pSwapChain = new SwapChain("RGBA8", output.width, output.height, 2, nullptr, FrameBufferRGBA8::create);
        pContext->pSwapChain->refInc();

        //Old swapchain
        if (pSwapChain)
        {
            pSwapChain->refDec();
        }
    }

    assert(output.width == pContext->pSwapChain->getWidth() && output.height == pContext->pSwapChain->getHeight());
}

void Tracer::trace(Context* pContext, embree::Camera* pCamera, Scene* pScene)
{
    if (!pContext) return;

    //make sure it's the right dimmensions
    resizeFrameBuffer(pContext);

    assert(pContext->pSwapChain != nullptr);
    assert(pContext->output.pFrame != nullptr);

    Output& output = pContext->output;

    m_pRenderer->renderFrame(pCamera, pScene->m_pInternal, pContext->pToneMapper, pContext->pSwapChain, pContext->accum++);
    pContext->pSwapChain->swapBuffers();

    size_t buffID = pContext->pSwapChain->id();
    {
        RT_COMMAND_HEADER;
        pContext->pSwapChain->buffer(buffID)->wait();
    }

    uint8_t* pFrameData = (uint8_t*)pContext->pSwapChain->buffer(buffID)->getData();
    assert(pFrameData);

    for (int h = 0; h < output.height; h++)
    {
        uint8_t* sptr = (uint8_t*)(pFrameData + h * (4 * output.width));
        uint8_t* dptr = (uint8_t*)(output.pFrame + h * output.modulo);

        for (int w = 0; w < output.width; w++)
        {
            *dptr++ = *(sptr + 0);
            *dptr++ = *(sptr + 1);
            *dptr++ = *(sptr + 2);
            *dptr++ = 255;
            sptr += 4;
        }
    }
}
//
static bool getOutputFromJS( JSWrapperObject *traceContextObject, Tracer::Output& output )
{
    JSWrapperData outputData;
    traceContextObject->get( "output", &outputData );

    JSWrapperData data;
    outputData.object()->get( "width", &data );
    output.width = data.toNumber();

    outputData.object()->get( "height", &data );
    output.height = data.toNumber();    

    assert(output.width > 0 && output.height > 0);

    outputData.object()->get( "modulo", &data );
    output.modulo = data.toNumber();    

    outputData.object()->get( "data", &data );
    data.object()->getAsUint8Array( &output.pFrame, &output.length );

    data.setBoolean(true);
    outputData.object()->set( "needsUpdate", data );

    return true;
}

JSWRAPPER_FUNCTION( vgRenderTrace )

    JSWrapperData rcData;

    assert( args.count() == 2 );
    rcData.setBoolean( true );

    JSWrapperObject *renderContext=args[0].object()->copy();
    JSWrapperObject *sceneManager=args[1].object()->copy();

    JSWrapperData traceContextData, cameraData, data;

    renderContext->get( "traceContext", &traceContextData );
    renderContext->get( "camera", &cameraData );

    // internal trace context detail
    Tracer* pTracer = Tracer::instance();

    Tracer::Context* pContext = pTracer->getContextByJSObject( traceContextData.object() ); // create or reuse internal tracer.

    // flags to notify

    traceContextData.object()->get( "sceneChanged", &data );
    bool sceneChanged = data.toBoolean();

    traceContextData.object()->get( "resetAccumulation", &data );
    bool resetAccumulation = data.toBoolean();

    if (sceneChanged || resetAccumulation)
        pContext->accum = 0;

    if (resetAccumulation)
    {   // reset flag
        data.setBoolean(false);
        traceContextData.object()->set( "resetAccumulation", data );
    }

    data.setNumber( pContext->accum );
    traceContextData.object()->set( "iterations", data );

    //printf("iterations %d\n", pContext->accum );

    traceContextData.object()->get( "maxIterations", &data );
    int32_t maxIterations = data.toNumber();

    if (pContext->accum > maxIterations) {
        JSWRAPPER_FUNCTION_RETURN
    }

    getOutputFromJS( traceContextData.object(), pContext->output); // make sure the tracer's output it's updated.

    // internal scene detail
    static Scene* pScene=0;// = new Scene();
    if (sceneChanged)
    {
        if ( pScene ) delete pScene;

        pScene = new Scene();

        pScene->clean();
        pScene->sync( renderContext, sceneManager );
        // reset flag

        data.setBoolean( false );
        traceContextData.object()->set("sceneChanged", data );
    }

    // update the internal camera
    AffineSpace3f tm = readJSMatrix4( cameraData.object() );
    cameraData.object()->get( "fov", &data );
    const float fov = data.toNumber();
    Parms parms;
    parms.add("local2world", Variant(tm));
    parms.add("angle", Variant(fov));
    parms.add("aspectRatio", Variant((float)pContext->output.width / (float)pContext->output.height));
    Ref<embree::Camera> pCamera = new PinHoleCamera(parms);
    
    // do trace processing.
    pTracer->trace(pContext, pCamera.ptr, pScene);

    JSWRAPPER_FUNCTION_SETRC( rcData )

JSWRAPPER_FUNCTION_END

void registerTracer( JSWrapper *jsWrapper )
{
    JSWrapperData data;
    jsWrapper->execute( "VG.Render", &data );

    data.object()->registerFunction( "trace", vgRenderTrace );
}