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

#include "shapes/trianglemesh_full.h"

#include "mesh.h"
#include "../gpubuffer.hpp"

#include "jswrapper.hpp"

Mesh::Mesh()
{
    indexBuffer = NULL;
}

#ifdef WIN32
#define uint unsigned int
#endif

extern JSWrapper *g_jsWrapper;

void Mesh::createSubMeshs(std::vector<embree::Shape*>& subMeshs, const embree::AffineSpace3f* transform)
{
    embree::Shape* subMesh;
    
    if (indexBuffer == NULL || indexInfos.empty())
    {   // single facet
        subMesh = createSubMesh(NULL, transform);
        if (subMesh)
            subMeshs.push_back(subMesh);
    }
    else
    {   // multiple facets
        for (int ifacet = 0; ifacet < indexInfos.size(); ifacet++)
        {   // facet
            IndexInfo facet = indexInfos[ifacet];
            subMesh = createSubMesh(&facet, transform);
            if (subMesh)
                subMeshs.push_back(subMesh);
        }
    }
}

embree::Shape* Mesh::createSubMesh(const IndexInfo* facet, const embree::AffineSpace3f* transform)
{
    int nVertex = (facet==NULL) ? getVertexCount() : facet->size;
    if (nVertex < 1)
        return NULL;

    embree::TriangleMeshFull* subMesh = new embree::TriangleMeshFull(embree::Parms());
    
    for (int i = 0; i < vertexLayout.size(); i++)
    {
        assert(vertexLayout[i].bufferIndex < vertexBuffers.size());
        const VBuffer& vb = vertexBuffers[vertexLayout[i].bufferIndex];
        
        assert(vertexLayout[i].index < vb.layout.size());
        const VertexInfo& vattr = vb.layout[vertexLayout[i].index];

        switch (vattr.type)
        {
            case V_POSITION:
            {
                subMesh->position.reserve(nVertex);
                for (int j = 0; j < nVertex; j++)
                {
                    uint index = j;
                    subMesh->position.push_back(getVector(vb.pBuffer, vb.pData, index, vb.stride, vattr.offset, transform));
                }
            }
                break;
            case V_NORMAL:
            {
                subMesh->normal.reserve(nVertex);
                for (int j = 0; j < nVertex; j++)
                {
                    uint index = j;
                    subMesh->normal.push_back(getVector(vb.pBuffer, vb.pData, index, vb.stride, vattr.offset, transform));
                }
            }
                break;
        }
    }
    
    subMesh->triangles.resize(nVertex / 3);
    for (int i = 0; i < nVertex; i += 3)
    {
        subMesh->triangles[i / 3] = embree::TriangleMeshFull::Triangle(i + 0, i + 1, i + 2);
    }
    
    return subMesh;
}

bool Mesh::isEmptyMesh() const
{
    return vertexBuffers.empty();
}

int Mesh::getVertexCount() const
{
    int n = 0;
    if (!vertexBuffers.empty())
        n = vertexBuffers[0].pBuffer->getSize() / vertexBuffers[0].stride;
    return n;
}

void Mesh::readAttributes( JSWrapperObject *meshNode )
{
    readVertexBuffers( meshNode );
    readVertexLayout( meshNode );
    readIndexBuffer( meshNode );
}

Mesh::VertexInfoType Mesh::getAttrTypeFromName(const char* name)
{
    assert(name);
    if (strcmp(name, "position") == 0)
        return V_POSITION;
    else if (strcmp(name, "normal") == 0)
        return V_NORMAL;
    return V_INVALID;
}

embree::Vec3fa Mesh::getVector(GPUBuffer* buffer, const float *data, int elementIdx, int stride, int elementOffset, const embree::AffineSpace3f* transform)
{
    assert(buffer->type == 0); // VG.Type.Float
    //const float* data = (const float*)buffer->data;
    const float* v = data + (stride * elementIdx) + elementOffset;
    if (transform != NULL)
        return embree::xfmPoint(*transform, embree::Vec3fa(v[0], v[1], v[2]));
    else
        return embree::Vec3fa(v[0], v[1], v[2]);
}

void Mesh::readVertexBuffers( JSWrapperObject *meshNode )
{
    JSWrapperData vBuffersData;
    meshNode->get( "vBuffers", &vBuffersData );
    
    unsigned int length; vBuffersData.object()->getArrayLength( &length );
    for (int i = 0; i < length; i++)
    {
        int bIndex = vertexBuffers.size();
        vertexBuffers.push_back(VBuffer());
        
        VBuffer& vb = vertexBuffers[bIndex];
        memset(&vb, 0, sizeof(VBuffer));

        JSWrapperData vBufferData, data, layoutData;
        vBuffersData.object()->getArrayElement( i, &vBufferData );
        assert(vBufferData.isObject());
                
        vBufferData.object()->get( "stride", &data );
        vb.stride = data.toNumber();
        
        //TODO add more RTTI checks
        vBufferData.object()->get( "vb", &data );
        vb.pBuffer = (GPUBuffer*) data.object()->getPrivate();
        assert(vb.pBuffer);

        vb.pData = (const float *) vb.pBuffer->getDataFromDataBuffer( data.object() );

        vBufferData.object()->get( "layout", &layoutData );
        unsigned int layoutLength; layoutData.object()->getArrayLength( &layoutLength );        
        for (int j = 0; j < layoutLength; j++)
        {
            JSWrapperData layoutElementData;
            layoutData.object()->getArrayElement( j, &layoutElementData );

            assert(layoutElementData.isObject());
                        
            int vaIndex = vb.layout.size();
            vb.layout.push_back(VertexInfo());
            
            VertexInfo& vinfo = vb.layout[j];
            
            layoutElementData.object()->get( "name", &data );
            assert(data.isString());
            vinfo.type = getAttrTypeFromName( data.toString().c_str() );
            
            layoutElementData.object()->get( "stride", &data );
            vinfo.stride = data.toNumber();
            
            layoutElementData.object()->get( "offset", &data );
            vinfo.offset = data.toNumber();
            
            if (j > 0) assert(vinfo.offset > 0 && "invalid vertex attr");
        }
    }
}

void Mesh::readVertexLayout( JSWrapperObject *meshNode )
{
    JSWrapperData layoutData;
    meshNode->get( "layout", &layoutData );

    // --- If the layout is empty, just return as we skip this node but still have to read out the children
    if ( layoutData.isNull() ) return;

    JSWrapperData objectData, objectGetOwnFunc, propertyData;

    g_jsWrapper->execute( "Object", &objectData );
    objectData.object()->get( "getOwnPropertyNames", &objectGetOwnFunc );

    JSWrapperArguments args; args.append( layoutData.object() );
    objectGetOwnFunc.object()->call( &args, layoutData.object(), &propertyData );

    unsigned int propertyLength; propertyData.object()->getArrayLength( &propertyLength );
    for (int i = 0; i < propertyLength; i++)
    {
        JSWrapperData elementNameData, layoutElementData, data;

        propertyData.object()->getArrayElement( i, &elementNameData );

        layoutData.object()->get( elementNameData.toString().c_str(), &layoutElementData );

        VertexLayoutInfo info;
        layoutElementData.object()->getArrayElement( 0, &data );

        info.bufferIndex = (int) data.toNumber();
        
        layoutElementData.object()->getArrayElement( 1, &data );
        info.index = (int) data.toNumber();
        
        vertexLayout.push_back(info);
    }
}

void Mesh::readIndexBuffer( JSWrapperObject *meshNode )
{
    JSWrapperData iBufferData, elementsData;
    meshNode->get( "iBuffer", &iBufferData );    

    if ( iBufferData.isNull() || iBufferData.isUndefined() ) return;

    iBufferData.object()->get( "elements", &elementsData );    

    uint n = 0; elementsData.object()->getArrayLength( &n );
    for (uint i = 0; i < n; i++)
    {
        JSWrapperData elData, data;
        elementsData.object()->getArrayElement( i, &elData );

        IndexInfo info;
        elData.object()->get( "offset", &data );    
        info.offset = data.toNumber();
        elData.object()->get( "size", &data );    
        info.size = data.toNumber();
        
        indexInfos.push_back(info);
    }
}