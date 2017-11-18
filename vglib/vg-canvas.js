/*
 * Copyright (c) 2014-2017 Markus Moenig <markusm@visualgraphics.tv> and Contributors
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

/**
 * Creates an VG.Canvas object.<br>
 *
 * VG.Canvas implements the basic drawing operations for Widgets inside an VG.UI.Workspace. Use it to draw 2D shapes, images and text. It implements these
 * functions based on the OpenGL ES 2 wrapper integrated into Visual Graphics.<br>
 *
 * The VG.Canvas for a given Workspace is passed to the calcSize() and paintWidget() calls of every Widget. If you ever need to access the VG.Canvas outside
 * these functions you can find references at both VG.context.canvas and VG.context.workspace.
 *
 * @constructor
 */

VG.Canvas=function()
{
    if ( arguments.length != 1 ) {
        if ( this instanceof VG.Canvas ) {
            this.canvas=0;
        } else return new VG.Canvas();
    } else {
        if ( this instanceof VG.Canvas ) {
            this.canvas=arguments[0];
        } else return new VG.Canvas( arguments[0] );
    }

    this.renderer = VG.Renderer();

    var VSHADER_SOURCE =
        '#version 100\n\n' +
        'attribute vec4 drawPosition;\n' +
        'attribute vec4 drawColor;\n' +
        'uniform mat4 pM;\n' +
        'varying vec4 v_Color;\n\n' +
        'void main() {\n' +
        '  gl_Position =  pM * drawPosition;\n' +
        '  v_Color = drawColor;\n' +
        '}\n';

    var FSHADER_SOURCE =
        '#version 100\n\n' +
        'precision mediump float;\n' +
        'varying vec4 v_Color;\n' +
        'uniform float uniformAlpha;\n' +
        'void main() {\n' +
        '  vec4 color = v_Color;\n' +
        '  gl_FragColor = vec4( color.rgb, color.a * uniformAlpha );\n' +
        '}\n';

    this.primShader=new VG.Shader(VSHADER_SOURCE, FSHADER_SOURCE);
    this.primShader.blendType = VG.Shader.Blend.Alpha;
    this.primShader.create();

    this.triBuffer=new VG.GPUBuffer(VG.Type.Float, (6 * 3) * 256 * 8, true);
    this.triBufferDB = this.triBuffer.getDataBuffer();
    this.triBuffer.create();
    this.triCount=0;


    this.fonts=[];
    this.fonts.push( VG.UI.stylePool.current.skin.Widget.Font );
    this.fontIndex=0;

    this.delayedPaintWidgets=[];

    this.hasBeenResized=false;
    this.alpha = 1.0;

    this.matrix=new VG.Math.Matrix4();


    //font rendering
    var FONT_VSHADER_SOURCE = [

        '#version 100',

        'attribute vec2 vPos;',

        'uniform mat4 tM;',
        'uniform mat4 pM;',

        'void main() {',
        '  mat4 m = pM * tM;',
        '  gl_Position = m * vec4(vPos, 0, 1);',
        '}'

    ].join('\n');

    var FONT_FSHADER_SOURCE = [
        '#version 100',

        'precision mediump float;',

        'uniform vec4 color;',
        'uniform float uniformAlpha;\n' +

        'void main() {',
        '  gl_FragColor = color;',
        '  gl_FragColor = vec4( color.rgb, color.a * uniformAlpha );\n' +

        '}'
    ].join('\n');

    this.fontShader=new VG.Shader(FONT_VSHADER_SOURCE, FONT_FSHADER_SOURCE);
    this.fontShader.blendType = VG.Shader.Blend.Alpha;
    this.fontShader.create();


    this.cacheM1 = new VG.Math.Matrix4();
    this.cacheM2 = new VG.Math.Matrix4();

    this.cacheC1 = VG.Core.Color();
    this.cacheC2 = VG.Core.Color();
    this.cacheC3 = VG.Core.Color();

    this.cacheV2A = new VG.Math.Vector2();
    this.cacheV2B = new VG.Math.Vector2();
    this.cacheV2C = new VG.Math.Vector2();
    this.cacheV2D = new VG.Math.Vector2();

    //render target
    this.rt = VG.Renderer().mainRT;
    this.clipRects=[];

    this.customProjectionMatrix = new VG.Math.Matrix4();
    this.twoD = true;

    this.canvas = document.getElementById( 'workspace' );
    this.ctx = this.canvas.getContext('2d');

    // If thie canvasContext class doesn't have  a fillRoundedRect, extend it now
    if (!this.ctx.constructor.prototype.fillRoundedRect) {
    // Extend the canvaseContext class with a fillRoundedRect method
        this.ctx.constructor.prototype.fillRoundedRect =
        function (xx,yy, ww,hh, rad, fill, stroke) {
            if (typeof(rad) == "undefined") rad = 5;
            this.beginPath();
            this.moveTo(xx+rad, yy);
            this.arcTo(xx+ww, yy,    xx+ww, yy+hh, rad);
            this.arcTo(xx+ww, yy+hh, xx,    yy+hh, rad);
            this.arcTo(xx,    yy+hh, xx,    yy,    rad);
            this.arcTo(xx,    yy,    xx+ww, yy,    rad);
            if (stroke) this.stroke();  // Default to no stroke
            if (fill || typeof(fill)=="undefined") this.fill();  // Default to fill
        };
    }

    // --- Check for Firefox. Needed for correcting text aligning on the 2D canvas
    if ( navigator && navigator.userAgent.indexOf("Firefox") > 0 )
        this.fireFox = true;
};

/**
 * An enum of 2D primitives which can be drawn via {@link VG.Canvas.draw2DShape}.
 * @enum {Number}
 */

VG.Canvas.Shape2D={ "Rectangle" : 0, "VerticalGradient" : 1, "HorizontalGradient" : 2, "RectangleOutline" : 3,  "RectangleOutlineMin1px" : 4,  "RectangleOutlineMin2px" : 5,
                    "RoundedRectangleOutline1px" : 6, "RoundedRectangle2px" : 7, "RectangleCorners" : 8,
                    "FlippedTriangle" : 9, "ArrowLeft" : 10, "ArrowRight" : 11, "Circle": 12, "CircleHue" : 13, "CircleOutline": 14, "ArrowRightGradient": 15,
                };

/**
 * Sets an {@link VG.RenderTarget} to the canvas. All drawing operations will be applied to the given render target. Call setTarget again with undefined to clear the render target.
 * @param {VG.RenderTarget} rt - RenderTarget to draw to.
 */

VG.Canvas.prototype.setTarget=function( rt )
{
    this.flush();
    if ( rt ) {
        this.customProjM = this.customProjectionMatrix;
        this.customProjM.setOrtho( 0, rt.width, 0, rt.height, 1, 0 );
        this.customTarget = rt;
    } else {
        this.customProjM = undefined;
        this.customTarget = undefined;
    }
};

/**
 * Pushes the given VG.Font.Font to the canvas. It will be used until a popFont() call takes it off the top of the font stack. Every pushFont() call needs to have a matching popFont()
 * call.
 * @param {VG.Font.Font} font - The font to use
 */

VG.Canvas.prototype.pushFont=function( font )
{
    this.fontIndex++;
    this.fonts.splice( this.fontIndex, 0, font );

    this.font = this.fonts[this.fontIndex];
    this.fontText = this.font.size + "px " + this.font.triFont.face.familyName;

    if ( typeof font.name === 'string' ) {
        if ( font.name.includes( "Bold") ) {
            this.fontText = "Bold " + this.fontText;
        }
        if ( font.name.includes( "Italic") ) {
            this.fontText = "Italic " + this.fontText;
        }
    }
    this.ctx.font = this.fontText;
    this.fontHeight = this.font.size;
};

/**
 * Takes the current font of the font stack and the canvas resumes using the new font at the top of the stack.
 */

VG.Canvas.prototype.popFont=function()
{
    this.fonts.splice( this.fontIndex, 1 );
    --this.fontIndex;

    this.font = this.fonts[this.fontIndex];
    this.fontText = this.font.size + "px " + this.font.triFont.face.familyName;

    if ( typeof this.font.name === 'string' ) {
        if ( this.font.name.includes( "Bold") ) {
            this.fontText = "Bold " + this.fontText;
        }
        if ( this.font.name.includes( "Italic") ) {
            this.fontText = "Italic " + this.fontText;
        }
    }
    this.ctx.font = this.fontText;
    this.fontHeight = this.font.size;
};

/**
 * Sets a new alpha value for the canvas. All following drawing operations will use this new alpha value. Calls {@link VG.Canvas.flush} to draw all pending triangles.
 * @param {number} alpha - The new alpha value to use, has to be in the range of 0..1.
 */

VG.Canvas.prototype.setAlpha=function( alpha )
{
    this.flush();
    this.alpha = alpha;
    this.ctx.globalAlpha = alpha;
};

/**
 * Sets a new clipping rectangle. All drawing outside this rectangle will be ignored. Pass null to reset to no clipping.
 * @param {VG.Core.Rect} rect - The new clipping rectangle to use or null to reset to no clipping.
 */

VG.Canvas.prototype.pushClipRect=function( rect )
{
    let ctx = this.ctx;

    if ( !this.clipRects.length ) ctx.save();
    else { ctx.restore(); ctx.save(); }

    this.flush();

    if ( rect )
    {
        if ( this.clipRects.length )
        {
            var lastRect=this.clipRects[this.clipRects.length-1];
            var intersectRect = lastRect.intersect( rect );

            if ( !intersectRect ) {
                //VG.log( "intersect is null", lastRect.toString(), rect.toString() );

                this.clipRects.push( VG.Core.Rect( lastRect ) );
                return;
            } else {
                this.clipRects.push( intersectRect );
                ctx.beginPath();
                ctx.rect( intersectRect.x, intersectRect.y, intersectRect.width, intersectRect.height );
                ctx.clip();
                ctx.beginPath();
                this.rt.setScissor( intersectRect );
            }

        } else {
            this.clipRects.push( rect );
            ctx.beginPath();
            ctx.rect( rect.x, rect.y, rect.width, rect.height );
            ctx.clip();
            ctx.beginPath();
            this.rt.setScissor( rect );
        }
    }
};

/**
 * Takes the current rectangle of the clip stack.
 */

VG.Canvas.prototype.popClipRect=function()
{
    if ( this.clipRects.length <= 0 ) { VG.error( "popClipRect -- Stack Underflow"); return; }

    let ctx = this.ctx;
    ctx.restore(); ctx.save();

    this.flush();

    this.clipRects.splice(-1,1);

    let last=this.clipRects[this.clipRects.length-1];
    if ( last ) {
        ctx.beginPath();
        ctx.rect( last.x, last.y, last.width, last.height );
        ctx.clip();
        ctx.beginPath();
        this.rt.setScissor( last );
    } else {
        // ctx.beginPath();
        // ctx.rect( 0, 0, VG.context.workspace.rect.width, VG.context.workspace.rect.height );
        // ctx.clip();
        this.rt.setScissor();
    }
};

/**
 * Flushes all triangle caches. Called by {@link VG.UI.Workspace} at the end of a redraw operation to make sure all triangles are painted.
 */

VG.Canvas.prototype.flush=function()
{
    if (this.triCount) this.flushTris();
};

/**
 * Draws a 2D triangle using the specified coordinates and the VG.Core.Color for each coordinate.
 * @param {number} x1 - The x1 coordinate
 * @param {number} y1 - The y1 coordinate
 * @param {number} x2 - The x2 coordinate
 * @param {number} y2 - The y2 coordinate
 * @param {number} x3 - The x3 coordinate
 * @param {number} y3 - The y3 coordinate
 * @param {number} col1 - The color at the x1, y1 coordinate
 * @param {number} col2 - The color at the x2, y2 coordinate
 * @param {number} col3 - The color at the x3, y3 coordinate
 */

VG.Canvas.prototype.addTriangle2D=function( x1, y1, x2, y2, x3, y3, col1, col2, col3 )
{
    var db = this.triBufferDB;
    var data=db.data;

    data[this.triCount++] = x1;
    data[this.triCount++] = y1;

    data[this.triCount++] = col1.r;
    data[this.triCount++] = col1.g;
    data[this.triCount++] = col1.b;
    data[this.triCount++] = col1.a;

    data[this.triCount++] = x2;
    data[this.triCount++] = y2;

    data[this.triCount++] = col2.r;
    data[this.triCount++] = col2.g;
    data[this.triCount++] = col2.b;
    data[this.triCount++] = col2.a;

    data[this.triCount++] = x3;
    data[this.triCount++] = y3;

    data[this.triCount++] = col3.r;
    data[this.triCount++] = col3.g;
    data[this.triCount++] = col3.b;
    data[this.triCount++] = col3.a;

    if (this.triCount >= db.getSize())
        this.flushTris();
};

/**
 * Draws a 2D rectangle using the specified coordinates and VG.Core.Color.
 * @param {number} x1 - The x1 coordinate
 * @param {number} y1 - The y1 coordinate
 * @param {number} x2 - The x2 coordinate
 * @param {number} y2 - The y2 coordinate
 * @param {number} col - The color of the rectangle.
 */

VG.Canvas.prototype.addSolidRectangle2D=function( x1, y1, x2, y2, col )
{
    this.addTriangle2D(x1, y1, x2, y1, x1, y2, col, col, col);
    this.addTriangle2D(x1, y2, x2, y1, x2, y2, col, col, col);
};

VG.Canvas.prototype.flushTris=function()
{
    if ( !this.triCount ) return;

   var b = this.triBuffer;
    var shader = this.primShader;

    shader.bind();

    //this also binds the buffer
    b.update(0, this.triCount);

    var stride = b.getStride();

    b.vertexAttrib(shader.getAttrib("drawPosition"), 2, false, stride * 6, 0);
    b.vertexAttrib(shader.getAttrib("drawColor"), 4, false, stride * 6, stride * 2);

    shader.setFloat("uniformAlpha", this.alpha);

    if ( this.customTarget ) {
        shader.setMatrix( "pM", this.customProjM.elements );
        this.customTarget.bind();
        this.customTarget.setViewportEx( 0, 0, this.customTarget.width, this.customTarget.height );
        b.drawBuffer(VG.Renderer.Primitive.Triangles, 0, this.triCount / 6);
        this.customTarget.unbind();
    } else {
        shader.setMatrix( "pM", VG.Renderer().proj2d.elements );
        b.drawBuffer(VG.Renderer.Primitive.Triangles, 0, this.triCount / 6);
    }

    this.triCount = 0;
};

/**
 * Draws a 2D Shape using the specified rectangle and colors on the 2D canvas layer.
 * @param {VG.Canvas.Shape2D} shape - The shape as specified in the VG.Canvas.Shape2D enum
 * @param {VG.Core.Rect} rect - The rectangle for the shape
 * @param {VG.Core.Color} col1 - The main color of the shape
 * @param {VG.Core.Color} col2 - The optional 2nd color of the shape. Usage depends on shape type.
 * @param {VG.Core.Color} col3 - The optional 3rd color of the shape. Usage depends on shape type.
 */

VG.Canvas.prototype.draw2DShape=function( shape, rect, col1, col2, col3 )
{
    let ctx = this.ctx; ctx.globalAlpha = this.alpha;

    switch( shape )
    {
        case VG.Canvas.Shape2D.Rectangle:
            ctx.fillStyle = col1.toCanvasStyle();
            ctx.fillRect( rect.x, rect.y, rect.width, rect.height );
        break;

        case VG.Canvas.Shape2D.RectangleGL:
            this.addSolidRectangle2D( rect.x, rect.y, rect.right(), rect.bottom(), col1 );
        break;

        case VG.Canvas.Shape2D.VerticalGradient:
        {
            let lingrad = ctx.createLinearGradient(0,rect.y,0, rect.bottom() );
            lingrad.addColorStop( 0, col1.toCanvasStyle() );
            lingrad.addColorStop( 1, col2.toCanvasStyle() );

            ctx.fillStyle = lingrad;
            ctx.fillRect( rect.x, rect.y, rect.width, rect.height );
        }
        break;

        case VG.Canvas.Shape2D.HorizontalGradient:
        {
            let lingrad = ctx.createLinearGradient(rect.x,0,rect.right(),0);
            lingrad.addColorStop( 0, col1.toCanvasStyle() );
            lingrad.addColorStop( 1, col2.toCanvasStyle() );

            ctx.fillStyle = lingrad;
            ctx.fillRect( rect.x, rect.y, rect.width, rect.height );
        }
        break;

        case VG.Canvas.Shape2D.RectangleOutline:
            ctx.strokeStyle = col1.toCanvasStyle();
            ctx.lineWidth = 1.0;
            ctx.strokeRect( rect.x + 0.5, rect.y + 0.5, rect.width - 1.0, rect.height - 1.0 );
        break;

        case VG.Canvas.Shape2D.RectangleOutlineMin1px:
            ctx.strokeStyle = col1.toCanvasStyle();
            ctx.lineWidth = 1.0;

            ctx.beginPath();
            ctx.moveTo( rect.x + 1.5, rect.y + 0.5 );
            ctx.lineTo( rect.right() - 1.5, rect.y + 0.5 );

            ctx.moveTo( rect.x + 1.5, rect.bottom() - 0.5 );
            ctx.lineTo( rect.right() - 1.5, rect.bottom() - 0.5 );

            ctx.moveTo( rect.right() - 0.5, rect.y + 1.5 );
            ctx.lineTo( rect.right() - 0.5, rect.bottom() - 1.5 );
            ctx.moveTo( rect.x + 0.5, rect.y + 1.5 );
            ctx.lineTo( rect.x + 0.5, rect.bottom() - 1.5 );
            ctx.stroke();
        break;

        case VG.Canvas.Shape2D.RectangleOutlineMin2px:
            ctx.strokeStyle = col1.toCanvasStyle();
            ctx.lineWidth = 1.0;

            ctx.beginPath();
            ctx.moveTo( rect.x + 2.5, rect.y + 0.5 );
            ctx.lineTo( rect.right() - 2.5, rect.y + 0.5 );

            ctx.moveTo( rect.x + 2.5, rect.bottom() - 0.5 );
            ctx.lineTo( rect.right() - 2.5, rect.bottom() - 0.5 );

            ctx.moveTo( rect.right() - 0.5, rect.y + 2.5 );
            ctx.lineTo( rect.right() - 0.5, rect.bottom() - 2.5 );
            ctx.moveTo( rect.x + 0.5, rect.y + 2.5 );
            ctx.lineTo( rect.x + 0.5, rect.bottom() - 2.5 );
            ctx.stroke();
        break;

        case VG.Canvas.Shape2D.RoundedRectangleOutline1px:
            ctx.strokeStyle = col1.toCanvasStyle();
            ctx.lineWidth = 1.0;
            ctx.fillRoundedRect( rect.x, rect.y, rect.width, rect.height, 2, false, true );
        break;

        case VG.Canvas.Shape2D.RoundedRectangle2px:
            ctx.fillStyle = col1.toCanvasStyle();
            ctx.fillRoundedRect( rect.x, rect.y, rect.width, rect.height, 5 );
        break;

        case VG.Canvas.Shape2D.RectangleCorners:
            // --- Top Left
            this.addSolidRectangle2D( rect.x, rect.y, rect.x+1, rect.y+1, col1 );
            // --- Bottom Left
            this.addSolidRectangle2D( rect.x, rect.bottom()-1, rect.x+1, rect.bottom(), col1 );
            // --- Top Right
            this.addSolidRectangle2D( rect.right()-1, rect.y, rect.right(), rect.y+1, col1 );
            // --- Bottom Right
            this.addSolidRectangle2D( rect.right()-1, rect.bottom()-1, rect.right(), rect.bottom(), col1 );
        break;

        case VG.Canvas.Shape2D.FlippedTriangle:
            this.addTriangle2D( rect.x, rect.y, rect.right(), rect.y, rect.x + rect.width/2, rect.bottom(), col1, col1, col1 );
        break;

        case VG.Canvas.Shape2D.ArrowRightGradient:
            this.addTriangle2D( rect.x, rect.y, rect.right(), rect.y + rect.height/2, rect.x, rect.bottom(), col1, col2, col3 );
        break;

        case VG.Canvas.Shape2D.ArrowLeft:
            this.addTriangle2D( rect.x, rect.y+rect.height/2, rect.right(), rect.y, rect.right(), rect.bottom(), col1, col1, col1 );
        break;

        case VG.Canvas.Shape2D.ArrowRight:
            this.addTriangle2D( rect.x, rect.y, rect.right(), rect.y + rect.height/2, rect.x, rect.bottom(), col1, col1, col1 );
        break;

        case VG.Canvas.Shape2D.Circle:
            ctx.beginPath();
            ctx.fillStyle = col1.toCanvasStyle();
            ctx.arc( rect.x + rect.width/2, rect.y + rect.height/2, Math.min( rect.width, rect.height) / 2, 0, 2 * Math.PI, false);
            ctx.fill();
        break;

        case VG.Canvas.Shape2D.CircleGL:
            rW = rect.width / 2;
            rH =  rect.height / 2;

            step = Math.floor(VG.Math.clamp(rW * rH, 8, 64));

            theta = 0.0;
            pX = rect.x + rect.width / 2;
            pY = rect.y + rect.height / 2;
            inc = (Math.PI * 2.0) / step;

            if (!col3) col3 = col1;
            if (!col2) col2 = col1;

            for (var i = 1; i <= step; i++)
            {
                x1 = pX + rW * Math.cos(inc * (i - 1));
                y1 = pY - rH * Math.sin(inc * (i - 1));

                x2 = pX + rW * Math.cos(inc * i);
                y2 = pY - rH * Math.sin(inc * i);

                this.addTriangle2D(x1, y1, x2, y2, pX, pY, col1, col2, col3);
            }
        break;

        case VG.Canvas.Shape2D.CircleHue:
            rW = rect.width / 2;
            rH =  rect.height / 2;

            step = Math.floor(VG.Math.clamp(rW * rH, 8, 64));

            theta = 0.0;
            pX = rect.x + rect.width / 2;
            pY = rect.y + rect.height / 2;
            inc = (Math.PI * 2.0) / step;

            if (!col3) col3 = col1;
            if (!col2) col2 = col1;

            for (let i = 1; i <= step; i++)
            {
                x1 = pX + rW * Math.cos(inc * (i - 1));
                y1 = pY - rH * Math.sin(inc * (i - 1));

                x2 = pX + rW * Math.cos(inc * i);
                y2 = pY - rH * Math.sin(inc * i);

                col1 = this.cacheC1;
                col1.setHSL(VG.Math.deg(inc * (i - 1)) - 90, 1.0, 0.5);

                col2 = this.cacheC2;
                col2.setHSL(VG.Math.deg(inc * i) - 90, 1.0, 0.5);

                col3 = VG.Core.Color.White;

                this.addTriangle2D(x1, y1, x2, y2, pX, pY, col1, col2, col3);
            }
        break;

        case VG.Canvas.Shape2D.CircleOutline:
            ctx.beginPath();
            ctx.fillStyle = col1.toCanvasStyle();
            ctx.lineWidth = 1.0;
            ctx.arc( rect.x + rect.width/2, rect.y + rect.height/2, Math.min( rect.width, rect.height) / 2, 0, 2 * Math.PI, false);
            ctx.stroke();
        break;
    }
};

/**
 * Draws a 2D Shape using the specified rectangle and colors on the WebGL layer.
 * @param {VG.Canvas.Shape2D} shape - The shape as specified in the VG.Canvas.Shape2D enum
 * @param {VG.Core.Rect} rect - The rectangle for the shape
 * @param {VG.Core.Color} col1 - The main color of the shape
 * @param {VG.Core.Color} col2 - The optional 2nd color of the shape. Usage depends on shape type.
 * @param {VG.Core.Color} col3 - The optional 3rd color of the shape. Usage depends on shape type.
 */

VG.Canvas.prototype.draw2DShapeGL=function( shape, rect, col1, col2, col3 )
{
    switch( shape )
    {
        case VG.Canvas.Shape2D.Rectangle:
        case VG.Canvas.Shape2D.RectangleGL:
            //this.addTriangle2D( rect.x, rect.bottom(), rect.right(), rect.bottom(), rect.x, rect.y, col1, col1, col1 );
            //this.addTriangle2D( rect.x, rect.y, rect.right(), rect.y, rect.right(), rect.bottom(), col1, col1, col1 );

            this.addSolidRectangle2D( rect.x, rect.y, rect.right(), rect.bottom(), col1 );
        break;

        case VG.Canvas.Shape2D.VerticalGradient:
            this.addTriangle2D( rect.x, rect.bottom(), rect.right(), rect.bottom(), rect.x, rect.y, col2, col2, col1 );
            this.addTriangle2D( rect.x, rect.y, rect.right(), rect.y, rect.right(), rect.bottom(), col1, col1, col2 );
        break;

        case VG.Canvas.Shape2D.HorizontalGradient:
            this.addTriangle2D( rect.x, rect.bottom(), rect.right(), rect.bottom(), rect.x, rect.y, col1, col2, col1 );
            this.addTriangle2D( rect.x, rect.y, rect.right(), rect.y, rect.right(), rect.bottom(), col1, col2, col2 );
        break;

        case VG.Canvas.Shape2D.RectangleOutline:
            // --- Top
            this.addSolidRectangle2D( rect.x, rect.y, rect.right(), rect.y+1, col1 );
            // --- Bottom
            this.addSolidRectangle2D( rect.x, rect.bottom()-1, rect.right(), rect.bottom(), col1 );
            // --- Left
            this.addSolidRectangle2D( rect.x, rect.y, rect.x+1, rect.bottom(), col1 );
            // --- Right
            this.addSolidRectangle2D( rect.right()-1, rect.y, rect.right(), rect.bottom(), col1 );
        break;

        case VG.Canvas.Shape2D.RectangleOutlineMin1px:
            // --- Top
            this.addSolidRectangle2D( rect.x + 1, rect.y, rect.right()-1, rect.y+1, col1 );
            // --- Bottom
            this.addSolidRectangle2D( rect.x + 1, rect.bottom()-1, rect.right()-1, rect.bottom(), col1 );
            // --- Left
            this.addSolidRectangle2D( rect.x, rect.y+1, rect.x+1, rect.bottom()-1, col1 );
            // --- Right
            this.addSolidRectangle2D( rect.right()-1, rect.y+1, rect.right(), rect.bottom()-1, col1 );
        break;

        case VG.Canvas.Shape2D.RectangleOutlineMin2px:
            // --- Top
            this.addSolidRectangle2D( rect.x + 2, rect.y, rect.right()-2, rect.y+1, col1 );
            // --- Bottom
            this.addSolidRectangle2D( rect.x + 2, rect.bottom()-1, rect.right()-2, rect.bottom(), col1 );
            // --- Left
            this.addSolidRectangle2D( rect.x, rect.y+2, rect.x+1, rect.bottom()-2, col1 );
            // --- Right
            this.addSolidRectangle2D( rect.right()-1, rect.y+2, rect.right(), rect.bottom()-2, col1 );
        break;

        case VG.Canvas.Shape2D.RoundedRectangleOutline1px:
            // --- Top
            this.addSolidRectangle2D( rect.x+1, rect.y, rect.right()-1, rect.y+1, col1 );
            // --- Bottom
            this.addSolidRectangle2D( rect.x+1, rect.bottom()-1, rect.right()-1, rect.bottom(), col1 );
            // --- Left
            this.addSolidRectangle2D( rect.x, rect.y+1, rect.x+1, rect.bottom()-1, col1 );
            // --- Right
            this.addSolidRectangle2D( rect.right()-1, rect.y+1, rect.right(), rect.bottom()-1, col1 );

            // --- Set the anti aliasing pixels in each corner

            var pixelColor=VG.Core.Color( col1 );
            pixelColor.a=0.3;

            this.addSolidRectangle2D( rect.x, rect.y, rect.x+1, rect.y+1, pixelColor );
            this.addSolidRectangle2D( rect.right()-1, rect.y, rect.right(), rect.y+1, pixelColor );
            this.addSolidRectangle2D( rect.x, rect.bottom()-1, rect.x+1, rect.bottom(), pixelColor );
            this.addSolidRectangle2D( rect.right()-1, rect.bottom()-1, rect.right(), rect.bottom(), pixelColor );
        break;

        case VG.Canvas.Shape2D.RoundedRectangle2px:
            // --- Top
            this.addSolidRectangle2D( rect.x+2, rect.y, rect.right()-2, rect.y+2, col1 );
            // --- Bottom
            this.addSolidRectangle2D( rect.x+2, rect.bottom()-2, rect.right()-2, rect.bottom(), col1 );
            // --- Middle
            this.addSolidRectangle2D( rect.x, rect.y+2, rect.right(), rect.bottom()-2, col1 );

            // --- Set the 2x2 anti aliasing pixels in each corner

            pixelColor=VG.Core.Color( col1 );

            // --- Top Left
            pixelColor.a=0.1 * col1.a;
            this.addSolidRectangle2D( rect.x, rect.y, rect.x+1, rect.y+1, pixelColor );
            pixelColor.a=0.75 * col1.a;
            this.addSolidRectangle2D( rect.x+1, rect.y, rect.x+2, rect.y+1, pixelColor );
            this.addSolidRectangle2D( rect.x, rect.y+1, rect.x+1, rect.y+2, pixelColor );
            pixelColor.a=1.0 * col1.a;
            this.addSolidRectangle2D( rect.x+1, rect.y+1, rect.x+2, rect.y+2, pixelColor );
            // --- Top Right
            pixelColor.a=0.1 * col1.a;
            this.addSolidRectangle2D( rect.right()-1, rect.y, rect.right(), rect.y+1, pixelColor );
            pixelColor.a=0.75 * col1.a;
            this.addSolidRectangle2D( rect.right()-2, rect.y, rect.right()-1, rect.y+1, pixelColor );
            this.addSolidRectangle2D( rect.right()-1, rect.y+1, rect.right(), rect.y+2, pixelColor );
            pixelColor.a=1.0 * col1.a;
            this.addSolidRectangle2D( rect.right()-2, rect.y+1, rect.right()-1, rect.y+2, pixelColor );
            // --- Bottom Left
            pixelColor.a=0.1 * col1.a;
            this.addSolidRectangle2D( rect.x, rect.bottom()-1, rect.x+1, rect.bottom(), pixelColor );
            pixelColor.a=0.75 * col1.a;
            this.addSolidRectangle2D( rect.x+1, rect.bottom()-1, rect.x+2, rect.bottom(), pixelColor );
            this.addSolidRectangle2D( rect.x, rect.bottom()-2, rect.x+1, rect.bottom()-1, pixelColor );
            pixelColor.a=1.0 * col1.a;
            this.addSolidRectangle2D( rect.x+1, rect.bottom()-2, rect.x+2, rect.bottom()-1, pixelColor );
            // --- Bottom Right
            pixelColor.a=0.1 * col1.a;
            this.addSolidRectangle2D( rect.right()-1, rect.bottom()-1, rect.right(), rect.bottom(), pixelColor );
            pixelColor.a=0.75 * col1.a;
            this.addSolidRectangle2D( rect.right()-2, rect.bottom()-1, rect.right()-1, rect.bottom(), pixelColor );
            this.addSolidRectangle2D( rect.right()-1, rect.bottom()-2, rect.right(), rect.bottom()-1, pixelColor );
            pixelColor.a=1.0 * col1.a;
            this.addSolidRectangle2D( rect.right()-2, rect.bottom()-2, rect.right()-1, rect.bottom()-1, pixelColor );
        break;

        case VG.Canvas.Shape2D.RectangleCorners:
            // --- Top Left
            this.addSolidRectangle2D( rect.x, rect.y, rect.x+1, rect.y+1, col1 );
            // --- Bottom Left
            this.addSolidRectangle2D( rect.x, rect.bottom()-1, rect.x+1, rect.bottom(), col1 );
            // --- Top Right
            this.addSolidRectangle2D( rect.right()-1, rect.y, rect.right(), rect.y+1, col1 );
            // --- Bottom Right
            this.addSolidRectangle2D( rect.right()-1, rect.bottom()-1, rect.right(), rect.bottom(), col1 );
        break;

        case VG.Canvas.Shape2D.FlippedTriangle:
            this.addTriangle2D( rect.x, rect.y, rect.right(), rect.y, rect.x + rect.width/2, rect.bottom(), col1, col1, col1 );
        break;

        case VG.Canvas.Shape2D.ArrowRightGradient:
            this.addTriangle2D( rect.x, rect.y, rect.right(), rect.y + rect.height/2, rect.x, rect.bottom(), col1, col2, col3 );
        break;

        case VG.Canvas.Shape2D.ArrowLeft:
            this.addTriangle2D( rect.x, rect.y+rect.height/2, rect.right(), rect.y, rect.right(), rect.bottom(), col1, col1, col1 );
        break;

        case VG.Canvas.Shape2D.ArrowRight:
            this.addTriangle2D( rect.x, rect.y, rect.right(), rect.y + rect.height/2, rect.x, rect.bottom(), col1, col1, col1 );
        break;

        case VG.Canvas.Shape2D.CircleHue:
        case VG.Canvas.Shape2D.Circle:
            rW = rect.width / 2;
            rH =  rect.height / 2;

            step = Math.floor(VG.Math.clamp(rW * rH, 8, 64));

            theta = 0.0;
            pX = rect.x + rect.width / 2;
            pY = rect.y + rect.height / 2;
            inc = (Math.PI * 2.0) / step;

            if (!col3) col3 = col1;
            if (!col2) col2 = col1;

            for (var i = 1; i <= step; i++)
            {
                x1 = pX + rW * Math.cos(inc * (i - 1));
                y1 = pY - rH * Math.sin(inc * (i - 1));

                x2 = pX + rW * Math.cos(inc * i);
                y2 = pY - rH * Math.sin(inc * i);

                if (shape === VG.Canvas.Shape2D.CircleHue)
                {
                    col1 = this.cacheC1;
                    col1.setHSL(VG.Math.deg(inc * (i - 1)) - 90, 1.0, 0.5);

                    col2 = this.cacheC2;
                    col2.setHSL(VG.Math.deg(inc * i) - 90, 1.0, 0.5);

                    col3 = VG.Core.Color.White;
                }

                this.addTriangle2D(x1, y1, x2, y2, pX, pY, col1, col2, col3);
            }
        break;

        case VG.Canvas.Shape2D.CircleOutline:
            rW = rect.width / 2;
            rH =  rect.height / 2;

            step = Math.floor(VG.Math.clamp(rW * rH, 8, 64));

            theta = 0.0;
            pX = rect.x + rect.width / 2;
            pY = rect.y + rect.height / 2;
            inc = (Math.PI * 2.0) / step;

            if (!col3) col3 = col1;
            if (!col2) col2 = col1;

            for (i = 1; i <= step; i++)
            {
                x1 = pX + rW * Math.cos(inc * (i - 1));
                y1 = pY - rH * Math.sin(inc * (i - 1));

                x2 = pX + rW * Math.cos(inc * i);
                y2 = pY - rH * Math.sin(inc * i);

                this.drawLineGL(x1, y1, x2, y2, 1, col1 );
            }

        break;
    }
};

/**
 * Draws a line using the 2D canvas layer.
 * @param {Number} x1 - From X coordinate
 * @param {Number} y1 - From Y coordinate
 * @param {Number} x2 - To X coordinate
 * @param {Number} y2 - To Y coordinate
 * @param {Number} t - The thickness of the line
 * @param {VG.Core.Color} color - The color of the line
 */

VG.Canvas.prototype.drawLine=function(x1, y1, x2, y2, t, color)
{
    this.ctx.strokeStyle = color.toCanvasStyle();
    this.ctx.lineWidth = t;

    this.ctx.beginPath();
    this.ctx.moveTo(x1+0.5, y1+0.5);
    this.ctx.lineTo(x2-0.5, y2-0.5);
    this.ctx.stroke();
};

/** Draws a cubic bezier line using the 2D canvas layer.
 *  @param {Number} x1 - The p1 x coordinate
 *  @param {Number} y1 - The p1 y coordinate
 *  @param {Number} x2 - The p2 x coordinate
 *  @param {Number} y2 - The p2 y coordinate
 *  @param {Number} x3 - The p3 x coordinate
 *  @param {Number} y3 - The p3 y coordinate
 *  @param {Number} x4 - The p4 x coordinate
 *  @param {Number} y4 - The p4 y coordinate
 *  @param {Number} t - Thickness of the curve
 *  @param {Number} seg - Segment count the higher the better quality
 *  @param {Number} color - The line color */

VG.Canvas.prototype.drawCurve=function(x1, y1, x2, y2, x3, y3, x4, y4, thick, seg, color)
{
    let ctx = this.ctx;
    ctx.strokeStyle = color.toCanvasStyle();
    ctx.lineWidth = thick;

    ctx.beginPath();
    ctx.moveTo( x1, y1 );
    ctx.bezierCurveTo( x2, y2, x3, y3, x4, y4 );
    ctx.stroke();
};

/**
 * Draws a line using the WegGL layer.
 * @param {Number} x1 - From X coordinate
 * @param {Number} y1 - From Y coordinate
 * @param {Number} x2 - To X coordinate
 * @param {Number} y2 - To Y coordinate
 * @param {Number} t - The thickness of the line
 * @param {VG.Core.Color} color - The color of the line
 */

VG.Canvas.prototype.drawLineGL=function(x1, y1, x2, y2, t, color)
{
    let hT = t * 0.5;

    let p0 = this.cacheV2B;
    p0.set(x1, y1);

    let p1 = this.cacheV2C;
    p1.set(x2, y2);

    //direction
    let vD = this.cacheV2A;
    vD.copy(p1);
    vD.sub(p0);
    //vD.normalize();

    //perpendicular direction
    let pD = this.cacheV2D;
    pD.copy(vD);
    pD.setPerpendicular();
    pD.normalize();

    this.addTriangle2D(p0.x + pD.x * hT, p0.y + pD.y * hT, p1.x + pD.x * hT, p1.y + pD.y * hT,
                       p1.x + pD.x * -hT, p1.y + pD.y * -hT, color, color, color);

    this.addTriangle2D(p0.x + pD.x * hT, p0.y + pD.y * hT, p1.x + pD.x * -hT, p1.y + pD.y * -hT,
                       p0.x + pD.x * -hT, p0.y + pD.y * -hT, color, color, color);
};

/** Draws a cubic bezier line using the WebGL layer.
 *  @param {Number} x1 - The p1 x coordinate
 *  @param {Number} y1 - The p1 y coordinate
 *  @param {Number} x2 - The p2 x coordinate
 *  @param {Number} y2 - The p2 y coordinate
 *  @param {Number} x3 - The p3 x coordinate
 *  @param {Number} y3 - The p3 y coordinate
 *  @param {Number} x4 - The p4 x coordinate
 *  @param {Number} y4 - The p4 y coordinate
 *  @param {Number} t - Thickness of the curve
 *  @param {Number} seg - Segment count the higher the better quality
 *  @param {Number} color - The line color */

VG.Canvas.prototype.drawCurveGL=function(x1, y1, x2, y2, x3, y3, x4, y4, thick, seg, color)
{
    let oldX=x1, oldY=y1;
    for (var j = 1; j <= seg; j++)
    {
        let t = j / seg;
        let tx = VG.Math.bezierCubic(t, x1, x2, x3, x4);
        let ty = VG.Math.bezierCubic(t, y1, y2, y3, y4);

        this.drawLine( oldX, oldY, tx, ty, thick, color);
        oldX=tx; oldY=ty;
    }
};

/**
 * Draws an image at the specified position, optionaly scales it to the given size.
 * @param {VG.Core.Point} point - The position of the image
 * @param {VG.Core.Image} image - The image to draw.
 * @param {VG.Core.Size} size - Optional, the size to scale the image to.
 */

VG.Canvas.prototype.drawImage=function( pt, image, size )
{
    this.flush();

	var tex = this.renderer.getTexture(image);

    var width=tex.getRealWidth();
	var height=tex.getRealHeight();

    if ( size )
    {
        width=size.width + (image.getRealWidth() - image.getWidth()) * size.width / image.getWidth();
        height=size.height + (image.getRealHeight() - image.getHeight()) * size.height / image.getHeight();
    }

    //using the renderer's routine, as drawing textured 2d quads is very common
    this.renderer.drawQuad(tex, width, height, pt.x, pt.y, this.alpha);
};

/**
 * Downscales an image into the specified rectangle. During downscaling the aspect ratio of the image is honored and the image is centered inside the rectangle.
 * @param {VG.Core.Rect} rect - The rectangle to draw into
 * @param {VG.Core.Image} image - The image to draw
 */

VG.Canvas.prototype.drawScaledImage=function( rect, image )
{
    // --- Get new Width and Height based on Aspect Ratio
    var aspectRatio=image.height / image.width;

    var newWidth, newHeight;

    if ( rect.width * aspectRatio > rect.height ) {
        newWidth=rect.height / aspectRatio < image.width ? rect.height / aspectRatio : image.width;
    } else {
        newWidth=rect.width < image.width ? rect.width : image.width;
    }
    newHeight=aspectRatio*newWidth;

    var xOffset=Math.round( (rect.width - newWidth)/2 );
    var yOffset=Math.round( (rect.height - newHeight)/2 );

    newWidth = Math.round( newWidth );
    newHeight = Math.round( newHeight );

    this.drawImage( VG.Core.Point( rect.x + xOffset, rect.y + yOffset ), image, VG.Core.Size( newWidth, newHeight ) );
};


/**
 * Fills the given fillRect with the given image. The image is tiled optionally in the horizontal and vertical directions.
 * @param {VG.Core.Rect} rect - The rectangle to fill.
 * @param {VG.Core.Image} image - The image to tile
 * @param {bool} horizontal - True if the image should be tiled horizontally.
 * @param {bool} vertical - True if the image should be tiled vertically.
 * @param {number} horOffset - Optional, the horizontal offset can be adjusted with this value, for example a value of -10 would adjust the image 10 pixels to the left on each iteration.
 * @param {number} verOffset - Optional, adjust the vertical offset.
 */

VG.Canvas.prototype.drawTiledImage=function( fillRect, image, horizontal, vertical, horOffset, verOffset )
{
    if ( !image.isValid() ) return;
    var rect=VG.Core.Rect( fillRect.x, fillRect.y, image.width, image.height );
    this.pushClipRect( fillRect );

    do
    {
        rect.x=fillRect.x;
        while( rect.x < fillRect.right() )
        {
            this.drawImage( rect, image );

            if ( !horizontal ) break;
            rect.x+=image.width;
            if ( horOffset ) rect.x+=horOffset;
        }

        if ( !vertical ) break;
        rect.y+=image.height;
    } while( rect.y < fillRect.bottom() );

    this.popClipRect();
};

/**
 * Returns the size of the given text using the current canvas font. Returns an VG.Core.Size, optionally you can pass the size object to use.
 * @param {string} text - The text to analyze for size using the current canvas font.
 * @param {VG.Core.Size} size - The size object to use, optional.
 * @returns {VG.Core.Size}
 */

VG.Canvas.prototype.getTextSize=function( text, size )
{
    if ( !size ) size = VG.Core.Size();

    this.ctx.textBaseline = "hanging";

    size.width = ( this.ctx.measureText( text ).width );
    size.height = this.fontHeight;//this.getLineHeight();

    return size;
};

/**
 * Returns the height of one line of text using the current canvas font.
 * @returns {number}
 */

VG.Canvas.prototype.getLineHeight=function()
{
    // var font=this.fonts[this.fontIndex];
    // return this.font.triFont.height * this.font.scale;
    return Math.ceil( this.fontHeight * 1.4 );
};

// --------------------------------------------- VG.Canvas.prototype.wordWrap

VG.Canvas.prototype.wordWrap=function( text, start, width, textLines, dontAppendBreakSymbol )
{
    let font=this.fonts[this.fontIndex];
    let lineWidth=start;
    let oneWordFit=false;
    let newLine=false;

    if( text === "" || text===undefined || width < 0 ) {
        textLines.push("");
        return { nextStart: start };
    }

    if( !textLines ) textLines=[];

    let i=0;
    while( text )
    {
        let snipLocation;
        lineWidth += this.getTextSize( text[i] ).width;

        if(lineWidth >= width)
        {
            // Not even the 1st letter fits.
            if(i === 0) {
                newLine=true;
                lineWidth=0;
                continue;
            }

            if(text[i] === " ")
            {
                snipLocation = i+1 < text.length ? i+1 : i;
                if( snipLocation === i )
                    textLines.push(text.substring( 0 ) );
                else
                    textLines.push( text.substring ( 0, snipLocation ) );

                text=text.substring(snipLocation);
                i=0;
                lineWidth = 0;
            }
            else
            {
                var j = i;
                for(j = i; j >= 0; --j)
                {
                    if(text[j] === " ")
                    {
                        textLines.push( text.substring ( 0, j+1 ) );
                        text=text.substring(j+1);
                        i=0;
                        lineWidth = 0;
                        break;
                    }
                }

                if(i != j && j === -1)
                {
                    // Clearly this word doesnt fit in one line.
                    snipLocation = i-1 > 0 ? i-1 : i;
                    if ( dontAppendBreakSymbol ) textLines.push( text.substring ( 0, snipLocation) );
                    else textLines.push( text.substring ( 0, snipLocation) + "-" );
                    text=text.substring( snipLocation );
                    lineWidth = 0;
                    i = 0;
                    continue;
                }
                else if( j >= 0 )
                    continue;
            }
        }
        else if( text[i] == " " && !newLine ) oneWordFit = true;

        ++i;
        if(i >= text.length) break;
    }

    if ( !oneWordFit && lineWidth < width && !newLine ) oneWordFit = true;

    textLines.push( text.substring ( 0 ));

    return { nextStart: lineWidth, forceStartNewLine: !oneWordFit };
};

/**
 * Draws one line of text using the current canvas font aligned inside the given rectangle using the 2D canvas layer. Optionally rotates the font.
 * @returns {string} text - The text to draw.
 * @returns {VG.Core.Rect} rect - The rectangle to align the text into
 * @returns {VG.Core.Color} col - The color to use for the text drawing
 * @returns {number} halign - The horizontal alignment method: 0 is left, 1 centered and 2 is right. TODO: Move into enum
 * @returns {number} valign - The vertical alignment method: 0 is top (plus font descender), 1 centered, 2 is bottom and 3 is top without descender. TODO: Move into enum
 */

VG.Canvas.prototype.drawTextRect=function( text, rect, col, halign, valign, angle, crX, crY)
{
    let ctx = this.ctx; ctx.globalAlpha = this.alpha;
    let textSize = VG.Core.Size( ctx.measureText( text).width, this.getLineHeight() );

    // if ( valign === 0 )
        // this.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, rect, VG.Core.Color( 255, 0, 0 ) );
    // else if ( valign === 1 )
        // this.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, rect, VG.Core.Color( 0, 255, 0 ) );
    // else if ( valign === 2 )
        // this.draw2DShape( VG.Canvas.Shape2D.RectangleOutline, rect, VG.Core.Color( 0, 0, 255 ) );

    ctx.save();
    ctx.rect( rect.x, rect.y, rect.width,  textSize.height > rect.height ? textSize.height : rect.height );
    ctx.clip();

    ctx.fillStyle = col.toCanvasStyle();
    ctx.textBaseline = "top";
    ctx.lineWidth = 1.0;

    let startX = rect.x;
    let y = rect.y;

    if ( !angle ) angle = 0;

    // --- Alignment

    var xalign=1, yalign=1;
    if ( arguments.length == 5 ) {
        xalign=halign; yalign=valign;
    }

    if ( xalign === 1 ) {
        if ( textSize.width > rect.width ) startX = rect.x;
        else startX=rect.x + (rect.width - textSize.width) / 2;
    } else
    if ( xalign === 2 ) {
        startX=rect.x + rect.width - textSize.width;
    }

    if ( yalign === 1 ) {
        ctx.textBaseline = "middle";
        y = rect.y + Math.ceil( rect.height / 2 );
        if ( this.fireFox ) ++y;
    } else
    if ( yalign === 2 ) {
        y = rect.y + rect.height - textSize.height;
        if ( y < rect.y ) y = rect.y;
        if ( this.fireFox ) ++y;
    } else
    if ( yalign === 3 ) {
        y = rect.y;
    }

    if ( angle !== 0 ) {
        crX = crX ? crX : rect.x + rect.width / 2;
        crY = crY ? crY : rect.y + rect.height / 2;

        ctx.translate( crX, crY );
        ctx.rotate( - VG.Math.rad( angle ) );
        ctx.translate( -crX, -crY );
    }

    ctx.fillText( text, startX, y );
    ctx.restore();

    return textSize.width;
};

/**
 * Draws one line of text using the current canvas font aligned inside the given rectangle using the WebGL layer. Optionally rotates the font.
 * @returns {string} text - The text to draw.
 * @returns {VG.Core.Rect} rect - The rectangle to align the text into
 * @returns {VG.Core.Color} col - The color to use for the text drawing
 * @returns {number} halign - The horizontal alignment method: 0 is left, 1 centered and 2 is right. TODO: Move into enum
 * @returns {number} valign - The vertical alignment method: 0 is top (plus font descender), 1 centered, 2 is bottom and 3 is top without descender. TODO: Move into enum
 */

VG.Canvas.prototype.drawTextRectGL=function( text, rect, col, halign, valign, angle, crX, crY)
{
    var font=this.fonts[this.fontIndex];

    var b=font.triFont.buffer, i;

    //create the gpu buffer if not present
    if (!b)
    {
        var v = font.triFont.tris;

        //Static gpu buffer
        b = new VG.GPUBuffer(VG.Type.Float, 2 * v.length, false);

        var j = 0;
        var db=b.getDataBuffer();

        for (i = 0; i < v.length; i++)
        {
            db.set(j++, v[i].x);
            db.set(j++, v[i].y);
        }

        if (j != v.length * 2) throw [j, v.length, "buffer length missmatch"];


        b.create();

        font.triFont.buffer = b;

        /* makes sure that there's no rederences left on the triangle array as
         *  the buffer has a copy already, from this point on it's not needed */

        delete font.triFont.tris;
        v = null;
    }

    //if angle not defined assume no rotation
    if (!angle) {
        angle = 0;
    }

    var startX=rect.x;
    var x=0, y=rect.y - font.triFont.descender * font.scale;
    //var lineHeight=font.triFont.height * font.size;

    var textSize=VG.Core.Size();
    this.getTextSize( text, textSize );

    if ( textSize.height > rect.height ) return;

    // --- Alignment

    var xalign=1, yalign=1;
    if ( arguments.length == 5 ) {
        xalign=halign; yalign=valign;
    }

    if ( xalign === 1 ) {
        if ( textSize.width > rect.width ) startX=rect.x;
        else startX=rect.x + (rect.width - textSize.width) / 2;
    } else
    if ( xalign === 2 ) {
        startX=rect.x + rect.width - textSize.width;
    }

    if ( yalign === 1 ) {
        y=rect.y + (rect.height - font.triFont.height * font.scale) / 2 - font.triFont.descender * font.scale;
    } else
    if ( yalign === 2 ) {
        y=rect.y + rect.height - textSize.height;
    } else
    if ( yalign === 3 ) {
        y=rect.y;
    }

    y=Math.round( y );
    // --- Draw it

    // fix rotation at center for now
    crX = crX ? crX : rect.x + rect.width / 2;
    crY = crY ? crY : rect.y + rect.height / 2;

    this.flush();

    this.fontShader.bind();
    this.fontShader.setFloat("uniformAlpha", this.alpha);
    this.fontShader.setColor("color", col);

    b.bind();
	b.vertexAttrib(this.fontShader.getAttrib("vPos"), 2, false, 8, 0);

    var tM = this.cacheM1;

    tM.setIdentity();

    if ( !this.customTarget )
        this.fontShader.setMatrix( "pM", VG.Renderer().proj2d.elements );
    else {
        this.fontShader.setMatrix( "pM", this.customProjM.elements );
        this.customTarget.bind();
        this.customTarget.setViewportEx( 0, 0, this.customTarget.width, this.customTarget.height );
    }

    for (i = 0; i < text.length; i++)
    {
        var g = VG.Font.Triangulator.getGlyph( font.triFont, text[i] );

        var drawX=Math.round( startX + x );

        if ( angle === 0.0 && ( x + g.width * font.scale ) > rect.width ) return;

        tM.setIdentity();

        if (angle !== 0.0)
        {
            tM.translate(crX, crY, 0);
            tM.rotate(-angle, 0, 0, 1);
            tM.translate(-crX, -crY, 0);
        }

        tM.translate(drawX, y, 0);
        tM.scale(font.scale, font.scale, font.scale);

        this.fontShader.setMatrix("tM", tM.elements);

        if (g.size > 0)
            b.drawBuffer(VG.Renderer.Primitive.Triangles, g.offset, g.size);

        x+=g.width * font.scale;
    }

    if ( this.customTarget )
        this.customTarget.unbind();

    return x;
};

// --------------------------------------------- VG.Canvas.prototype.drawSVG

VG.Canvas.prototype.drawSVG=function( svg, svgGroup, rect, col, angle, crX, crY)
{
    /**Draws one line of text using the current canvas font aligned inside the given rectangle. Optionally rotates the font.
     * @returns {string} text - The text to draw.
     * @returns {VG.Core.Rect} rect - The rectangle to align the text into
     * @returns {VG.Core.Color} col - The color to use for the text drawing
     * @returns {number} halign - The horizontal alignment method: 0 is left, 1 centered and 2 is right. TODO: Move into enum
     * @returns {number} valign - The vertical alignment method: 0 is top (plus font descender), 1 centered, 2 is bottom and 3 is top without descender. TODO: Move into enum
     */

    var b=svg.buffer;

    //create the gpu buffer if not present
    if (!b)
    {
        var v = svg.tris;

        //Static gpu buffer
        b = new VG.GPUBuffer(VG.Type.Float, v.length, true);

        var j = 0;
        var db=b.getDataBuffer();

        for (var i = 0; i < v.length; i++)
            db.set(j++, v[i] );

        if (j != v.length ) throw [j, v.length, "buffer length missmatch"];

        b.create();

        svg.buffer = b;

        /* makes sure that there's no rederences left on the triangle array as
         *  the buffer has a copy already, from this point on it's not needed */


        delete svg.tris;
        v = null;
    }


    if ( !svgGroup ) group=svg.groups[0];
    else group=svgGroup;

    //if angle not defined assume no rotation
    if (!angle) {
        angle = 0;
    }

    var posX=rect.x, posY=rect.y;
    var scale=1;

    if ( rect.width && rect.height )//&& ( rect.width < group.width || rect.height < group.height ) )
    {
        var scaleX=rect.width / group.width;
        var scaleY=rect.height / group.height;

        scale=Math.min( scaleX, scaleY );

        // --- temp solution for icon alignment
        if ( group.name === "SaveAs" ) {
            posY-=4; scale=0.93;
        }

        var newWidth=group.width * scale;//aspectRatio;
        var newHeight=group.height * scale;//aspectRatio;

        posX+=(group.width*scaleX - newWidth)/2 - group.bbox.minX * scale;
        posY+=(group.height*scaleY - newHeight)/2 - group.bbox.minY * scale;
    } else
    if ( rect.width && rect.height ) {
        posX+=(rect.width - group.width)/2 - group.bbox.minX;
        posY+=(rect.height - group.height)/2 - group.bbox.minY;
    }

    posX=Math.round( posX ); posY=Math.round( posY );

    // --- Draw it

    // fix rotation at center for now
    crX = crX ? crX : rect.x + rect.width / 2;
    crY = crY ? crY : rect.y + rect.height / 2;

    this.flush();

    this.fontShader.bind();
    this.fontShader.setFloat("uniformAlpha", this.alpha);
    this.fontShader.setColor("color", col);

    b.bind();
    b.vertexAttrib(this.fontShader.getAttrib("vPos"), 2, false, 8, 0);

    var tM = this.cacheM1;

    tM.setIdentity();

    this.fontShader.setMatrix("pM", VG.Renderer().proj2d.elements);

    tM.setIdentity();

    if (angle !== 0.0)
    {
        tM.translate(crX, crY, 0);
        tM.rotate(-angle, 0, 0, 1);
        tM.translate(-crX, -crY, 0);
    }

    tM.translate( posX, posY, 0);
    tM.translate( 0, 0, 0);
    tM.scale(scale, scale, scale);

    this.fontShader.setMatrix("tM", tM.elements);

    if (group.triSize > 0)
        b.drawBuffer(VG.Renderer.Primitive.Triangles, Math.round( group.triOffset/2 ), Math.round( group.triSize/2 ) );
};

/**
 * Make sure the UI gets repaint on the next tick.
 **/

VG.Canvas.prototype.update=function()
{
    VG.update();
};

/**
 * Clears the given rectangle on the GL layer.
 * @param {VG.Core.Rectangle} rect - The rectangle to clear.
 **/

VG.Canvas.prototype.clearGLRect=function( rect )
{
    this.flush();
    this.rt.setScissor( rect );
    this.rt.clear( true );
    this.rt.setScissor();
};
