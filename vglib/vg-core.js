/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>
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

VG.Core = {};

// --- Global function to be able to chain constructors using apply

Function.prototype.creator=function( aArgs ) 
{
    var fConstructor = this, fNewConstr = function() { fConstructor.apply(this, aArgs); };
    fNewConstr.prototype = fConstructor.prototype;
    return new fNewConstr();
};

// --------------------------------------------- VG.Core.Point

VG.Core.Point=function()
{
    /** Creates a new VG.Core.Point class.
     *
     *  @constructor 
     *  @param {Number | VG.Core.Point} value - Either the x value or a VG.Core.Point class
     *  @param {Number} y - The Y Value
     */

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

VG.Core.Point.prototype.set=function()
{
    /** Sets the Point values.
     *
     *  @param {Number | VG.Core.Point} value - Either the x value of the Point or a Point class
     *  @param {Number} y - Y Value
     */

    if ( arguments.length == 2 ) {
        this.x=arguments[0]; this.y=arguments[1];
    } else if ( arguments.length == 1 ) {
        this.x=arguments[0].x; this.y=arguments[0].y;
    }
};

VG.Core.Point.prototype.copy=function()
{
    /** Copy the Point values.
     *
     *  @param {VG.Core.Point} value - A Point class
     */

    this.x=arguments[0].x; this.y=arguments[0].y;
};

VG.Core.Point.prototype.equals=function( arg )
{
    /** Returns true if the given VG.Core.Point is equal.
     *
     *  @param {VG.Core.Point} point - The point to compare
     *  @returns {bool}
     */    

    if ( this.x === arg.x && this.y === arg.y )
        return true; else return false;
};

VG.Core.Point.prototype.toString=function()
{
    /** Returns a string version of this class.
     *
     *  @returns {String}
     */        
    return "VG.Core.Point( " + this.x + ", " + this.y + " );";
};

// --------------------------------------------- VG.Core.Size

VG.Core.Size=function()
{
    /** Creates a new VG.Core.Size class.
     *
     *  @constructor 
     *  @param {Number | VG.Core.Size} value - Either the width value or a VG.Core.Size class
     *  @param {Number} height - The height value
     */

    if ( !(this instanceof VG.Core.Size ) ) return VG.Core.Size.creator( arguments );    

    /** The width, default is 0.
     *  @member {Number} */  
    this.width=0; 

    /** The height, default is 0.
     *  @member {Number} */  
    this.height=0;

    if ( arguments.length === 2 ) {
        this.width=arguments[0]; this.height=arguments[1];
    }
};

VG.Core.Size.prototype.add=function( width, height, resultSize )
{
    /** Creates a new VG.Core.Size class with the values of this class and adds the given values to it. Returns the new class.
     *  @param {Number | VG.Core.Point} value - Either the width value or a VG.Core.Size class
     *  @param {Number} height - Height value
     *  @returns {VG.Core.Size}     
     */

    var size;
    if ( !resultSize ) size=new VG.Core.Size( this ); else { if ( resultSize !== this ) resultSize.copy( this ); size=resultSize; }

    if ( arguments.length >= 2 )
        size.set( this.width+width, this.height+height );
    if ( arguments.length === 1 )
        size.set( this.width+arguments[0].width, this.height+arguments[0].height );

    return size;
};

VG.Core.Size.prototype.set=function( width, height )
{
    /** Sets the Size values.
     *
     *  @param {Number | VG.Core.Point} value - Either the width value or a VG.Core.Size class
     *  @param {Number} height - Height value
     */

    if ( arguments.length == 2 ) {
        this.width=width; this.height=height;
    } else
    if ( arguments.length == 1 ) {
        this.width=arguments[0].width; this.height=arguments[0].height;
    }
};

VG.Core.Size.prototype.equals=function( arg )
{
    /** Returns true if the given VG.Core.Size is equal.
     *
     *  @param {VG.Core.Size} size - The VG.Core.Size to compare
     *  @returns {bool}
     */  

    if ( this.width === arg.width && this.height === arg.height )
        return true; else return false;
};

VG.Core.Size.prototype.toString=function()
{
    /** Returns a string version of this class.
     *  @returns {String}
     */        
    return "VG.Core.Size( " + this.width + ", " + this.height + " );";
};

// --------------------------------------------- VG.Core.Rect

VG.Core.Rect=function()
{
    /** Creates a new VG.Core.Rect class containing the x, y coordinates and width, height values of the rectangle.
     *
     *  @constructor 
     *  @param {Number | VG.Core.Rect} value - Either the x coordinate or a VG.Core.Rect class
     *  @param {Number} y - The y coordinate
     *  @param {Number} width - The width value
     *  @param {Number} height - The height value
     */

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

VG.Core.Rect.prototype.add=function( x, y, width, height, resultRect )
{
    /** Creates a new VG.Core.Rect class with the values of this class and adds the given rectangle values to it. Returns the new class.
     * 
     *  @param {number | VG.Core.Rect} value - Either the width value or a VG.Core.Rect class
     *  @param {number} y - Y Coordinate
     *  @param {number} width - Width value
     *  @param {number} height - Height value
     *  @param {VG.Core.Rect} resultRect - Optional, use this rect instead of allocating a new one
     *  @returns {VG.Core.Rect}
     */

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

VG.Core.Rect.prototype.clear=function()
{
    /** Sets all values to 0. */

    this.x=0; this.y=0;
    this.width=0; this.height=0;
};

VG.Core.Rect.prototype.shrink=function( width, height, resultRect )
{
    /** Creates a new VG.Core.Rect class with the values of this class and subtracts the given width and height values from it. Adjust the x, y coordinates
     * so that the new rectangle is centered on the this rectangle. Returns the new class.
     *
     *  @param {Number} width - Width value to subtract.
     *  @param {Number} height - Height walue to subtract.
     *  @param {VG.Core.Rect} resultRect - Optional, use this rect instead of allocating a new one     
     *  @returns {VG.Core.Rect}     
     */  

    var rect;
    if ( !resultRect ) rect=new VG.Core.Rect( this ); else { if ( resultRect !== this ) resultRect.copy( this ); rect=resultRect; }

    rect.x+=width; rect.y+=height;
    rect.width-=2*width; rect.height-=2*height;
    
    return rect;    
};

VG.Core.Rect.prototype.setPos=function( x, y )
{
    /** Sets the position values.
     * 
     *  @param {Number | VG.Core.Point} value - Either the new x coordinate value or a VG.Core.Point class
     *  @param {Number} y - New y Coordinate
     */

    if ( arguments.length === 2 ) {
        this.x=x; this.y=y;
    } else {
        this.x=arguments[0].x; 
        this.y=arguments[0].y;         
    }
};

VG.Core.Rect.prototype.pos=function()
{
    /** Returns the position of this rectangle as a VG.Core.Point class.
     *  @returns {VG.Core.Point}
     */

    return VG.Core.Point( this.x, this.y );
};

VG.Core.Rect.prototype.setSize=function( width, height )
{
    /** Sets the size values.
     * 
     *  @param {Number | VG.Core.Point} value - Either the new width value or a VG.Core.Size class
     *  @param {Number} y - New height value
     */

    if ( arguments.length === 2 ) {    
        this.width=width; this.height=height;
    } else {
        this.width=arguments[0].width; 
        this.height=arguments[0].height;         
    }    
};

VG.Core.Rect.prototype.size=function()
{
    /** Returns the size of this rectangle as a VG.Core.Size class.
     *  @returns {VG.Core.Size}
     */

    return VG.Core.Size( this.width, this.height );
};

VG.Core.Rect.prototype.set=function( rect )
{
    /** Sets the values of the rectangle.
     *
     *  @param {Number | VG.Core.Rect} value - Either the x coordinate or a VG.Core.Rect class
     *  @param {Number} y - The y coordinate
     *  @param {Number} width - The width value
     *  @param {Number} height - The height value
     */

    if ( arguments.length === 4 ) {
        this.x=arguments[0]; this.y=arguments[1];
        this.width=arguments[2]; this.height=arguments[3];
    } else {
        this.x=rect.x; this.y=rect.y;
        this.width=rect.width; this.height=rect.height;
    }
};

VG.Core.Rect.prototype.copy=function( rect )
{
    /** Copies the values of the given rectangle.
     *
     *  @param {VG.Core.Rect} rect - The VG.Core.Rect object to copy
     */

    this.x=rect.x; this.y=rect.y;
    this.width=rect.width; this.height=rect.height;
};

VG.Core.Rect.prototype.upperLeft=function()
{
    /** Returns the upper left position as a VG.Core.Point class.
     *  @returns {VG.Core.Point}
     */    
    return new VG.Core.Point( this.x, this.y );
};

VG.Core.Rect.prototype.upperRight=function()
{
    /** Returns the upper right position as a VG.Core.Point class.
     *  @returns {VG.Core.Point}
     */        
    return new VG.Core.Point( this.x+this.width, this.y );
};

VG.Core.Rect.prototype.lowerLeft=function()
{
    /** Returns the lower left coordinate as a VG.Core.Point class.
     *  @returns {VG.Core.Point}
     */        
    return new VG.Core.Point( this.x, this.y + this.height-1 );
};

VG.Core.Rect.prototype.lowerRight=function()
{
    /** Returns the lower right coordinate of this rectangle as a VG.Core.Point class.
     *  @returns {VG.Core.Point}
     */        
    return new VG.Core.Point( this.x + this.width, this.y + this.height-1 );
};

VG.Core.Rect.prototype.right=function()
{
    /** Returns the right x coordinate.
     *  @returns {Number}
     */       
    return this.x+this.width;
};

VG.Core.Rect.prototype.bottom=function()
{
    /** Returns the bottom y coordinate.
     *  @returns {Number}
     */       
    return this.y+this.height;
};

VG.Core.Rect.prototype.round=function()
{
    /** Rounds all values, afterwards all values of the rectangle are integers. */

    this.x=Math.round( this.x );
    this.y=Math.round( this.y );
    this.width=Math.round( this.width );
    this.height=Math.round( this.height );

    return this;
};

VG.Core.Rect.prototype.equals=function( arg )
{
    /** Returns true if the two rectangles are equal, i.e. all values are a perfect match
     *
     *  @param {VG.Core.Rect} rect - A VG.Core.Rect class to compare.
     *  @returns {bool}
     */

    if ( this.x === arg.x && this.y === arg.y && this.width === arg.width && this.height === arg.height )
        return true; else return false;
};

VG.Core.Rect.prototype.contains=function( arg )
{
    /** Returns true if the VG.Core.Point or VG.Core.Rect are completely contained in this rectangle.
     *
     *  @param {VG.Core.Rect | VG.Core.Point} value - A VG.Core.Rect or VG.Core.Point class
     *  @returns {bool}
     */

    if ( arg instanceof VG.Core.Point ) {
        if ( (this.x <= arg.x) && (this.y <= arg.y) && (this.x + this.width >= arg.x) && (this.y + this.height >= arg.y) )
            return true; else return false;
    } else
    if ( arg instanceof VG.Core.Rect ) {
        if ( (this.x <= arg.x) && (this.y <= arg.y) && (this.right() >= arg.right() ) && (this.bottom() >= arg.bottom()) )
            return true; else return false;
    }

    return false;
};

VG.Core.Rect.prototype.intersect=function( rect )
{
    /** Returns the resultant rectangle of the intersection of this and rect if they intersect. If they don't, returns null.
     *
     *  @param {VG.Core.Rect} rect - A VG.Core.Rect class
     *  @returns {VG.Core.Rect}
     */

    if( rect instanceof VG.Core.Rect ) {

        var left = Math.max( this.x, rect.x );
        var top = Math.max( this.y, rect.y );

        var right = Math.min( this.x+this.width, rect.x+rect.width );
        var bottom = Math.min( this.y+this.height, rect.y+rect.height );

        var width = right - left;
        var height= bottom - top;

        if( width > 0 && height > 0 )
            return VG.Core.Rect(left, top, width, height)

        return null;
    }
}

VG.Core.Rect.prototype.toString=function()
{
    /** Returns a string version of this class.
     *  @returns {String}
     */    
    return "VG.Core.Rect( " + this.x + ", " + this.y + ", " + this.width + ", " + this.height + " );";
};

// --------------------------------------------- VG.Core.Margin

VG.Core.Margin=function()
{
    if ( !(this instanceof VG.Core.Margin ) ) return VG.Core.Margin.creator( arguments );    

    /** Creates a new VG.Core.Margin class, used to specify the margins of Layouts.
     *
     *  @constructor 
     *  @param {Number | VG.Core.Margin} value - Either the left margin or a VG.Core.Margin class
     *  @param {Number} top - Top margin
     *  @param {Number} right - Right margin
     *  @param {Number} bottom - Bottom margin
     */

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
 
VG.Core.Margin.prototype.set=function( left, top, right, bottom )
{
    /** Sets the values of the margin.
     *
     *  @param {Number | VG.Core.Margin} value - Either the left margin or a VG.Core.Margin class
     *  @param {Number} top - Top margin
     *  @param {Number} right - Right margin
     *  @param {Number} bottom - Bottom margin
     */

    if ( arguments.length === 4 ) {
        this.left=left; this.top=top;
        this.right=right; this.bottom=bottom;
    } else
    if ( arguments.length === 1 ) {
        this.left=arguments[0].left; this.top=arguments[0].top;
        this.right=arguments[0].right; this.bottom=arguments[0].bottom;
    }    
};

VG.Core.Margin.prototype.clear=function()
{
    /** Sets all values of the Margin to 0.*/

    this.left=0; this.top=0;
    this.right=0; this.bottom=0;    
};

VG.Core.Margin.prototype.toString=function()
{
    /** Returns a string version of this class.
     *  @returns {String}
     */    
    return "VG.Core.Margin( " + this.left + ", " + this.top + ", " + this.right + ", " + this.bottom + " );";
};

// --------------------------------------------- VG.Color

VG.Core.Color=function()
{
    if ( !(this instanceof VG.Core.Color ) ) return VG.Core.Color.creator( arguments );    

    /** Creates a new VG.Core.Color which specifies a specific RGB color, including alpha. Internally the color values are represented normalized between
     * 0 .. 1.<br>
     * There are several constructors available:<ul>
     * <li>The copy constructor takes a single VG.Core.Color value.</li>
     * <li>The HEX constructor takes a single string value of the form "#ffffff".</li>
     * <li>You can specify RGB values using either 3 arguments for red, green and blue or 4 values including alpha. All these values are between 0..255.</li>
     *</ul>
     * @constructor      
     */

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
};

VG.Core.NormalizedColor=function()
{
    /** Creates a new VG.Core.Color which specifies a specific RGB color, including alpha. Internally the color values are represented normalized between
     * 0 .. 1.<br>
     * There are several constructors available:<ul>
     * <li>The copy constructor takes a single VG.Core.Color value.</li>
     * <li>You can specify RGB values using either 3 arguments for red, green and blue or 4 values including alpha. All these values are between 0..1.</li>
     *</ul>
     * @constructor      
     */
	var color = VG.Core.Color();
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
	return color;
};

VG.Core.Color.prototype.copy=function(color)
{
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
}

VG.Core.Color.prototype.set=function(color)
{
    /** Sets the color values to the values of the given color.
     *  @param {VG.Core.Color} color - The color class to copy the values from.
     */
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
}

VG.Core.Color.prototype.mul=function(d)
{
    /** Multiplies the color values with the given value. The results are clamped between 0..1.
     *  @param {Number} value - The value to multiply each color value with.
     */    
    this.r = VG.Math.clamp(this.r * d, 0.0, 1.0);
    this.g = VG.Math.clamp(this.g * d, 0.0, 1.0);
    this.b = VG.Math.clamp(this.b * d, 0.0, 1.0);
    this.a = VG.Math.clamp(this.a * d, 0.0, 1.0);
}

VG.Core.Color.prototype.setRGBA=function( r, g, b, a )
{
    /** Sets the color values to RGBA values between 0..255.
     *  @param {number} r - The red color value between 0.255
     *  @param {number} g - The green color value between 0.255
     *  @param {number} b - The blue color value between 0.255
     *  @param {number} a - The alpha value between 0.255
     */    
    this.r=r/255.0; this.g=g/255.0; this.b=b/255.0; this.a=a/255.0;
};

VG.Core.Color.prototype.setValue=function( r, g, b, a )
{
    /** Sets the color values to RGBA values between 0..1.
     *  @param {number} r - The red color value between 0..1
     *  @param {number} g - The green color value between 0..1
     *  @param {number} b - The blue color value between 0..1
     *  @param {number} a - The alpha value between 0..1
     */    
    this.r=r; this.g=g; this.b=b; this.a=a;
};
/*
VG.Core.Color.prototype.setValueArray=function(value)
{
	if (0 < value.length)
		this.r = value[0];
	if (1 < value.length)
		this.g = value[1];
	if (2 < value.length)
		this.b = value[2];
	if (3 < value.length)
		this.a = value[3];
}
*/
VG.Core.Color.prototype.toHSL=function()
{
    /** Returns an object containing the converted HSL values for this color.
    * @returns {Object} Containing the converted h, s, l values.
    */
    
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
}

VG.Core.Color.prototype.setHSL=function(h, s, l)
{
    /** Sets the internal color values to the given HSL values
     * @param {Number} h - Hue value
     * @param {Number} s - Saturation value
     * @param {Number} l - Lightness value
     */

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

    if (s == 0.0)
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
}

VG.Core.Color.prototype.toHex=function()
{
    /** Returns a string containing a hex representation of this color, i.e. "#ffffff"
    * @returns {String}
    */

    // Based on http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    return "#" + componentToHex( this.r * 255.0 ) + componentToHex( this.g * 255.0 ) + componentToHex( this.b * 255.0 );
}

VG.Core.Color.prototype.setHex=function( hex )
{
    /** Sets the internal color values to the given Hex valu.
     * @param {String} hex - Hex value in the form "#ffffff"
     */

    // Based on http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    this.r=parseInt(result[1], 16) / 255.0;
    this.g=parseInt(result[2], 16) / 255.0;
    this.b=parseInt(result[3], 16) / 255.0;
}

// --------------------------------------------- VG.Core.Timer

VG.Core.Timer=function()
{
    /** Clock/Timer for delta calculation */

    this.prev=0; //old time
}

VG.Core.Timer.prototype.getDelta = function()
{
    /** Returns the time elapsed since the last call to this method in seconds (float) */
    var nt = Date.now();

    var diff=0.001 * (nt -this.prev);

    this.prev = nt;

    return diff;
}

// --------------------------------------------- VG.Core.Image

VG.Core.Image=function()
{    
    /** Creates a new VG.Core.Image class containing the color values of an image. Image Data is allocated via an Uint8Array typed array. The image data is allocated
     * in the power of two of the width and height values to ensure direct WebGL / OpenGL support. realWidth and realHeight contain the power of two sizes.
     *
     * @param {Number | VG.Core.Image} value - Either the width or a VG.Core.Image class to copy width/height values from
     * @param {Number} height - Height value
     * @constructor     
     */

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

    /** Determines if the image is forced power of two
     *  @member {Bool} */
    this.forcePowerOfTwo = true;

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
};

VG.Core.Image.prototype.alloc=function()
{
    /**Allocates a power of two sized image data based on width and height values of the image.
     */
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

        this.modulo=this.realWidth * 4;

        this.data=new Uint8Array( this.realWidth * 4 * this.realHeight);   
    }
}

VG.Core.Image.prototype.getPixel=function( x, y, color )
{
    /**Gets a pixel color at position x, y.
     * @param {number} position x coordinate
     * @param {number} position y coordinate
     * @param {VG.Core.Color} The color class to store the pixel data.
     */

    if ( !color ) color=VG.Core.Color();
    var offset=y * this.modulo + x * 4;
    color.r=this.data[offset] / 255;
    color.g=this.data[offset+1] / 255;
    color.b=this.data[offset+2] / 255;
    color.a=this.data[offset+3] / 255;

    return color;
};

VG.Core.Image.prototype.setPixel=function( x, y, r, g, b, a )
{
    /**Sets pixel color at position
     * @param {number} position x coordinate
     * @param {number} position y coordinate
     * @param {number} 0.0 to 1.0 red channel
     * @param {number} 0.0 to 1.0 green channel
     * @param {number} 0.0 to 1.0 blue channel
     * @param {number} 0.0 to 1.0 alpha channel
     */
    var offset=y * this.modulo + x * 4;
    this.data[offset]=r * 255;
    this.data[offset+1]=g * 255;
    this.data[offset+2]=b * 255;
    this.data[offset+3]=a * 255;
};

VG.Core.Image.prototype.setPixelRGBA=function( x, y, r, g, b, a )
{
    /**Sets pixel color at position
     * @param {number} position x coordinate
     * @param {number} position y coordinate
     * @param {number} 0 to 255 red channel
     * @param {number} 0 to 255 green channel
     * @param {number} 0 to 255 blue channel
     * @param {number} 0 to 255 alpha channel
     */
    var offset=y * this.modulo + x * 4;
    this.data[offset]=r;
    this.data[offset+1]=g;
    this.data[offset+2]=b;
    this.data[offset+3]=a;
};

VG.Core.Image.prototype.powerOfTwo=function (value, pow) {
    var pow = pow || 1;
    while(pow<value) {
        pow *= 2;
    }
    return pow;
};

VG.Core.Image.prototype.set=function( image )
{
    /** Copies the values of the given image using a new data array.
     * @param {VG.Core.Image} image - The image to copy  
     */

    this.width=image.width; this.height=image.height;
    this.realWidth=image.realWidth; this.realHeight=image.realHeight;
    this.modulo=image.modulo;
    this.imageData=image.imageData;
    this.name=image.name;

    this.data=null;
    this.data=new Uint8Array( image.data );    
};

VG.Core.Image.prototype.copy=function( image )
{
    /** Copies the values of the given image using a new data array.
     * @param {VG.Core.Image} image - The image to copy  
     */

    this.set( image );   
};

VG.Core.Image.prototype.mul=function( color )
{
    /** Multiplies the given VG.Core.Color with every pixel of the image.
     * @param {VG.Core.Color} color - The color to multiply the image data with.
     */

    for ( var h=0; h < this.height; ++h ) {
        for ( var w=0; w < this.width; ++w )
        {
            var offset=h * this.modulo + w * 4

            this.data[offset]=this.data[offset] * color.r;
            this.data[offset+1]=this.data[offset+1] * color.g;
            this.data[offset+2]=this.data[offset+2] * color.b;
        }
    }
};

VG.Core.Image.prototype.isValid=function()
{
    /** Returns true if the image has valid image data associated with it.
     * Returns {bool}
     */

    if ( this.width && this.height && this.data ) return true;
    else return false;
};

VG.Core.Image.prototype.clear=function()
{
    /** Clears the image by setting the data and dimensions of the image to 0.
     */    
    this.data=null;
    this.width=0; this.height=0;
};

VG.Core.Image.prototype.getRealWidth=function()
{
    /** Get the real width of the image (power of two).
	 * @return {Number}
     */    
    return this.realWidth;
};

VG.Core.Image.prototype.getRealHeight=function()
{
    /** Get the real height of the image (power of two).
	 * @return {Number}
     */    
    return this.realHeight;
};

VG.Core.Image.prototype.getWidth=function()
{
    /** Get the user specified width of the Image.
	 * @return {Number}
     */
    return this.width;
};

VG.Core.Image.prototype.getHeight=function()
{
    /** Get the user specified height of the Image.
	 * @return {Number}
     */
    return this.height;
};

// --------------------------------------------- VG.Core.ImagePool

VG.Core.ImagePool=function()
{  
    if ( !(this instanceof VG.Core.ImagePool) ) return new VG.Core.ImagePool();

    /** Creates an VG.Core.ImagePool class. The default image pool of every VG application is located at VG.context.imagePool. It is filled automatically
     * on application startup with all application images as well as with images used by the Style. You can retrieve images from the default pool
     * using VG.Utils.getImageByName() which in turn calls VG.context.imagePool.getImageByName().
     */

    this.images=[];
}

// --- addImage

VG.Core.ImagePool.prototype.addImage=function( image )
{
    /** Adds an image to the pool.
     * param {VG.Core.Image} image - The image to add.
     */

    this.images.push( image );
};

// --- getImageByName

VG.Core.ImagePool.prototype.getImageByName=function( name )
{
    /** Returns an image from the pool based on its name.
     * @returns {VG.Core.Image} or null if no image with the given name was found.
     */

    for( var i=0; i < this.images.length; ++i ) {
        if ( this.images[i].name === name )
            return this.images[i];
    }

    var prefixName=VG.UI.stylePool.current.skin.prefix + name;

    for( var i=0; i < this.images.length; ++i ) {
        if ( this.images[i].name === prefixName )
            return this.images[i];
    }

    if ( VG.UI.stylePool.current.skin.fallbackPrefix ) {
        prefixName=VG.UI.stylePool.current.skin.fallbackPrefix + name;
        for( var i=0; i < this.images.length; ++i ) {
            if ( this.images[i].name === prefixName )
                return this.images[i];
        }
    }

    return null;
};

VG.context.imagePool=VG.Core.ImagePool();

// --------------------------------------------- VG.Core.TypedArray

VG.Core.TypedArray = function( type, size )
{
    /** Creates a new Typed Array
     *  @constructor
     *  @param {enum} type - The buffer type: VG.Core.TypedArray.Type.Float, VG.Core.TypedArray.Type.Uint8, VG.Core.TypedArray.Uint16, VG.Core.TypedArray.Uint32
     *  @param {number} size - The buffer size (not in bytes but in elements)
     *  */

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

VG.Core.TypedArray.Type = { Float: 0, Uint8: 1, Uint16: 2, Uint32: 3 };

VG.Core.TypedArray.prototype.set=function( index, value )
{
    /** Sets the array data by index
     *  @param {number} index - The index in the array, must be < size 
     *  @param {*} The value to set*/

    this.data[index] = value;
};

VG.Core.TypedArray.prototype.get=function( index )
{
    /** Gets the array data by index
     *  @param {number} index - The index in the array, must be < size 
     *  @returns {*} */

    return this.data[index];
};

VG.Core.TypedArray.prototype.getSize = function()
{
    /** Returns the size (not in bytes but elements)
     *  @returns {number}
     *  */
    return this.data.length;
};