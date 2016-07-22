/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv> and Contributors
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

VG.Render.Mesh = function(parent)
{
    /** Triangle-based mesh for realtime rendering 
     *  @constructor
     *  @param {VG.SceneNode} parent - The parent, can be null */

    /*
     To create mesh with texture coordinates use this:
     this.vertexCount = triCount * 3;
     var layout =[
         { name: "position", offset: 0, stride: 4 },
         { name: "normal", offset: 4, stride: 4 }
     ];
     if (usingTextureCoordinates) {
        layout.push({name: 'texCoord', offset: 8, stride: 2});
     }
     this.addVertexBuffer(VG.Type.Float, layout);
     this.layout = this.generateStaticLayout();

     ...

     var face = [
        {position: ..., normal: ..., texCoord: ...},
        {position: ..., normal: ..., texCoord: ...},
        {position: ..., normal: ..., texCoord: ...}
      ]
      this.setTriangle(index, face);
     */
    VG.Render.SceneNode.call(this, parent);
    
    /** Identifies this node is mesh node in native.
     * @param {bool}
     */
    this.identifyMeshSceneNode = true;

    /** Array of element definitions as { facet, offset, size } referencing the index buffer (if indexed) or the vertex buffer
     *  if empty then the mesh should be considered invalid.
     *  @member {Object} */
    this.elements = [];

    /** The material
     *  @member {Material} */
	this.material = null;

    /** The vertex count 
     *  @member {Number} */
    this.vertexCount = -1;

    /** Internal vertex buffers with an attribute definition array that goes as:
     *  {
     *      layout: [ { name, offset, stride }, ... ],
     *      vb: VG.GPUBuffer
     *  }
     *  @member {Object} */
    this.vBuffers = [];

    /**
     * Index buffer, will be initialized by init()
     * @type {VG.GPUBuffer}
     */
    this.iBuffer = null;
	this.layout = null;
    this.hasBounds = true;

    this.__cacheV3 = new VG.Math.Vector3();

}

VG.Render.Mesh.prototype = Object.create(VG.Render.SceneNode.prototype);

VG.Render.Mesh.prototype.clone = function(){
    /**
     * Clone this mesh, while not duplicating vBuffer
     * @return cloned object
     */
    var mesh = new VG.Render.Mesh();
    mesh = Object.assign(mesh, this);
    mesh._parent = undefined;
    mesh._position = new VG.Math.Vector3();
    mesh._position.copy(this._position);
    mesh._scale = new VG.Math.Vector3();
    mesh._scale.copy(this._scale);
    mesh._rotation = new VG.Math.Quat();
    mesh._rotation.copy(this._rotation);
    mesh.__cacheV3 = new VG.Math.Vector3();
    mesh.__cacheM1 = new VG.Math.Matrix4();
    mesh.__cacheM2 = new VG.Math.Matrix4();
    mesh.__cacheQ1 = new VG.Math.Quat();
    mesh.__cacheAabb = new VG.Math.Aabb();
    mesh.children = [];
    this.children.forEach(function(c){
        var c1 = c.clone();
        c1._parent = mesh;
        mesh.children.push(c1);
    });
    return mesh;
};

VG.Render.Mesh.prototype.isValid = function()
{
    /** True if the mesh is properly initialized 
     *  @returns {Bool} */
	return this.vertexCount != -1 && this.vBuffers.length != 0;
}

VG.Render.Mesh.prototype.load = function(jsobj)
{
    /** Initializes and loads the mesh from an object according to this specification: 
     *  //TODO 
     *  */    
}

VG.Render.Mesh.prototype.extractTrisFromBuffer = function(buffer)
{
    /**
     * Extract triangles from buffer.
     * For now, supporting only non-indexed buffer.
     * Implementation rely on assumptions that it's webgl buffer
     * Not support index buffer yet.
     * Assumption they are to be drawn with GL_TRIANGLES
     * @param {Object{vb:{GPUBuffer}, stride:{Number}, layout: []}}
     * @return {attribute1: [], ...} example: {position: [1, 2, 3, ...], normal: [1, ...]}
     */
    var gl = VG.WebGL.gl;
    var vb = buffer.vb;
    var db = vb.getDataBuffer();
    if (vb.target === gl.ARRAY_BUFFER) {
        console.log(db.data.length);
        var vertexCount = db.data.length/buffer.stride;
        var out = {};
        for(var name in this.layout){
            if (!this.layout.hasOwnProperty(name)) {
                continue;
            }
            out[name] = new Array(vertexCount);
            var iLayout = this.layout[name][1];
            var attr = buffer.layout[iLayout];
            var iAttr = 0;
			var iBuffer = 0;
            for(var i = 0; i < vertexCount; i++) {
                iBuffer = i*buffer.stride + attr.offset;
                iAttr = i*attr.stride;
                for(var j = 0; j < attr.stride; j++) {
                    out[name][iAttr+j] = db.data[iBuffer+j];
                }
            }
        }
        return out;
    }
};

VG.Render.Mesh.prototype._trianglesFromIndexedFaces = function(faces, scale)
{
    /**
     * load from faces with form: {v: [], vt: [], vn: [], f: [[{v: , vn:, vt: } ... ] ... ]}
     * the result will be non-indexed triangle mesh
     * @param faces Dictionary {v: [], vt: [], vn: [], f: []}
     * @param {Float} scale - scale the loaded object, default to 1
     * @return {{x:{min: int, max: int}, y:{min: int, max: int}, z:{min: int, max: int}}} Bounding box of object.
     * @private
     */
    // not using index buffer
    scale = scale === undefined ? 1.0 : scale;

    if(faces.f.length === 0){
        return;
    }
    var box = {
        x: {min: Number.MAX_VALUE, max: -Number.MAX_VALUE},
        y: {min: Number.MAX_VALUE, max: -Number.MAX_VALUE},
        z: {min: Number.MAX_VALUE, max: -Number.MAX_VALUE}
    };
    for(var i = 0; i < faces.v.length; i++) {
        var v = faces.v[i];
        box.x.min = Math.min(box.x.min, v.x * scale);
        box.x.max = Math.max(box.x.max, v.x * scale);
        box.y.min = Math.min(box.y.min, v.y * scale);
        box.y.max = Math.max(box.y.max, v.y * scale);
        box.z.min = Math.min(box.z.min, v.z * scale);
        box.z.max = Math.max(box.z.max, v.z * scale);
    }

    var triCount = faces.f.reduce(function(accum, face) {
        return accum + face.length - 2;
    }, 0);

    var use = {
        vt: faces.vt.length > 0
    };
	// create geometry
	this.vertexCount = triCount * 3;
    var layout =[
            { name: "position", offset: 0, stride: 4 },
            { name: "normal", offset: 4, stride: 4 }
    ];
    if (use.vt) {
        layout.push({name: 'texCoord', offset: 8, stride: 2});
    }
	this.addVertexBuffer(VG.Type.Float, layout);
	this.layout = this.generateStaticLayout();


    function texCoordOf(indices) {
        var v = faces.vt[indices.vt-1];
        return [v.u, v.v];
    }
    function positionOf(indices) {
        var v = faces.v[indices.v-1];
        return [v.x * scale, v.y * scale, v.z * scale, v.w === undefined ? 1.0 : parseFloat(v.w)];
    }
    function positionToVector3(indices) {
        var v = faces.v[indices.v-1];
        return new VG.Math.Vector3(v.x, v.y, v.z);
    }
    function normalOf(indices) {
        var v = faces.vn[indices.vn-1];
        return [parseFloat(v.x), parseFloat(v.y), parseFloat(v.z)];
    }
    function makeTri(a, b, c) {
        /**
         * make triangle from point a, b, c
         * @type {{position: *, normal: *}[]}
         */
        var tri = [ // simple (fan) triangulation
            {position: positionOf(a)},
            {position: positionOf(b)},
            {position: positionOf(c)}
        ];
        if (a.vn !== undefined && b.vn !== undefined && c.vn !== undefined) {
            tri[0].normal = normalOf(a);
            tri[1].normal = normalOf(b);
            tri[2].normal = normalOf(c);
        } else {
            // n = normalize((b-a).cross(c-a))
            var A = positionToVector3(a);
            var B = positionToVector3(b);
            var C = positionToVector3(c);
            var n = new VG.Math.Vector3();
            n.computeNormal(A, B, C);
            n.normalize();
            n = [n.x, n.y, n.z];
            tri[0].normal = n;
            tri[1].normal = n;
            tri[2].normal = n;
        }
        if (use.vt) {
            tri[0].texCoord = texCoordOf(a);
            tri[1].texCoord = texCoordOf(b);
            tri[2].texCoord = texCoordOf(c);
        }
        return tri;
    }
    var index = 0;
    for (var i = 0; i < faces.f.length; i ++) {
        var face = faces.f[i];
        for(var j = 0; j < face.length-2; j++) {
            this.setTriangle(index, makeTri(face[0], face[j+1], face[j+2]));
            index += 1;
        }
    }
    this.update();
    return box;
};

VG.Render.Mesh.prototype.loadFromSTL = function(objText, scale)
{
    /** Initializes and loads the mesh from an .stl string
     *  @param {String} objText - The .obj text content
     *  @param {Float} scale - scale the loaded object, default to 1
     * @return {{x:{min: int, max: int}, y:{min: int, max: int}, z:{min: int, max: int}}} Bounding box of object.
     */

    var objData = VG.Utils.parseSTL(objText);
    return this._trianglesFromIndexedFaces(objData, scale);
};

VG.Render.Mesh.prototype.isIndexed = function()
{
    /** Returns wether this mesh indexed or not, if false then this.iBuffer should be null */
    return this.iBuffer ? true : false;
}

VG.Render.Mesh.prototype.getIndexCount = function()
{
	/** Returns the index count. */
	return this.iBuffer.getDataBuffer().getSize();
}

VG.Render.Mesh.prototype.hasSubFacets = function()
{
	/** Checks if ther are sub-facets. */
	return this.elements.length > 0;
}

VG.Render.Mesh.prototype.dispose = function()
{
    /** Disposes all the buffers and set this mesh as invalid, safe to call if invalid,
     *  also safe to re-initialize */
    if (this.isValid())
	{
		for (var i = 0; i < this.vBuffers.length; i++)
        {
            this.vBuffers[i].vb_db=null;
			this.vBuffers[i].vb.dispose();
        }
	}

	if (this.isIndexed())
	{
		this.iBuffer.dispose();
		this.iBuffer = null;
	}

    this.vertexCount = -1;

	this.vBuffers = [];
    this.elements = [];
}

VG.Render.Mesh.prototype.update = function()
{
    /** Updates all buffers, for more efficient cherry-pick update, access this.iBuffer and this.vBuffers directly
     *  this also updates the scene node bounds */

    if (this.isIndexed())
		this.iBuffer.update();

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

VG.Render.Mesh.prototype.addVertexBuffer = function(type, vertexLayout, generateLayout)
{
    /** Adds a vertex buffer with the defined attribute layout. 
     *  @param {VG.Type} type - The array element type, offset and stride should be pass as element count not bytes.
     *  @param {Array} vertexLayout - The vertex layout as an array of { name, offset, stride } not in bytes.
	 *  @param {Boolean} generateLayout - creates static layout to use for reading/writing reference
	 */

    var vBuffer = { vb: null, layout: vertexLayout, stride: 0 };

    for (var i = 0; i < vBuffer.layout.length; i++)
    {
        if (this.getAttrDef(vBuffer.layout[i].name) !== false)
            throw "Attribute already defined in another buffer";
        vBuffer.stride += vBuffer.layout[i].stride;
    }

    vBuffer.vb = new VG.GPUBuffer(type, vBuffer.stride * this.vertexCount, false);
    vBuffer.vb_db = vBuffer.vb.getDataBuffer();
    vBuffer.vb.create();
    
    this.vBuffers.push(vBuffer);

	if (generateLayout)
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
    //var db=b.vb.getDataBuffer();
    for (var i = 0; i < attr.stride; i++)
    {
        var value = i < values.length ? value = values[i] : 0;

        //b.vb.setBuffer((vertexIndex * b.stride + attr.offset) + i, value);
        b.vb_db.set((vertexIndex * b.stride + attr.offset) + i, value);        
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
        if (index === undefined)
			continue;

        var b = this.vBuffers[index[0]];
        var attr = b.layout[index[1]];
        var v = array[attrName];
		var nvertex = v.length / attr.stride;

        //var db=b.vb.getDataBuffer();

        for (var vertexIndex = 0; vertexIndex < nvertex; vertexIndex++)
        {
            for (var i = 0; i < attr.stride; i++)
            {
                //b.vb.setBuffer((vertexIndex * b.stride + attr.offset) + i, v[(vertexIndex * attr.stride) + i]);
                b.vb_db.set((vertexIndex * b.stride + attr.offset) + i, v[(vertexIndex * attr.stride) + i]);
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
    //var db=b.vb.getDataBuffer();

    for (var i = 0; i < attr.stride; i++)
    {
        //values[i] = b.vb.getBuffer((vertexIndex * b.stride + attr.offset) + i);
        values[i] = b.vb_db.get((vertexIndex * b.stride + attr.offset) + i);
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

VG.Render.Mesh.prototype.onDraw = function(pipeline, context, delta)
{
	/** draw mesh
	* @param {VG.Render.Pipeline} pipeline - rendering pipeline
	* @param {VG.Render.Context} context - rendering context
	* @param {Number} delta - rendering timestamp (seconds)
	*/
    if (!this.isValid())
		return;

    var material = this.material || pipeline.defaultMaterial;
    material.bind(context);

	var viewM = context.camera.getTransform().invert();
	var mvM = new VG.Math.Matrix4(viewM);
	mvM.multiply(this.getTransform());
    material.setModelViewMatrix(mvM.elements);
    material.setProjectionMatrix(context.camera.projM.elements);

	var vb; // for native call
    for (var i = 0; i < this.vBuffers.length; i++)
    {
        vb = this.vBuffers[i].vb;
        var layout = this.vBuffers[i].layout;

        var tStride = vb.getStride();
        var vStride = tStride * this.vBuffers[i].stride;

        vb.bind();

        for (var j = 0; j < layout.length; j++)
        {
            var vL = layout[j];
            var index = material.getAttrib(vL.name);
            if (index < 0) {
                continue;
            }
            vb.vertexAttrib(index, vL.stride, false, vStride, tStride * vL.offset);
        }
    }

	material.applyLights( context.lights, viewM, context.emissiveObjects );

	if (this.isIndexed())
	{
        this.iBuffer.bind();
		if (this.hasSubFacets())
		{
			for (var ifacet = 0; ifacet < this.elements.length; ifacet++)
			{
				var facet = this.elements[ifacet];
				material.applySubMaterial(ifacet); // applies sub material
				vb.drawBuffer(VG.Renderer.Primitive.Triangles, facet.offset, facet.size, true, this.iBuffer.elemType);
			}
		}
		else
		{
			material.applySubMaterial(-1); // applies default material
			vb.drawBuffer(VG.Renderer.Primitive.Triangles, 0, this.getIndexCount(), true, this.iBuffer.elemType);
		}
	}
	else
	{
		//material.applySubMaterial(-1); // applies default material
        if ( material.applyData ) material.applyData();
		vb.drawBuffer(VG.Renderer.Primitive.Triangles, 0, this.vertexCount);
	}

	vb.purgeAttribs();
}

// utility
VG.Render.Mesh.makeBox = function(width, height, depth)
{
    /** Makes a primitive box 
     *  @param {Number} width - The width
     *  @param {Number} height - The height
     *  @param {Number} depth - The depth
     *  @returns {VG.Render.Mesh} */
    
    var mesh = new VG.Render.BoxMesh();
	mesh.setGeometry(width, height, depth);
    mesh.update();

    return mesh;
}
VG.Render.Mesh.makeBoxIndexed = function(width, height, depth)
{
    /** Makes a primitive box
     *  @param {Number} width - The width
     *  @param {Number} height - The height
     *  @param {Number} depth - The depth
     *  @returns {VG.Render.Mesh} */

    var mesh = new VG.Render.Mesh();
    mesh.vertexCount = 8;
    mesh.addVertexBuffer(VG.Type.Float,
        [
            { name: "position", offset: 0, stride: 4 }
        ]
    );
    mesh.layout = mesh.generateStaticLayout();
    mesh.setTriangleArray({
        position:[
            -1, -1, -1, 1,
            1, -1, -1, 1,
            1, 1, -1, 1,
            -1, 1, -1, 1,
            -1, -1, 1, 1,
            1, -1, 1, 1,
            1, 1, 1, 1,
            -1, 1, 1, 1,
        ]
    });
    mesh.iBuffer = new VG.GPUBuffer(VG.Type.Uint16, 3*6*2, false, true);
    mesh.iBuffer.create();
    var db = mesh.iBuffer.getDataBuffer();
    var ixs =
        [
            0, 2, 1,
            0, 3, 2,
            4, 5, 6,
            4, 6, 7,
            0, 1, 5,
            0, 5, 4,
            1, 2, 6,
            1, 6, 5,
            2, 3, 7,
            2, 7, 6,
            3, 0, 4,
            3, 4, 7
        ];
    for(var i in ixs) {
        db.set(i, ixs[i]);
    }
    var t = new VG.Math.Matrix4();
    t.setScale(width / 2, height / 2, depth / 2);
    mesh.applyTransform(t);
    mesh.update();

    return mesh;
}

VG.Render.Mesh.makeSphere = function(radius, segments)
{
     /** Makes a sphere
     *  @param {Number} radius - The radius
     *  @param {Number} segments - The segment count, the higher the smoothier
     *  @returns {VG.Render.Mesh} */

    var mesh = new VG.Render.SphereMesh( undefined, segments );
    mesh.update();

    return mesh;    
}

// Box Mesh
VG.Render.SphereMesh = function(parent, segments)
{
     /** Constructs a sphere
     *  @constructor     
     *  @param {VG.SceneNode} parent - The parent, can be null     
     *  @param {Number} segments - The segment count, the higher the smoother
     *  @returns {VG.Render.Mesh} */

    VG.Render.Mesh.call(this, parent);

    if ( !segments ) segments=5;

    var mesh = { v: [], vn: [], f: [], vt: [] };

    var step=1/segments*2;

    var radius=1;
    var pt=Math.atan2( -radius, 0 );

    var offset=0, vertexOut=1;
    while ( offset < Math.PI )
    {
        var sx=radius * Math.cos( pt + offset );
        var sy=radius * Math.sin( pt + offset );

        var nextOffset=offset+step;
        if ( nextOffset > Math.PI ) nextOffset=Math.PI;

        var nsx=radius * Math.cos( pt + nextOffset );
        var nsy=radius * Math.sin( pt + nextOffset );

        var caOffset=0; var caStep=1/segments*2;
        while ( caOffset < 2*Math.PI )
        {
            var cos=Math.cos( caOffset );
            var sin=Math.sin( caOffset );
            var ncos=Math.cos( caOffset + caStep );
            var nsin=Math.sin( caOffset + caStep );

            var x=sx * cos;
            var y=sx * sin;

            var lx=sx * ncos;
            var ly=sx * nsin;

            var nx=nsx * cos;
            var ny=nsx * sin;

            var lnx=nsx * ncos;
            var lny=nsx * nsin;

            mesh.v.push( { x: lx, y: sy, z: ly, w: 1.0 } );
            mesh.v.push( { x: x, y: sy, z: y, w: 1.0 } );
            mesh.v.push( { x: nx, y: nsy, z: ny, w: 1.0 } );
            mesh.v.push( { x: lnx, y: nsy, z: lny, w: 1.0 } );

            var poly = [];
            poly.push( { v : vertexOut }, { v : vertexOut+1 }, { v : vertexOut+2 }, { v : vertexOut+3 } );
            mesh.f.push( poly );   
            vertexOut+=4;

            caOffset+=caStep;
        }

        offset+=step;
    }

    this._trianglesFromIndexedFaces( mesh, 1.0 );
};

VG.Render.SphereMesh.prototype = Object.create(VG.Render.Mesh.prototype);

VG.Render.SphereMesh.prototype.setRadius = function(radius)
{
    /** Sets the radius for the sphere
     *  @param {Number} radius - The radius
     */

    // scale box
    var t = new VG.Math.Matrix4();
    t.setScale(radius, radius, radius);
    this.applyTransform(t);

    this.radius=radius;
}

// Box Mesh
VG.Render.BoxMesh = function(parent)
{
    /** Triangle-based box mesh
     *  @constructor
     *  @param {VG.SceneNode} parent - The parent, can be null */

	VG.Render.Mesh.call(this, parent);

	// constants for 6 facets index
	var v = 0;
	this.Left = v++;
	this.Right = v++;
	this.Bottom = v++;
	this.Top = v++;
	this.Back = v++;
	this.Front = v++;

	// create geometry
	this.vertexCount = 36; // 6(facet) * 2(face-triangle) * 3(vertex) = 36 vertex
	this.addVertexBuffer(VG.Type.Float,
		[
			{ name: "position", offset: 0, stride: 4 },
			{ name: "normal", offset: 4, stride: 4 }
		]
	);
	this.layout = this.generateStaticLayout();
}

VG.Render.BoxMesh.prototype = Object.create(VG.Render.Mesh.prototype);

VG.Render.BoxMesh.prototype.setGeometry = function(width, height, depth)
{
    /** Makes a primitive box (position, normal for every vertex)
     *  @param {Number} width - The width
     *  @param {Number} height - The height
     *  @param {Number} depth - The depth
	 */
    this.setTriangleArray(
        {
            position:
            [
				// left
                -1, +1, +1, 1.0, -1, +1, -1, 1.0, -1, -1, -1, 1.0,
                -1, +1, +1, 1.0, -1, -1, -1, 1.0, -1, -1, +1, 1.0,
				// right
                +1, +1, -1, 1.0, +1, +1, +1, 1.0, +1, -1, +1, 1.0,
                +1, +1, -1, 1.0, +1, -1, +1, 1.0, +1, -1, -1, 1.0,
				// bottom
                -1, -1, -1, 1.0, +1, -1, -1, 1.0, +1, -1, +1, 1.0,
                -1, -1, -1, 1.0, +1, -1, +1, 1.0, -1, -1, +1, 1.0,
				// top
                -1, +1, +1, 1.0, +1, +1, +1, 1.0, +1, +1, -1, 1.0,
                -1, +1, +1, 1.0, +1, +1, -1, 1.0, -1, +1, -1, 1.0,
				// back
                -1, +1, -1, 1.0, +1, +1, -1, 1.0, +1, -1, -1, 1.0,
                -1, +1, -1, 1.0, +1, -1, -1, 1.0, -1, -1, -1, 1.0,
				// front
                +1, +1, +1, 1.0, -1, +1, +1, 1.0, -1, -1, +1, 1.0,
                +1, +1, +1, 1.0, -1, -1, +1, 1.0, +1, -1, +1, 1.0
            ],
            normal:
            [
				// left
                -1,  0,  0, 0,  -1,  0,  0, 0,  -1,  0,  0, 0,  -1,  0,  0, 0,  -1,  0,  0, 0,  -1,  0,  0, 0,
				// right
                +1,  0,  0, 0,  +1,  0,  0, 0,  +1,  0,  0, 0,  +1,  0,  0, 0,  +1,  0,  0, 0,  +1,  0,  0, 0,
				// bottom
                 0, -1,  0, 0,   0, -1,  0, 0,   0, -1,  0, 0,   0, -1,  0, 0,   0, -1,  0, 0,   0, -1,  0, 0,
				// top
                 0, +1,  0, 0,   0, +1,  0, 0,   0, +1,  0, 0,   0, +1,  0, 0,   0, +1,  0, 0,   0, +1,  0, 0,
				// back
                 0,  0, -1, 0,   0,  0, -1, 0,   0,  0, -1, 0,   0,  0, -1, 0,   0,  0, -1, 0,   0,  0, -1, 0,
				// front
                 0,  0, +1, 0,   0,  0, +1, 0,   0,  0, +1, 0,   0,  0, +1, 0,   0,  0, +1, 0,   0,  0, +1, 0
            ]
        }
    );

	// scale box
    var t = new VG.Math.Matrix4();
    t.setScale(width / 2, height / 2, depth / 2);
    this.applyTransform(t);
}

VG.Render.BoxMesh.prototype.makeSubFacets = function()
{
	/** make 6 facets (left, right, bottom, top, back, front)
	*/
    this.iBuffer = new VG.GPUBuffer(VG.Type.Uint8, this.vertexCount, false, true);
    this.iBuffer.create();
    var db=this.iBuffer.getDataBuffer();
	for (var idx = 0; idx < this.vertexCount; idx++)
	{
		//this.iBuffer.setBuffer(idx, idx);
        db.set(idx, idx);
	}
	this.elements[this.Left] = {facet:"Left", offset:0, size:6};
	this.elements[this.Right] = {facet:"Right", offset:6, size:6};
	this.elements[this.Bottom] = {facet:"Bottom", offset:12, size:6};
	this.elements[this.Top] = {facet:"Top", offset:18, size:6};
	this.elements[this.Back] = {facet:"Back", offset:24, size:6};
	this.elements[this.Front] = {facet:"Front", offset:30, size:6};
}