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

#ifndef __VG_TRACER_INCLUDED
#define __VG_TRACER_INCLUDED

#include <inttypes.h>
//#include <unordered_map>
#include <tr1/unordered_map>

#include "jswrapper.hpp"

namespace embree 
{
    class Renderer;
    class SwapChain;
    class ToneMapper;
    class Camera;
}


class Scene;


/** A sigle instance(trace context) that hold embree state */
class Tracer
{
public:
    struct Output
    {
        uint8_t* pFrame;
        uint32_t length;
        int modulo;

        int32_t width;
        int32_t height;

        inline Output()
        {
            memset(this, 0, sizeof(Output));
        }
    };

    struct Context
    {
        int32_t  id;
        Output output;

        embree::SwapChain* pSwapChain;
        embree::ToneMapper* pToneMapper;

        int accum;

        inline Context()
        {
            memset(this, 0, sizeof(Context));
        }
    };

private:

    static Tracer* instancePtr;

    Tracer();

    typedef std::tr1::unordered_map<int32_t, Context*> ContextMap;
    //typedef std::unordered_map<int32_t, Context*> ContextMap;

    //members
    ContextMap          m_contexts;
    embree::Renderer*   m_pRenderer;

    void resizeFrameBuffer(Context* pContext) const;

public:

    ~Tracer();

    uint32_t generateUniqueId() const;

    /* Returns nullptr if not found */
    Context* getContextById(int32_t id) const;

    /* if not found a new context is created, id in the jscontext is set by the new id */
    Context* getContextByJSObject( JSWrapperObject * );


    void trace(Context* pContext, embree::Camera* pCamera, Scene* pScene);


    static Tracer* instance();
    //safe to call even if tracer not instantiated
    static void cleanUp();
};

#endif
