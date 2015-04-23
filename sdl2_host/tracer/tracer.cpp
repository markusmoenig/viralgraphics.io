/*
* (C) Copyright 2014, 2015 Markus Moenig Luis Jimenez <kuko@kvbits.com>.
*
* This file is part of Visual Graphics.
*
* Visual Graphics is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Visual Graphics is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
*
*/

#include "Tracer.h"


#include <embree2/rtcore.h>
#include <embree2/rtcore_ray.h>

#include "math/affinespace.h"
#include "math/linearspace3.h"
#include "math/vec3.h"

#include "scene.h"

#include <stdint.h>
#include <stdio.h>
#include <assert.h>
#include <jsapi.h>
#include <jsfriendapi.h>
#include "../jshost.hpp"

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


extern JSHost *g_host;

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
    {
        instancePtr = new Tracer();
    }

    return instancePtr;
}

Tracer::Tracer()
{
    rtcInit(NULL);
    rtcSetErrorFunction(error_handler);

    m_pRenderer = new IntegratorRenderer(embree::Parms());
    //m_pRenderer = new DebugRenderer(embree::Parms());
    m_pRenderer->refInc();

    TaskScheduler::create(8);
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

Tracer::Context* Tracer::getContextByJSObject(JSContext* cx, RootedObject& jsTraceContext)
{
    int32_t id = 0;

    RootedValue tempValue(cx);

    JS_GetProperty(cx, HandleObject(jsTraceContext), "id", MutableHandleValue(&tempValue));
    id = tempValue.toInt32();

    Context* pContext = getContextById(id);

    if (!pContext)
    {
        pContext = new Context();
        pContext->id = generateUniqueId();

        //make sure it's null
        pContext->pSwapChain = nullptr;

        pContext->pToneMapper = new DefaultToneMapper(embree::Parms());
        pContext->pToneMapper->refInc();

        tempValue.setInt32(pContext->id);
        JS_SetProperty(cx, HandleObject(jsTraceContext), "id", tempValue);

        m_contexts.insert(ContextMap::value_type(pContext->id, pContext));
    }

    return pContext;
}

uint32_t Tracer::generateUniqueId() const
{
    int32_t id = std::rand();

    Context* pContext = getContextById(id);

    if (pContext) return generateUniqueId();

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

static bool getOutputFromJS(JSContext* cx, RootedObject& jsTraceContext, Tracer::Output& output)
{
    //TODO add checks
    RootedValue tmpValue(cx);

    JS_GetProperty(cx, HandleObject(jsTraceContext), "output", MutableHandleValue(&tmpValue));

    RootedObject jsOutput(cx, &tmpValue.toObject());

    JS_GetProperty(cx, HandleObject(jsOutput), "width", MutableHandleValue(&tmpValue));
    output.width = tmpValue.toInt32();

    JS_GetProperty(cx, HandleObject(jsOutput), "height", MutableHandleValue(&tmpValue));
    output.height = tmpValue.toInt32();

    assert(output.width > 0 && output.height > 0);

    JS_GetProperty(cx, HandleObject(jsOutput), "modulo", MutableHandleValue(&tmpValue));
    output.modulo = tmpValue.toInt32();

    JS_GetProperty(cx, HandleObject(jsOutput), "data", MutableHandleValue(&tmpValue));
    JS_GetObjectAsUint8Array(&tmpValue.toObject(), &output.length, &output.pFrame);

    tmpValue.setBoolean(true);
    JS_SetProperty(cx, HandleObject(jsOutput), "needsUpdate", tmpValue);

    return true;
}

bool vgRenderTrace(JSContext* cx, unsigned argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);

    // makes sure we create the tracer instance only whenever "trace" has been called */
    Tracer* pTracer = Tracer::instance();

    assert(argc == 3);

    RootedObject jsTraceContext(cx, &args[0].toObject());
    RootedObject jsCamera(cx, &args[1].toObject());
    RootedObject jsScene(cx, &args[2].toObject());

    Tracer::Context* pContext = pTracer->getContextByJSObject(cx, jsTraceContext);

    RootedValue tmpValue(cx);

    JS_GetProperty(cx, HandleObject(jsTraceContext), "resetAccumulation", MutableHandleValue(&tmpValue));

    if (tmpValue.toBoolean())
    {
        pContext->accum = 0;
        tmpValue.setBoolean(false);
        JS_SetProperty(cx, HandleObject(jsTraceContext), "resetAccumulation", tmpValue);
    }

    tmpValue.setInt32(pContext->accum);
    JS_SetProperty(cx, HandleObject(jsTraceContext), "iterations", tmpValue);

    JS_GetProperty(cx, HandleObject(jsTraceContext), "maxIterations", MutableHandleValue(&tmpValue));
    int32_t maxIterations = tmpValue.toInt32();

    if (pContext->accum > maxIterations)
    {
        return true;
    }

    //make sure the output it's updated
    getOutputFromJS(cx, jsTraceContext, pContext->output);

    static Scene* pScene = new Scene();
    pScene->sync(cx, jsScene);


    AffineSpace3f tm = readJSMatrix4(cx, jsCamera);

    JS_GetProperty(cx, jsCamera, "fov", MutableHandleValue(&tmpValue));
    const float fov = tmpValue.toNumber();

    Parms parms;

    parms.add("local2world", Variant(tm));
    parms.add("angle", Variant(fov));
    parms.add("aspectRatio", Variant((float)pContext->output.width / (float)pContext->output.height));

    Ref<embree::Camera> pCamera = new PinHoleCamera(parms);

    //nullptr safe
    pTracer->trace(pContext, pCamera.ptr, pScene);

    return true;
}

static JSFunctionSpec vg_tracer_functions[] = 
{
    JS_FS("trace", vgRenderTrace, 0, 0),
    JS_FS_END
};

void registerTracer(JSContext *cx, JSObject *vgRenderObject)
{
    RootedObject obj(cx, vgRenderObject);

    if (!JS_DefineFunctions(cx, HandleObject(obj), vg_tracer_functions))
        JS_ReportError(cx, "Error Registering VG Tracer Functions!");
}