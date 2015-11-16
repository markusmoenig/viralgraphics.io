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

#ifndef __VG_TRACER_MESH_INCLUDED
#define __VG_TRACER_MESH_INCLUDED

#include <vector>
#include "shapes/shape.h"
#include "common/math/affinespace.h"

#include "jswrapper.hpp"

class GPUBuffer;

// Mesh Node
class Mesh
{
    enum VertexInfoType
    {
        V_INVALID,
        V_POSITION,
        V_NORMAL,
        V_UV
    };
    struct VertexInfo
    {
        VertexInfoType type;
        int stride;
        int offset;
    };
    typedef std::vector<VertexInfo> VertexInfos;
    
    struct VBuffer
    {
        VertexInfos layout;
        int stride;
        GPUBuffer* pBuffer;
        const float *pData;
    };
    typedef std::vector<VBuffer> VBuffers;
    
    struct VertexLayoutInfo
    {
        int bufferIndex;
        int index;
    };
    typedef std::vector<VertexLayoutInfo> VertexLayoutInfos;
    
    struct IndexInfo
    {
        int offset;
        int size;
    };
    typedef std::vector<IndexInfo> IndexInfos;
    
    /// members
private:
    VBuffers vertexBuffers;
    VertexLayoutInfos vertexLayout;
    GPUBuffer* indexBuffer;
    IndexInfos indexInfos;

    /// methods
public:
    Mesh();
    bool isEmptyMesh() const;
    void readAttributes( JSWrapperObject * );
    void createSubMeshs(std::vector<embree::Shape*>& subMeshs, const embree::AffineSpace3f* transform);
private:
    embree::Shape* createSubMesh(const IndexInfo* facet, const embree::AffineSpace3f* transform);
    int getVertexCount() const;
    static VertexInfoType getAttrTypeFromName(const char* name);
    void readVertexBuffers( JSWrapperObject * );
    void readVertexLayout( JSWrapperObject * );
    void readIndexBuffer( JSWrapperObject * );
    static embree::Vec3fa getVector(GPUBuffer* buffer, const float *data, int elementIdx, int stride, int elementOffset, const embree::AffineSpace3f* transform);
};

#endif