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

#ifndef __VG_TRACER_SCENE_INCLUDED
#define __VG_TRACER_SCENE_INCLUDED

#include <inttypes.h>
#include "api/scene_flat.h"

#include "jswrapper.hpp"

class Tracer;
class TracerTriangleMesh;
class GPUBuffer;

class Scene
{
    friend class Tracer;

    typedef std::vector<embree::Ref<embree::BackendSceneFlat::Primitive>> PrimitiveList;

// members
protected:
    embree::BackendSceneFlat* m_pInternal;
    
// methods
protected:
    // material
    void createMaterial(embree::Material*& defaultMaterial, std::vector<embree::Material*>& subMaterials, JSWrapperObject * );
    // light
    static void createLight( JSWrapperObject *, std::vector<embree::Light*>& lights );
    // scene traverse
    void syncChildren( JSWrapperObject *, PrimitiveList& prims);
public:
    Scene();
    ~Scene();
    /** Syncronizes the js scene to this */
    void sync( JSWrapperObject *, JSWrapperObject * );
    /** Cleans any internal structures, sync has to be called again to re-validate this scene */
    void clean();
};

#endif