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
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* Type enum */
VG.Type = { Float: 0, Uint8: 1, Uint16: 2 };



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

    this.shaderTex2d = new VG.Shader(
        "#version 100\n\n" +
        "attribute vec4 vPos;\n"+
        "attribute vec2 vTexCoord;\n\n" +
        "varying vec2 texCoord;\n\n" +

        "void main() {\n" +
        "   texCoord = vTexCoord;\n" +
        "   texCoord.y = 1.0 - vTexCoord.y;\n" +
        "   gl_Position = vPos;" +
        "}",

        "#version 100\n\n" +

        "precision mediump float;\n\n" +

        "uniform sampler2D tex;\n\n" +

        "uniform float alpha;\n\n" +

        "varying vec2 texCoord;\n\n" +

        "void main() {\n" +
        "   vec4 color = texture2D(tex, texCoord);\n" +
        "   gl_FragColor = vec4(color.rgb, color.a * alpha);\n" +
        "}\n");

    this.shaderTex2d.blendType = VG.Shader.Blend.Alpha;
    this.shaderTex2d.create();


    //Generic quad buffer with uv
    this.texQuadBuffer = new VG.GPUBuffer(VG.Type.Float, 4 * 4, true);
    this.texQuadBuffer.create();




    //the main render target (it's actually null), dont need to call create.
    this.mainRT = new VG.RenderTarget(0, 0, true);
    this.mainRT.clear();

}

VG.Renderer.prototype.addResource = function(resource)
{
    this.resources.set(resource, resource);
}

VG.Renderer.prototype.removeResource = function(resource)
{
    this.resource.delete(resource);
}

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
        
        if (r.bindAsTexture)// instanceof VG.RenderTarget)
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

VG.Renderer.prototype.drawQuad = function(texture, w, h, x, y, alpha)
{
    /** Draws a textured quad, if rect is null then it render a full screen quad
     *  unless w or h are defined 
     *  @param {VG.Texture | VG.TextureCube | VG.RenderTarget} texture - The texture to use 
     *  @param {number} w - Width in pixels 
     *  @param {number} h - Height in pixels 
     *  @param {number} x - X offset
     *  @param {number} y - Y offset
     *  @param {number} alpha - The alpha for the blend
     *  */

    if (!w) w = this.w;
    if (!h) h = this.h;
    if (!x) x = 0;
    if (!y) y = 0;
    if (alpha === undefined) alpha = 1.0;

    this.shaderTex2d.bind();
    this.shaderTex2d.setTexture("tex", texture, 0);
    this.shaderTex2d.setFloat("alpha", alpha);

    var b = this.texQuadBuffer;


    var x1 = (x - this.w / 2) / (this.w / 2);
    var y1 = (this.h / 2 - y) / (this.h / 2);
    var x2 = ((x + w) - this.w / 2) / (this.w / 2);
    var y2 = (this.h / 2 - (y + h)) / (this.h / 2);

    var i = 0;

    b.setBuffer(i++, x1); b.setBuffer(i++, y1); b.setBuffer(i++, 0.0); b.setBuffer(i++, 1.0);
    b.setBuffer(i++, x1); b.setBuffer(i++, y2); b.setBuffer(i++, 0.0); b.setBuffer(i++, 0.0);
    b.setBuffer(i++, x2); b.setBuffer(i++, y1); b.setBuffer(i++, 1.0); b.setBuffer(i++, 1.0);
    b.setBuffer(i++, x2); b.setBuffer(i++, y2); b.setBuffer(i++, 1.0); b.setBuffer(i++, 0.0); 


    b.update();

    b.vertexAttrib(this.shaderTex2d.getAttrib("vPos"), 2, false, 16, 0);
    b.vertexAttrib(this.shaderTex2d.getAttrib("vTexCoord"), 2, true, 16, 4 * 2);
    
    b.draw(VG.Renderer.Primitive.TriangleStrip, 0, 4, true); 
}

VG.Renderer.Primitive = { Triangles: 0, Lines: 1, TriangleStrip: 2, LineStrip: 3 };
