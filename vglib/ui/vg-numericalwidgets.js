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

// ----------------------------------------------------------------- VG.UI.NumberEdit

VG.UI.NumberEdit=function( value, min, max, fixedPrecision )
{
    if ( !(this instanceof VG.UI.NumberEdit) ) return new VG.UI.NumberEdit( value, min, max, fixedPrecision );

    VG.UI.TextLineEdit.call( this );
    this.name="NumberEdit";

    this.min=min;
    this.max=max;
    
    this.value=value;

    this.inputFilter=function( input ) {
        var output="";

        var i=0; var afterComma=false, digitsAfterComma=0;
        var index=this.text.indexOf( '.' );
        if ( index !== -1 ) {
            afterComma=true;
            digitsAfterComma=this.text.length - index;
        }

        while( i < input.length && input )
        {
            var c=input[i];

            if (c >= '0' && c <= '9') {
                if ( afterComma && digitsAfterComma > this.fixedPrecision )
                {
                    break;
                } else
                if ( afterComma ) {
                    digitsAfterComma++;
                    output+=c;
                } else output+=c;
            } else
            if ( c === '.' && this.text.indexOf( '.' ) === -1 ) {
                output+=c;
                if ( this.fixedPrecision ) afterComma=true;
            }
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

    this.font=VG.Font.Font( VG.UI.stylePool.current.skin.TextEdit.Font );

    this.supportsFocus=true;
    this.minimumSize.width=40;

    this.fixedPrecision=fixedPrecision;

    this.horizontalExpanding=true;
    this.verticalExpanding=false;
};

VG.UI.NumberEdit.prototype=VG.UI.TextLineEdit();

Object.defineProperty( VG.UI.NumberEdit.prototype, "value", {
    get: function() {
        return Number( this.text );
    },
    set: function( value ) {

        if ( !this.fixedPrecision )
            this.text=String( this.checkValueRange( value ) );
        else
        {
            this.text=String( this.checkValueRange( value.toFixed( this.fixedPrecision ) ) );
        }       
    }    
});

VG.UI.NumberEdit.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.value=0;
    else this.value=value;

    if ( this.changed )
        this.changed.call( VG.context, this.value, false, this );

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

VG.UI.Vector2Edit=function( x, y, min, max, fixedPrecision )
{
    if ( !(this instanceof VG.UI.Vector2Edit) ) return new VG.UI.Vector2Edit( x, y, min, max, fixedPrecision );

    VG.UI.Widget.call( this );
    this.name="Vector2Edit";
    this.min=min;
    this.max=max;

    this.supportsFocus=true;
    this.minimumSize.width=40;
    
    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.value1Edit=VG.UI.NumberEdit( x, min, max, fixedPrecision );
    this.value1Edit.changed=function( value, cont, obj ) {
        this.value.x=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value2Edit=VG.UI.NumberEdit( y, min, max, fixedPrecision );
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

VG.UI.Vector3Edit=function( x, y, z, min, max, fixedPrecision )
{
    if ( !(this instanceof VG.UI.Vector3Edit) ) return new VG.UI.Vector3Edit( x, y, z, min, max, fixedPrecision );

    VG.UI.Widget.call( this );
    this.name="Vector3Edit";
    this.min=min;
    this.max=max;

    this.supportsFocus=true;
    this.minimumSize.width=40;
    
    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.value1Edit=VG.UI.NumberEdit( x, min, max, fixedPrecision );
    this.value1Edit.changed=function( value, cont, obj ) {
        this.value.x=value;
        if ( this.changed ) this.changed( this.value, cont, this );
        if ( this.collection && this.path )
            this.collection.storeDataForPath( this.path, [this.value.x, this.value.y, this.value.z] );
    }.bind( this );

    this.value2Edit=VG.UI.NumberEdit( y, min, max, fixedPrecision );
    this.value2Edit.changed=function( value, cont, obj ) {
        this.value.y=value;
        if ( this.changed ) this.changed( this.value, cont, this );
        if ( this.collection && this.path )
            this.collection.storeDataForPath( this.path, [this.value.x, this.value.y, this.value.z] );        
    }.bind( this );

    this.value3Edit=VG.UI.NumberEdit( z, min, max, fixedPrecision );
    this.value3Edit.changed=function( value, cont, obj ) {
        this.value.z=value;
        if ( this.changed ) this.changed( this.value, cont, this );
        if ( this.collection && this.path )
            this.collection.storeDataForPath( this.path, [this.value.x, this.value.y, this.value.z] );        
    }.bind( this );

    this.value=new VG.Math.Vector3( x, y, z );

    this.layout=VG.UI.Layout( this.value1Edit, this.value2Edit, this.value3Edit );
    this.layout.margin.set( 0, 0, 0, 0 );    
};

VG.UI.Vector3Edit.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.Vector3Edit.prototype, "fixedPrecision", {
    get: function() {
        return this.value1Edit.fixedPrecision;
    },
    set: function( value ) {
        this.value1Edit.fixedPrecision=value;
        this.value2Edit.fixedPrecision=value;
        this.value3Edit.fixedPrecision=value;
    }    
});

VG.UI.Vector3Edit.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );

    if ( path.indexOf( "." ) === -1 )
        this.valueFromModel( collection.dataForPath( path ) );
};

VG.UI.Vector3Edit.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.value.set( 0, 0, 0 );
    else if ( value instanceof Array )
        this.value.set( value[0], value[1], value[2] );

    this.value1Edit.value=this.value.x;
    this.value2Edit.value=this.value.y;
    this.value3Edit.value=this.value.z;

    if ( this.changed )
        this.changed.call( VG.context, this.value, true, this );
};

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

VG.UI.Vector4Edit=function( x, y, z, w, min, max, fixedPrecision )
{
    if ( !(this instanceof VG.UI.Vector4Edit) ) return new VG.UI.Vector4Edit( x, y, z, w, min, max, fixedPrecision );

    VG.UI.Widget.call( this );
    this.name="Vector4Edit";
    this.min=min;
    this.max=max;

    this.supportsFocus=true;
    this.minimumSize.width=40;
    
    this.horizontalExpanding=true;
    this.verticalExpanding=false;

    this.value1Edit=VG.UI.NumberEdit( x, min, max, fixedPrecision );
    this.value1Edit.changed=function( value, cont, obj ) {
        this.value.x=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value2Edit=VG.UI.NumberEdit( y, min, max, fixedPrecision );
    this.value2Edit.changed=function( value, cont, obj ) {
        this.value.y=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value3Edit=VG.UI.NumberEdit( z, min, max, fixedPrecision );
    this.value3Edit.changed=function( value, cont, obj ) {
        this.value.z=value;
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value4Edit=VG.UI.NumberEdit( w, min, max, fixedPrecision );
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