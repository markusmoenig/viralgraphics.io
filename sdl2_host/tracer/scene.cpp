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


#include "scene.h"
#include <stdint.h>
#include <stdio.h>
#include <assert.h>
#include <jsapi.h>
#include <jsfriendapi.h>
#include "../jshost.hpp"

#include "../gpubuffer.hpp"

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
#include "materials/metallicpaint.h"
#include "shapes/trianglemesh.h"
#include "materials/matte.h"
#include "lights/trianglelight.h"
#include "lights/pointlight.h"

#include "util.h"


using namespace embree;




class TracerTriangleMesh : public TriangleMeshFull
{
public:

    TracerTriangleMesh(const Scene::VBuffers& vbuffers, const Scene::StaticLayout& layout, const AffineSpace3f& transform, GPUBuffer* ibuffer = nullptr) :
        TriangleMeshFull(Parms())
    {
        assert(vbuffers.size() > 0);

        //TODO unhack this...
        const uint32_t vertexCount = vbuffers[0].pBuffer->getSize() / vbuffers[0].stride;


        for (int i = 0; i < layout.size(); i++)
        {
            assert(layout[i].bufferIndex < vbuffers.size());
            const Scene::VBuffer& vb = vbuffers[layout[i].bufferIndex];

            assert(layout[i].index < vb.layout.size());
            const Scene::VertexAttr& vattr = vb.layout[layout[i].index];

            
            switch (vattr.type)
            {
            case Scene::V_POSITION:
            {
                position.reserve(vertexCount);

                //TODO enumerate buffer type
                assert(vb.pBuffer->type == 0/* VG.Type.Float */);
                const float* vData = (const float*)vb.pBuffer->data;

                for (int j = 0; j < vertexCount; j++)
                {
                    const float* v = vData + (vb.stride * j) + vattr.offset;
                    position.push_back(xfmPoint(transform, Vec3fa(v[0], v[1], v[2])));
                }

            }
            break;
            case Scene::V_NORMAL:
            {
                normal.reserve(vertexCount);

                //TODO enumerate buffer type
                assert(vb.pBuffer->type == 0/* VG.Type.Float */);
                const float* vData = (const float*)vb.pBuffer->data;

                for (int j = 0; j < vertexCount; j++)
                {
                    const float* v = vData + (vb.stride * j) + vattr.offset;
                    normal.push_back(Vec3fa(v[0], v[1], v[2]));
                }

            }
            break;
            }

        }

        if (ibuffer)
        {
            //TODO read from the index buffer
        }
        else
        {
            triangles.resize(vertexCount / 3);

            uint32_t index = 0;
            for (uint32_t i = 0; i < vertexCount; i += 3)
            {
                triangles[i / 3] = Triangle(i + 0, i + 1, i + 2);
            }
        }

    }

};




Scene::Scene()
{
    m_pInternal = nullptr;
    m_id = 0;
}

Scene::~Scene()
{
    clean();
}

embree::Material* Scene::createDefaultMaterial() const
{
    Parms parms;

    static int i = 0;
    i++;

    if (i == 6)
    {
        parms.add("reflectance", Variant(1.5f, 1.5f, 1.5f));
    }
    else
    {
        parms.add("reflectance", Variant(1.0f, 1.0f, 1.2f));
    }

    return new Matte(parms);
}


Scene::VertexAttrType Scene::getAttrTypeFromName(const char* name)
{
    assert(name);
    if (strcmp(name, "position") == 0) return V_POSITION;
    else
    if (strcmp(name, "normal") == 0) return V_NORMAL;

    return V_INVALID;
}

void Scene::readVBuffers(JSContext* cx, JS::RootedObject& jsMeshNode, VBuffers& vbuffers)
{
    RootedValue tmpValue(cx);

    JS_GetProperty(cx, jsMeshNode, "vBuffers", MutableHandleValue(&tmpValue));
    assert(tmpValue.isObject());

    RootedObject jsVBuffers(cx, &tmpValue.toObject());

    AutoIdArray bidArray(cx, JS_Enumerate(cx, HandleObject(&jsVBuffers)));

    for (int i = 0; i < bidArray.length(); i++)
    {
        int bIndex = vbuffers.size();
        vbuffers.push_back(VBuffer());

        VBuffer& vb = vbuffers[bIndex];
        memset(&vb, 0, sizeof(VBuffer));

        HandleId hvbid = HandleId::fromMarkedLocation(&bidArray[i]);

        JS_GetPropertyById(cx, HandleObject(jsVBuffers), hvbid, MutableHandleValue(&tmpValue));
        assert(tmpValue.isObject());

        RootedObject jsVBuffer(cx, &tmpValue.toObject());

        JS_GetProperty(cx, jsVBuffer, "stride", MutableHandleValue(&tmpValue));
        vb.stride = tmpValue.toInt32();

        //TODO add more RTTI checks
        JS_GetProperty(cx, jsVBuffer, "vb", MutableHandleValue(&tmpValue));
        vb.pBuffer = (GPUBuffer*)JS_GetPrivate(&tmpValue.toObject()); //potentially unsafe
        assert(vb.pBuffer);

        JS_GetProperty(cx, jsVBuffer, "layout", MutableHandleValue(&tmpValue));
        RootedObject jsLayout(cx, &tmpValue.toObject());

        AutoIdArray attridArray(cx, JS_Enumerate(cx, HandleObject(&jsLayout)));

        for (int j = 0; j < attridArray.length(); j++)
        {
            HandleId hattrid = HandleId::fromMarkedLocation(&attridArray[j]);

            JS_GetPropertyById(cx, jsLayout, hattrid, MutableHandleValue(&tmpValue));
            assert(tmpValue.isObject());

            RootedObject jsAttr(cx, &tmpValue.toObject());

            int vaIndex = vb.layout.size();
            vb.layout.push_back(VertexAttr());

            VertexAttr& vattr = vb.layout[j];

            JS_GetProperty(cx, jsAttr, "name", MutableHandleValue(&tmpValue));
            assert(tmpValue.isString());
            vattr.type = getAttrTypeFromName(JS_EncodeString(cx, tmpValue.toString()));

            JS_GetProperty(cx, jsAttr, "stride", MutableHandleValue(&tmpValue));
            vattr.stride = tmpValue.toInt32();

            JS_GetProperty(cx, jsAttr, "offset", MutableHandleValue(&tmpValue));
            vattr.offset = tmpValue.toInt32();

            if (j > 0) assert(vattr.offset > 0 && "invalid vertex attr");
        }

    }
}

embree::Shape* Scene::createShapeFromJSMesh(JSContext* cx, JS::RootedObject& jsMeshNode, const AffineSpace3f* pWorldTransform)
{
    Shape* pShape = nullptr;

    RootedValue tmpValue(cx);

    if (!JS_GetProperty(cx, jsMeshNode, "layout", MutableHandleValue(&tmpValue)))
    {
        //this is not a mesh node
        return nullptr;
    }

    assert(tmpValue.isObject());

    VBuffers vbuffers;
    readVBuffers(cx, jsMeshNode, vbuffers);


    StaticLayout staticLayout;


    RootedObject jsLayout(cx, &tmpValue.toObject());

    AutoIdArray attrs(cx, JS_Enumerate(cx, HandleObject(&jsLayout)));

    for (int i = 0; i < attrs.length(); i++)
    {
        HandleId hid = HandleId::fromMarkedLocation(&attrs[i]);

        JS_GetPropertyById(cx, HandleObject(jsLayout), hid, MutableHandleValue(&tmpValue));
        RootedObject jsAttr(cx, &tmpValue.toObject());

        

        StaticLayoutAttr layoutAttr;
        JS_GetElement(cx, HandleObject(jsAttr), 0, MutableHandleValue(&tmpValue));
        layoutAttr.bufferIndex = tmpValue.toInt32();

        JS_GetElement(cx, HandleObject(jsAttr), 1, MutableHandleValue(&tmpValue));
        layoutAttr.index = tmpValue.toInt32();

        staticLayout.push_back(layoutAttr);
    }

    if (vbuffers.size())
    {
        pShape = new TracerTriangleMesh(vbuffers, staticLayout, *pWorldTransform);
    }


    //dummy sphere as fail over
    if (!pShape)
    {
        Parms parms;
        parms.add("dPdt", Variant(0.f, 0.f, 0.f));
        parms.add("r", Variant(0.5f));
        parms.add("numTheta", Variant(64));
        parms.add("numPhi", Variant(64));

        pShape = new Sphere(parms);
    }

    assert(pShape != nullptr);

    return pShape;
}

void Scene::syncChildren(JSContext* cx, RootedObject& jsNode, embree::PrimitiveList& prims)
{
    printf("syncChildren %d\n", jsNode.get());

    RootedValue tmpValue(cx);

    JS_GetProperty(cx, HandleObject(jsNode), "children", MutableHandleValue(&tmpValue));
    assert(JS_IsArrayObject(cx, tmpValue));
    
    assert(tmpValue.isObject() == true);

    RootedObject jsChildren(cx, &tmpValue.toObject());

    uint32_t length = 0;
    JS_GetArrayLength(cx, jsChildren, &length);


    AffineSpace3f tm = readJSMatrix4(cx, jsNode);

    for (int i = 0; i < length; i++)
    {
        JS_GetElement(cx, jsChildren, i, MutableHandleValue(&tmpValue));

        assert(tmpValue.isObject() == true);

        RootedObject jsChildNode(cx, &tmpValue.toObject());

        syncChildren(cx, jsChildNode, prims);
    }

    bool foundp = false;
    if (JS_HasProperty(cx, jsNode, "vBuffers", &foundp) && foundp)
    {
        Shape* pShape = createShapeFromJSMesh(cx, jsNode, &tm);
        assert(pShape != nullptr);

        BackendSceneFlat::Primitive* pMeshPrimitive = new BackendSceneFlat::Primitive(pShape, NULL, createDefaultMaterial(), 0xFFFFFF, 0xFFFFFF);
        prims.push_back(pMeshPrimitive);
    }
}

void Scene::sync(JSContext* cx, JS::RootedObject& jsScene)
{
    if (m_pInternal) return;

    //dummy primitives
    PrimitiveList prims;
    syncChildren(cx, jsScene, prims);

    Parms lightParms;
    lightParms.add("P", Variant(0.f, 9.f, 0.f));
    lightParms.add("D", Variant(0.5f, -1.f, -0.5));
    lightParms.add("E", Variant(1.0f, 1.f, 1.f));
    lightParms.add("I", Variant(10.0f, 10.f, 10.f));
    lightParms.add("L", Variant(0.1f, 0.1f, 0.1f));

    AmbientLight* pAmbient = new AmbientLight(lightParms);

    //DirectionalLight* pLight = new DirectionalLight(lightParms);
    PointLight* pLight = new PointLight(lightParms);
    BackendSceneFlat::Primitive* pLightPrimitive = new BackendSceneFlat::Primitive(NULL, pLight, NULL, 0xFFFFFF, 0xFFFFFF);

    prims.push_back(pLightPrimitive);

    m_pInternal = new BackendSceneFlat(prims);
    m_pInternal->refInc();
    //m_pInternal->add(pAmbient);
}

void Scene::clean()
{
    if (!m_pInternal) return;

    m_pInternal->refDec();
    m_pInternal = nullptr;
}