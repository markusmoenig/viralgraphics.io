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

/* Type enum */
VG.Type = { Float: 0, Uint8: 1, Uint16: 2, Uint32: 3 };

VG.Renderer = function()
{
    if (!(this instanceof VG.Renderer))
    {
        if (!VG.Renderer.instance) return new VG.Renderer();

        return VG.Renderer.instance;
    }

    VG.Renderer.instance = this;

    this.textures = new Map();
    this.w = 16;
    this.h = 16;

    /** Holds all the gpu resources for proper restoration */
    this.resources = new Map();

    this.proj2d = new VG.Math.Matrix4();

    this.shaderTex2d = new VG.Shader([
        "#version 100",
        "attribute vec4 vPos;",
        "attribute vec2 vTexCoord;",
        "varying vec2 texCoord;",
        "void main(){",
        "   texCoord = vec2(vTexCoord.x, 1.0-vTexCoord.y);",
        "   gl_Position = vPos;",
        "}", ""
    ].join('\n'), [
        "#version 100",
        "precision mediump float;",
        "uniform sampler2D tex;",
        "uniform float alpha;",
        "uniform bool premAlpha;",
        "varying vec2 texCoord;",
        "void main(){",
        "   vec4 color = texture2D(tex, texCoord);",
        "   if(premAlpha){",
        "       gl_FragColor = vec4(clamp( color.r * alpha, 0.0, 1.0), clamp( color.g * alpha, 0.0, 1.0), clamp( color.b * alpha, 0.0, 1.0), clamp( color.a * alpha, 0.0, 1.0) );",
        "   }else{",
        "       gl_FragColor = vec4(color.rgb, clamp( color.a * alpha, 0.0, 1.0) );",
        "   }",
        "}", ""
    ].join('\n'));

    this.shaderTex2d.blendType = VG.Shader.Blend.Alpha;
    this.shaderTex2d.create();

    //Generic quad buffer with uv
    this.texQuadBuffer = new VG.GPUBuffer(VG.Type.Float, 4 * 4, true);
    this.texQuadBuffer.create();

    //the main render target (it's actually null), dont need to call create.
    this.mainRT = new VG.RenderTarget(0, 0, true);
    this.mainRT.clear();

	// the render targets(fbo) for continued effect-chain process, while ping pong (switching).
	this.rtPing = new VG.RenderTarget();
	this.rtPong = new VG.RenderTarget();
    
	this.framePingPong = new VG.GPUBuffer(VG.Type.Float, 4 * 4, true);
	this.framePingPong.create();
}

VG.Renderer.prototype.addResource = function(resource)
{
    this.resources.set(resource, resource);
}

VG.Renderer.prototype.removeResource = function(resource)
{
    this.resources.delete(resource);
}

// ping pong RT mechanism - begin
VG.Renderer.prototype.startPingPong = function(width, height, imageWidth, imageHeight )
{
	this.rtPing.resetSize(width, height);
	this.rtPong.resetSize(width, height);

    this.rtPing.imageWidth=imageWidth; this.rtPing.imageHeight=imageHeight;
    this.rtPong.imageWidth=imageWidth; this.rtPong.imageHeight=imageHeight;

	this.mainRT.setViewportEx(0, VG.context.workspace.rect.height-height, width, height );
	this.prepareFrameQuad(0, 0, width, height, VG.Core.Size(width, height), this.framePingPong);
}

VG.Renderer.prototype.whilePingPong = function(texture)
{
	var rtActive;

	if (texture===this.rtPing)
		rtActive = this.rtPong;
	else
		rtActive = this.rtPing;
	
	rtActive.bind();

	return rtActive;
}

VG.Renderer.prototype.drawPingPong = function(aPos, aTex)
{
    /** Draws a frame-quad.
	 *  @param {number} aPos - The vertex coordinate attribute location of shader.
	 *  @param {number} aTex - The Texture coordinate attribute location of shader.
     *  */
    this.drawFrameQuad(aPos, aTex, true, this.framePingPong);
}

VG.Renderer.prototype.endPingPong = function(texture)
{
	if (texture.bindAsTexture) // instanceof VG.RenderTarget
		texture.unbind();
}
// ping pong RT mechanism - end

VG.Renderer.prototype.getTexture = function(source)
{
    /** Gets a texture from the pool 
     *  @param {string | VG.Core.Image} source - The image source, either a path or an image object 
     *  @returns {VG.Texture} 
     *  */
    var tex = null;

    if (this.textures.has(source))
    {
        tex = this.textures.get(source);
    }
    else if (source.bindAsTexture) // instanceof VG.RenderTarget
    {
		tex = source;
    }
    else if (source.identifyTexture) // instanceof VG.Texture
    {
		tex = source;
    }
	else
    {
        tex = new VG.Texture([source]);
        tex.create();

        this.textures.set(source, tex);
    }

    return tex;
}

VG.Renderer.prototype.onResize = function(w, h)
{
    this.w = w;
    this.h = h;

    this.resources.forEach(function(r) {
        
        if (r.bindAsTexture) // instanceof VG.RenderTarget
        {
            if (r.autoResize)
            {
                r.resize(w, h);
            }
        }

    });


    this.proj2d.setOrtho(0, this.w, this.h, 0, 1, 0);
}

VG.Renderer.prototype.restore = function()
{
    /** Calls create on every tracked gpu resource */

    //Explicity call create on each resource
    this.resources.forEach(function(r) {

        r.create();
    });
}

VG.Renderer.prototype.release = function()
{
    /** Calls release on every tracked gpu resource, it's
     *  safe to call this multiple times */
    this.resources.forEach(function(r) {
        r.destroy();
    });
}

VG.Renderer.prototype.invalidateAll = function()
{
    /** Same as release */
    this.release();
}

VG.Renderer.prototype.tick = function()
{
}

/**
 *
 * @param {Object} options - Options
 * @param {VG.Texture} options.texture - Texture to use
 * @param {number} options.x - Center x
 * @param {number} options.y - Center y
 * @param {number} options.width - Quad width
 * @param {number} options.height - Quad height
 * @param {number} [options.angle=0] - Rotation in radian ccc.
 * @param {number} [options.scale=1] - Scale
 * @param {number} [options.alpha=1] - Alpha
 * @param {VG.Core.Size} [options.viewportSize=undefined] - View port size
 */
VG.Renderer.prototype.drawQuadRotate = function(options){
    "use strict";
    var buffer,
        shader,
        db,
        i,
        x,
        y,
        dx,
        dy,
        angle,
        scale;

    var view = {
        width: this.w,
        height: this.h
    };
    if(options.viewportSize){
        view.width = options.viewportSize.width;
        view.height = options.viewportSize.height;
    }
    view.max = Math.max(view.width, view.height);
    view.min = Math.min(view.width, view.height);
    view.aspect = {
        x: view.height/view.max,
        y: view.width/view.max
    };

    // buffer init
    VG.Renderer._gpuBuffer = VG.Renderer._gpuBuffer || {};
    if(!VG.Renderer._gpuBuffer.drawQuadRotate){
        buffer = VG.Renderer._gpuBuffer.drawQuadRotate
            = new VG.GPUBuffer(VG.Type.Float, 4 * 8, true);
        buffer.create();
    }
    buffer = VG.Renderer._gpuBuffer.drawQuadRotate;

    // shader init
    VG.Renderer._shader = VG.Renderer._shader || {};
    if(!VG.Renderer._shader.drawQuadRotate){
        shader = VG.Renderer._shader.drawQuadRotate
            = new VG.Shader([
            "#version 100",
            "attribute vec2 a_center;",
            "attribute vec2 a_offset;",
            "attribute float a_angle;",
            "attribute float a_scale;",
            "attribute vec2 a_texCoord;",
            "uniform vec2 u_aspect;",
            "varying vec2 v_texCoord;",
            "void main(){",
            "   float c = cos(a_angle);",
            "   float s = sin(a_angle);",
            "   v_texCoord = vec2(a_texCoord.x, 1.0-a_texCoord.y);",
            "   vec2 offset = a_offset * a_scale;",
            "   gl_Position = vec4(a_center + vec2((offset.x*c - offset.y*s), (offset.x*s + offset.y*c))*u_aspect, 0.0, 1.0);",
            "}", ""
        ].join('\n'),[
            "#version 100",
            "precision mediump float;",
            "uniform sampler2D tex;",
            "uniform float alpha;",
            "uniform bool premAlpha;",
            "varying vec2 v_texCoord;",
            "void main(){",
            "   vec4 color = texture2D(tex, v_texCoord);",
            "   if(premAlpha){",
            "       gl_FragColor = vec4(clamp( color.r * alpha, 0.0, 1.0), clamp( color.g * alpha, 0.0, 1.0), clamp( color.b * alpha, 0.0, 1.0), clamp( color.a * alpha, 0.0, 1.0) );",
            "   }else{",
            "       gl_FragColor = vec4(color.rgb, clamp( color.a * alpha, 0.0, 1.0) );",
            "   }",
            "}", ""
        ].join('\n'));
        shader.blendType = VG.Shader.Blend.Alpha;
        shader.create();
    }
    shader = VG.Renderer._shader.drawQuadRotate;
    shader.bind();

    // shader update
    if(options.texture)
        shader.setTexture("tex", options.texture, 0);

    shader.setFloat("alpha", (typeof options.alpha === 'undefined') ? 1.0 : options.alpha);
    shader.setFloat("u_aspect", [view.aspect.x, view.aspect.y]);

    // buffer update
    x = (options.x * 2.0 / view.width - 1);
    y = options.y * 2.0 / view.height - 1;
    dx = options.width / view.min;
    dy = options.height / view.min;
    angle = typeof options.angle === 'undefined' ? 0 : options.angle;
    scale = typeof options.scale === 'undefined' ? 1.0 : options.scale;

    db = buffer.getDataBuffer(); i = 0;

    db.set(i++, x); db.set(i++, y); db.set(i++, 0.0); db.set(i++, 1.0);
    db.set(i++, -dx); db.set(i++, -dy); db.set(i++, angle); db.set(i++, scale);

    db.set(i++, x); db.set(i++, y); db.set(i++, 0.0); db.set(i++, 0.0);
    db.set(i++, -dx); db.set(i++, dy); db.set(i++, angle); db.set(i++, scale);

    db.set(i++, x); db.set(i++, y); db.set(i++, 1.0); db.set(i++, 1.0);
    db.set(i++, dx); db.set(i++, -dy); db.set(i++, angle); db.set(i++, scale);

    db.set(i++, x); db.set(i++, y); db.set(i++, 1.0); db.set(i++, 0.0);
    db.set(i++, dx); db.set(i++, dy); db.set(i++, angle); db.set(i++, scale);

    buffer.update();

    // buffer draw
    // todo: move it to shader creation, its possible if buffer.update() does not change gpu location
    buffer.vertexAttrib(shader.getAttrib("a_center"), 2, false, 32, 0);
    buffer.vertexAttrib(shader.getAttrib("a_texCoord"), 2, false, 32, 8);
    buffer.vertexAttrib(shader.getAttrib("a_offset"), 2, false, 32, 16);
    buffer.vertexAttrib(shader.getAttrib("a_angle"), 1, false, 32, 24);
    buffer.vertexAttrib(shader.getAttrib("a_scale"), 1, false, 32, 28);

    buffer.drawBuffer(VG.Renderer.Primitive.TriangleStrip, 0, 4);
};

VG.Renderer.prototype.drawQuad = function(texture, w, h, x, y, alpha, viewportSize)
{
    /** Draws a textured quad, if rect is null then it render a full screen quad
     *  unless w or h are defined 
     *  @param {VG.Texture | VG.TextureCube | VG.RenderTarget} texture - The texture to use 
     *  @param {number} w - Width in pixels 
     *  @param {number} h - Height in pixels 
     *  @param {number} x - X offset
     *  @param {number} y - Y offset
     *  @param {number} alpha - The alpha for the blend
     *  @param {VG.Core.Size} [null] viewportSize - The viewport size
     *  */

	// texture
    this.shaderTex2d.bind();
    this.shaderTex2d.setTexture("tex", texture, 0);
	
	// alpha
	if (alpha === undefined)
		alpha = 1.0;
    this.shaderTex2d.setFloat("alpha", alpha);
	
	// quad
	this.prepareFrameQuad(x, y, w, h, viewportSize);
	this.drawFrameQuad(this.shaderTex2d.getAttrib("vPos"), this.shaderTex2d.getAttrib("vTexCoord"), true);
}

VG.Renderer.prototype.prepareFrameQuad = function(x, y, w, h, viewportSize, quad)
{
    /** Prepares a frame-quad to draw, if rect is null then it render a full screen quad
     *  unless w or h are defined 
     *  @param {number} x - X offset
     *  @param {number} y - Y offset
     *  @param {number} w - Width in pixels 
     *  @param {number} h - Height in pixels 
     *  @param {VG.Core.Size} [null] viewportSize - The viewport size
	 *  @param {VG.GPUBuffer} quad - primitive to set
     *  */
    var vw = viewportSize ? viewportSize.width : this.w;
    var vh = viewportSize ? viewportSize.height : this.h;

    if (!w) w = vw;
    if (!h) h = vh;
    if (!x) x = 0;
    if (!y) y = 0;

    var b = quad ? quad : this.texQuadBuffer;
    
	var x1 = (x - vw / 2) / (vw / 2);
    var y1 = (vh / 2 - y) / (vh / 2);
    var x2 = ((x + w) - vw / 2) / (vw / 2);
    var y2 = (vh / 2 - (y + h)) / (vh / 2);

    var i = 0;
    var db=b.getDataBuffer();

    db.set(i++, x1); db.set(i++, y1); db.set(i++, 0.0); db.set(i++, 1.0);
    db.set(i++, x1); db.set(i++, y2); db.set(i++, 0.0); db.set(i++, 0.0);
    db.set(i++, x2); db.set(i++, y1); db.set(i++, 1.0); db.set(i++, 1.0);
    db.set(i++, x2); db.set(i++, y2); db.set(i++, 1.0); db.set(i++, 0.0);

    b.update();

	return b;
}

VG.Renderer.prototype.drawFrameQuad = function(aPos, aTex, nobind, quad)
{
    /** Draws a frame-quad.
	 *  @param {number} aPos - The vertex coordinate attribute location of shader.
	 *  @param {number} aTex - The Texture coordinate attribute location of shader.
	 *  @param {bool} nobind - If true the buffer wont be binded.
	 *  @param {VG.GPUBuffer} quad - primitive to draw
     *  */
	var b = quad ? quad : this.texQuadBuffer;
	if (!nobind)
		b.bind();
    b.vertexAttrib(aPos, 2, false, 16, 0);
    b.vertexAttrib(aTex, 2, false, 16, 4 * 2);

	b.drawBuffer(VG.Renderer.Primitive.TriangleStrip, 0, 4);
}

VG.Renderer.prototype.drawMesh = function(mesh, element, shader)
{
    /** Draw a mesh element(s) with a shader 
     *  @param {VG.Render.Mesh} mesh - The mesh, must be valid 
     *  @param {Number} element - The element index, -1 to draw all elements 
     *  @param {VG.Shader} shader - The shader to use */

    if (mesh.isValid() == false) return;

	var vb;
    for (var i = 0; i < mesh.vBuffers.length; i++)
    {
        vb = mesh.vBuffers[i].vb;
        var layout = mesh.vBuffers[i].layout;

        //byte stride
        var tStride = vb.getStride();
        var vStride = tStride * mesh.vBuffers[i].stride;

        vb.bind();

        for (var j = 0; j < layout.length; j++)
        {
            var vL = layout[j];
            var index = shader.getAttrib(vL.name);
            if (index < 0) continue;

            vb.vertexAttrib(index, vL.stride, false, vStride, tStride * vL.offset);
        }
    }

    var eOffset = 0;
    var eSize = 0;

    if (element == -1 || mesh.elements[element] === undefined)
    {
        eOffset = 0;
        eSize = mesh.isIndexed() ? mesh.getIndexCount() : mesh.vertexCount;
    }
    else
    {
        eOffset = mesh.elements[element].offset;
        eSize = mesh.elements[element].size;
    }

    if (mesh.isIndexed())
    {
        mesh.iBuffer.bind();
		vb.drawBuffer(VG.Renderer.Primitive.Triangles, eOffset, eSize, true, mesh.iBuffer.elemType);
    }
    else
    {
		vb.drawBuffer(VG.Renderer.Primitive.Triangles, eOffset, eSize);
    }
}


VG.Renderer.Primitive = { Triangles: 0, Lines: 1, TriangleStrip: 2, LineStrip: 3, Points: 4 };


/**
 * Namespace contains all realtime Scene / Mesh / Material classes.
 * @namespace
 */
VG.Render = {};

VG.Render.TraceContext = function()
{
    /** Ray tracing context, used with VG.Render.trace function, holds an image which gets updated
     *  per pixel/tile asynchronously
     *
     *  @constructor */ 

    /** Output image 
     *  @member {VG.Core.Image} */
    this.output = new VG.Core.Image(1, 1);
    this.output.forcePowerOfTwo = false;
    this.output.alloc();

    /** Internal ID, if set/zero then a new internal context is created 
     *  @member {Number} */
    this.id = 0;

    /** Texture to use in real time rendering 
     *  @member {VG.Texture} */
    this.texture = new VG.Texture([this.output]);
    
    /** If true then the tracing re-starts from zero, usefull when the camera or geometry changes
     *  to avoid artifacts, otherwise the tracer would continue to trace the scene with the new changes regardless
     *  
     *  This gets automatically set to false once processed.
     *  @member {Bool} */
    this.resetAccumulation = false;

    /** Set by the tracer, current iterations 
     *  @member {Number} */
    this.iterations = 0;

    /** Maximum iterations 
     *  @member {Number} */
    this.maxIterations = 512;

    /** Render scale ratio, use low values for faster iteration
     *  @member {Number} */
    this.scaleRatio = 0.5;

    /** Flag to notify scene changed
     *  @member {bool} */
    this.sceneChanged = true;

    this.texture.create();
}

VG.Render.networkTrace = function()
{
    return false; // not implemented, as for nows
}

VG.Render.TraceSettings = function()
{
    /** Ray tracing settings, used with VG.Render.trace function.
     *
     *  @constructor */ 
};
