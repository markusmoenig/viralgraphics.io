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

// ----------------------------------------------------------------- VG.Nodes.Terminal

VG.Nodes.Terminal=function( type, name, onCall, onConnect, onDisconnect )
{
    /**
     * Creates a Terminal.<br>
     * 
     * Terminals are either an input or an output of a VG.Nodes.Node. Terminals can be connected if their types match.
     * 
     * @constructor
     * @param {VG.Nodes.Terminal.Type} type - The type of the Terminal. Terminals can be connected if they have the same type or if one of the Terminals has a type
     * of VG.Nodes.Terminal.Type.Universal.
     * @param {string} name - The name of the Terminal. The name of a Terminal inside a Node has to be unique.
     * @param {function} onCall - A function which is called when an output node is pulled during node graph execution. The parameters to onCall and its return value
     * depend on the terminal type. This function callback only needs to be set for output terminals.
     * @param {function} onConnect - Optional. A function which is called when the terminal is being connected. Can be used for input terminals to disable Node Parameters which
     * are being overruled by the terminal connection.
     * @param {function} onDisconnect - Optional. A function which is called when the terminal is being disconnected. Can be used for input terminals to enable Node Parameters which
     * are otherwise being overruled if the terminal would be connected.
    */

    if ( !(this instanceof VG.Nodes.Terminal ) ) return new VG.Nodes.Terminal( type, name, onCall, onConnect, onDisconnect );

    this.type=type;
    this.name=name;
    this.onCall=onCall;
    this.onConnect=onConnect;
    this.onDisconnect=onDisconnect;

    /**The node this terminal is embedded in.
     * @member {VG.Nodes.Node} */
    this.node=undefined;

    /**A list of other terminals this terminal is connected to.
     * @member {array} */    
    this.connectedTo=[];
}

VG.Nodes.Terminal.Type={ "Universal" : 0, "String" : 1, "Float" : 2, "Vector2" : 3, "Vector3" : 4, "Vector4" : 5, "Sample2D" : 6, "Sample3D" : 7, 
    "Material" : 8, "Docs.Enum" : -1 };

VG.Nodes.Terminal.prototype.connectTo=function( t, dontAddToLowLevelData )
{
    /**Connects this terminal to the given terminal. It is assumed that canConnect() was called previously to make sure the terminals can be connected.
     * @param {VG.Nodes.Terminal} terminal - The terminal to connect to.
     */

    this.connectedTo.push( t );
    t.connectedTo.push( this );

    // --- Connect
    if ( !this.node.data.connections )  this.node.data.connections=[];
    if ( !t.node.data.connections )  t.node.data.connections=[];

    // --- Call the connection callbacks
    if ( this.onConnect ) this.onConnect( t );
    if ( t.onConnect ) t.onConnect( this );

    if ( dontAddToLowLevelData ) return;

    // --- Add the connection to the low level data representation
    this.node.data.connections.push( { terminalName : this.name, connNodeId : t.node.data.id, connTerminalName : t.name } );
    t.node.data.connections.push( { terminalName : t.name, connNodeId : this.node.data.id, connTerminalName : this.name } );
};

VG.Nodes.Terminal.prototype.disconnectFrom=function( t, dontRemoveFromLowLevelData )
{
    /**Disconnects this terminal from the given terminal. It is assumed that the two terminals are already connected, if not, this function does nothing.
     * @param {VG.Nodes.Terminal} terminal - The terminal to disconnect from.
     */

    // --- Call the disconnection callbacks
    if ( this.onDisconnect ) this.onDisconnect( t );
    if ( t.onDisconnect ) t.onDisconnect( this );

    // --- Disconnect
    var index=this.connectedTo.indexOf( t );
    if ( index >= 0 )
        this.connectedTo.splice( index, 1 );

    index=t.connectedTo.indexOf( this );
    if ( index >= 0 )
        t.connectedTo.splice( index, 1 );

    if ( dontRemoveFromLowLevelData ) return;

    // --- Remove the connection from the low level data representation
    function getConnIndex( array, terminalName, connNodeId, connTerminalName ) {
        for ( var i=0; i < array.length; ++i )
        {
            var conn=array[i];
            if ( conn.terminalName === terminalName && conn.connNodeId === connNodeId && conn.connTerminalName === connTerminalName )
                return i;
        }
        return -1;
    }

    var index=getConnIndex( this.node.data.connections, this.name, t.node.data.id, t.name );
    var connIndex=getConnIndex( t.node.data.connections, t.name, this.node.data.id, this.name );

    if ( index !== -1 ) this.node.data.connections.splice( index, 1 );
    if ( connIndex !== -1 ) t.node.data.connections.splice( connIndex, 1 );
};

VG.Nodes.Terminal.prototype.canConnect=function( t )
{
    /**Checks if this terminal can be connected to the given terminal.
     * @param {VG.Nodes.Terminal} terminal - The terminal to check.
     * @returns True if the terminals can be connected, false otherwise.
     */

    // --- Make sure terminals are on different nodes and both or not an input or output
    if ( this.input !== t.input && this.node !== t.node )
    {
        // --- Make sure terminal types match
        if ( this.type === t.type || ( this.type === VG.Nodes.Terminal.Type.Universal || t.type === VG.Nodes.Terminal.Type.Universal ) )
        {
            // --- Input can have only one connection
            if ( ( this.input && this.isConnected() ) || ( t.input && t.isConnected() ) ) return false;
            else return true;
        }
    }
    return false;
};

VG.Nodes.Terminal.prototype.isConnected=function()
{
    /**Returns true if this terminal has at least one connection.
     * @returns True if the terminal is connected to at least one other terminal, false otherwise.
     */

    if ( this.connectedTo.length ) return true; else return false;
};

VG.Nodes.Terminal.prototype.disconnectAll=function( dontRemoveFromLowLevelData )
{
    /**Disconnects all connected terminals.
     * @param {bool} dontRemoveFromLowLevelData - True if the disconnection should not affect the low level data reprentation, i.e. is only an UI operation.
     */

    for ( var c=0; c < this.connectedTo.length; ++c )
    {
        var ct=this.connectedTo[c];
        this.disconnectFrom( ct, dontRemoveFromLowLevelData );
    }    
};