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
 * You should have received a copy of the GNU Lesser General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ----------------------------------------------------------------- VG.UI.NumberEdit

VG.UI.NumberEdit=function( value, min, max )
{
    if ( !(this instanceof VG.UI.NumberEdit) ) return new VG.UI.NumberEdit( value, min, max );

    VG.UI.TextLineEdit.call( this );
    this.name="NumberEdit";

    this.min=min;
    this.max=max;
    
    this.value=value;

    this.inputFilter=function( input ) {
        var output="";

        var i=0;
        while( i < input.length && input )
        {
            var c=input[i];

            if (c >= '0' && c <= '9') {
                output+=c;
            } else
            if ( c === '.' && this.text.indexOf( '.' ) === -1 )
                output+=c;
            else
            if ( ( c === '+' || c === '-' ) && !this.text.length && !i )
                output+=c;

            ++i;
        }

        if ( this.min && Number( this.text + output ) < this.min ) output="";
        else
        if ( this.max && Number( this.text + output ) > this.max ) output="";

        return output;
    }

    this.font=VG.context.style.skin.NumberEdit.Font;

    this.supportsFocus=true;
    this.minimumSize.width=40;
    
    this.horizontalExpanding=true;
    this.verticalExpanding=false;
};

VG.UI.NumberEdit.prototype=VG.UI.TextLineEdit();

Object.defineProperty( VG.UI.NumberEdit.prototype, "value", {
    get: function() {
        return Number( this.text );
    },
    set: function( value ) {
        this.text=String( this.checkValueRange( value ) );
    }    
});

VG.UI.NumberEdit.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.value=0;
    else this.value=value;

    //if ( this.changed )
        //this.changed.call( VG.context, this.value, true, this );

    this.verifyScrollbar();
};

VG.UI.NumberEdit.prototype.checkValueRange=function( value )
{
    if ( this.min && value < this.min ) value=this.min;
    if ( this.max && value > this.max ) value=this.max;

    return value;
};

VG.UI.NumberEdit.prototype.calcSize=function( canvas )
{
    var size=VG.Core.Size();

    canvas.pushFont( this.font );

    canvas.getTextSize( "0", size );
    
    if ( !this.embedded )
        size=size.add( 16, 8 );

    this.maximumSize.height=size.height;
    this.checkSizeDimensionsMinMax( size );

    canvas.popFont();

    return size;
};

// ----------------------------------------------------------------- VG.UI.Vector2Edit

VG.UI.Vector2Edit=function( x, y, min, max )
{
    if ( !(this instanceof VG.UI.Vector2Edit) ) return new VG.UI.Vector2Edit( x, y, min, max );

    VG.UI.Widget.call( this );
    this.name="Vector2Edit";
    this.min=min;
    this.max=max;

    this.supportsFocus=true;
    this.minimumSize.width=40;
    
    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.value1Edit=VG.UI.NumberEdit( x, min, max );
    this.value1Edit.changed=function( value, cont, obj ) {
        this.value.x=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value2Edit=VG.UI.NumberEdit( y, min, max );
    this.value2Edit.changed=function( value, cont, obj ) {
        this.value.y=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value=new VG.Math.Vector2( x, y );

    this.layout=VG.UI.Layout( this.value1Edit, this.value2Edit );
    this.layout.margin.set( 0, 0, 0, 0 );
};

VG.UI.Vector2Edit.prototype=VG.UI.Widget();

VG.UI.Vector2Edit.prototype.calcSize=function( canvas )
{
    return this.value1Edit.calcSize( canvas );
};

VG.UI.Vector2Edit.prototype.paintWidget=function( canvas )
{
    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.Vector3Edit

VG.UI.Vector3Edit=function( x, y, z, min, max )
{
    if ( !(this instanceof VG.UI.Vector3Edit) ) return new VG.UI.Vector3Edit( x, y, z, min, max );

    VG.UI.Widget.call( this );
    this.name="Vector3Edit";
    this.min=min;
    this.max=max;

    this.supportsFocus=true;
    this.minimumSize.width=40;
    
    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.value1Edit=VG.UI.NumberEdit( x, min, max );
    this.value1Edit.changed=function( value, cont, obj ) {
        this.value.x=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value2Edit=VG.UI.NumberEdit( y, min, max );
    this.value2Edit.changed=function( value, cont, obj ) {
        this.value.y=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value3Edit=VG.UI.NumberEdit( z, min, max );
    this.value3Edit.changed=function( value, cont, obj ) {
        this.value.z=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value=new VG.Math.Vector3( x, y, z );

    this.layout=VG.UI.Layout( this.value1Edit, this.value2Edit, this.value3Edit );
    this.layout.margin.set( 0, 0, 0, 0 );    
};

VG.UI.Vector3Edit.prototype=VG.UI.Widget();

VG.UI.Vector3Edit.prototype.calcSize=function( canvas )
{
    return this.value1Edit.calcSize( canvas );
};

VG.UI.Vector3Edit.prototype.paintWidget=function( canvas )
{
    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.Vector3Edit

VG.UI.Vector4Edit=function( x, y, z, w, min, max )
{
    if ( !(this instanceof VG.UI.Vector4Edit) ) return new VG.UI.Vector4Edit( x, y, z, w, min, max );

    VG.UI.Widget.call( this );
    this.name="Vector4Edit";
    this.min=min;
    this.max=max;

    this.supportsFocus=true;
    this.minimumSize.width=40;
    
    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.value1Edit=VG.UI.NumberEdit( x, min, max );
    this.value1Edit.changed=function( value, cont, obj ) {
        this.value.x=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value2Edit=VG.UI.NumberEdit( y, min, max );
    this.value2Edit.changed=function( value, cont, obj ) {
        this.value.y=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value3Edit=VG.UI.NumberEdit( z, min, max );
    this.value3Edit.changed=function( value, cont, obj ) {
        this.value.z=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value4Edit=VG.UI.NumberEdit( w, min, max );
    this.value4Edit.changed=function( value, cont, obj ) {
        this.value.w=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value=new VG.Math.Vector4( x, y, z, w );

    this.layout=VG.UI.Layout( this.value1Edit, this.value2Edit, this.value3Edit, this.value4Edit );
    this.layout.margin.set( 0, 0, 0, 0 );    
};

VG.UI.Vector4Edit.prototype=VG.UI.Widget();

VG.UI.Vector4Edit.prototype.calcSize=function( canvas )
{
    return this.value1Edit.calcSize( canvas );
};

VG.UI.Vector4Edit.prototype.paintWidget=function( canvas )
{
    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};