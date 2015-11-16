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
#include "lights/light.h"
#include "materials/material.h"

#include "util.h"
#include "light.h"
#include "material.h"
#include "mesh.h"

using namespace embree;

#ifdef WIN32
#define uint unsigned int
#endif

Scene::Scene()
{
    m_pInternal = nullptr;
}

Scene::~Scene()
{
    clean();
}

// Creates embree-material from JS-material.
void Scene::createMaterial(embree::Material*& defaultMaterial, std::vector<embree::Material*>& subMaterials, JSWrapperObject *material )
{
/*
    if (JS_HasProperty(cx, jsMaterial, "identifyNormalMaterial", &identify) && identify)
    {   // normal material
        printf("create normal material\n");
        NormalMaterial material;
        material.readJSMaterial(cx, jsMaterial);
        material.makeMaterial(defaultMaterial, subMaterials);
    }
    else
*/

    MtlMaterial m;
    m.readJSMaterial( material );
    defaultMaterial = m.makeMaterial();
}

// Creates embree-light from JS-light.
void Scene::createLight( JSWrapperObject *lightObject, std::vector<embree::Light*>& lights)
{
    MtlLight l;
    l.readJSLight( lightObject );
    l.makeLights(lights);
}

void Scene::syncChildren( JSWrapperObject *node, PrimitiveList& prims )
{
    JSWrapperData nodeData, childrenData;
    node->get( "children", &childrenData );

    // traverse children recursively
    uint n = 0; childrenData.object()->getArrayLength( &n );
    for (int i = 0; i < n; i++) {
        childrenData.object()->getArrayElement( i, &nodeData );
        syncChildren( nodeData.object(), prims);
    }

    // leaf node
    JSWrapperData identifyMesheNodeData;
    node->get( "identifyMeshSceneNode", &identifyMesheNodeData );
    if ( !identifyMesheNodeData.isUndefined() )
    {
        // mesh
        Mesh mesh;
        mesh.readAttributes( node );

        // geometry
        std::vector<embree::Shape*> subMeshs;
        
        AffineSpace3f tm = readJSMatrix4( node );
        mesh.createSubMeshs(subMeshs, &tm);
        
        // material
        embree::Material* defaultMaterial;
        std::vector<embree::Material*> subMaterials;

        if (!mesh.isEmptyMesh())
        {
            JSWrapperData materialData; node->get( "material", &materialData );
            createMaterial(defaultMaterial, subMaterials, materialData.object() );
        }
        
        // primitives

        for (int i = 0; i < subMeshs.size(); i++)
        {
            embree::Shape* shape = subMeshs[i];

            embree::Material* material = defaultMaterial;

            BackendSceneFlat::Primitive* primitive = new BackendSceneFlat::Primitive(shape, NULL, material, 0xFFFFFF, 0xFFFFFF);
            prims.push_back(primitive);
        }
    }
}

void Scene::sync( JSWrapperObject *renderContext, JSWrapperObject *sceneManager )
{
    if (m_pInternal) return;

    // geometries & materials by recursively.
    PrimitiveList prims;
    syncChildren( sceneManager, prims);

    // lights (array)
    JSWrapperData lightsData;
    renderContext->get( "lights", &lightsData );

    unsigned int nLight = 0;
    lightsData.object()->getArrayLength( &nLight );
    
    for (int iLight = 0; iLight < nLight; iLight++)
    {
        JSWrapperData data;
        lightsData.object()->getArrayElement( iLight, &data );

        std::vector<embree::Light*> lights;
        createLight( data.object(), lights);
        
        for (int i = 0; i < lights.size(); i++)
        {
            embree::Light* light = lights[i];
            BackendSceneFlat::Primitive* primitive = new BackendSceneFlat::Primitive(NULL, light, NULL, 0xFFFFFF, 0xFFFFFF);
            prims.push_back(primitive);
        }
    }

    m_pInternal = new BackendSceneFlat(prims);
    m_pInternal->refInc();
}

void Scene::clean()
{
    if (!m_pInternal)
        return;
    m_pInternal->refDec();
    m_pInternal = nullptr;
}