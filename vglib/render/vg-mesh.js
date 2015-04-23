/*
 * (C) Copyright 2014, 2015 Luis Jimenez <kuko@kvbits.com>.
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

VG.Render.Mesh = function(p)
{
    /** Triangle-based mesh for realtime rendering 
     *  @constructor
     *  @param {VG.SceneNode} p - The parent, can be null */

    VG.Render.SceneNode.call(this, p);

    /** Array of element definitions as { offset, size } referencing the index buffer (if indexed) or the vertex buffer
     *  if empty then the mesh should be considered invalid.
     *  @member {Object} */
    this.elements = [];

    //TODO once the material is added, support for Regular and Multi Material. (array of materials)
    this.material = null

    /** The vertex count 
     *  @member {Number} */
    this.vertexCount = -1;

    /** The overall index buffer count, therefore also the triangle count if divided by 3 
     *  @member {Number} */
    this.indexCount = -1;

    /** Internal vertex buffers with an attribute definition array that goes as:
     *  {
     *      layout: [ { name, offset, stride }, ... ],
     *      vb: VG.GPUBuffer
     *  }
     *  @member {Object} */
    this.vBuffers = [];

    //index buffer
    this.iBuffer = null;


    this.layout = null;


    this.onDraw = function(pipeline, context, delta)
    {
        pipeline.drawMesh(context, this);
    }

    this.hasBounds = true;

    this.__cacheV3 = new VG.Math.Vector3();
}

VG.Render.Mesh.prototype = Object.create(VG.Render.SceneNode.prototype);

VG.Render.Mesh.prototype.isValid = function()
{
    /** True if the mesh is properly initialized 
     *  @returns {Bool} */
    //TODO add more checks
    return this.vertexCount != -1 && this.vBuffers.length != 0; 
}

VG.Render.Mesh.prototype.load = function(jsobj)
{
    /** Initializes and loads the mesh from an object according to this specification: 
     *  //TODO 
     *  */    
}

VG.Render.Mesh.prototype.loadFromOBJ = function(objText)
{
    /** Initializes and loads the mesh from an wavefront .obj string
     *  @param {String} objText - The .obj text content */

    var objData = VG.Utils.parseOBJ(objText);

    this.init(objData.f.length * 3, 0);

    var v = objData.v;
    var vn = objData.vn;

    var i0, i1, i2, v0, v1, v1, n0, n1, n2;

    for (var i = 0; i < objData.f.length; i++)
    {
        i0 = objData.f[i][0];
        i1 = objData.f[i][1];
        i2 = objData.f[i][2];

        v0 = v[i0.v - 1];
        v1 = v[i1.v - 1];
        v2 = v[i2.v - 1];
        
        n0 = vn[i0.vn - 1];
        n1 = vn[i1.vn - 1];
        n2 = vn[i2.vn - 1];

        this.setTriangle(i,
            [
                { position: [v0.x, v0.y, v0.z, 1.0], normal: [n0.x, n0.y, n0.z] },
                { position: [v1.x, v1.y, v1.z, 1.0], normal: [n1.x, n1.y, n1.z] },
                { position: [v2.x, v2.y, v2.z, 1.0], normal: [n2.x, n2.y, n2.z] }
            ]
        );
    }

    this.update();
}

VG.Render.Mesh.prototype.isIndexed = function()
{
    /** Returns wether this mesh indexed or not, if false then this.iBuffer should be null */
    return this.indexCount > 0;
}

VG.Render.Mesh.prototype.init = function(vSize, iSize, bare, layout)
{
    /** Initializes the mesh and creates the default vertex layout, aswell as
     *  a default element. Must be called on a newly created mesh
     *  @param {Number} vSize - Vertex count
     *  @param {Number} iSize - Index count, if zero / negative then this will be marked as non-indexed mesh
     *  @param {Bool} [false] bare - If true then the default vertex buffer wont be created
     *  @param {VG.VertexLayout} [null] layout - predefined layout template //TODO */

    if (this.isValid()) throw "Mesh must be destroyed or newly created";

    if (bare === undefined) bare = false;

    this.vertexCount = vSize;
    this.indexCount = iSize;

    if (this.indexCount)
    {
        var type = vSize < 65535 ? VG.Type.Uint16 : VG.Type.Uint32;
        this.iBuffer = new VG.GPUBuffer(type, iSize, false, true);
        this.iBuffer.create();
    }

    if (bare == false)
    {
        this.addVertexBuffer(VG.Type.Float,
            [
                { name: "position", offset: 0, stride: 4 },
                { name: "normal", offset: 4, stride: 4 },
            ]
        );

        this.elements.push({ offset: 0, size: this.isIndexed() ? this.indexCount : this.vertexCount });
    }
}

VG.Render.Mesh.prototype.dispose = function()
{
    /** Disposes all the buffers and set this mesh as invalid, safe to call if invalid,
     *  also safe to re-initialize */

    if (!this.isValid()) return;

    this.indexCount = -1;
    this.vertexCount = -1;

    for (var i = 0; i < this.vBuffers.length; i++)
    {
        this.vBuffers[i].vb.destroy();
    }

    this.vBuffers = [];

    this.elements = [];
}

VG.Render.Mesh.prototype.update = function()
{
    /** Updates all buffers, for more efficient cherry-pick update, access this.iBuffer and this.vBuffers directly
     *  this also updates the scene node bounds */

    if (this.iBuffer) this.iBuffer.update();

    for (var i = 0; i < this.vBuffers.length; i++)
    {
        this.vBuffers[i].vb.update();
    }

    this.bounds.setEmpty();

    var v3 = this.__cacheV3;

    for (var i = 0; i < this.vertexCount; i++)
    {
        var v = this.getVertex(i);

        //if it has no positions then there's nothing to do here
        if (!v.position) break;

        v3.set(v.position[0], v.position[1], v.position[2]);
        this.bounds.expand(v3);
    }
}

VG.Render.Mesh.prototype.getAttrDef = function(name)
{
    /** Returns attribute definition that holds the specified attribute as [bufferIndex, layoutIndex] 
     *  @return {Object} */

    for (var i = 0; i < this.vBuffers.length; i++)
    {
        var layout = this.vBuffers[i].layout;

        for (var j = 0; j < layout.length; j++)
        {
            if (layout[j].name == name)
            {
                return [i, j];
            }
        }
    }

    return false;
}

VG.Render.Mesh.prototype.addVertexBuffer = function(type, vertexLayout)
{
    /** Adds a vertex buffer with the defined attribute layout. 
     *  @param {VG.Type} type - The array element type, offset and stride should be pass as element count not bytes.
     *  @param {Array} vertexLayout - The vertex layout as an array of { name, offset, stride } not in bytes.*/

    var vBuffer = { vb: null, layout: vertexLayout, stride: 0 };

    for (var i = 0; i < vBuffer.layout.length; i++)
    {
        if (this.getAttrDef(vBuffer.layout[i].name) !== false)
        {
            throw "Attribute already defined in another buffer";
        }

        vBuffer.stride += vBuffer.layout[i].stride;
    }

    vBuffer.vb = new VG.GPUBuffer(type, vBuffer.stride * this.vertexCount, false);
    vBuffer.vb.create();
    
    this.vBuffers.push(vBuffer);


    this.layout = this.generateStaticLayout();
}

VG.Render.Mesh.prototype.generateStaticLayout = function()
{
    /** Creates a static layout to use for reading/writing reference */

    var layout = {};

    for (var i = 0; i < this.vBuffers.length; i++)
    {
        var vL = this.vBuffers[i].layout;

        for (var j = 0; j < vL.length; j++)
        {
            layout[vL[j].name] = [i, j];
        }
    }

    return layout;
}

VG.Render.Mesh.prototype.set = function(index, vertexIndex, values)
{
    /** Sets a single vertex atrribute, see setVertex and setTriangle for a higher level interface 
     *  @param {Array} index - An array of two indices (see/use getAtrrDef) [ bufferIndex, layoutIndex ]
     *  @param {Number} vertexIndex - The vertex index 
     *  @param {Array} values - An array of values equal to the attribute stride */

    var b = this.vBuffers[index[0]];
    var attr = b.layout[index[1]];

    for (var i = 0; i < attr.stride; i++)
    {
        var value = i < values.length ? value = values[i] : 0;

        b.vb.setBuffer((vertexIndex * b.stride + attr.offset) + i, value);
    }
}

VG.Render.Mesh.prototype.setVertex = function(vertexIndex, vertex)
{
    /** Sets a single vertex, see "set" for a lower level interface
     *  @param {Number} vertexIndex - The vertex index 
     *  @param {Object} vertex - An object with attr-values pair, ie: { position: [x, y, z, 1.0] } */

    for (var attr in vertex)
    {
        var attrIndex = this.layout[attr];

        if (!attrIndex) throw "Attribute " + attr + " is not defined in the layout";

        this.set(attrIndex, vertexIndex, vertex[attr]);
    }
}

VG.Render.Mesh.prototype.setTriangle = function(triangleIndex, vertexArray)
{
    /** Sets a triangle, same as setVertex but this take an array of 3 objects 
     *  @param {Number} triangleIndex - The triangle index 
     *  @param {Array} vertexArray - See setVertex for more details */

    for (var i = 0; i < 3; i++)
    {
        this.setVertex((triangleIndex * 3) + i, vertexArray[i]);
    }
}

VG.Render.Mesh.prototype.setTriangleArray = function(array)
{
    /** Sets an array of triangles 
     *  @param {Array} array - The array of triangles */

    for (var attrName in array)
    {
        var index = this.layout[attrName];

        if (index === undefined) continue;

        var b = this.vBuffers[index[0]];
        var attr = b.layout[index[1]];

        var v = array[attrName]; 

        
        for (var vertexIndex = 0; vertexIndex < v.length / attr.stride; vertexIndex++)
        {
            for (var i = 0; i < attr.stride; i++)
            {
                b.vb.setBuffer((vertexIndex * b.stride + attr.offset) + i, v[(vertexIndex * attr.stride) + i]);
            }

        }


    }
}

VG.Render.Mesh.prototype.get = function(index, vertexIndex)
{
    /** Gets a single vertex atrribute, see getVertex and getTriangle for a higher level interface 
     *  @param {Array} index - An array of two indices (see/use getAtrrDef) [ bufferIndex, layoutIndex ]
     *  @param {Number} vertexIndex - The vertex index 
     *  @return {Array} */

    var b = this.vBuffers[index[0]];
    var attr = b.layout[index[1]];

    var values = [];

    for (var i = 0; i < attr.stride; i++)
    {
        values[i] = b.vb.getBuffer((vertexIndex * b.stride + attr.offset) + i);
    }

    return values;
}

VG.Render.Mesh.prototype.getVertex = function(vertexIndex)
{
    /** Gets a single vertex, see "get" for a lower level interface
     *  @param {Number} vertexIndex - The vertex index 
     *  @return {Object} */

    var vertex = {};

    for (var attr in this.layout)
    {
        var attrIndex = this.layout[attr];

        vertex[attr] = this.get(attrIndex, vertexIndex);
    }

    return vertex;
}

VG.Render.Mesh.prototype.applyTransform = function(m)
{
    /** Applies a Matrix4 transform to position and normals (if defined) */

    for (var i = 0; i < this.vertexCount; i++)
    {
        var v = this.getVertex(i);

        if (v.position) m.transformVectorArray(v.position);
        if (v.normal) m.transformVectorArray(v.normal, true);
        
        this.setVertex(i, v);
    }
}

VG.Render.Mesh.makeBox = function(width, height, depth)
{
    /** Makes a primitive box 
     *  @param {Number} width - The width
     *  @param {Number} height - The height
     *  @param {Number} depth - The depth
     *  @returns {VG.Render.Mesh} */
    
    var mesh = new VG.Render.Mesh();

    mesh.init(36, 0);

    mesh.setTriangleArray(
        {
            position:
            [
                +1, +1, -1, 1.0, +1, +1, +1, 1.0, +1, -1, +1, 1.0,
                +1, +1, -1, 1.0, +1, -1, +1, 1.0, +1, -1, -1, 1.0,

                -1, +1, +1, 1.0, -1, +1, -1, 1.0, -1, -1, -1, 1.0,
                -1, +1, +1, 1.0, -1, -1, -1, 1.0, -1, -1, +1, 1.0,

                -1, +1, +1, 1.0, +1, +1, +1, 1.0, +1, +1, -1, 1.0,
                -1, +1, +1, 1.0, +1, +1, -1, 1.0, -1, +1, -1, 1.0,

                -1, -1, -1, 1.0, +1, -1, -1, 1.0, +1, -1, +1, 1.0,
                -1, -1, -1, 1.0, +1, -1, +1, 1.0, -1, -1, +1, 1.0,

                +1, +1, +1, 1.0, -1, +1, +1, 1.0, -1, -1, +1, 1.0,
                +1, +1, +1, 1.0, -1, -1, +1, 1.0, +1, -1, +1, 1.0,

                -1, +1, -1, 1.0, +1, +1, -1, 1.0, +1, -1, -1, 1.0,
                -1, +1, -1, 1.0, +1, -1, -1, 1.0, -1, -1, -1, 1.0
                 
            ],
            normal:
            [
                +1,  0,  0, 0,  +1,  0,  0, 0,  +1,  0,  0, 0,  +1,  0,  0, 0,  +1,  0,  0, 0,  +1,  0,  0, 0,
                -1,  0,  0, 0,  -1,  0,  0, 0,  -1,  0,  0, 0,  -1,  0,  0, 0,  -1,  0,  0, 0,  -1,  0,  0, 0,
                 0, +1,  0, 0,   0, +1,  0, 0,   0, +1,  0, 0,   0, +1,  0, 0,   0, +1,  0, 0,   0, +1,  0, 0,
                 0, -1,  0, 0,   0, -1,  0, 0,   0, -1,  0, 0,   0, -1,  0, 0,   0, -1,  0, 0,   0, -1,  0, 0,
                 0,  0, +1, 0,   0,  0, +1, 0,   0,  0, +1, 0,   0,  0, +1, 0,   0,  0, +1, 0,   0,  0, +1, 0,
                 0,  0, -1, 0,   0,  0, -1, 0,   0,  0, -1, 0,   0,  0, -1, 0,   0,  0, -1, 0,   0,  0, -1, 0
            ]

        }
    );

    var t = new VG.Math.Matrix4();

    t.setIdentity();
    t.scale(width / 2, height / 2, depth / 2);

    mesh.applyTransform(t);

    mesh.update();

    return mesh;
}

VG.Render.Mesh.makeSphere = function(radius, segments)
{
     /** Makes a primitive sphere
     *  @param {Number} radius - The radius
     *  @param {Number} segments - The XY segment count, the higher the smoothier
     *  @returns {VG.Render.Mesh} */
    
    return VG.Render.Mesh.makeBox(radius, radius, radius);
}
