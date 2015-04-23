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

#ifndef __VG_TRACER_INCLUDED
#define __VG_TRACER_INCLUDED


#include <jsapi.h>
#include <inttypes.h>
#include <unordered_map>

namespace embree 
{
    class Renderer;
    class SwapChain;
    class ToneMapper;
    class Camera;
}


class Scene;


/** A sigle instance that hold embree state */
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

    typedef std::unordered_map<int32_t, Context*> ContextMap;

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
    Context* getContextByJSObject(JSContext* cx, JS::RootedObject& jsTraceContext);


    void trace(Context* pContext, embree::Camera* pCamera, Scene* pScene);


    static Tracer* instance();
    //safe to call even if tracer not instantiated
    static void cleanUp();
};



#endif
