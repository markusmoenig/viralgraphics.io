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

// ----------------------------------------------------------------- VG.Nodes.Node

VG.Nodes.Node=function()
{
    /**
     * Creates a Node.<br>
     * 
     * VG.Nodes.Node is the base class for all Nodes.
     * 
     * @constructor
    */

    if ( !(this instanceof VG.Nodes.Node ) ) return new VG.Nodes.Node();

    if ( !this.name ) this.name="Base Node";

    /**The list of input terminals of this node.
     * @member {array} */
    this.inputs=[];

    /**The list of output terminals of this node.
     * @member {array} */    
    this.outputs=[];
};

VG.Nodes.Node.prototype.addInput=function( terminal )
{
    /**Adds the given terminal as an input terminal to this node.
     * @param {VG.Nodes.Terminal} terminal - The new input terminal.
     */

    terminal.node=this;
    terminal.input=true; terminal.output=false;
    this.inputs.push( terminal );
};

VG.Nodes.Node.prototype.removeInput=function( terminal )
{
    /**Removes the given terminal as an input terminal from this node.
     * @param {VG.Nodes.Terminal} terminal - The input terminal to remove.
     */    

    terminal.disconnectAll();
    terminal.node=null;

    var index=this.inputs.indexOf( terminal );
    if ( index >= 0 ) this.inputs.splice( index, 1 );     
};

VG.Nodes.Node.prototype.addOutput=function( terminal )
{
    /**Adds the given terminal as an output terminal to this node.
     * @param {VG.Nodes.Terminal} terminal - The new output terminal.
     */

    terminal.node=this;
    terminal.input=false; terminal.output=true;    
    this.outputs.push( terminal );
};

VG.Nodes.Node.prototype.getInput=function( name )
{
    /**Gets the input terminal specified by name.
     * @param {string} terminal - The name of the terminal.
     * @returns The found terminal or null.
     */

    for ( var i=0; i < this.inputs.length; ++i )
        if ( this.inputs[i].name === name ) return this.inputs[i];

    return null;
};

VG.Nodes.Node.prototype.hasConnectedInput=function()
{
    /**Returns true if one of the nodes inputs is connected, i.e. this node is not static.
     * @returns True if one of the inputs is connected or false otherwise.
     */

    for ( var i=0; i < this.inputs.length; ++i )
        if ( this.inputs[i].isConnected() ) return true;

    return false;
};

VG.Nodes.Node.prototype.getTerminal=function( terminalName )
{
    /**Gets the input or output terminal specified by name.
     * @param {string} terminal - The name of the terminal.
     * @returns The found terminal or null.
     */

    for ( var i=0; i < this.inputs.length; ++i )
    {
        if ( this.inputs[i].name === terminalName )
            return this.inputs[i];
    }

    for ( var i=0; i < this.outputs.length; ++i )
    {
        if ( this.outputs[i].name === terminalName )
            return this.outputs[i];
    }

    return null;    
};

VG.Nodes.Node.prototype.readConnections=function( outputsOnly )
{
    /**Reads the connections of the low level data and initializes the terminals and connections.
     * @param {bool} outputsOnly - Only connect output terminals (to make sure terminals are only connected once)
     */

    if ( this.data.connections ) {
        for ( var i=0; i < this.data.connections.length; ++i )
        {
            var conn=this.data.connections[i];
            var terminal=this.getTerminal( conn.terminalName );
            if ( terminal ) {

                if ( outputsOnly && terminal.input )
                    continue;

                var destNode;
                if ( conn.connNodeId === -1 ) {
                    destNode=this.graph.previewNode;
                    this.graph.outputTerminal=terminal;
                }
                else destNode=this.graph.nodes.get( conn.connNodeId );
                if ( destNode )
                {
                    var destTerminal=destNode.getTerminal( conn.connTerminalName );
                    if ( destTerminal ) terminal.connectTo( destTerminal, true );
                }
            }
        }
    }
};

VG.Nodes.Node.prototype.disconnectAll=function()
{
    /**Disonnects all terminals.
     */

    for ( var i=0; i < this.inputs.length; ++i )
    {
        var t=this.inputs[i];

        for ( var c=0; c < t.connectedTo.length; ++c )
        {
            var ct=t.connectedTo[c];
            t.disconnectFrom( ct, true );
        }
    }

    for ( var i=0; i < this.outputs.length; ++i )
    {
        var t=this.outputs[i];

        for ( var c=0; c < t.connectedTo.length; ++c )
        {
            var ct=t.connectedTo[c];
            t.disconnectFrom( ct, true );
        }
    }    
};

VG.Nodes.Node.prototype.setParamColor=function( name, r, g, b, a )
{
    /**Sets the value of a color parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} r - The red value to set.
     * @param {number} g - The green value to set.
     * @param {number} b - The blue value to set.
     * @param {number} a - The alpha value to set.
     */
     if ( this.container )
        this.container.setParamColor( name, r, g, b, a );
};

VG.Nodes.Node.prototype.setParamNumber=function( name, value )
{
    /**Sets the value of a color parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The value to set.
     */
     if ( this.container )
        this.container.setParamNumber( name, value );
};

VG.Nodes.Node.prototype.setParamSlider=function( name, value )
{
    /**Sets the value of a slider parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The value to set.
     */
     if ( this.container )
        this.container.setParamSlider( name, value );
};

VG.Nodes.Node.prototype.setParamBoolean=function( name, value )
{
    /**Sets the value of a boolean parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The value to set.
     */
     if ( this.container )
        this.container.setParamBoolean( name, value );
};

VG.Nodes.Node.prototype.setParamList=function( name, value )
{
    /**Sets the value of a list parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The value to set.
     */
     if ( this.container )
        this.container.setParamList( name, value );
};

VG.Nodes.Node.prototype.setParamVector2=function( name, x, y )
{
    /**Sets the value of a color parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} x - The x value to set.
     * @param {number} y - The y value to set.
     */
     if ( this.container )
        this.container.setParamVector2( name, x, y );
};

VG.Nodes.Node.prototype.setParamVector3=function( name, x, y, z )
{
    /**Sets the value of a color parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} x - The x value to set.
     * @param {number} y - The y value to set.
     * @param {number} z - The z value to set.
     */
     if ( this.container )
        this.container.setParamVector3( name, x, y, z );
};

VG.Nodes.Node.prototype.setParamVector4=function( name, x, y, z, w )
{
    /**Sets the value of a color parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} x - The x value to set.
     * @param {number} y - The y value to set.
     * @param {number} z - The z value to set.
     * @param {number} w - The w value to set.
     */
     if ( this.container )
        this.container.setParamVector4( name, x, y, z, w );
};

VG.Nodes.Node.prototype.setParamImage=function( name, imageName, imageData)
{
    /**Sets the value of an image parameter, identified by its name.
     * @param {string} name - The name of the parameter to set.
     * @param {number} imageName - The name of the image.
     * @param {imageData} imageData- The compressed data of the image to set.
     */

     if ( this.container )
        this.container.setParamImage( name, imageName, imageData );
};

VG.Nodes.availableNodes=new Map();
