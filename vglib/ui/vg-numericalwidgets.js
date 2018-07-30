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

// ----------------------------------------------------------------- VG.UI.NumberEdit

VG.UI.NumberEdit=function( value, min, max, fixedPrecision )
{
    if ( !(this instanceof VG.UI.NumberEdit) ) return new VG.UI.NumberEdit( value, min, max, fixedPrecision );

    VG.UI.TextLineEdit.call( this );
    this.name="NumberEdit";

    this.min=min;
    this.max=max;

    this.inputFilter=function( input ) {
        var output=input;
        return output;
/*
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

        return output;*/
    };

    this.font = VG.Font.Font( VG.UI.stylePool.current.skin.TextEdit.Font );

    this.supportsFocus=true;
    this.minimumSize.width=40;

    this.fixedPrecision = fixedPrecision;
    this.maxString=this.max ? this.max.toFixed( this.fixedPrecision ) : "0";
    this.value = value;

    if ( value ) this.text = this.checkValueRange( value ).toFixed( this.fixedPrecision === undefined ? 3 : this.fixedPrecision );
    else this.text = "0";

    this.horizontalExpanding=true;
    this.verticalExpanding=false;
};

VG.UI.NumberEdit.prototype=VG.UI.TextLineEdit();

Object.defineProperty( VG.UI.NumberEdit.prototype, "value", {
    get: function() {
        return Number( this.text );
    },
    set: function( value ) {

        let fixedPrecision = this.fixedPrecision;
        if ( fixedPrecision === undefined && value % 1 !== 0 ) fixedPrecision = 3;

        if ( !fixedPrecision ) this.text = String( this.checkValueRange( value ) );
        else this.text = this.checkValueRange( value ).toFixed( fixedPrecision );
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

VG.UI.NumberEdit.prototype.valueIsValid=function()
{
    var valid=true;

    if ( isNaN( this.value ) ) valid=false;
    if ( this.min && this.value < this.min ) valid=false;
    if ( this.max && this.value > this.max ) valid=false;

    return valid;
};

VG.UI.NumberEdit.prototype.calcSize=function( canvas )
{
    let size = this.preferredSize;

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

        if ( this.lockAspect ) {
            let ratio = this.value.x / this.value.y;
            this.value.x = value;
            this.value.y = Math.round( value / ratio );
            this.value2Edit.value = this.value.y;
        } else
        this.value.x=value;
        if ( this.collection && this.path )
            this.collection.storeDataForPath( { path : this.path, value : [this.value.x, this.value.y], undoText : this.undoText } );
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value2Edit=VG.UI.NumberEdit( y, min, max, fixedPrecision );
    this.value2Edit.changed=function( value, cont, obj ) {

        if ( this.lockAspect ) {
            let ratio = this.value.y / this.value.x;
            this.value.y = value;
            this.value.x = Math.round( value / ratio );
            this.value1Edit.value = this.value.x;
        } else
        this.value.y=value;
        if ( this.collection && this.path )
            this.collection.storeDataForPath( { path : this.path, value : [this.value.x, this.value.y], undoText : this.undoText } );
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value=new VG.Math.Vector2( x, y );

    this.minimumSize.height=10;

    this.layout=VG.UI.Layout( this.value1Edit, this.value2Edit );
    this.layout.margin.set( 0, 0, 0, 0 );
};

VG.UI.Vector2Edit.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.Vector2Edit.prototype, "toolTip", {
    get: function() {
        return this.value1Edit.toolTip;
    },
    set: function( value ) {
        this.value1Edit.toolTip=value;
        this.value2Edit.toolTip=value;
    }
});

Object.defineProperty( VG.UI.Vector2Edit.prototype, "disabled", {
    get: function() {
        return this.value1Edit.disabled;
    },
    set: function( value ) {
        this.value1Edit.disabled=value;
        this.value2Edit.disabled=value;
    }
});

VG.UI.Vector2Edit.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );

    if ( path.indexOf( "." ) === -1 )
        this.valueFromModel( collection.dataForPath( path ) );
};

VG.UI.Vector2Edit.prototype.calcSize=function( canvas )
{
    this.minimumSize.height = this.value1Edit.minimumSize.height;
    return this.value1Edit.calcSize( canvas );
};

VG.UI.Vector2Edit.prototype.set=function( x, y )
{
    this.value1Edit.value = x;
    this.value2Edit.value = y;

    this.value.x = x;
    this.value.y = y;
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
        if ( this.collection && this.path )
            this.collection.storeDataForPath( { path : this.path, value : [this.value.x, this.value.y, this.value.z], undoText : this.undoText } );
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value2Edit=VG.UI.NumberEdit( y, min, max, fixedPrecision );
    this.value2Edit.changed=function( value, cont, obj ) {
        this.value.y=value;
        if ( this.collection && this.path )
            this.collection.storeDataForPath( { path : this.path, value : [this.value.x, this.value.y, this.value.z], undoText : this.undoText } );
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.value3Edit=VG.UI.NumberEdit( z, min, max, fixedPrecision );
    this.value3Edit.changed=function( value, cont, obj ) {
        this.value.z=value;
        if ( this.collection && this.path )
            this.collection.storeDataForPath( { path : this.path, value : [this.value.x, this.value.y, this.value.z], undoText : this.undoText } );
        if ( this.changed ) this.changed( this.value, cont, this );
    }.bind( this );

    this.minimumSize.height=10;

    this.value=new VG.Math.Vector3( x, y, z );

    this.layout=VG.UI.Layout( this.value1Edit, this.value2Edit, this.value3Edit );
    this.layout.margin.set( 0, 0, 0, 0 );
    this.layout.parent = this;

    Object.defineProperty( this.layout, "disabled", {
        get: () => this.parent ? this.parent._disabled : this._disabled
    } );
};

VG.UI.Vector3Edit.prototype=VG.UI.Widget();

Object.defineProperty( VG.UI.Vector3Edit.prototype, "disabled", {
    get: function() {
        if ( !this.parent ) return this._disabled;
        else return this._disabled | this.parent.disabled;
    },
    set: function( value ) {
        this._disabled = value;
        this.value1Edit.disabled=value;
        this.value2Edit.disabled=value;
        this.value3Edit.disabled=value;
    }
});

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

Object.defineProperty( VG.UI.Vector3Edit.prototype, "toolTip", {
    get: function() {
        return this.value1Edit.toolTip;
    },
    set: function( value ) {
        this.value1Edit.toolTip=value;
        this.value2Edit.toolTip=value;
        this.value3Edit.toolTip=value;
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
    else if ( typeof value === 'string' || value instanceof String )
    {
        var arr=JSON.parse( value );
        this.value.set( arr[0], arr[1], arr[2] );
    }
    else if ( value instanceof Array )
        this.value.set( value[0], value[1], value[2] );

    this.value1Edit.value=this.value.x;
    this.value2Edit.value=this.value.y;
    this.value3Edit.value=this.value.z;

    if ( this.changed )
        this.changed.call( VG.context, this.value, true, this, true );
};

VG.UI.Vector3Edit.prototype.calcSize=function( canvas )
{
    this.minimumSize.height = this.value1Edit.minimumSize.height;
    return this.value1Edit.calcSize( canvas );
};

VG.UI.Vector3Edit.prototype.enableXYZMode=function()
{
    this.value1Edit.customBorderColor=VG.Core.Color( "#bd2121" );
    this.value2Edit.customBorderColor=VG.Core.Color( "#dbd92a" );
    this.value3Edit.customBorderColor=VG.Core.Color( "#4445c6" );
};

VG.UI.Vector3Edit.prototype.set=function( x, y, z )
{
    this.value1Edit.value = x;
    this.value2Edit.value = y;
    this.value3Edit.value = z;

    this.value.x = x;
    this.value.y = y;
    this.value.z = z;
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

Object.defineProperty( VG.UI.Vector4Edit.prototype, "fixedPrecision", {
    get: function() {
        return this.value1Edit.fixedPrecision;
    },
    set: function( value ) {
        this.value1Edit.fixedPrecision=value;
        this.value2Edit.fixedPrecision=value;
        this.value3Edit.fixedPrecision=value;
        this.value4Edit.fixedPrecision=value;
    }
});

Object.defineProperty( VG.UI.Vector4Edit.prototype, "disabled", {
    get: function() {
        return this.value1Edit.disabled;
    },
    set: function( value ) {
        this.value1Edit.disabled=value;
        this.value2Edit.disabled=value;
        this.value3Edit.disabled=value;
        this.value4Edit.disabled=value;
    }
});

VG.UI.Vector4Edit.prototype.calcSize=function( canvas )
{
    this.minimumSize.height = this.value1Edit.minimumSize.height;
    return this.value1Edit.calcSize( canvas );
};

VG.UI.Vector4Edit.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );

    if ( path.indexOf( "." ) === -1 )
        this.valueFromModel( collection.dataForPath( path ) );
};

VG.UI.Vector4Edit.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.value.set( 0, 0, 0, 0 );
    else if ( typeof value === 'string' || value instanceof String )
    {
        var arr=JSON.parse( value );
        this.value.set( arr[0], arr[1], arr[2], arr[3] );
    }
    else if ( value instanceof Array )
        this.value.set( value[0], value[1], value[2], value[3] );

    this.value1Edit.value=this.value.x;
    this.value2Edit.value=this.value.y;
    this.value3Edit.value=this.value.z;
    this.value4Edit.value=this.value.z;

    if ( this.changed )
        this.changed.call( VG.context, this.value, true, this, true );
};

VG.UI.Vector4Edit.prototype.set=function( x, y, z, w )
{
    this.value1Edit.value = x;
    this.value2Edit.value = y;
    this.value3Edit.value = z;
    this.value4Edit.value = w;

    this.value.x = x;
    this.value.y = y;
    this.value.z = z;
    this.value.w = w;
};

VG.UI.Vector4Edit.prototype.paintWidget=function( canvas )
{
    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};