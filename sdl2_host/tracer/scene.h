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

#ifndef __VG_TRACER_SCENE_INCLUDED
#define __VG_TRACER_SCENE_INCLUDED




#include <jsapi.h>
#include <inttypes.h>
#include <unordered_map>
#include "api/scene_flat.h"


class GPUBuffer;

namespace embree
{
    class Material;
    class Shape;
    typedef std::vector<Ref<BackendSceneFlat::Primitive>> PrimitiveList;
}

class Tracer;
class TracerTriangleMesh;


class Scene
{
protected:


    enum VertexAttrType
    {
        V_INVALID,
        V_POSITION,
        V_NORMAL,
        V_UV
    };

    struct VertexAttr
    {
        VertexAttrType type;
        int stride;
        int offset;
    };

    typedef std::vector<VertexAttr> VertexAttrArray;

    struct VBuffer
    {
        VertexAttrArray layout;
        int stride;
        GPUBuffer* pBuffer;
    };

    struct StaticLayoutAttr
    {
        int bufferIndex;
        int index;
    };

    typedef std::vector<StaticLayoutAttr> StaticLayout;

    typedef std::vector<VBuffer> VBuffers;

    static VertexAttrType getAttrTypeFromName(const char* name);

    static void readVBuffers(JSContext* cx, JS::RootedObject& jsMeshNode, VBuffers& vbuffers);

    /** Reads and creates a embree shape from a js mesh */
    static embree::Shape* createShapeFromJSMesh(JSContext* cx, JS::RootedObject& jsMeshNode, const embree::AffineSpace3f* pWorldTransform);


    embree::BackendSceneFlat* m_pInternal;

    void syncChildren(JSContext* cx, JS::RootedObject& jsNode, embree::PrimitiveList& prims);

    friend class Tracer;
    friend class TracerTriangleMesh;
public:

    Scene();
    ~Scene();

    /** Syncronizes the js scene to this */
    void sync(JSContext* cx, JS::RootedObject& jsScene);

    /** Cleans any internal structures, sync has to be called again to re-validate this scene */
    void clean();

    embree::Material* createDefaultMaterial() const;

    //public members
    int32_t m_id;
};






#endif