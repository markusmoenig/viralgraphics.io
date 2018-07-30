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
 * Contains the core classes used by Visual Graphics. These classes are meant to be used in the UI aspect of Visual Graphics. For realtime graphics
 * please use the classes contained in {@link VG.Math}.
 * @namespace
 */

VG.Core = {};

// --- Global function to be able to chain constructors using apply

Function.prototype.creator=function( aArgs )
{
    var fConstructor = this, fNewConstr = function() { fConstructor.apply(this, aArgs); };
    fNewConstr.prototype = fConstructor.prototype;
    return new fNewConstr();
};

// --------------------------------------------- VG.Core.Point

/**
* Creates a new VG.Core.Point class.
* @constructor
* @param {Number | VG.Core.Point} value - Either the x value or a VG.Core.Point class
* @param {Number} y - The Y Value
*/

VG.Core.Point=function()
{
    if ( !(this instanceof VG.Core.Point ) ) return VG.Core.Point.creator( arguments );

    /** The x coordinate, default is 0
     *  @member {Number} */
    this.x=0;

    /** The y coordinate, default is 0
     *  @member {Number} */
    this.y=0;

    if ( arguments.length === 2 ) {
        this.x=arguments[0]; this.y=arguments[1];
    } else
    if ( arguments.length === 1 ) {
        this.x=arguments[0].x; this.y=arguments[0].y;
    }
};

/**
 * Sets the Point values directly.
 * @param {Number | VG.Core.Point} value - Either the x value of the Point or a Point class
 * @param {Number} y - Y Value
 */

VG.Core.Point.prototype.set=function()
{
    if ( arguments.length == 2 ) {
        this.x=arguments[0]; this.y=arguments[1];
    } else if ( arguments.length == 1 ) {
        this.x=arguments[0].x; this.y=arguments[0].y;
    }
};

/**
 * Copy the Point values from the given {@link VG.Core.Point} class.
 * @param {VG.Core.Point} value - A Point class
 */

VG.Core.Point.prototype.copy=function()
{
    this.x=arguments[0].x; this.y=arguments[0].y;
};

/**
 * Returns true if the given {@link VG.Core.Point} is equal.
 * @param {VG.Core.Point} point - The point to compare
 * @returns {bool}
 */

VG.Core.Point.prototype.equals=function( arg )
{
    if ( this.x === arg.x && this.y === arg.y )
        return true; else return false;
};

/**
 * Returns a string version of this class.
 * @returns {String}
 */

VG.Core.Point.prototype.toString=function()
{
    return "VG.Core.Point( " + this.x + ", " + this.y + " );";
};


/**
 * Creates a new VG.Core.Size class.
 * @constructor
 * @param {Number | VG.Core.Size} value - Either the width value or a VG.Core.Size class
 * @param {Number} height - The height value
 */

VG.Core.Size=function()
{
    if ( !(this instanceof VG.Core.Size ) ) return VG.Core.Size.creator( arguments );

    /** The width, default is 0.
     *  @member {Number} */
    this.width=0;

    /** The height, default is 0.
     *  @member {Number} */
    this.height=0;

    if ( arguments.length === 2 ) {
        this.width=arguments[0]; this.height=arguments[1];
    } else
    if ( arguments.length === 1 ) {
        this.width=arguments[0].width; this.height=arguments[0].height;
    }
};

/**
 * Creates a new VG.Core.Size class with the values of this class and adds the given values to it. Returns the new class. Optionally an
 * @param {Number | VG.Core.Point} value - Either the width value or a VG.Core.Size class
 * @param {Number} height - Height value
 * @param {VG.Core.Size} resultSize - Optional, use this size instead of allocating a new one
 * @returns {VG.Core.Size}
 */

VG.Core.Size.prototype.add=function( width, height, resultSize )
{
    var size;
    if ( !resultSize ) size=new VG.Core.Size( this ); else { if ( resultSize !== this ) resultSize.copy( this ); size=resultSize; }

    if ( arguments.length >= 2 )
        size.set( this.width+width, this.height+height );
    if ( arguments.length === 1 )
        size.set( this.width+arguments[0].width, this.height+arguments[0].height );

    return size;
};

/**
 * Sets the Size values directly.
 * @param {Number | VG.Core.Point} value - Either the width value or a VG.Core.Size class
 * @param {Number} height - Height value
 */

VG.Core.Size.prototype.set=function( width, height )
{
    if ( arguments.length == 2 ) {
        this.width=width; this.height=height;
    } else
    if ( arguments.length == 1 ) {
        this.width=arguments[0].width; this.height=arguments[0].height;
    }
};

/**
 * Copies the values from an {@link VG.Core.Size} object.
 * @param {Number | VG.Core.Point} size - A VG.Core.Size class
 */

VG.Core.Size.prototype.copy=function()
{
    this.width=arguments[0].width; this.height=arguments[0].height;
};

/**
 * Returns true if the given VG.Core.Size is equal.
 * @param {VG.Core.Size} size - The VG.Core.Size to compare
 *  @returns {bool}
 */

VG.Core.Size.prototype.equals=function( arg )
{
    if ( this.width === arg.width && this.height === arg.height )
        return true; else return false;
};

/** Returns a string version of this class.
 *  @returns {String}
 */

VG.Core.Size.prototype.toString=function()
{
    return "VG.Core.Size( " + this.width + ", " + this.height + " );";
};


/**
 * Creates a new VG.Core.Rect class containing the x, y coordinates and width, height values of the rectangle.
 *
 *  @constructor
 *  @param {Number | VG.Core.Rect} value - Either the x coordinate or a VG.Core.Rect class
 *  @param {Number} y - The y coordinate
 *  @param {Number} width - The width value
 *  @param {Number} height - The height value
 */

VG.Core.Rect=function()
{
    if ( !(this instanceof VG.Core.Rect ) ) return VG.Core.Rect.creator( arguments );

    /** The x coordinate of the rectangle, default is 0.
     *  @member {Number} */
    this.x=0;

    /** The y coordinate of the rectangle, default is 0.
     *  @member {Number} */
    this.y=0;

    /** The width of the rectangle, default is 0.
     *  @member {Number} */
    this.width=0;

    /** The height of the rectangle, default is 0.
     *  @member {Number} */
    this.height=0;

    if ( arguments.length === 4 ) {
        this.x=arguments[0]; this.y=arguments[1];
        this.width=arguments[2]; this.height=arguments[3];
    } else if ( arguments.length == 1 ) {
        // --- Copy constructor
        this.x=arguments[0].x; this.y=arguments[0].y;
        this.width=arguments[0].width; this.height=arguments[0].height;
    }
};

/**
 * Creates a new VG.Core.Rect class with the values of this class and adds the given rectangle values to it. Returns the new class.
 * @param {number | VG.Core.Rect} value - Either the width value or a VG.Core.Rect class
 * @param {number} y - Y Coordinate
 * @param {number} width - Width value
 * @param {number} height - Height value
 * @param {VG.Core.Rect} resultRect - Optional, use this rect instead of allocating a new one
 * @returns {VG.Core.Rect}
 */

VG.Core.Rect.prototype.add=function( x, y, width, height, resultRect )
{
    var rect;
    if ( !resultRect ) rect=new VG.Core.Rect( this ); else { if ( resultRect !== this ) resultRect.copy( this ); rect=resultRect; }

    if ( arguments.length >= 4 ) {
        rect.x+=x; rect.y+=y;
        rect.width+=width; rect.height+=height;
    } else
    if ( arguments.length === 1 ) {
        rect.x+=arguments[0].x; rect.y+=arguments[0].y;
        rect.width+=arguments[0].width; rect.height+=arguments[0].height;
    }

    return rect;
};

/** Sets all values to 0. */

VG.Core.Rect.prototype.clear=function()
{
    this.x=0; this.y=0;
    this.width=0; this.height=0;
};

/**
 * Creates a new VG.Core.Rect class with the values of this class and subtracts the given width and height values from it. Adjusts the x, y coordinates
 * so that the new rectangle is centered on this rectangle. Returns the new class.
 *
 *  @param {Number} width - Width value to subtract.
 *  @param {Number} height - Height walue to subtract.
 *  @param {VG.Core.Rect} resultRect - Optional, use this rect instead of allocating a new one
 *  @returns {VG.Core.Rect}
 */

VG.Core.Rect.prototype.shrink=function( width, height, resultRect )
{
    var rect;
    if ( !resultRect ) rect=new VG.Core.Rect( this ); else { if ( resultRect !== this ) resultRect.copy( this ); rect=resultRect; }

    rect.x+=width; rect.y+=height;
    rect.width-=2*width; rect.height-=2*height;

    return rect;
};

/**
 * Sets the position values.
 * @param {Number | VG.Core.Point} value - Either the new x coordinate value or a VG.Core.Point class
 * @param {Number} y - New y Coordinate
 */

VG.Core.Rect.prototype.setPos=function( x, y )
{
    if ( arguments.length === 2 ) {
        this.x=x; this.y=y;
    } else {
        this.x=arguments[0].x;
        this.y=arguments[0].y;
    }
};

/**
 * Returns the position of this rectangle as a {@link VG.Core.Point} class.
 * @returns {VG.Core.Point}
 */

VG.Core.Rect.prototype.pos=function()
{
    return VG.Core.Point( this.x, this.y );
};

/**
 * Sets the size values.
 * @param {Number | VG.Core.Point} value - Either the new width value or a VG.Core.Size class
 * @param {Number} y - New height value
 */

VG.Core.Rect.prototype.setSize=function( width, height )
{
    if ( arguments.length === 2 ) {
        this.width=width; this.height=height;
    } else {
        this.width=arguments[0].width;
        this.height=arguments[0].height;
    }
};

/**
 * Returns the size of this rectangle as a {@link VG.Core.Size} class.
 * @returns {VG.Core.Size}
 */

VG.Core.Rect.prototype.size=function()
{
    return VG.Core.Size( this.width, this.height );
};

/**
 * Sets the values of the rectangle directly.
 * @param {Number | VG.Core.Rect} value - Either the x coordinate or a VG.Core.Rect class
 * @param {Number} y - The y coordinate
 * @param {Number} width - The width value
 * @param {Number} height - The height value
 */

VG.Core.Rect.prototype.set=function( rect )
{
    if ( arguments.length === 4 ) {
        this.x=arguments[0]; this.y=arguments[1];
        this.width=arguments[2]; this.height=arguments[3];
    } else {
        this.x=rect.x; this.y=rect.y;
        this.width=rect.width; this.height=rect.height;
    }
};

/**
 * Copies the values of the given rectangle.
 * @param {VG.Core.Rect} rect - The VG.Core.Rect object to copy
 */

VG.Core.Rect.prototype.copy=function( rect )
{
    this.x=rect.x; this.y=rect.y;
    this.width=rect.width; this.height=rect.height;
};

/**
 * Returns the upper left position as a {@link VG.Core.Point} class.
 * @returns {VG.Core.Point}
 */

VG.Core.Rect.prototype.upperLeft=function()
{
    return new VG.Core.Point( this.x, this.y );
};

/**
 * Returns the upper right position as a {@link VG.Core.Point} class.
 * @returns {VG.Core.Point}
 */

VG.Core.Rect.prototype.upperRight=function()
{
    return new VG.Core.Point( this.x+this.width, this.y );
};

/**
 * Returns the lower left coordinate as a {@link VG.Core.Point} class.
 * @returns {VG.Core.Point}
 */

VG.Core.Rect.prototype.lowerLeft=function()
{
    return new VG.Core.Point( this.x, this.y + this.height-1 );
};

/**
 * Returns the lower right coordinate of this rectangle as a {@link VG.Core.Point} class.
 * @returns {VG.Core.Point}
 */

VG.Core.Rect.prototype.lowerRight=function()
{
    return new VG.Core.Point( this.x + this.width, this.y + this.height-1 );
};

/**
 * Returns the right x coordinate.
 * @returns {Number}
 */

VG.Core.Rect.prototype.right=function()
{
    return this.x+this.width;
};

/**
 * Returns the bottom y coordinate.
 * @returns {Number}
 */

VG.Core.Rect.prototype.bottom=function()
{
    return this.y+this.height;
};

/** Rounds all values, afterwards all values of the rectangle are integers. */

VG.Core.Rect.prototype.round=function()
{
    this.x=Math.round( this.x );
    this.y=Math.round( this.y );
    this.width=Math.round( this.width );
    this.height=Math.round( this.height );

    return this;
};

/**
 * Returns true if the two rectangles are equal, i.e. all values are a perfect match
 * @param {VG.Core.Rect} rect - A VG.Core.Rect class to compare.
 * @returns {bool}
 */

VG.Core.Rect.prototype.equals=function( arg )
{
    if ( this.x === arg.x && this.y === arg.y && this.width === arg.width && this.height === arg.height )
        return true; else return false;
};

/**
 * Returns true if the VG.Core.Point or VG.Core.Rect are completely contained in this rectangle.
 *
 * @param {VG.Core.Rect | VG.Core.Point | Number} value - A VG.Core.Rect or VG.Core.Point class or a Number representing the x value
 * @param {Number} y - The Y Value
 * @returns {bool}
 */

VG.Core.Rect.prototype.contains=function( arg )
{
    if ( arg instanceof VG.Core.Point ) {
        if ( (this.x <= arg.x) && (this.y <= arg.y) && (this.x + this.width >= arg.x) && (this.y + this.height >= arg.y) )
            return true; else return false;
    } else
    if ( arg instanceof VG.Core.Rect ) {
        if ( (this.x <= arg.x) && (this.y <= arg.y) && (this.right() >= arg.right() ) && (this.bottom() >= arg.bottom()) )
            return true; else return false;
    } else if ( arguments.length === 2 )
    {
        if ( (this.x <= arguments[0] ) && (this.y <= arguments[1] ) && (this.x + this.width >= arguments[0] ) && (this.y + this.height >= arguments[1] ) )
            return true; else return false;
    }

    return false;
};

/**
 * Returns a resultant rectangle of the intersection of this and rect if they intersect. If they don't, returns null.
 *
 * @param {VG.Core.Rect} rect - A VG.Core.Rect class
 * @returns {VG.Core.Rect}
 */

VG.Core.Rect.prototype.intersect=function( rect )
{
    if( rect instanceof VG.Core.Rect ) {

        var left = Math.max( this.x, rect.x );
        var top = Math.max( this.y, rect.y );

        var right = Math.min( this.x+this.width, rect.x+rect.width );
        var bottom = Math.min( this.y+this.height, rect.y+rect.height );

        var width = right - left;
        var height= bottom - top;

        if( width > 0 && height > 0 )
            return VG.Core.Rect(left, top, width, height);

        return null;
    }
};

/**
 * Returns the resultant rectangle of the union of this and rect. Applies to and returns resultRect if defined.
 *
 * @param {VG.Core.Rect} rect - A VG.Core.Rect class
 * @param {VG.Core.Rect} resultRect - Optional, use this rect instead of allocating a new one
 * @returns {VG.Core.Rect}
 */

VG.Core.Rect.prototype.union=function( rect, resultRect )
{
    if( rect instanceof VG.Core.Rect ) {

        var left = Math.min( this.x, rect.x );
        var top = Math.min( this.y, rect.y );

        var right = Math.max( this.x+this.width, rect.x+rect.width );
        var bottom = Math.max( this.y+this.height, rect.y+rect.height );

        var width = right - left;
        var height= bottom - top;

        if ( resultRect ) {
            resultRect.set( left, top, width, height );
            return resultRect;
        }
        else return VG.Core.Rect(left, top, width, height);
    }
};

/**
 * Returns a string version of this class.
 * @returns {String}
 */

VG.Core.Rect.prototype.toString=function()
{
    return "VG.Core.Rect( " + this.x + ", " + this.y + ", " + this.width + ", " + this.height + " );";
};

/**
 * Returns true if the rectangle is valid, i.e. both width and height are greater than 0, otherwise returns false.
 *  @returns {String}
 */

VG.Core.Rect.prototype.isValid=function()
{
    if ( this.width > 0 && this.height > 0 ) return true;
    else return false;
};


/**
 * Creates a new VG.Core.Margin class, used to specify the margins of Layouts.
 * @constructor
 * @param {Number | VG.Core.Margin} value - Either the left margin or a VG.Core.Margin class
 * @param {Number} top - Top margin
 * @param {Number} right - Right margin
 * @param {Number} bottom - Bottom margin
 */

VG.Core.Margin=function()
{
    if ( !(this instanceof VG.Core.Margin ) ) return VG.Core.Margin.creator( arguments );

    /** The left margin, default is 0.
     *  @member {Number} */
    this.left=0;

    /** The top margin, default is 0.
     *  @member {Number} */
    this.top=0;

    /** The right margin, default is 0.
     *  @member {Number} */
    this.right=0;

    /** The bottom margin, default is 0.
     *  @member {Number} */
    this.bottom=0;

    if ( arguments.length == 4 ) {
        // --- All 4 args passed
        this.left=arguments[0]; this.top=arguments[1];
        this.right=arguments[2]; this.bottom=arguments[3];
    } else if ( arguments.length === 1 ) {
        // --- Copy constructor
        this.left=arguments[0].left; this.top=arguments[0].top;
        this.right=arguments[0].right; this.bottom=arguments[0].bottom;
    }
};

/**
 * Sets the values of the margin.
 * @param {Number | VG.Core.Margin} value - Either the left margin or a VG.Core.Margin class
 * @param {Number} top - Top margin
 * @param {Number} right - Right margin
 * @param {Number} bottom - Bottom margin
 */

VG.Core.Margin.prototype.set=function( left, top, right, bottom )
{
    if ( arguments.length === 4 ) {
        this.left=left; this.top=top;
        this.right=right; this.bottom=bottom;
    } else
    if ( arguments.length === 1 ) {
        this.left=arguments[0].left; this.top=arguments[0].top;
        this.right=arguments[0].right; this.bottom=arguments[0].bottom;
    }
};

/** Sets all values of the Margin to 0.*/

VG.Core.Margin.prototype.clear=function()
{
    this.left=0; this.top=0;
    this.right=0; this.bottom=0;
};

/** Returns a string version of this class.
 *  @returns {String}
 */

VG.Core.Margin.prototype.toString=function()
{
    return "VG.Core.Margin( " + this.left + ", " + this.top + ", " + this.right + ", " + this.bottom + " );";
};


/**
 * Creates a new VG.Core.Color which specifies a specific RGB color, including alpha. Internally the color values are represented normalized between
 * 0 .. 1.<br>
 * There are several constructors available:<ul>
 * <li>The copy constructor takes a single VG.Core.Color value.</li>
 * <li>The HEX constructor takes a single string value of the form "#ffffff".</li>
 * <li>You can specify RGB values using either 3 arguments for red, green and blue or 4 values including alpha. All these values are between 0..255.</li>
 *</ul>
 * Internally all values are stored as normalized value between 0..1. If you want to pass normalized value to an constructor please use the
 * {@link VG.Core.NormalizedColor} constructor.
 * @constructor
 */

VG.Core.Color=function()
{
    if ( !(this instanceof VG.Core.Color ) ) return VG.Core.Color.creator( arguments );

    /** The red color value, normalized between 0..1, default is 0.
     *  @member {Number} */
    this.r=0.0;
    /** The green color value, normalized between 0..1, default is 0.
     *  @member {Number} */
    this.g=0.0;
    /** The blue color value, normalized between 0..1, default is 0.
     *  @member {Number} */
    this.b=0.0;
    /** The alpha value, normalized between 0..1, default is 1.
     *  @member {Number} */
    this.a=1.0;

    if ( arguments.length === 1 )
    {
        if ( arguments[0] instanceof VG.Core.Color ) {
            this.r=arguments[0].r; this.g=arguments[0].g; this.b=arguments[0].b;
            this.a=arguments[0].a;
        } else
        if ( typeof( arguments[0] ) === 'string' ) {
            this.setHex( arguments[0] );
            this.a=1.0;
        }
    } else
    if ( arguments.length === 3 ) {
        this.r=arguments[0]/255.0; this.g=arguments[1]/255.0; this.b=arguments[2]/255.0;
        this.a=1.0;
    } else
    if ( arguments.length === 4 ) {
        this.r=arguments[0]/255.0; this.g=arguments[1]/255.0; this.b=arguments[2]/255.0;
        this.a=arguments[3]/255.0;
    }
    this.canvasStyle = this.toCanvasStyle();
};

/**
 * Creates a new {@link VG.Core.Color} class which specifies a specific RGB color, including alpha. Internally the color values are represented normalized between
 * 0 .. 1.<br>
 * There are several constructors available:<ul>
 * <li>The copy constructor takes a single VG.Core.Color value.</li>
 * <li>You can specify RGB values using either 3 arguments for red, green and blue or 4 values including alpha. All these values are between 0..1.</li>
 *</ul>
 * @constructor
 */

VG.Core.NormalizedColor=function()
{
	let color = VG.Core.Color();
    if ( arguments.length === 1 )
    {
        if ( arguments[0] instanceof VG.Core.Color ) {
            color.r=arguments[0].r; color.g=arguments[0].g; color.b=arguments[0].b;
            color.a=arguments[0].a;
        }
    } else
    if ( arguments.length === 3 ) {
        color.r=arguments[0]; color.g=arguments[1]; color.b=arguments[2];
        color.a=1.0;
    } else
    if ( arguments.length === 4 ) {
        color.r=arguments[0]; color.g=arguments[1]; color.b=arguments[2];
        color.a=arguments[3];
    }
    color.canvasStyle = color.toCanvasStyle();
	return color;
};

/**
 * Copies the color values from the given color.
 * @param {VG.Core.Color} color - The color class to copy the values from.
 */

VG.Core.Color.prototype.copy=function(color)
{
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
    this.canvasStyle = this.toCanvasStyle();
};

/**
 * Sets the color values directly. All values have to be between 0..1.
 * @param {number} r - The red color value.
 * @param {number} g - The green color value.
 * @param {number} b - The blue color value.
 * @param {number} a - Optional, the alpha value.
 */

VG.Core.Color.prototype.set=function( r, g, b, a )
{
    this.r = r;
    this.g = g;
    this.b = b;
    if ( a !== undefined ) this.a = a;
    this.canvasStyle = this.toCanvasStyle();
};

/**
 * Multiplies the color values with the given value. The results are clamped between 0..1.
 * @param {Number} value - The value to multiply each color value with.
 */

VG.Core.Color.prototype.mul=function(d)
{
    this.r = VG.Math.clamp(this.r * d, 0.0, 1.0);
    this.g = VG.Math.clamp(this.g * d, 0.0, 1.0);
    this.b = VG.Math.clamp(this.b * d, 0.0, 1.0);
    this.a = VG.Math.clamp(this.a * d, 0.0, 1.0);
    this.canvasStyle = this.toCanvasStyle();
};

/**
 * Sets the color values to RGBA values between 0..255.
 * @param {number} r - The red color value.
 * @param {number} g - The green color value.
 * @param {number} b - The blue color value.
 * @param {number} a - Optional, the alpha value.
 */

VG.Core.Color.prototype.setRGBA=function( r, g, b, a )
{
    this.r=r/255.0; this.g=g/255.0; this.b=b/255.0;
    if ( a !== undefined ) this.a=a/255.0;
    this.canvasStyle = this.toCanvasStyle();
};

/**
 * Copies the color values from the given array.
 * @param {array} value - The array to copy the color values from.
 */

VG.Core.Color.prototype.setArray=function(value)
{
	if (0 < value.length)
		this.r = value[0];
	if (1 < value.length)
		this.g = value[1];
	if (2 < value.length)
		this.b = value[2];
	if (3 < value.length)
        this.a = value[3];
    this.canvasStyle = this.toCanvasStyle();
};

/**
 * Returns an object containing the converted HSL values for this color.
 * @returns {Object} Containing the converted h, s, l values.
 */

VG.Core.Color.prototype.toHSL=function()
{
    var max = Math.max(this.r, this.g, this.b);
    var min = Math.min(this.r, this.g, this.b);

    var v = (max + min) / 2;
    var h = v;
    var s = v;
    var l = v;

    if (max == min)
    {
        h = 0.0;
        s = 0.0;
    }
    else
    {
        var d = max - min;

        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        if (max == this.r)
        {
            h = (this.g - this.b) / d + (this.g < this.b ? 6 : 0);
        }
        else
        if (max == this.g)
        {
            h = (this.b - this.r) / d + 2;
        }
        else
        if (max == this.b)
        {
            h = (this.r - this.g) / d + 4;
        }

        h /= 6;
    }


    return { h: h, s: s, l: l };
};

/**
 * Sets the internal color values to the given HSL values.
 * @param {Number} h - Hue value
 * @param {Number} s - Saturation value
 * @param {Number} l - Lightness value
 */

VG.Core.Color.prototype.setHSL=function(h, s, l)
{
    function hueAngle(hue, x, y)
    {
        if (hue < 0.0)
        {
            hue += 1;
        }
        else
        if (hue > 1.0)
        {
            hue -= 1;
        }

        if (hue < 1 / 6) return x + (y - x) * 6 * hue;
        if (hue < 1 / 2) return y;
        if (hue < 2 / 3) return x + (y - x) * ((2 / 3) - hue) * 6;

        return x;
    }

    if (s === 0.0)
    {
        this.r = l;
        this.g = l;
        this.b = l;
    }
    else
    {
        var y = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var x = 2 * l - y;

        var hue = h / 360;

        this.r = hueAngle(hue + 1 / 3, x, y);
        this.g = hueAngle(hue        , x, y);
        this.b = hueAngle(hue - 1 / 3, x, y);
    }
    this.canvasStyle = this.toCanvasStyle();
};

/**
 * Returns a string containing a hex representation of this color, i.e. "#ffffff"
 * @returns {String}
 */

VG.Core.Color.prototype.toHex=function()
{
    // Based on http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

    function componentToHex(c) {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    return "#" + componentToHex( Math.round( this.r * 255.0 ) ) + componentToHex( Math.round( this.g * 255.0 ) ) + componentToHex( Math.round( this.b * 255.0 ) );
};

/**
 * Returns a string containing a canvas style representation of this color, i.e. "rgba( 255, 255, 255, 255)"
 * @returns {String}
 */

VG.Core.Color.prototype.toCanvasStyle=function()
{
    let text="rgba( " + this.r * 255 + ", " + this.g * 255 + ", " + this.b * 255 + ", " + this.a + ")";
    return text;
};

/**
 * Sets the internal color values to the given Hex value.
 * @param {String} hex - Hex value in the form "#ffffff"
 */

VG.Core.Color.prototype.setHex=function( hex )
{
    // Based on http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if ( !result ) return;

    this.r=result.length >= 2 ? parseInt(result[1], 16) / 255.0 : 0;
    this.g=result.length >= 3 ? parseInt(result[2], 16) / 255.0 : 0;
    this.b=result.length >= 4 ? parseInt(result[3], 16) / 255.0 : 0;

    this.canvasStyle = this.toCanvasStyle();
};

/**
 * Creates a new {@link VG.Core.Material} class
 * @constructor
 */

VG.Core.Material=function( color, m, s, r )
{
    if ( !(this instanceof VG.Core.Material ) ) return VG.Core.Material.creator( arguments );

    this.color=color || VG.Core.Color();
    this.r = this.color.r;
    this.g = this.color.g;
    this.b = this.color.b;
    this.a = this.color.a;
    this.metallic=m || 0;
    this.smoothness=s || 0;
    this.reflectance=r || 0.5;
};

/**
 * Copies the material values from the given material or color.
 * @param {VG.Core.Material} material - The materialclass to copy the values from.
 */

VG.Core.Material.prototype.copy=function(material)
{
    if ( material instanceof VG.Core.Material )
    {
        this.color.copy( material.color );
        this.r = this.color.r;
        this.g = this.color.g;
        this.b = this.color.b;
        this.a = this.color.a;
        this.metallic = material.metallic;
        this.smoothness = material.smoothness;
        this.reflectance = material.reflectance;
    } else
    if ( material instanceof VG.Core.Color )
    {
        this.color.copy( material );
    }
};

VG.Core.Material.prototype.set=function( color, metallic, smoothness, reflectance )
{
    this.color.copy( color );
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
    this.metallic = metallic;
    this.smoothness = smoothness;
    this.reflectance = reflectance;
};

/**
 * Clock/Timer for delta calculation
 * @constructor
 */

VG.Core.Timer=function()
{
    this.prev=Date.now(); //old time
};

/** Returns the time elapsed since the last call to this method in seconds (float) */

VG.Core.Timer.prototype.getDelta = function()
{
    var nt = Date.now();

    var diff=0.001 * (nt -this.prev);

    this.prev = nt;

    return diff;
};

/** Predefined Black Color Object */
VG.Core.Color.Black=VG.Core.Color();
/** Predefined White Color Object */
VG.Core.Color.White=VG.Core.Color( 255, 255, 255 );

/** Creates a new Typed Array
 *  @constructor
 *  @param {enum} type - The buffer type: VG.Core.TypedArray.Type.Float, VG.Core.TypedArray.Type.Uint8, VG.Core.TypedArray.Uint16, VG.Core.TypedArray.Uint32
 *  @param {number} size - The buffer size (not in bytes but in elements)
 */

VG.Core.TypedArray = function( type, size )
{
    if ( !(this instanceof VG.Core.TypedArray) ) return new VG.Core.TypedArray( type, size );

    this.data = null;
    this.type = type;

    switch (type)
    {
        case VG.Type.Float:
            this.data = new Float32Array( size );
        break;
        case VG.Type.Uint8:
            this.data = new Uint8Array( size );
        break;
        case VG.Type.Uint16:
            this.data = new Uint16Array( size );
        break;
        case VG.Type.Uint32:
            this.data = new Uint32Array( size );
        break;
    }
};

/**
 * @enum
 * The available typed array types
*/

VG.Core.TypedArray.Type = { Float: 0, Uint8: 1, Uint16: 2, Uint32: 3 };

/**
 * Sets the array data by index
 * @param {number} index - The index in the array, must be < size
 * @param {*} The value to set
 */

VG.Core.TypedArray.prototype.set=function( index, value )
{
    this.data[index] = value;
};

/**
 * Gets the array data by index
 * @param {number} index - The index in the array, must be < size
 * @returns {*}
 */

VG.Core.TypedArray.prototype.get=function( index )
{
    return this.data[index];
};

/**
 * Returns the size of the typed array (not in bytes but elements).
 *  @returns {number}
 */

VG.Core.TypedArray.prototype.getSize = function()
{
    return this.data.length;
};

/**
 * Creates a new VG.Core.Image class containing the color values of an image. Image Data is allocated via an Uint8Array typed array. The image data is allocated
 * in the power of two of the width and height values to ensure direct WebGL / OpenGL support. realWidth and realHeight contain the power of the two sizes.
 *
 * @param {Number | VG.Core.Image} value - Either the width or a VG.Core.Image class to copy width/height values from
 * @param {Number} height - Height value
 * @constructor
 */

VG.Core.Image=function()
{
    if ( !(this instanceof VG.Core.Image ) ) return VG.Core.Image.creator( arguments );

    /** The user specified width of the Image.
     *  @member {Number} */
    this.width=0;

    /** The user specified height of the Image.
     *  @member {Number} */
    this.height=0;

    /** The image data, allocated in the power of two of the width and height values using an Uint8Array typed array.
     *  @member {Number} */
    this.data=null;

    /** The real width of the image (power of two).
     *  @member {Number} */
    this.realWidth=0;

    /** The real height of the image (power of two).
     *  @member {Number} */
    this.realHeight=0;

    /** The modulo of the image data, i.e. the distance between lines in bytes.
     *  @member {Number} */
    this.modulo=0;

    /** Determines if the image is forced power of two, default is true.
     *  @member {Bool} */
    this.forcePowerOfTwo = false;

    if ( !(this instanceof VG.Core.Image ) ) return VG.Core.Image.creator( arguments );

    if ( arguments.length === 1 ) {
        this.width=arguments[0].width; this.height=arguments[0].height;
        this.forcePowerOfTwo = arguments[0].forcePowerOfTwo;
    } else
    if ( arguments.length === 2 ) {
        this.width=arguments[0]; this.height=arguments[1];
    }

    Object.defineProperty( this, "data", {
        enumerable: false,
        writable: true
    });

    this.alloc();
    this.type=VG.Core.TypedArray.Type.Uint8;
    this.elements=4;
};

/**
 * Allocates the image data. If forcePowerOfTwo is true (the default) allocates the image data in the power of two.
 */

VG.Core.Image.prototype.alloc=function()
{
    this.data=0;
    this.modulo=0;

    this.width = Math.round( this.width );
    this.height = Math.round( this.height );

    if ( this.width && this.height )
    {
        if (this.forcePowerOfTwo)
        {
            this.realWidth=this.powerOfTwo( this.width );
            this.realHeight=this.powerOfTwo( this.height );
        }
        else
        {
            this.realWidth=this.width;
            this.realHeight=this.height;
        }

        this.modulo=this.realWidth * 4;

        this.data=new Uint8Array( this.realWidth * 4 * this.realHeight);
    }
};

/**
 * Disposes the texture associated with this image and deallocates the image data.
 */

VG.Core.Image.prototype.dispose=function()
{
    var texture=VG.Renderer().getTexture( this );
    if ( texture ) texture.dispose();
    this.invalidate();
};


/**
 * Gets a pixel color at position x, y.
 * @param {number} position x coordinate
 * @param {number} position y coordinate
 * @param {VG.Core.Color} The color class to store the pixel data.
 */

VG.Core.Image.prototype.getPixel=function( x, y, color )
{
    if ( !color ) color=VG.Core.Color();
    let offset=y * this.modulo + x * 4;
    color.r=this.data[offset] / 255;
    color.g=this.data[offset+1] / 255;
    color.b=this.data[offset+2] / 255;
    color.a=this.data[offset+3] / 255;

    return color;
};

/**
 * Sets pixel color at position
 * @param {number} position x coordinate
 * @param {number} position y coordinate
 * @param {number} 0.0 to 1.0 red channel
 * @param {number} 0.0 to 1.0 green channel
 * @param {number} 0.0 to 1.0 blue channel
 * @param {number} 0.0 to 1.0 alpha channel
*/

VG.Core.Image.prototype.setPixel=function( x, y, r, g, b, a )
{
    var offset=y * this.modulo + x * 4;
    this.data[offset]=r * 255;
    this.data[offset+1]=g * 255;
    this.data[offset+2]=b * 255;
    this.data[offset+3]=a * 255;
};

/**
 * Sets pixel color at position
 * @param {number} position x coordinate
 * @param {number} position y coordinate
 * @param {number} 0 to 255 red channel
 * @param {number} 0 to 255 green channel
 * @param {number} 0 to 255 blue channel
 * @param {number} 0 to 255 alpha channel
*/

VG.Core.Image.prototype.setPixelRGBA=function( x, y, r, g, b, a )
{
    var offset=y * this.modulo + x * 4;
    this.data[offset]=r;
    this.data[offset+1]=g;
    this.data[offset+2]=b;
    this.data[offset+3]=a;
};

VG.Core.Image.prototype.powerOfTwo=function (value, pow) {
    pow = pow || 1;
    while(pow<value) {
        pow *= 2;
    }
    return pow;
};

/**
 * Resizes the image (all image data is lost) using the given width and height.
 * @param {number} width - The new width of the image.
 * @param {number} height - The new height of the image.
 */

VG.Core.Image.prototype.resize=function( width, height )
{
    if ( !this.isValid() || this.width !== width || this.height !== height ) {
        this.width=width; this.height=height;
        this.alloc();
    }
    this.needsUpdate=true;
};

/**
 * Clears the image data with 0 values.
 */

VG.Core.Image.prototype.clear=function()
{
    if ( this.data.fill ) this.data.fill( 0 );
    else
    {
        for ( var i=0; i < this.data.length; ++i )
            this.data[i]=0;
    }
};

/**
 * Copies the values of the given image using a new data array.
 * @param {VG.Core.Image} image - The image to copy
 */

VG.Core.Image.prototype.set=function( image )
{
    this.width=image.width; this.height=image.height;
    this.realWidth=image.realWidth; this.realHeight=image.realHeight;
    this.modulo=image.modulo;
    this.imageData=image.imageData;
    this.name=image.name;
    this.powerOfTwo=image.powerOfTwo;

    this.data=null;
    this.data=new Uint8Array( image.data );
};

/**
 * Copies the values of the given image using a new data array.
 * @param {VG.Core.Image} image - The image to copy
 */

VG.Core.Image.prototype.copy=function( image )
{
    this.set( image );
};

/**
 * Multiplies the given VG.Core.Color with every pixel of the image.
 * @param {VG.Core.Color} color - The color to multiply the image data with.
 */

VG.Core.Image.prototype.mul=function( color )
{
    for ( var h=0; h < this.height; ++h ) {
        for ( var w=0; w < this.width; ++w )
        {
            var offset=h * this.modulo + w * 4;

            this.data[offset]=this.data[offset] * color.r;
            this.data[offset+1]=this.data[offset+1] * color.g;
            this.data[offset+2]=this.data[offset+2] * color.b;
        }
    }
};

/**
 * Returns true if the image has valid image data associated with it.
 * Returns {bool}
 */

VG.Core.Image.prototype.isValid=function()
{
    if ( this.width && this.height && this.data && !this.locked ) return true;
    else return false;
};

/**
 * Invalidates the image by setting the data and dimensions of the image to 0.
 */

VG.Core.Image.prototype.invalidate=function()
{
    this.data=undefined;
    this.width=0; this.height=0;
};

/** Get the real width of the image (power of two).
 * @return {Number}
 */

VG.Core.Image.prototype.getRealWidth=function()
{
    return this.realWidth;
};

/**
 * Get the real height of the image (power of two).
 * @return {Number}
 */

VG.Core.Image.prototype.getRealHeight=function()
{
    return this.realHeight;
};

/**
 * Get the user specified width of the Image.
 * @return {Number}
 */

VG.Core.Image.prototype.getWidth=function()
{
    return this.width;
};

/**
 * Get the user specified height of the Image.
 * @return {Number}
 */

VG.Core.Image.prototype.getHeight=function()
{
    return this.height;
};


VG.Core.Float32Image=function()
{
    if ( !(this instanceof VG.Core.Float32Image ) ) return VG.Core.Float32Image.creator( arguments );

    /** The user specified width of the Image.
     *  @member {Number} */
    this.width=0;

    /** The user specified height of the Image.
     *  @member {Number} */
    this.height=0;

    /** The image data, allocated in the power of two of the width and height values using an Uint8Array typed array.
     *  @member {Number} */
    this.data=null;

    /** The real width of the image (power of two).
     *  @member {Number} */
    this.realWidth=0;

    /** The real height of the image (power of two).
     *  @member {Number} */
    this.realHeight=0;

    /** The modulo of the image data, i.e. the distance between lines in bytes.
     *  @member {Number} */
    this.modulo=0;

    /** Determines if the image is forced power of two, default is true.
     *  @member {Bool} */
    this.forcePowerOfTwo = false;

    if ( !(this instanceof VG.Core.Image ) ) return VG.Core.Image.creator( arguments );

    if ( arguments.length === 1 ) {
        this.width=arguments[0].width; this.height=arguments[0].height;
    } else
    if ( arguments.length === 2 ) {
        this.width=arguments[0]; this.height=arguments[1];
    }

    Object.defineProperty( this, "data", {
        enumerable: false,
        writable: true
    });

    this.alloc();
    this.type=VG.Core.TypedArray.Type.Float;
    this.elements=4;
};

VG.Core.Float32Image.prototype=VG.Core.Image();

/**
 * Allocates the image data. If forcePowerOfTwo is true (the default) allocates the image data in the power of two.
 */

VG.Core.Float32Image.prototype.alloc=function()
{
    this.data=0;
    this.modulo=0;

    if ( this.width && this.height )
    {
        if (this.forcePowerOfTwo)
        {
            this.realWidth=this.powerOfTwo( this.width );
            this.realHeight=this.powerOfTwo( this.height );
        }
        else
        {
            this.realWidth=this.width;
            this.realHeight=this.height;
        }

        this.modulo=this.realWidth * this.elements;
        this.data=new Float32Array( this.realWidth * this.elements * this.realHeight);
    }
};

/**
 * Creates an VG.Core.ImagePool class. The default image pool of every Visual Graphics application is located at VG.context.imagePool. It is filled automatically
 * on application startup with all application images as well as with images used by the Style. You can retrieve images from the default pool
 * using VG.Utils.getImageByName() which in turn calls VG.context.imagePool.getImageByName().
 *  @constructor
 */

VG.Core.ImagePool=function()
{
    if ( !(this instanceof VG.Core.ImagePool) ) return new VG.Core.ImagePool();

    this.images=[];
};

/**
 * Adds an image to the pool.
 * param {VG.Core.Image} image - The image to add.
 */

VG.Core.ImagePool.prototype.addImage=function( image )
{
    this.images.push( image );
};

/**
 * Returns an image from the pool based on its name.
 * @returns {VG.Core.Image} or null if no image with the given name was found.
 */

VG.Core.ImagePool.prototype.getImageByName=function( name )
{
    for( var i=0; i < this.images.length; ++i ) {
        if ( this.images[i].name === name )
            return this.images[i];
    }

    var prefixName=VG.UI.stylePool.current.skin.prefix + name;

    for( i=0; i < this.images.length; ++i ) {
        if ( this.images[i].name === prefixName )
            return this.images[i];
    }

    if ( VG.UI.stylePool.current.skin.fallbackPrefix ) {
        prefixName=VG.UI.stylePool.current.skin.fallbackPrefix + name;
        for( i=0; i < this.images.length; ++i ) {
            if ( this.images[i].name === prefixName )
                return this.images[i];
        }
    }

    return null;
};

VG.context.imagePool=VG.Core.ImagePool();
