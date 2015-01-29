/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>.
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
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// Web specific Implementations

// --- VG WebGL Globals
VG.WebGL={};

// --- VG.init

VG.init=function() 
{ 
    VG.WebGL.canvas=document.getElementById( 'webgl' );
    VG.WebGL.gl=WebGLUtils.setupWebGL( VG.WebGL.canvas );
}

VG.GPUBuffer = function(type, size, dynamic, isIndexBuffer)
{
    /** Creates a new buffer
     *  @constructor
     *  @param {enum} type - The buffer type: VG.Type.Float, VG.Type.Uint8, VG.Type.Uint16
     *  @param {number} size - The buffer size (not in bytes!)
     *  @param {enum} dynamic - Usage hint for the driver
     *  @param {bool} isIndexBuffer - True is this is an index (ELEMENT_ARRAY) buffer 
     *  */

    //just for constant access, no gl calls are performed here.
    var gl = VG.WebGL.gl;

    //in webgl this is represented as an object, but it still an id.
    this.id = 0; //On context lost, this must be set to zero/null
    this.usage = dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

    this.target = isIndexBuffer ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;

    /* The internal data in native code must be in bytes so it should allocated like this:
     * int stride = (value from a type switch) ie case TYPE_FLOAT: stride = sizeof(float);
     * char* pData = new char[stride * size);
     * */
    this.data = null;


    //TODO add more type cases (this are enough for common and advanced usages)
    switch (type)
    {
    case VG.Type.Float:
        this.elemType = gl.FLOAT;
        this.data = new Float32Array(size); 
        break;
    case VG.Type.Uint8: 
        this.elemType = gl.UNSIGNED_BYTE;
        this.data = new Uint8Array(size); 
        break;
    case VG.Type.Uint16:
        this.elemType = gl.UNSIGNED_SHORT;
        this.data = new Uint16Array(size); 
        break;
    }

    //This shouldn't happend in native code as the enum is constant
    if (!this.data) throw "Data is null, unkown/invalid type?";

    VG.Renderer().addResource(this);
}

VG.GPUBuffer.prototype.getSize = function()
{
    /** Returns the size (not in bytes but elements)
     *  @returns {number}
     *  */
    return this.data.length;
}

VG.GPUBuffer.prototype.getStride = function()
{
    /** Returns the stride in bytes
     *  @returns {number}
     *  */

    return this.data.BYTES_PER_ELEMENT;
}

VG.GPUBuffer.prototype.setBuffer = function(index, value)
{
    /** Sets the buffer data by index
     *  @param {number} index - The index in the buffer, must be < size 
     *  @param {*} */
    this.data[index] = value;
}

VG.GPUBuffer.prototype.bind = function()
{
    /** Binds the buffer */
    var gl = VG.WebGL.gl;

    gl.bindBuffer(this.target, this.id);
}

VG.GPUBuffer.prototype.update = function(offset, count, nobind)
{
    /** Updates the buffer from ram to vram
     *  @param {number} [0] offset - The buffer offset
     *  @param {number} [size] count - The count or size to update from the offset
     *  @param {bool} [false] nobind - If true then the buffer wont be binded.
     *  */
    var gl = VG.WebGL.gl;

    if (this.id === 0) this.create();

    if (!offset)
    {
        offset = 0;
    }

    if (!nobind)
    {
        this.bind();
    }

    if (!count)
    {
        count = this.data.length;
    }

    //On native code, check for offset + cout overflow, or it will crash
    
    //this does not allocate a new buffer, just a hack for webgl (subarray returns a view)
    //for native opengl would be  glBufferSubData(target, offset, count, dataPtr); in BYTES!
    
    if (count >= this.data.length)
    {
        gl.bufferData(this.target, this.data, this.usage);
    }
    else
    {
        var data = this.data.subarray(offset, count);

        gl.bufferSubData(this.target, offset, data);
    }
}

VG.GPUBuffer.prototype.create = function()
{
    /** Restores or creates the buffer in the gpu */

    var gl = VG.WebGL.gl;

    if (this.id !== 0)
    {
        throw "Unexpected buffer creation (buffer already create)";
    }

    this.id = gl.createBuffer();

    this.bind();
    gl.bufferData(this.target, this.data, this.usage);
}

VG.GPUBuffer.prototype.destroy = function()
{
    /** Releases the buffer from GPU, it can be send again with buffer.create */
    if (this.id === 0) return;

    var gl = VG.WebGL.gl;

    gl.deleteBuffer(this.id);

    this.id = 0;
}

VG.GPUBuffer.prototype.dispose = function()
{
    /** Disposes this object and becomes invalid for further use */

    this.destroy();
    VG.Renderer().removeResource(this);
}

VG.GPUBuffer.prototype.vertexAttrib = function(index, size, norm, stride, offset)
{
    /** Pointers a buffer to a vertex attribute 
     *  @param {number} index - The attribute index
     *  @param {number} size - Element size ie 2 floats 
     *  @param {bool} norm - if true then the value it's normalized regardless 
     *  @param {number} stride - Vertex stride in bytes 
     *  @param {number} offset - Vertex offset */

    var gl = VG.WebGL.gl;

    gl.vertexAttribPointer(index, size, this.elemType, norm, stride, offset);
    gl.enableVertexAttribArray(index);
} 

VG.GPUBuffer.prototype.draw = function(primType, offset, count, nobind)
{
    /** Draws primitives
     *  @param {enum} primType - Primitive type VG.Primitive.Triangles, VG.Primitive.Lines VG.Primitive.TriangleStip VG.Primitive.LineStrip 
     *  @param {number} offset - The offset or start index 
     *  @param {number} count - The count from the offset on 
     *  @param {bool} nobind - If true the buffer wont be binded
     *  */
    var gl = VG.WebGL.gl;

    if (!nobind)
    {
        this.bind();
    }

    var mode = gl.TRIANGLES;

    switch (primType)
    {
    case VG.Renderer.Primitive.Lines: mode = gl.LINES; break;
    case VG.Renderer.Primitive.LineStrip: mode = gl.LINE_STRIP; break;
    case VG.Renderer.Primitive.TriangleStrip: mode = gl.TRIANGLE_STRIP; break;
    }

    gl.drawArrays(mode, offset, count);
}

VG.GPUBuffer.prototype.drawIndexed = function(primType, offset, count, indexType, indexBuffer, nobind)
{
    /** Draws indexed primitives
     *  @param {enum} primType - Primitive type VG.Primitive.Triangles, VG.Primitive.Lines VG.Primitive.TriangleStip VG.Primitive.LineStrip 
     *  @param {number} offset - The index offset or start index 
     *  @param {number} count - The index count from the offset on
     *  @param {enum} indexType - The index type: VG.Type.Uint8 or VG.Type.Uint16 
     *  @param {VG.GPUBuffer} indexBuffer - The index buffer
     *  @param {bool} nobind - If true no buffer will be binded including the index buffer
     *  */
    var gl = VG.WebGL.gl;   

    var mode = gl.TRIANGLES;

    if (!nobind)
    {
        this.bind();
        indexBuffer.bind();
    }

    switch (primType)
    {
    case VG.Renderer.Primitive.Lines: mode = gl.LINES; break;
    case VG.Renderer.Primitive.LineStrip: mode = gl.LINE_STRIP; break;
    case VG.Renderer.Primitive.TriangleStrip: mode = gl.TRIANGLE_STRIP; break;
    }

    var glType = indexType == VG.Type.Uint8 ? gl.UNSIGNED_BYTE : gl.UNSIGNED_SHORT;

    gl.drawElements(mode, count, glType, offset);
}













VG.Shader = function(vertSrc, fragSrc)
{
    /** Creates a new shader from a pair of vertex and fragment sources
     *  @constructor
     *  @param {string} vertSrc - Vertex shader source
     *  @param {string} fragSrc - Fragment/Pixel shader source
     *  */



    /** Enables writing to the depth buffer, default is false 
     *  @member {bool} */
    this.depthWrite = false;

    /** Enables depth testing, default is false
     *  @member {bool} */
    this.depthTest = false;

    /** BlendType default is VG.Shader.Blend.None
     *  @member {enum} */
    this.blendType = VG.Shader.Blend.None;

    /** BackFace culling, default is false
     *  @member {bool} */
    this.culling = false;




    //keep a copy of the source
    this.vsrc = vertSrc;
    this.fsrc = fragSrc;

    this.vid = 0;
    this.fid = 0;

    //program id
    this.id = 0;

    VG.Renderer().addResource(this);
}

VG.Shader.Blend = { None: 0, Alpha: 1 };

VG.Shader.prototype.create = function()
{
    /** Copiles, links and creates the shader program */

    var gl = VG.WebGL.gl;

    this.vid = gl.createShader(gl.VERTEX_SHADER);
    this.fid = gl.createShader(gl.FRAGMENT_SHADER);


    function Compile(id, src)
    {
        gl.shaderSource(id, src);
        gl.compileShader(id);

        if (!gl.getShaderParameter(id, gl.COMPILE_STATUS))
        {
            var error = gl.getShaderInfoLog(id);
            console.error(error);
            return false;
        }

        return true;
    }
    
    if (!Compile(this.vid, this.vsrc) || !Compile(this.fid, this.fsrc))
    {
        gl.deleteShader(this.vid);
        gl.deleteShader(this.fid);

        throw "Failed to compile shaders";
        return;
    }

    this.id = gl.createProgram();
    

    gl.attachShader(this.id, this.vid);
    gl.attachShader(this.id, this.fid);

    gl.linkProgram(this.id);

    if (!gl.getProgramParameter(this.id, gl.LINK_STATUS))
    {
        var error = gl.getProgramInfoLog(program);

        this.destroy();
        
        throw 'Failed to link program: ' + error;
    }
}

VG.Shader.prototype.destroy = function()
{
    /** Releases the shader from gpu */
    if (this.id === 0) return;

    var gl = VG.WebGL.gl;

    gl.deleteProgram(this.id);
    gl.deleteShader(this.vid);
    gl.deleteShader(this.fid);

    this.id = 0;
    this.vid = 0;
    this.fid = 0;
}

VG.Shader.prototype.bind = function()
{
    /** Binds the shader program */

    var gl = VG.WebGL.gl;

    gl.useProgram(this.id);


    //TODO create fingerprint or software state checking

    //blend states
    if (this.blendType == VG.Shader.Blend.None)
    {
        gl.disable(gl.BLEND);
    }
    else
    {
        gl.enable(gl.BLEND);

        switch (this.blendType)
        {
        case VG.Shader.Blend.Alpha:
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            break;
        }
    }

    //depth states
    if (this.depthTest)
    {
        gl.enable(gl.DEPTH_TEST);
    }
    else
    {
        gl.disable(gl.DEPTH_TEST);
    }

    if (this.depthWrite)
    {
        gl.depthFunc(gl.LESS);
    }
    else
    {
        gl.depthFunc(gl.NEVER);
    }


    //culling states
    if (!this.culling)
    {
        gl.disable(gl.CULL_FACE);
    }
    else
    {
        gl.enable(gl.CULL_FACE);

        gl.cullFace(gl.BACK);

    }
}

VG.Shader.prototype.getUniform = function(name)
{
    /** Returns the uniform location/index 
     *  @param {string} name - The uniform name as set in the source
     *  @returns {number}
     *  */
    var gl = VG.WebGL.gl;

    return gl.getUniformLocation(this.id, name);
}

VG.Shader.prototype.dispose = function()
{
    /** Disposes this object and becomes invalid for further use */

    this.destroy();
    VG.Renderer().removeResource(this);
}

VG.Shader.prototype.getAttrib = function(name)
{
    /** Queries the attribute location/index
     *  @param {string} name - The attribute name as set in the source
     *  @returns {number}
     *  */
    var gl = VG.WebGL.gl;

    return gl.getAttribLocation(this.id, name);
}

VG.Shader.prototype.setFloat = function(uniform, value)
{
    /** Sets single float or float array, the shader must be binded
     *  @param {number | string} uniform - Takes either a location/index or the name
     *  @param {float | array} value - A single float value or an array of maximum 4 values
     *  */

    var gl = VG.WebGL.gl;

    if (!(uniform instanceof WebGLUniformLocation))
    {
        uniform = this.getUniform(uniform);
    }

    if (value instanceof Array)
    {
        if (value.length == 0) throw "Array is empty";

        switch (Math.min(value.length, 4))
        {
        case 1:
        default: 
            gl.uniform1f(uniform, value[0]); 
            break;
        case 2: 
            gl.uniform2fv(uniform, value); 
            break;
        case 3: 
            gl.uniform3fv(uniform, value); 
            break;
        case 4: 
            gl.uniform4fv(uniform, value); 
            break;
        }
    }
    else
    {
        gl.uniform1f(uniform, value);
    }
}

VG.Shader.prototype.setTexture = function(uniform, texture, slot)
{
    /** Sets a texture
     *  @param {number | string} uniform - Takes either a location/index or the name
     *  @param {VG.Texture2D | VG.TextureCube | VG.RenderTarget} texture - The texture to set
     *  */

    var gl = VG.WebGL.gl;

    if (!(uniform instanceof WebGLUniformLocation))
    {
        uniform = this.getUniform(uniform);
    }


    gl.activeTexture(gl["TEXTURE" + slot]);

    if (texture instanceof VG.RenderTarget)
    {
        texture.bindAsTexture();
    }
    else
    {
        texture.bind();
    }

    gl.uniform1i(uniform, slot); 
}

VG.Shader.prototype.setColor = function(uniform, value)
{
    /** Sets a single VG.Core.Color
     *  @param {number | string} uniform - Takes either a location/index or the name
     *  @param {VG.Core.Color} value - A single color
     *  */

    this.setFloat(uniform, [value.r, value.g, value.b, value.a]);
}

VG.Shader.prototype.setColor3 = function(uniform, value)
{
    /** Sets a single vec3/rgb VG.Core.Color
     *  @param {number | string} uniform - Takes either a location/index or the name
     *  @param {VG.Core.Color} value - A single color
     *  */

    this.setFloat(uniform, [value.r, value.g, value.b]);
}

VG.Shader.prototype.setInt = function(uniform, value)
{
    /** Sets single int or int array, the shader must be binded
     *  @param {number | string} uniform - Takes either a location/index or the name
     *  @param {number | array} value - A single int value or an array of maximum 4 values
     *  */

    var gl = VG.WebGL.gl;

    if (!(uniform instanceof WebGLUniformLocation))
    {
        uniform = this.getUniform(uniform);
    }

    if (value instanceof Array)
    {
        if (value.length == 0) throw "Array is empty";

        switch (Math.min(value.length, 4))
        {
        case 1:
        default: 
            gl.uniform1i(uniform, value[0]); 
            break;
        case 2: 
            gl.uniform2iv(uniform, value); 
            break;
        case 3: 
            gl.uniform3iv(uniform, value); 
            break;
        case 4: 
            gl.uniform4iv(uniform, value); 
            break;
        }
    }
    else
    {
        gl.uniform1i(uniform, value);
    }
}

VG.Shader.prototype.setMatrix = function(uniform, value, transpose)
{
    /** Sets a matrix from a float array, the shader must be binded
     *  @param {number | string} uniform - Takes either a location/index or the name
     *  @param {array} value - A float array (2x2, 3x3 or 4x4)
     *  @param {bool} [false] transpose - If true transposes the matrix
     *  */

    var gl = VG.WebGL.gl;

    if (!(uniform instanceof WebGLUniformLocation))
    {
        uniform = this.getUniform(uniform);
    }

    if (!transpose)
    {
        transpose = false;
    }

    if (value.length == 0) throw "Array is empty";

    switch (Math.min(value.length, 16))
    {
    case 4:
    default:
        gl.uniformMatrix2fv(uniform, transpose, value); 
        break;
    case 9: 
        gl.uniformMatrix3fv(uniform, transpose, value); 
        break;
    case 16:
        gl.uniformMatrix4fv(uniform, transpose, value); 
        break;
    }
}













//TODO add option to provide with custom/pre-generated mipmaps
VG.Texture = function(images, cube)
{
    /** 2d texture
     *  @constructor 
     *  @param {VG.Core.Image} images - The source images
     *  @param {bool} cube - If true then the image array is treated as cube faces
     *  */

    /** Texture coordinate wrapping
     * @member {enum} */
    this.wrapU = VG.Texture.Wrap.Clamp;

    /** Texture coordinate wrapping
     * @member {enum} */
    this.wrapV = VG.Texture.Wrap.Clamp;

    /** If true generates and uses mipmaps
     * @member {bool} */
    this.mipmaps = false;

    /** Texture filtering VG.Texture.FilterNone, VG.Texture.Filter.Bilinear, 
     * VG.Texture.Filter.Trilinear, VG.Texture.Filter.Anisotropic
     * @member {enum}*/
    this.filtering = VG.Texture.Filter.None;

    this.initW = images[0].realWidth;
    this.initH = images[0].realHeight;


    var gl = VG.WebGL.gl;


    this.target = cube ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D;

    if (!images instanceof Array) throw "images is not an array";

    this.images = images;

    this.id = 0;
    VG.Renderer().addResource(this);
}

VG.Texture.prototype.bind = function()
{
    /** Binds the texture */

    var gl = VG.WebGL.gl;

    if (this.target == gl.TEXTURE_2D && this.images[0].needsUpdate)
    {
        this.images[0].needsUpdate = false;
        this.update();
    }

    gl.bindTexture(this.target, this.id);
}

VG.Texture.prototype.create = function()
{
    /** Creates the texture on the gpu */

    if (this.id == 9) throw "Texture already on gpu";

    var gl = VG.WebGL.gl;

    this.id = gl.createTexture(this.target);

    this.bind();


    if (this.mipmaps)
    {
        gl.generateMipmap(this.target);
    }

    var minFilter = this.mipmaps ? gl.NEAREST_MIPMAP_NEAREST : gl.NEAREST;
    var magFilter = gl.NEAREST;

    var wrapS = this.wrapU == VG.Texture.Wrap.Clamp ? gl.CLAMP_TO_EDGE : gl.REPEAT;
    var wrapT = this.wrapV == VG.Texture.Wrap.Clamp ? gl.CLAMP_TO_EDGE : gl.REPEAT;


    switch (this.filtering)
    {
    case VG.Texture.Filter.Bilinear:
        minFilter = this.mipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR;
        magFilter = gl.LINEAR;
        break;
    case VG.Texture.Filter.Anisotropic: //TODO check for the extension
    case VG.Texture.Filter.Trilinear:
        minFilter = this.mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
        magFilter = gl.LINEAR;
        break;
    }

    gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, magFilter);

    gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, wrapT);
    

    var image = this.images[0];


    var w = image.realWidth;
    var h = image.realHeight; 

    this.initW = w;
    this.initH = h;    

    if (this.target == gl.TEXTURE_CUBE_MAP)
    {
        var faceOrder = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        if (this.images.length != 6) throw "unexpected number of faces";

        for (var i = 0; i < this.images.length; i++)
        {
            gl.texImage2D(faceOrder[i], 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.images[i].data); 
        }

    }
    else
    {
        gl.texImage2D(this.target, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
    }
}

VG.Texture.prototype.update = function(x, y, w, h)
{
    /** Updates the image pixel data from the internal image, cube textures are not supported
     * 
     *  @param {number} [0] x - The X offset
     *  @param {number} [0] y - The y offset
     *  @param {number} [-1] w - The width, defaults to full width or -1
     *  @param {number} [-1] h - The height, default to full height or -1
     */

    var gl = VG.WebGL.gl;

    if (this.target == gl.TEXTURE_CUBE_MAP) return;


    var image = this.images[0];

    var imW = image.realWidth;
    var imH = image.realHeight;


    //if the dimmension has changed, recreate the texture from scratch
    if (imW != this.initW || imH != this.initH)
    {
        this.destroy();
        this.create();

        return;
    }


    if (!x) x = 0;
    if (!y) y = 0;
    if (!w) w = imW;
    if (!h) h = imH;

    gl.bindTexture(this.target, this.id);
    gl.texSubImage2D(this.target, 0, x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
}

VG.Texture.prototype.destroy = function()
{
    /** Releases the texture from gpu */
    if (this.id === 0) return;

    var gl = VG.WebGL.gl;

    gl.deleteTexture(this.id);

    this.id = 0;
}

VG.Texture.prototype.dispose = function()
{
    /** Disposes the texture */

    this.destroy();
    VG.Renderer().removeResource(this);
}



VG.Texture.Wrap = { Clamp: 0, Repeat: 1 };
VG.Texture.Filter = { None: 0, Linear: 1, Bilinear: 2, Trilinear: 3, Anisotropic: 4 };









VG.RenderTarget = function(w, h, main)
{
    /** A frame buffer that can be binded as a texture, if width or 
     *  height are not provided, it will resize automatically. 
     *  @constructor 
     *  @param {number} w - Width in pixels
     *  @param {number} h - Height in pixels 
     *  @param {bool} main - Determines if this is a main frame bufer
     *  */

    this.w = w ? w : 16;
    this.h = h ? h : 16;

    this.main = main;

    this.autoResize = w === undefined || h === undefined;

    this.id = 0;
    this.rbid = 0;

    if (main)
    {
        //force autoResize if this is a main frame buffer
        this.autoResize = true;
    }

    //this holds the texture
    this.texid = 0;
    VG.Renderer().addResource(this);
}

VG.RenderTarget.prototype.create = function()
{
    /** Creates the frame buffer in the gpu */
    if (this.main) return;

    var gl = VG.WebGL.gl;

    if (this.id !== 0) throw "RenderTarget already created";


    this.id = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);



    this.texid = gl.createTexture(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, this.texid);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    


    //we dont need to assign any data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    //gl.generateMipmap(gl.TEXTURE_2D);


    this.rbid = gl.createRenderbuffer();

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.rbid);
    //set the depth buffer, standard 16bit for better portability
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.w, this.h);

    //attach the texture
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texid, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.rbid);


    //make sure to clear to default
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

VG.RenderTarget.prototype.destroy = function()
{
    /** Realeses the frame buffer from gpu */
    if (this.id === 0) return;

    var gl = VG.WebGL.gl;

    gl.deleteFramebuffer(this.id);
    gl.deleteRenderbuffer(this.rbid);
    gl.deleteTexture(this.texid);

    this.id = 0;
    this.rbid = 0;
    this.texid = 0;
}

VG.RenderTarget.prototype.dispose = function()
{
    /** Disposes the render target */
    this.destroy();
    VG.Renderer().removeResource(this);
}

VG.RenderTarget.prototype.unbind = function()
{
    /** Unbinds the frame buffer, in this case the main frame buffer will be
     *  used for rendering */
    var gl = VG.WebGL.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

VG.RenderTarget.prototype.bind = function()
{
    /** Binds the frame buffer, unbind must be called aftet drawing to ensure
     *  flush into the main frame buffer */
    var gl = VG.WebGL.gl;

    if (this.main)
    {
        //force unbind if any
        this.unbind();
    }
    else
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    }
}

VG.RenderTarget.prototype.bindAsTexture = function()
{
    /** Binds this frame buffer as a texture */
    var gl = VG.WebGL.gl;

    if (this.main) throw "You can't bind a main frame buffer as texture";

    gl.bindTexture(gl.TEXTURE_2D, this.texid);
}

VG.RenderTarget.prototype.resize = function(w, h)
{
    /** Resizes the frame buffer, it must not be binded as this recreates
     *  the interal data */

    this.destroy();

    this.w = w;
    this.h = h;

    this.create();
}

VG.RenderTarget.prototype.setViewport = function(rect)
{
    /** Sets the drawing viewport for the next draw call and on 
     *  @param {VG.Core.Rect} rect - The rect to be used */

    var gl = VG.WebGL.gl;

    gl.viewport(rect.x, rect.y, rect.width, rect.height);
}

VG.RenderTarget.prototype.setScissor = function(rect)
{
    /** Sets the scissor for the next draw call and on, it discards pixels outside the rect
     *  @param {VG.Core.Rect} rect - The rect, if null/false then it clears it.*/
    var gl = VG.WebGL.gl;

    if (rect)
    {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(rect.x, this.h - rect.bottom(), rect.width, rect.height);        
    }
    else
    {
        //disable scissor
        gl.disable(gl.SCISSOR_TEST);
    }
}

VG.RenderTarget.prototype.clear = function(color, depth)
{
    /** Clears the frame buffer
     *  @param {VG.Core.Color} color  - The color to clear to 
     *  @param {numbeR} depth - If defined then the depth buffer is cleared with this value */
    var gl = VG.WebGL.gl;

    var clearBits = 0;

    if (color !== false)
    {
        if (color instanceof VG.Core.Color)
        {
            gl.clearColor(color.r, color.g, color.b, color.a);
        }

        clearBits |= gl.COLOR_BUFFER_BIT;
    }

    if (depth !== false)
    {
        gl.clearDepth(depth);
        clearBits |= gl.DEPTH_BUFFER_BIT;
    }


    gl.clear(clearBits);
}


