/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>, Luis Jimenez <kuko@kvbits.com>.
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

// --------------------------------------------- VG.Canvas

VG.Canvas=function()
{
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

    this.triBuffer=new VG.GPUBuffer(VG.Type.Float, (6 * 3) * 256, true);
    this.triBuffer.create();
    this.triCount=0;

    
    this.fonts=[];
    this.fonts.push( VG.context.style.skin.DefaultFont );
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

    //render target
    this.rt = VG.Renderer().mainRT;

    // Current clipRect
    this.clipRect=VG.Core.Rect();
};

VG.Canvas.Shape2D={ "Rectangle" : 0, "VerticalGradient" : 1, "HorizontalGradient" : 2, "RectangleOutline" : 3, "RoundedRectangleOutline1px" : 4, "RoundedRectangle2px" : 5, 
                    "FlippedTriangle" : 6, "ArrowLeft" : 7, "ArrowRight" : 8, "Circle": 9, "ArrowRightGradient": 10, "DropShadow_NoTop7px" : 11, "Docs.Enum" : 9000 };

VG.Canvas.prototype.pushFont=function( font )
{
    /**Pushes the given VG.Font.Font to the canvas. It will be used until a popFont() call takes it off the top of the font stack. Every pushFont() call needs to have a matching popFont()
     * call.
     * @param {VG.Font.Font} font - The font to use
     */

    this.fontIndex++;
    this.fonts.splice( this.fontIndex, 0, font );
};

VG.Canvas.prototype.popFont=function( font )
{
    /**Takes the current font of the font stack and the canvas resumes using the new font at the top of the stack.
     */

    this.fonts.splice( this.fontIndex, 1 );
    --this.fontIndex;
};

VG.Canvas.prototype.setAlpha=function( alpha )
{
    /**Sets a new alpha value to the canvas. All following drawing operations will use this new alpha value.
     * @param {number} alpha - The new alpha value to use, has to be in the range of 0..1.
     */

    this.flush();    
    this.alpha = alpha;
};

VG.Canvas.prototype.setClipRect=function( rect, intersect )
{
    /**Sets a new clipping rectangle. All drawing outside this rectangle will be ignored. Pass null to reset to no clipping.
     * @param {VG.Core.Rect} rect - The new clipping rectangle to use or null to reset to no clipping.
     * @param {bool} intersect - If true set the new clipping rectangle to be the intersection of the current rectangle and rect.  
     */

    this.flush();

    if ( intersect && this.clipRect.width && this.clipRect.height ) {

        var intersectRect = this.clipRect.intersect( rect );

        if( intersectRect ) {

            this.clipRect = intersectRect;
            this.rt.setScissor( intersectRect );
        }
    }
    else {

        if ( rect ) this.clipRect.set( rect );
        else { this.clipRect.width=0; this.clipRect.height=0; }

        this.rt.setScissor(rect);
    }
};

VG.Canvas.prototype.flush=function()
{
    /**Flushes all triangle caches. Called by VG.UI.Workspace at the end of a redraw operation to make sure all triangles are painted.
     */    
    if (this.triCount) this.flushTris();    
};

VG.Canvas.prototype.addTriangle2D=function( x1, y1, x2, y2, x3, y3, col1, col2, col3 )
{ 
    /**Draws a 2D triangle using the specified coordinates and the VG.Core.Color for each coordinate.
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

    var b = this.triBuffer;

    b.setBuffer(this.triCount++, x1);
    b.setBuffer(this.triCount++, y1);

    b.setBuffer(this.triCount++, col1.r);
    b.setBuffer(this.triCount++, col1.g);
    b.setBuffer(this.triCount++, col1.b);
    b.setBuffer(this.triCount++, col1.a);



    b.setBuffer(this.triCount++, x2);
    b.setBuffer(this.triCount++, y2);

    b.setBuffer(this.triCount++, col2.r);
    b.setBuffer(this.triCount++, col2.g);
    b.setBuffer(this.triCount++, col2.b);
    b.setBuffer(this.triCount++, col2.a);



    b.setBuffer(this.triCount++, x3);
    b.setBuffer(this.triCount++, y3);

    b.setBuffer(this.triCount++, col3.r);
    b.setBuffer(this.triCount++, col3.g);
    b.setBuffer(this.triCount++, col3.b);
    b.setBuffer(this.triCount++, col3.a);


    if (this.triCount >= b.getSize())
    {
        this.flushTris();
    }
}

VG.Canvas.prototype.addSolidRectangle2D=function( x1, y1, x2, y2, col )
{
    /**Draws a 2D rectangle using the specified coordinates and VG.Core.Color.
     * @param {number} x1 - The x1 coordinate
     * @param {number} y1 - The y1 coordinate
     * @param {number} x2 - The x2 coordinate
     * @param {number} y2 - The y2 coordinate
     * @param {number} col - The color of the rectangle.
     */    
    this.addTriangle2D(x1, y1, x2, y1, x1, y2, col, col, col);
    this.addTriangle2D(x1, y2, x2, y1, x2, y2, col, col, col);
};

VG.Canvas.prototype.flushTris=function()
{
    var b = this.triBuffer;
    var shader = this.primShader;
    
    shader.bind();

    //this also binds the buffer
    b.update(0, this.triCount);

    var stride = b.getStride();

    b.vertexAttrib(shader.getAttrib("drawPosition"), 2, false, stride * 6, 0);
    b.vertexAttrib(shader.getAttrib("drawColor"), 4, false, stride * 6, stride * 2);

    shader.setFloat("uniformAlpha", this.alpha);
    shader.setMatrix("pM", VG.Renderer().proj2d.elements);

    //buffer already binded at b.update(), force no bind
    b.draw(VG.Renderer.Primitive.Triangles, 0, this.triCount / 6, true);

    this.triCount = 0;
}

// --------------------------------------------- VG.Canvas.prototype.draw2DShape

VG.Canvas.prototype.draw2DShape=function( shape, rect, col1, col2, col3 )
{
    /**Draws a 2D Shape using the specified rectangle and colors.
     * @param {VG.Canvas.Shape2D} shape - The shape as specified in the VG.Canvas.Shape2D enum
     * @param {VG.Core.Rect} rect - The rectangle for the shape
     * @param {VG.Core.Color} col1 - The main color of the shape
     * @param {VG.Core.Color} col2 - The optional 2nd color of the shape. Usage depends on shape type.
     * @param {VG.Core.Color} col3 - The optional 3rd color of the shape. Usage depends on shape type.
     */    
    switch( shape )
    {
        case VG.Canvas.Shape2D.Rectangle:
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

            var pixelColor=VG.Core.Color( col1 );

            // --- Top Left
            pixelColor.a=0.1;
            this.addSolidRectangle2D( rect.x, rect.y, rect.x+1, rect.y+1, pixelColor );
            pixelColor.a=0.75;
            this.addSolidRectangle2D( rect.x+1, rect.y, rect.x+2, rect.y+1, pixelColor );
            this.addSolidRectangle2D( rect.x, rect.y+1, rect.x+1, rect.y+2, pixelColor );
            pixelColor.a=1.0;
            this.addSolidRectangle2D( rect.x+1, rect.y+1, rect.x+2, rect.y+2, pixelColor );
            // --- Top Right
            pixelColor.a=0.1;
            this.addSolidRectangle2D( rect.right()-1, rect.y, rect.right(), rect.y+1, pixelColor );
            pixelColor.a=0.75;
            this.addSolidRectangle2D( rect.right()-2, rect.y, rect.right()-1, rect.y+1, pixelColor );
            this.addSolidRectangle2D( rect.right()-1, rect.y+1, rect.right(), rect.y+2, pixelColor );
            pixelColor.a=1.0;
            this.addSolidRectangle2D( rect.right()-2, rect.y+1, rect.right()-1, rect.y+2, pixelColor );
            // --- Bottom Left
            pixelColor.a=0.1;
            this.addSolidRectangle2D( rect.x, rect.bottom()-1, rect.x+1, rect.bottom(), pixelColor );
            pixelColor.a=0.75;
            this.addSolidRectangle2D( rect.x+1, rect.bottom()-1, rect.x+2, rect.bottom(), pixelColor );
            this.addSolidRectangle2D( rect.x, rect.bottom()-2, rect.x+1, rect.bottom()-1, pixelColor );
            pixelColor.a=1.0;
            this.addSolidRectangle2D( rect.x+1, rect.bottom()-2, rect.x+2, rect.bottom()-1, pixelColor );            
            // --- Bottom Right
            pixelColor.a=0.1;
            this.addSolidRectangle2D( rect.right()-1, rect.bottom()-1, rect.right(), rect.bottom(), pixelColor );
            pixelColor.a=0.75;
            this.addSolidRectangle2D( rect.right()-2, rect.bottom()-1, rect.right()-1, rect.bottom(), pixelColor );
            this.addSolidRectangle2D( rect.right()-1, rect.bottom()-2, rect.right(), rect.bottom()-1, pixelColor );
            pixelColor.a=1.0;
            this.addSolidRectangle2D( rect.right()-2, rect.bottom()-2, rect.right()-1, rect.bottom()-1, pixelColor );    
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
            var rW = rect.width / 2;
            var rH =  rect.height / 2;

            var step = Math.floor(VG.Math.clamp(rW * rH, 8, 64));
            
            var theta = 0.0;
            var pX = rect.x + rect.width / 2;
            var pY = rect.y + rect.height / 2;
            var inc = (Math.PI * 2.0) / step;

            if (!col3) col3 = col1;
            if (!col2) col2 = col1;
 
            var x1, y1, x2, y2;

            for (var i = 1; i <= step; i++)
            {
                x1 = pX + rW * Math.cos(inc * (i - 1));
                y1 = pY - rH * Math.sin(inc * (i - 1));    

                x2 = pX + rW * Math.cos(inc * i);
                y2 = pY - rH * Math.sin(inc * i);

                if (shape == VG.Canvas.Shape2D.CircleHue)
                {
                    col1 = this.cacheC1;
                    col1.setHSL(VG.Math.deg(inc * (i - 1)) - 90, 1.0, 0.5);

                    col2 = this.cacheC2;
                    col2.setHSL(VG.Math.deg(inc * i) - 90, 1.0, 0.5);

                    col3 = VG.Core.Color(255, 255, 255);
                }

                this.addTriangle2D(x1, y1, x2, y2, pX, pY, col1, col2, col3);
            }

            return;
        break;   

        case VG.Canvas.Shape2D.DropShadow_NoTop7px:

            col1.a=102.0 / 255.0;
            var startColor=col1; 
            var midColor=VG.Core.Color( startColor ); 
            midColor.a=36.0 / 255.0;
            var endColor=VG.Core.Color( 0, 0, 0, 0 );

            var cp=8;

            if ( rect.height < cp ) {
                this.draw2DShape( VG.Canvas.Shape2D.HorizontalGradient, VG.Core.Rect( rect.x-7, rect.y, 7, rect.height ), endColor, startColor );
                this.draw2DShape( VG.Canvas.Shape2D.HorizontalGradient, VG.Core.Rect( rect.right(), rect.y, 7, rect.height ), startColor, endColor );
                this.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, VG.Core.Rect( rect.x, rect.bottom(), rect.width, 7 ), startColor, endColor );
            } else
            {
                this.draw2DShape( VG.Canvas.Shape2D.HorizontalGradient, VG.Core.Rect( rect.x-7, rect.y, 7, rect.height-cp ), endColor, startColor );
                this.draw2DShape( VG.Canvas.Shape2D.HorizontalGradient, VG.Core.Rect( rect.right(), rect.y, 7, rect.height-cp ), startColor, endColor );
                this.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, VG.Core.Rect( rect.x+cp, rect.bottom(), rect.width-2*cp, 7 ), startColor, endColor );

                this.addTriangle2D( rect.x+1, rect.bottom(), rect.x, rect.bottom() - cp, rect.x-7, rect.bottom()-cp, midColor, startColor, endColor );
                this.addTriangle2D( rect.x-7, rect.bottom() - cp, rect.x-7, rect.bottom(), rect.x+1, rect.bottom(), endColor, endColor, midColor );

                this.addTriangle2D( rect.x+cp, rect.bottom()+7, rect.x+cp, rect.bottom(), rect.x+1, rect.bottom(), endColor, startColor, midColor );
                this.addTriangle2D( rect.x+1, rect.bottom(), rect.x, rect.bottom()+7, rect.x+cp, rect.bottom()+7, midColor, endColor, endColor );

                this.addTriangle2D( rect.right()-1, rect.bottom(), rect.right()-cp, rect.bottom(), rect.right()-cp, rect.bottom()+7, midColor, startColor, endColor );
                this.addTriangle2D( rect.right()-cp, rect.bottom()+7, rect.right(), rect.bottom()+7, rect.right()-1, rect.bottom(), endColor, endColor, midColor );

                this.addTriangle2D( rect.right()+7, rect.bottom()-cp, rect.right(), rect.bottom()-cp, rect.right()-1, rect.bottom(), endColor, startColor, midColor );                
                this.addTriangle2D( rect.right()-1, rect.bottom(), rect.right()+7, rect.bottom(), rect.right()+7, rect.bottom()-cp, midColor, endColor, endColor );                
            }

        break;        
    }
};

var rot=0;

// --------------------------------------------- VG.Canvas.prototype.drawImage

VG.Canvas.prototype.drawImage=function( pt, image, size )
{
    /**Draws an image at the specified position, optionaly scales it to the given size.
     * @param {VG.Core.Point} point - The position of the image
     * @param {VG.Core.Image} image - The image to draw.
     * @param {VG.Core.Size} size - The size to scale the image to, optional.
     */   

    this.flush();

    var width=image.realWidth, height=image.realHeight;

    if ( size ) 
    {
        width=size.width + (image.realWidth - image.width) * size.width / image.width; 
        height=size.height + (image.realHeight - image.height) * size.height / image.height;
    }

    var tex = VG.Renderer().getTexture(image);

    //using the renderer's routine, as drawing textured 2d quads is very common
    this.renderer.drawQuad(tex, width, height, pt.x, pt.y, this.alpha);
};

// --------------------------------------------- VG.Canvas.prototype.drawScaledImage

VG.Canvas.prototype.drawScaledImage=function( rect, image )
{
    /**Downscales an image into the specified rectangle. During downscaling the aspect ratio of the image is honored and the image is centered inside the rectangle.
     * @param {VG.Core.Rect} rect - The rectangle to draw into
     * @param {VG.Core.Image} image - The image to draw
     */      
    // --- Get new Width and Height based on Aspect Ratio
    var aspectRatio=image.height / image.width;

    var newWidth, newHeight;

    if ( rect.width * aspectRatio > rect.height ) {
        newWidth=rect.height / aspectRatio < image.width ? rect.height / aspectRatio : image.width;
    } else {
        newWidth=rect.width < image.width ? rect.width : image.width;
    }
    newHeight=aspectRatio*newWidth;

    var xOffset=(rect.width - newWidth)/2;
    var yOffset=(rect.height - newHeight)/2;    
    this.drawImage( VG.Core.Point( rect.x + xOffset, rect.y + yOffset ), image, VG.Core.Size( newWidth, newHeight ) );
};

// --------------------------------------------- VG.Canvas.prototype.getTextSize

VG.Canvas.prototype.getTextSize=function( text, size )
{
    /**Returns the size of the given text using the current canvas size. Returns an VG.Core.Size, optionally you can pass the size object to use.
     * @param {string} text - The text to analyze for size using the current canvas font.
     * @param {VG.Core.Size} size - The size object to use, optional.
     * @returns {VG.Core.Size}
     */ 

    var font=this.fonts[this.fontIndex];
    var x=0;
    var baseLine=0;

    if ( !size ) size=VG.Core.Size();

    for (var i = 0; i < text.length; i++)
    {
        var g = VG.Font.Triangulator.getGlyph( font.triFont, text[i] );//font.triFont.glyphs[text[i]];

        baseLine=Math.max(baseLine, g.baseLine * font.scale);

        x+=g.width * font.scale;
    }

    size.width=Math.ceil( x );
    size.height=Math.ceil( baseLine );

    return size;
}

// --------------------------------------------- VG.Canvas.prototype.wordWrap

VG.Canvas.prototype.wordWrap=function( text, start, width, textLines)
{
    var font=this.fonts[this.fontIndex];
    var lineWidth=start;
    var oneWordFit=false;
    var newLine=false;

    if( text === "" || text===undefined ) {

        textLines.push("");
        return { nextStart: start };
    }

    if( !textLines ) textLines=[];

    var i=0;
    while(text)
    {
        var g = VG.Font.Triangulator.getGlyph( font.triFont, text[i] );
        lineWidth+=g.width * font.scale;
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
                var snipLocation = i+1 < text.length ? i+1 : i; 
                if( snipLocation === i )
                    textLines.push(text.substring( 0 ) );
                else
                    textLines.push( text.substring ( 0, snipLocation ) );

                text=text.substring(snipLocation)
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
                    var snipLocation = i-1 > 0 ? i-1 : i;
                    textLines.push( text.substring ( 0, snipLocation) + "-" );
                    text=text.substring( snipLocation )
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
}


// --------------------------------------------- VG.Canvas.prototype.getLineHeight

VG.Canvas.prototype.getLineHeight=function()
{
    /**Returns the height of one line of text using the current canvas font.
     * @returns {number}
     */ 

    var font=this.fonts[this.fontIndex];
    return font.triFont.height * font.scale;
}

// --------------------------------------------- VG.Canvas.prototype.drawTextRect

VG.Canvas.prototype.drawTextRect=function( text, rect, col, halign, valign, angle, crX, crY)
{    
    /**Draws one line of text using the current canvas font aligned inside the given rectangle. Optionally rotates the font.
     * @returns {string} text - The text to draw.
     * @returns {VG.Core.Rect} rect - The rectangle to align the text into
     * @returns {VG.Core.Color} col - The color to use for the text drawing
     * @returns {number} halign - The horizontal alignment method: 0 is left, 1 centered and 2 is right. TODO: Move into enum
     * @returns {number} valign - The vertical alignment method: 0 is top (plus font descender), 1 centered, 2 is bottom and 3 is top without descender. TODO: Move into enum
     */ 

    var font=this.fonts[this.fontIndex];

    var b=font.triFont.buffer;

    //create the gpu buffer if not present
    if (!b)
    {
        var v = font.triFont.tris;

        //Static gpu buffer
        var b = new VG.GPUBuffer(VG.Type.Float, 2 * 3 * v.length, false);

        var j = 0;

        for (var i = 0; i < v.length; i++)
        {
            b.setBuffer(j++, v[i].x);
            b.setBuffer(j++, v[i].y);
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
        startX=rect.x + (rect.width - textSize.width) / 2;
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

    this.fontShader.setMatrix("pM", VG.Renderer().proj2d.elements);

    for (var i = 0; i < text.length; i++)
    {
        var g = VG.Font.Triangulator.getGlyph( font.triFont, text[i] );

        var drawX=Math.round( startX + x );

        if ( angle == 0.0 && ( x + g.width * font.scale ) > rect.width ) return;

        tM.setIdentity();
        
        if (angle != 0.0)
        {
            tM.translate(crX, crY, 0);
            tM.rotate(-angle, 0, 0, 1);
            tM.translate(-crX, -crY, 0);
        }

        tM.translate(drawX, y, 0);
        tM.scale(font.scale, font.scale, font.scale);
        
        this.fontShader.setMatrix("tM", tM.elements);
 
        if (g.size > 0)
        {
            b.draw(VG.Renderer.Primitive.Triangles, g.offset, g.size, false);
        }
                
        x+=g.width * font.scale;
    }

    return x;
};

// --------------------------------------------- VG.Canvas.prototype.update

VG.Canvas.prototype.update=function()
{
    VG.update();    
}
