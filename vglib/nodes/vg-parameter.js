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
}

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

    for( var i=0; i < this.groups.length; ++i )
    {
        var group=this.groups[i];

        for( var p=0; p < group.parameters.length; ++p )
        {
            var param=group.parameters[p];

            if ( param.name === name ) return param.data[param.name];
        }
    }

    return null;
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
    this.open=open === undefined ? true : false;

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

    this.min=min;
    this.max=max;
    this.precision=precision;

    this.data=data;
    if ( !data[name] ) data[name]=value;
};

VG.Nodes.ParamNumber.prototype=VG.Nodes.Param();

// ----------------------------------------------------------------- VG.Nodes.ParamNumber

VG.Nodes.ParamSlider=function( data, name, text, value, min, max, step, precision )
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
     * @param {number} precision - Optiona, the fixed precision for the edit widget.
     * @constructor
    */    

    //VG.Nodes.Param.call( this );

    if ( !(this instanceof VG.Nodes.ParamSlider ) ) return new VG.Nodes.ParamSlider( data, name, text, value, min, max, step, precision );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";

    this.min=min;
    this.max=max;
    this.step=step;    
    this.precision=precision;

    this.data=data;
    if ( !data[name] ) data[name]=value;
};

VG.Nodes.ParamSlider.prototype=VG.Nodes.Param();

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

    this.data=data;
    if ( !data[name] ) data[name]=value;
};

VG.Nodes.ParamBoolean.prototype=VG.Nodes.Param();

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

    this.list=array;
    this.callback=callback;

    this.data=data;
    if ( !data[name] ) data[name]=value;
};

VG.Nodes.ParamList.prototype=VG.Nodes.Param();

// ----------------------------------------------------------------- VG.Nodes.ParamVector2

VG.Nodes.ParamVector2=function( data, name, text, x, y, min, max )
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
     * @constructor
    */    

    if ( !(this instanceof VG.Nodes.ParamVector2 ) ) return new VG.Nodes.ParamVector2( data, name, text, x, y, min, max );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";

    this.min=min;
    this.max=max;

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

    this.min=min;
    this.max=max;

    if ( !data[name] ) 
    {
        data[name]={};
        data[name].x=x;
        data[name].y=y;
        data[name].z=z;
    }

    this.data=data;
    this.value=new VG.Math.Vector3( x, y, z );
};

VG.Nodes.ParamVector3.prototype=VG.Nodes.Param();

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

// ----------------------------------------------------------------- VG.Nodes.ParamColor

VG.Nodes.ParamColor=function( data, name, text, value )
{   
    /**
     * Creates a Color Parameter.<br>
     * 
     * @param {object} data - The object which holds the low level representation of the parameters.     
     * @param {string} name - The name of the new parameter, the name is used to identify parameters inside a container or group and has to be unique.
     * @param {string} text - The text to display in the user interface for this parameter.
     * @param {string} value - The initial value of this parameter.
     * @constructor
    */
 
    if ( !(this instanceof VG.Nodes.ParamColor ) ) return new VG.Nodes.ParamColor( data, name, text, value );

    this.name=name ? name : "value";
    this.text=text ? text : "Value";

    if ( !data[name] ) 
    {
        data[name]={};
        data[name].r=value.r;
        data[name].g=value.g;
        data[name].b=value.b;
        data[name].a=value.a;
    }

    this.data=data;
    this.value=VG.Core.Color( value );
};

VG.Nodes.ParamColor.prototype=VG.Nodes.Param();

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
