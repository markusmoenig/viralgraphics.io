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

VG.Nodes={};

// ----------------------------------------------------------------- VG.Nodes.ParamContainer

VG.Nodes.ParamContainer=function( node )
{
    /**
     * Creates a Parameter Container.<br>
     *
     * VG.Nodes.ParamContainer is the container class which lists all parameter groups of a node and provide convenience functions to read and write value of Parameters
     * inside the different groups.
     *
     * @constructor
     * @param {VG.Nodes.Node} node - The node whose parameters this container represents.
    */

    if ( !(this instanceof VG.Nodes.ParamContainer ) ) return new VG.Nodes.ParamContainer( node );

    /**An array of all VG.Nodes.ParamGroup inside the container.
     * @member {array} */
    this.groups=[];

    this.node=node;
};

VG.Nodes.ParamContainer.prototype.addGroupByName=function( name, text, open )
{
    /**Adds a new parameter group to the container and returns it.
     * @param {string} name - The name of the new group, the name is used to identify groups inside a container and has to be unique.
     * @param {string} text - The text / title of this group.
     * @param {string} open - True if the group should be open by default. Default is true.
     * @returns The newly added VG.Nodes.ParamGroup.
     */

    var group=VG.Nodes.ParamGroup( name, text, open );
    group.container=this;
    this.groups.push( group );
    return group;
};

VG.Nodes.ParamContainer.prototype.addGroup=function( group )
{
    /**Adds the given group to this container.
     * @param {VG.Nodes.ParamGroup} group - The group to be added to this container.
     */

    group.container=this;
    this.groups.push( group );
};

VG.Nodes.ParamContainer.prototype.getGroup=function( name )
{
    for( let i=0; i < this.groups.length; ++i )
    {
        let group=this.groups[i];

        if ( group.name === name )
            return group;
    }
};

VG.Nodes.ParamContainer.prototype.getParam=function( name )
{
    /**Returns the parameter identified by its name.
     * @param {string} name - The name of the parameter to look up.
     * @returns The found parameter or null.
     */

    for( var i=0; i < this.groups.length; ++i )
    {
        var group=this.groups[i];

        for( var p=0; p < group.parameters.length; ++p )
        {
            var param=group.parameters[p];

            if ( param.name === name ) return param;
        }
    }

    return null;
};

VG.Nodes.ParamContainer.prototype.getParamValue=function( name )
{
    /**Returns the value of the parameter identified by its name.
     * @param {string} name - The name of the parameter to look up.
     * @returns The found parameter value or null.
     */

    for( let i=0; i < this.groups.length; ++i )
    {
        let group=this.groups[i];

        for( let p=0; p < group.parameters.length; ++p )
        {
            let param=group.parameters[p];

            if ( param.name === name ) {
                if ( !param.data._keyFrames ) return param.data[param.name];
                else return this.keyParamValue( param );
            }
        }
    }

    return null;
};

VG.Nodes.ParamContainer.prototype.getAdjustedParamString=function( name, adjustCallback, scale )
{
    /**Returns the value of the parameter identified by its name.
     * @param {string} name - The name of the parameter to look up.
     * @returns The found parameter value or null.
     */

    for( let i=0; i < this.groups.length; ++i )
    {
        let group=this.groups[i];

        for( let p=0; p < group.parameters.length; ++p )
        {
            let param = group.parameters[p];

            if ( param.name === name ) {
                let value = param.data[param.name];
                if ( adjustCallback ) value = adjustCallback( name, param, scale );
                if (typeof value === 'string' || value instanceof String) {

                } else
                if ( param.type === "bool" )
                {
                    value = `${Boolean( value )}`;
                } else
                if ( param.type === "int" )
                {
                    value = `${Math.round( value )}`;
                } else
                if ( !isNaN( value ) && value.toFixed ) {
                    value = value.toFixed( 3 );
                } else
                if ( param.type === "vec2" )
                {
                    value = `vec2(${value.x},${value.y})`;
                } else
                if ( param.type === "vec3" )
                {
                    value = `vec3(${value.x},${value.y},${value.z})`;
                } else
                if ( param.type === "vec4" )
                {
                    value = `vec4(${value.x},${value.y},${value.z},${value.w})`;
                }

                return value;
            }
        }
    }

    return null;
};

VG.Nodes.ParamContainer.prototype.areKeysActive=function( keys )
{
    /**Returns the value of the parameter identified by its name.
     * @param {string} name - The name of the parameter to look up.
     * @returns The found parameter value or null.
     */

    for( var i=0; i < this.groups.length; ++i )
    {
        var group=this.groups[i];

        for( var p=0; p < group.parameters.length; ++p )
        {
            var param=group.parameters[p];

            if ( param.data._keyFrames )
            {
                for( let k=0; k < param.data._keyFrames.length; ++k )
                {
                    let key=param.data._keyFrames[k];

                    for ( let t=0; t < keys.length; ++t )
                    {
                        if ( key[keys[t]] !== undefined ) return true;
                    }
                }
            }
        }
    }

    return false;
};

VG.Nodes.ParamContainer.prototype.resetParams=function()
{
    for( let i=0; i < this.groups.length; ++i )
    {
        let group=this.groups[i];

        for( let p=0; p < group.parameters.length; ++p )
        {
            let param=group.parameters[p];

            if ( param.defaultValue === undefined )
                continue;

            if ( param instanceof VG.Nodes.ParamColor )
            {
                let value = param.data[param.name];
                value.r=param.defaultValue.r; value.g=param.defaultValue.g; value.b=param.defaultValue.b; value.a=param.defaultValue.a;
                value.x=param.defaultValue.r; value.y=param.defaultValue.g; value.z=param.defaultValue.b; value.w=param.defaultValue.a;
            }
            else {
                param.data[param.name] = param.defaultValue;
            }
        }
    }
};

VG.Nodes.ParamContainer.prototype.setParamColor=function( name, r, g, b, a )
{
    /**Sets the value of a color parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} r - The red value to set.
     * @param {number} g - The green value to set.
     * @param {number} b - The blue value to set.
     * @param {number} a - The alpha value to set.
     */
    var param=this.getParam( name );
    if ( !param ) return;
    var value=param.data[param.name];

    value.r=r; value.g=g; value.b=b; value.a=a;
    value.x=r; value.y=g; value.z=b; value.w=a;
};

VG.Nodes.ParamContainer.prototype.setParamNumber=function( name, value )
{
    /**Sets the value of a number parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The value to set.
     */
    var param=this.getParam( name );
    param.data[param.name]=value;
};

VG.Nodes.ParamContainer.prototype.setParamText=function( name, value )
{
    /**Sets the value of a text parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The value to set.
     */
    var param=this.getParam( name );
    param.data[param.name]=value;
};

VG.Nodes.ParamContainer.prototype.setParamSlider=function( name, value )
{
    /**Sets the value of a slider parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The value to set.
     */
    var param=this.getParam( name );
    param.data[param.name]=value;
};

VG.Nodes.ParamContainer.prototype.setParamBoolean=function( name, value )
{
    /**Sets the value of a boolean parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The value to set.
     */
    var param=this.getParam( name );
    param.data[param.name]=value;

    if ( param.widget )
        param.widget.checked=value;
};

VG.Nodes.ParamContainer.prototype.setParamList=function( name, value )
{
    /**Sets the value of a list parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The value to set.
     */
    var param=this.getParam( name );
    param.data[param.name]=value;
};


VG.Nodes.ParamContainer.prototype.setParamVector2=function( name, x, y )
{
    /**Sets the value of a vector2 parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} x - The x value to set.
     * @param {number} y - The y value to set.
     */
    var param=this.getParam( name );
    if ( !param ) return;
    param.data[param.name].x=x;
    param.data[param.name].y=y;

    if ( param.widget ) {
        param.widget.value1Edit.value=x;
        param.widget.value2Edit.value=y;
    }
};

VG.Nodes.ParamContainer.prototype.setParamVector3=function( name, x, y, z )
{
    /**Sets the value of a vector3 parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} x - The x value to set.
     * @param {number} y - The y value to set.
     * @param {number} z - The z value to set.
     */
    var param=this.getParam( name );
    if ( !param ) return;
    param.data[param.name].x=x;
    param.data[param.name].y=y;
    param.data[param.name].z=z;

    if ( param.widget ) {
        param.widget.value1Edit.value=x;
        param.widget.value2Edit.value=y;
        param.widget.value3Edit.value=z;
    }
};

VG.Nodes.ParamContainer.prototype.setParamVector4=function( name, x, y, z, w )
{
    /**Sets the value of a vector4 parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} x - The x value to set.
     * @param {number} y - The y value to set.
     * @param {number} z - The z value to set.
     * @param {number} w - The w value to set.
     */
    var param=this.getParam( name );
    if ( !param ) return;
    param.data[param.name].x=x;
    param.data[param.name].y=y;
    param.data[param.name].z=z;
    param.data[param.name].w=w;
};

VG.Nodes.ParamContainer.prototype.setParamImage=function( name, imageName, imageData )
{
    /**Sets the value of an image parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} imageName - The name of the image.
     * @param {imageData} imageData- The compressed data of the image to set.
     */
    var param=this.getParam( name );
    if ( !param ) return;

    param.data[param.name].imageName=imageName;
    param.data[param.name].imageData=imageData;

    if ( param.updateFromData ) param.updateFromData( param.data );
};

VG.Nodes.ParamContainer.prototype.addKeyFrame=function( frame, param, value, noUndo )
{
    // console.log( "addKeyFrame", frame, param, value, noUndo );
    this.node.open=true;

    let data = param.data;
    if ( !data._keyFrames ) data._keyFrames=[];

    let key = this.keyFrameAt( data, frame ), added=false, obj={};
    if ( !key ) {
        key = { _frame : frame };

        let ins=0;
        for( let i=0; i < data._keyFrames.length; ++i ) {
            let k=data._keyFrames[i];
            if ( k._frame < frame ) ++ins;
            else break;
        }

        data._keyFrames.splice( ins, 0, key );
        added=true;
    }

    if ( !added && !noUndo ) {
        // --- Prepare for Node Change Undo
        obj.oldValue = JSON.stringify( key );
    }

    // --- If key did not yet exist at the position, make sure its added and not changed
    if ( key[param.name] === undefined ) added = true;

    if ( value instanceof Object )
    {
        key[param.name]={};
        let dest=key[param.name];

        var props = Object.getOwnPropertyNames( value );

        props.forEach( function( prop ) {
            dest[prop]=value[prop];
        } );
    } else key[param.name]=value;

    if ( !noUndo ) {
        if ( this.node.graph.nodeKeyAddedCallback && added )
            this.node.graph.nodeKeyAddedCallback( param, data, key );
        if ( this.node.graph.nodeKeyChangedCallback && !added ) {
            obj.newValue=JSON.stringify( key );
            this.node.graph.nodeKeyChangedCallback( param, data, obj );
        }
    }

    VG.update();
};

VG.Nodes.ParamContainer.prototype.removeKeyFrameAt=function( frame, keyName, noUndo )
{
    let data = this.groups[0].parameters[0].data;
    let key = this.keyFrameAt( data, frame );
    let newKey = {};

    let count = 0;
    for ( let prop in key ) {
        if ( prop !== "_frame" ) count++;
        if ( prop !== keyName && prop ) newKey[prop] = key[prop];
    }

    let param = this.getParam( keyName );
    let insertNewKey = count >=  2 ? true : false;

    if ( key ) {
        let keyIndex = data._keyFrames.indexOf( key );
        data._keyFrames.splice( keyIndex, 1 );

        if ( insertNewKey ) data._keyFrames.splice( keyIndex, 0, newKey );

        if ( !noUndo ) {
            if ( this.node.graph.nodeKeyRemovedCallback )
                this.node.graph.nodeKeyRemovedCallback( param, data, key, insertNewKey ? newKey : undefined, keyName );
        }
    }

    VG.update();
};

VG.Nodes.ParamContainer.prototype.keyFrameAt=function( data, frame )
{
    if ( !data._keyFrames ) return undefined;

    for( let i=0; i < data._keyFrames.length; ++i )
    {
        let key=data._keyFrames[i];
        if ( key._frame === frame ) return key;
    }
    return undefined;
};

VG.Nodes.ParamContainer.prototype.keyParamValue=function( param )
{
    var frame = this.node.graph.time.frames - this.node.inTime.frames;
    var data=param.data, name=param.name;

    var keys=this.findSurrKeys( frame, data, name );

    if ( keys.prev && !keys.next ) return keys.prev[name];
    else
    if ( !keys.prev && !keys.next ) return data[name];
    else
    if ( keys.prev === keys.next ) return keys.prev[name];

    // --- Interpolate values

    var value;

    var prevFrame = keys.prev ? keys.prev._frame : 0;
    var nextFrame = keys.next._frame;

    var frameDur =  nextFrame - prevFrame;
    var frameOff = frame - prevFrame;

    var prevValue = keys.prev ? keys.prev[name] : data[name];
    var nextValue = keys.next[name];

    if ( param instanceof VG.Nodes.ParamSlider || param instanceof VG.Nodes.ParamNumber )
    {
        value = prevValue + ( (nextValue - prevValue) / frameDur ) * frameOff;
    } else
    if ( param instanceof VG.Nodes.ParamVector2 )
    {
        value = {};
        value.x = prevValue.x + ( (nextValue.x - prevValue.x) / frameDur ) * frameOff;
        value.y = prevValue.y + ( (nextValue.y - prevValue.y) / frameDur ) * frameOff;
    } else
    if ( param instanceof VG.Nodes.ParamColor )
    {
        value = {};
        value.r = prevValue.r + ( (nextValue.r - prevValue.r) / frameDur ) * frameOff;
        value.g = prevValue.g + ( (nextValue.g - prevValue.g) / frameDur ) * frameOff;
        value.b = prevValue.b + ( (nextValue.b - prevValue.b) / frameDur ) * frameOff;
        value.a = prevValue.a + ( (nextValue.a - prevValue.a) / frameDur ) * frameOff;
    } else
    if ( param instanceof VG.Nodes.ParamMaterial )
    {
        value = {};
        value.r = prevValue.r + ( (nextValue.r - prevValue.r) / frameDur ) * frameOff;
        value.g = prevValue.g + ( (nextValue.g - prevValue.g) / frameDur ) * frameOff;
        value.b = prevValue.b + ( (nextValue.b - prevValue.b) / frameDur ) * frameOff;
        value.a = prevValue.a + ( (nextValue.a - prevValue.a) / frameDur ) * frameOff;
        value.metallic = prevValue.metallic + ( (nextValue.metallic - prevValue.metallic) / frameDur ) * frameOff;
        value.smoothness = prevValue.smoothness + ( (nextValue.smoothness - prevValue.smoothness) / frameDur ) * frameOff;
        value.reflectance = prevValue.reflectance + ( (nextValue.reflectance - prevValue.reflectance) / frameDur ) * frameOff;
    } else
    if ( param instanceof VG.Nodes.ParamBoolean )
    {
        value = prevValue;
    }

    return value;
};

VG.Nodes.ParamContainer.prototype.findSurrKeys=function( frame, data, name )
{
    var keys={ prev: undefined, next: undefined };
    for( let i=0; i < data._keyFrames.length; ++i )
    {
        let key=data._keyFrames[i];
        if ( key._frame < frame && key[name] !== undefined ) keys.prev=key;
        else
        if ( key._frame === frame && key[name] !== undefined ) {
            keys.prev=key;
            keys.next=key;
            break;
        }
        else
        if ( key._frame > frame && key[name] !== undefined ) {
            keys.next=key;
            break;
        }
    }
    return keys;
};

VG.Nodes.ParamContainer.prototype.getKeyListOfProperty=function( data, name )
{
    var keys=[];
    for( let i=0; i < data._keyFrames.length; ++i )
    {
        let key=data._keyFrames[i];
        if ( key[name] !== undefined ) keys.push( key );
    }
    return keys;
};

VG.Nodes.ParamContainer.prototype.containsKeyFrames=function( data, list )
{
    for( let i=0; i < data._keyFrames.length; ++i )
    {
        let key=data._keyFrames[i];

        for( let l=0; l < list.length; ++l ) {
            if ( key[list[l]] !== undefined )
                return true;
        }
    }
    return false;
};

// ----------------------------------------------------------------- VG.Nodes.ParamGroup

VG.Nodes.ParamGroup=function( name, text, open )
{
    /**
     * Creates a Parameter Group.<br>
     *
     * VG.Nodes.ParamGroup is used to group several parameters. Typically these parameters control a common feature of the node.
     * @param {string} name - The name of the new group, the name is used to identify groups inside a container and has to be unique.
     * @param {string} text - The text / title of this group.
     * @param {string} open - True if the group should be open by default. Default is true.
     * @constructor
    */
    if ( !(this instanceof VG.Nodes.ParamGroup ) ) return new VG.Nodes.ParamGroup( name, text, open );

    this.name=name ? name : "settings";
    this.text=text ? text : "Settings";
    this.open=open === undefined ? true : open;

    this.visible=true;

    /**The array of parameters contained in this group.
     * @member {array} */
    this.parameters=[];
};

VG.Nodes.ParamGroup.prototype.addParam=function( param )
{
    /**Adds the given parameter to this group.
     * @param {VG.Nodes.Param} param - The parameter to add to this group.
     */

    param.group=this;
    this.parameters.push( param );

    return param;
};

// ----------------------------------------------------------------- VG.Nodes.Param

VG.Nodes.Param=function()
{
    if ( !(this instanceof VG.Nodes.Param) ) return new VG.Nodes.Param();
};

Object.defineProperty( VG.Nodes.Param.prototype, "disabled",
{
    get: function() {
        return this._disabled;
    },
    set: function( disabled ) {
        this._disabled=disabled;
        if ( this.widget ) this.widget.disabled=disabled;
    }
});

// ----------------------------------------------------------------- VG.Nodes.ParamNumber

VG.Nodes.ParamNumber=function( data, name, text, value, min, max, precision )
{
    /**
     * Creates a Number Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} value - The initial value of this parameter.
     * @param {number} min - Optional, the minimum number allowed.
     * @param {number} max - Optional, the maximum number allowed.
     * @param {number} precision - Optional, the numerical precision.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamNumber ) ) return new VG.Nodes.ParamNumber( data, name, text, value, min, max, precision );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";
    this.type = "float";

    this.min=min;
    this.max=max;
    this.precision=precision;

    this.data=data;
    if ( data[name] === undefined ) data[name]=value;
};

VG.Nodes.ParamNumber.prototype=VG.Nodes.Param();

VG.Nodes.ParamNumber.prototype.toString=function()
{
    var val=this.data[this.name];
    return val.toFixed( 3 );
};

// ----------------------------------------------------------------- VG.Nodes.ParamText

VG.Nodes.ParamText=function( data, name, text, value )
{
    /**
     * Creates a Text Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} value - The initial value of this parameter.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamText ) ) return new VG.Nodes.ParamText( data, name, text, value );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";

    this.data=data;
    if ( !data[name] ) data[name]=value;
};

VG.Nodes.ParamText.prototype=VG.Nodes.Param();

VG.Nodes.ParamText.prototype.toString=function()
{
    var val=this.data[this.name];
    return val;
};

// ----------------------------------------------------------------- VG.Nodes.ParamText

VG.Nodes.ParamHtml=function( data, name, text, value )
{
    /**
     * Creates an Html Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} value - The initial value of this parameter.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamHtml ) ) return new VG.Nodes.ParamHtml( data, name, text, value );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";

    this.data=data;
    data[name]=value;
};

VG.Nodes.ParamHtml.prototype=VG.Nodes.Param();

// ----------------------------------------------------------------- VG.Nodes.ParamDivider

VG.Nodes.ParamDivider=function( data, name, text )
{
    /**
     * Creates a Divider.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamDivider ) ) return new VG.Nodes.ParamDivider( data, name, text );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";
};

VG.Nodes.ParamDivider.prototype=VG.Nodes.Param();

// ----------------------------------------------------------------- VG.Nodes.ParamToolSettings

VG.Nodes.ParamToolSettings=function( data, name, text, widgetCount, height )
{
    /**
     * Creates a Divider.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {string} widgetCount - The widget count.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamToolSettings ) ) return new VG.Nodes.ParamToolSettings( data, name, text, widgetCount, height );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";
    this.data=data;
    this.widgetCount = widgetCount;
    this.height = height;
};

VG.Nodes.ParamToolSettings.prototype=VG.Nodes.Param();

// ----------------------------------------------------------------- VG.Nodes.ParamNumber

VG.Nodes.ParamSlider=function( data, name, text, value, min, max, step, precision, halfWidthValue )
{
    /**
     * Creates a Slider Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} value - The initial value of this parameter.
     * @param {number} min - Optional, the minimum number allowed.
     * @param {number} max - Optional, the maximum number allowed.
     * @param {number} step - Optional, the step distance between possible values.
     * @param {number} precision - Optional, the fixed precision for the edit widget.
     * @constructor
    */

    //VG.Nodes.Param.call( this );

    if ( !(this instanceof VG.Nodes.ParamSlider ) ) return new VG.Nodes.ParamSlider( data, name, text, value, min, max, step, precision, halfWidthValue );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";

    this.min=min;
    this.max=max;
    this.step=step;
    this.precision=precision;
    this.halfWidthValue=halfWidthValue;
    this.defaultValue=value;
    this.type = "float";

    this.data=data;
    if ( data[name] === undefined ) {
        if ( !isNaN( value ) ) value = Number( value );
        data[name]=value;
    } else {
        if ( !isNaN( data[name] ) ) data[name] = Number( data[name] );
    }
};

VG.Nodes.ParamSlider.prototype=VG.Nodes.Param();

VG.Nodes.ParamSlider.prototype.toString=function()
{
    var val=this.data[this.name];
    return val.toFixed( 3 );
};

// ----------------------------------------------------------------- VG.Nodes.ParamBoolean

VG.Nodes.ParamBoolean=function( data, name, text, value )
{
    /**
     * Creates a Boolean (on/off) Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} value - The initial value of this parameter.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamBoolean ) ) return new VG.Nodes.ParamBoolean( data, name, text, value );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";
    this.type = "bool";

    this.data=data;
    if ( data[name] === undefined ) data[name]=value;
};

VG.Nodes.ParamBoolean.prototype=VG.Nodes.Param();

// ----------------------------------------------------------------- VG.Nodes.ParamBoolean

VG.Nodes.ParamCustom=function( data, name, text, cb )
{
    /**
     * Creates a Boolean (on/off) Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} value - The initial value of this parameter.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamCustom ) ) return new VG.Nodes.ParamCustom( data, name, text, cb );

    this.name=name ? name : "value";
    this.text=text !== undefined ? text : "";

    this.data=data;
    this.cb=cb;

    if ( data[name] === undefined ) data[name]=cb( "DefaultValue" );
};

VG.Nodes.ParamCustom.prototype=VG.Nodes.Param();

// ----------------------------------------------------------------- VG.Nodes.ParamList

VG.Nodes.ParamList=function( data, name, text, value, array, callback )
{
    /**
     * Creates a List Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} value - The initial index of this parameter.
     * @param {array} array - An array of strings.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamList ) ) return new VG.Nodes.ParamList( data, name, text, value, array, callback );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";
    this.type = "int";

    this.list=array;
    this.callback=callback;

    this.data=data;
    if ( data[name] === undefined ) data[name]=value;
};

VG.Nodes.ParamList.prototype=VG.Nodes.Param();

// ----------------------------------------------------------------- VG.Nodes.ParamVector2

VG.Nodes.ParamVector2=function( data, name, text, x, y, min, max, precision )
{
    /**
     * Creates a Vector 2 Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} x - The initial x value.
     * @param {number} y - The initial y value.
     * @param {number} min - Optional, the minimum number allowed.
     * @param {number} max - Optional, the maximum number allowed.
     * @param {number} precision - Optional, the fixed precision for the edit widget.*
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamVector2 ) ) return new VG.Nodes.ParamVector2( data, name, text, x, y, min, max, precision );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";
    this.type = "vec2";

    this.min=min;
    this.max=max;
    this.precision=precision;

    if ( !data[name] )
    {
        data[name]={};
        data[name].x=x;
        data[name].y=y;
    }

    this.data=data;
    this.value=new VG.Math.Vector2( x, y );
};

VG.Nodes.ParamVector2.prototype=VG.Nodes.Param();

VG.Nodes.ParamVector2.prototype.toString=function()
{
    var obj=this.data[this.name];
    return  "vec2( " + obj.x.toFixed(3) + "," + obj.y.toFixed(3) + " )";
};

// ----------------------------------------------------------------- VG.Nodes.ParamVector2

VG.Nodes.ParamVector2List=function( data, name, text, array, min, max )
{
    /**
     * Creates a Vector 2 Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} array - The list of values.
     * @param {number} min - Optional, the minimum number allowed.
     * @param {number} max - Optional, the maximum number allowed.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamVector2List ) ) return new VG.Nodes.ParamVector2List( data, name, text, array, min, max );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";

    this.min=min;
    this.max=max;

    if ( !data[name] )
        data[name] = array;

    this.data=data;
    this.minimumPoints = 2;
    this.index=0;
};

VG.Nodes.ParamVector2List.prototype=VG.Nodes.Param();

// ----------------------------------------------------------------- VG.Nodes.ParamVector3

VG.Nodes.ParamVector3=function( data, name, text, x, y, z, min, max )
{
    /**
     * Creates a Vector 3 Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} x - The initial x value.
     * @param {number} y - The initial y value.
     * @param {number} z - The initial z value.
     * @param {number} min - Optional, the minimum number allowed.
     * @param {number} max - Optional, the maximum number allowed.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamVector3 ) ) return new VG.Nodes.ParamVector3( data, name, text, x, y, z, min, max );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";
    this.type = "vec3";

    this.min=min;
    this.max=max;

    if ( !data[name] )
    {
        data[name]={};
        data[name].x=x;
        data[name].y=y;
        data[name].z=z;
    }

    if ( typeof data[name] == 'number' )
        data[name] = { x : data[name], y : data[name], z : data[name] };

    this.data=data;
    this.value=new VG.Math.Vector3( x, y, z );
};

VG.Nodes.ParamVector3.prototype=VG.Nodes.Param();

VG.Nodes.ParamVector3.prototype.toString=function()
{
    var obj=this.data[this.name];
    return  "vec3( " + obj.x.toFixed(3) + "," + obj.y.toFixed(3) + "," + obj.z.toFixed(3) + " )";
};

// ----------------------------------------------------------------- VG.Nodes.ParamVector4

VG.Nodes.ParamVector4=function( data, name, text, x, y, z, w, min, max )
{
    /**
     * Creates a Vector4 Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {number} x - The initial x value.
     * @param {number} y - The initial y value.
     * @param {number} z - The initial z value.
     * @param {number} w - The initial w value.
     * @param {number} min - Optional, the minimum number allowed.
     * @param {number} max - Optional, the maximum number allowed.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamVector4 ) ) return new VG.Nodes.ParamVector4( data, name, text, x, y, z, w, min, max );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";
    this.type = "vec4";

    this.min=min;
    this.max=max;

    if ( !data[name] )
    {
        data[name]={};
        data[name].x=x;
        data[name].y=y;
        data[name].z=z;
        data[name].w=w;
    }

    this.data=data;
    this.value=new VG.Math.Vector4( x, y, z, w );
};

VG.Nodes.ParamVector4.prototype=VG.Nodes.Param();

VG.Nodes.ParamVector4.prototype.toString=function()
{
    var obj=this.data[this.name];
    return  "vec4( " + obj.x.toFixed(3) + "," + obj.y.toFixed(3) + "," + obj.z.toFixed(3) + "," + obj.w.toFixed(3) + " )";
};

// ----------------------------------------------------------------- VG.Nodes.ParamColor

VG.Nodes.ParamColor=function( data, name, text, value, alpha )
{
    /**
     * Creates a Color Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {string} value - The initial value of this parameter.
     * @param {boolean} alpha - If the edit show an alpha slider for the color.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamColor ) ) return new VG.Nodes.ParamColor( data, name, text, value, alpha );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";
    this.type = "vec3";

    if ( !data[name] )
    {
        data[name]={};
        data[name].r=value.r;
        data[name].g=value.g;
        data[name].b=value.b;
        data[name].a=value.a;

        data[name].x=value.r;
        data[name].y=value.g;
        data[name].z=value.b;
        data[name].w=value.a;
    } else {
        if ( data[name].x === undefined ) {
            data[name].x=data[name].r;
            data[name].y=data[name].g;
            data[name].z=data[name].b;
            data[name].w=data[name].a;
        }
    }

    this.data=data;
    this.defaultValue=value;
    this.value=VG.Core.Color( value );
    this.alpha=alpha;
};

VG.Nodes.ParamColor.prototype=VG.Nodes.Param();

VG.Nodes.ParamColor.prototype.toString=function()
{
    var obj=this.data[this.name];
    return  "vec4( " + obj.r.toFixed(3) + "," + obj.g.toFixed(3) + "," + obj.b.toFixed(3) + "," + obj.a.toFixed(3) + " )";
};

VG.Nodes.ParamColor.prototype.toString3=function()
{
    var obj=this.data[this.name];
    return  "vec3( " + obj.r.toFixed(3) + "," + obj.g.toFixed(3) + "," + obj.b.toFixed(3) + " )";
};

// ----------------------------------------------------------------- VG.Nodes.ParamColor

VG.Nodes.ParamMaterial=function( data, name, text, value, alpha )
{
    /**
     * Creates a Material Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {VG.Core.Material} value - The initial value of this parameter.
     * @param {boolean} alpha - If the edit for this material should show an alpha slider for the color.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamMaterial ) ) return new VG.Nodes.ParamMaterial( data, name, text, value, alpha );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";

    if ( !data[name] )
    {
        data[name]={};
        data[name].r=value.color.r;
        data[name].g=value.color.g;
        data[name].b=value.color.b;
        data[name].a=value.color.a;
        data[name].metallic=value.metallic;
        data[name].smoothness=value.smoothness;
        data[name].reflectance=value.reflectance;
    }

    this.data=data;
    this.value=VG.Core.Material( value.color, value.metallic, value.smoothness, value.reflectance );
    this.alpha=alpha;
};

VG.Nodes.ParamColor.prototype=VG.Nodes.Param();

VG.Nodes.ParamColor.prototype.toString=function()
{
    var obj=this.data[this.name];
    return  "vec4( " + obj.r.toFixed(3) + "," + obj.g.toFixed(3) + "," + obj.b.toFixed(3) + "," + obj.a.toFixed(3) + " )";
};

// ----------------------------------------------------------------- VG.Nodes.ParamImage

VG.Nodes.ParamImage=function( data, name, text )
{
    /**
     * Creates an Image Parameter.<br>
     *
     * @param {object} data - The object which holds the low level representation of the parameters.
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.ParamImage ) ) return new VG.Nodes.ParamImage( data, name, text );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";

    this.value=VG.Core.Image();

    if ( !data[name] )
    {
        data[name]={};
        data[name].imageData=null;
        data[name].imageName="";
    }

    this.data=data;
};

VG.Nodes.ParamImage.prototype=VG.Nodes.Param();

VG.Nodes.ParamImage.prototype.updateFromData=function( data )
{
    if ( data[this.name] )
    {
        if ( data[this.name].imageData ) {
            VG.decompressImageData( data[this.name].imageData, this.value, function() {
                if ( this.group.container.node.graph && this.group.container.node.graph.update )
                    this.group.container.node.graph.update();
            }.bind( this ) );

            if ( VG.context.workspace.platform !== VG.HostProperty.PlatformWeb ) {
                if ( this.group.container.node.graph && this.group.container.node.graph.update )
                    this.group.container.node.graph.update();
            }
        } else this.value.clear();
    }
};
