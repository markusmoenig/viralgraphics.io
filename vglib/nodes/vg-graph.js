/*
 * (C) Copyright 2014-2017 Markus Moenig <markusm@visualgraphics.tv>.
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

// ----------------------------------------------------------------- VG.Nodes.Graph

/**
 * Creates a VG.Node.Graph.<br>
 *
 * A node graph contains a list of nodes and provides convenient functions to load / save the graph.
 *
 * @constructor
 */

VG.Nodes.Graph=function()
{
	if ( !(this instanceof VG.Nodes.Graph ) ) return new VG.Nodes.Graph();

    /**The array of nodes (nodes are derived from VG.Nodes.Node) contained in this graph.
     * @member {array} */
	this.nodes=new Map();

    this.idCounter=0;
};

/**
 * Adds the given node to this graph.
 * @param {VG.Nodes.Node} node - The node to add.
 */

VG.Nodes.Graph.prototype.addNode=function( node, customSetup )
{
    node.graph=this;

    if ( !node.data && !customSetup )
    {
        node.data={};

        Object.defineProperty( node.data, "node", { enumerable: false, writable: true } );

        while ( this.nodes.has( this.idCounter ) ) this.idCounter++;

        node.data.id=this.idCounter++;
        node.data.className=node.className;
        node.data.node=node;
        node.data.name=node.name;

        if ( node.createProperties )
            node.createProperties( node.data );
    }

    this.nodes.set( node.data.id, node );
};

/**
 * Creates the node of the given class name and add it to this graph
 * @param {string} className - The name of the class.
 */

VG.Nodes.Graph.prototype.createNode=function( className)
{
    var node=new VG.Nodes[className]();

    if ( node )
    {
        node.data={};

        Object.defineProperty( node.data, "node", {
            enumerable: false,
            writable: true
        });

        node.data.id=this.idCounter++;
        node.data.className=node.className;
        node.data.node=node;
        node.data.name=node.name;

        if ( node.createProperties )
            node.createProperties( node.data );

        this.nodes.set( node.data.id, node );
        node.graph=this;

        return node;
    }

    return null;
};

/**
 * Returns the node with the given id.
 * @param {number} id - The id of the node to return.
 * @returns The node associated with the given id.
 */

VG.Nodes.Graph.prototype.getNodeFromId=function( id )
{
    return this.nodes.get( id );
};

/**
 * Finds the node of the given name.
 * @param {string} name - The name of the node to return.
 * @returns The node associated with the given name.
 */

VG.Nodes.Graph.prototype.findNode=function( name )
{
    for (var node of this.nodes.values() )
    {
        if ( node.data.name === name )
            return node;
    }
};

/**
 * Finds the first node of the given class.
 * @param {string} name - The class name of the node to return.
 * @returns The node of the given class name
 */

VG.Nodes.Graph.prototype.findNodeClass=function( name )
{
    for (var node of this.nodes.values() )
    {
        if ( node.data.className === name )
            return node;
    }
};

/**
 * Initializes the graph from the given node array.
 */

VG.Nodes.Graph.prototype.loadNodesFromArray=function( array, displaceImage )
{
    if ( !array ) { VG.error( "Graph::load() could not find array."); return; }

    // --- Load the Nodes

    var i, nodeData;
    for ( i=0; i < array.length; ++i )
    {
        nodeData=array[i];

        Object.defineProperty( nodeData, "node", {
            enumerable: false,
            writable: true
        });

        nodeData.node=new VG.Nodes[nodeData.className]();
        nodeData.node.data=nodeData;

        if ( nodeData.node.createProperties )
            nodeData.node.createProperties( nodeData );

        if ( displaceImage && nodeData.className === "NodeImage" ) {
            var param=nodeData.node.container.getParam("image");
            param.value.set( displaceImage );
            nodeData.image.imageData=displaceImage.imageData;
            nodeData.image.imageName=displaceImage.name;
        }

        if ( nodeData.node.updateFromData )
            nodeData.node.updateFromData( nodeData );

        this.addNode( nodeData.node, true );
    }

    this.outputTerminal=null;

    // --- Connect the Nodes
    for( i=0; i < array.length; ++i )
    {
        nodeData=array[i];
        nodeData.node.readConnections( true );
    }

    return this.outputTerminal;
};

/**
 * Loads the nodes of a compressed graph.
 * @param {string} data - The compressed data to load.
 */

VG.Nodes.Graph.prototype.load=function( data, displaceImage )
{
    var string=VG.Utils.decompressFromBase64( data );

    var obj=JSON.parse( string );
    var array=null;

    if ( obj instanceof Array ) array=obj;
    else if ( obj.nodes instanceof Array ) array=obj.nodes;

    return this.loadNodesFromArray( array, displaceImage );
};

/**
 * Saves the node data of this graph. This is low level, in a GraphEdit environment this gets taken care of the node controller.
 * @returns {string} data - The compressed data
 **/

VG.Nodes.Graph.prototype.save=function()
{
    var arr=[];

    this.nodes.forEach(function(n) {
        arr.push( n.data );
    });
    var data=JSON.stringify( arr );
    data=VG.Utils.compressToBase64( data );

    return data;
};

/**
 * Called when the graph has changed and the graph has to be rerun.
 **/


VG.Nodes.Graph.prototype.update=function()
{
    if ( this.updateCallback )
        this.updateCallback();
};

VG.Nodes.Graph.prototype.nodePropertyWillChange=function( param, data )
{
    if ( this.nodePropertyWillChangeCallback )
        this.nodePropertyWillChangeCallback( param, data );
};

/**
 * Clears the graph.
 **/

VG.Nodes.Graph.prototype.clear=function( id )
{
    this.nodes.clear();
    this.idCounter=0;
};

/**
 *
 */

VG.Nodes.Graph.prototype.getMaterialNode=function()
{
    let node = this.findNodeClass( "NodeMaterial" );
    return node;
};

/**
 * Utility function called from collectGlobals(). Builds the global code from the branch starting from this terminal.
 * @param {VG.Nodes.Terminal} terminal - The terminal to start collection globals.
 * @param {array} nodesProcessed - The array holding the already processed nodes.
 * @param {string} globalCode - The already processed global code.
 * @returns {string} The accumulated global code.
 */

VG.Nodes.Graph.prototype.collectTerminalBranch=function( terminal, nodesProcessed, globalCode )
{
    if ( terminal && terminal.isConnected() ) {
        for ( let i = 0; i < terminal.connectedTo.length; ++i )
        {
            let cTerminal = terminal.connectedTo[i];

            let n = cTerminal.node;

            // --- Add the node if not yet processed
            if ( !nodesProcessed.includes( n.className ) && !nodesProcessed.includes( n.token ) )
            {
                if ( n.getGlobalCode !== undefined )
                    globalCode = n.getGlobalCode() + globalCode;

                if ( !n.modifiesGlobal ) nodesProcessed.push( n.className );
                else nodesProcessed.push( n.token );
            }

            // --- Parse the nodes inputs
            for ( i = 0; i < n.inputs.length; ++i )
            {
                let iTerminal = n.inputs[i];
                globalCode = this.collectTerminalBranch( iTerminal, nodesProcessed, globalCode );
            }
        }
    }

    return globalCode;
};

/**
 * Builds the global code of the nodes starting from the given node.
 * @param {VG.Nodes.Node} node - The node to build the global code from.
 * @param {array} nodesProcessed - The already processed nodes (multiple graphs / materials etc)
 * @returns The global code of the nodes in the chain.
 */

VG.Nodes.Graph.prototype.collectGlobals=function( node, nodesProcessed )
{
    let globalCode = "";

    for ( i = 0; i < node.inputs.length; ++i )
    {
        let terminal = node.inputs[i];
        globalCode = this.collectTerminalBranch( terminal, nodesProcessed, globalCode );
    }

    return globalCode;
};

/**
 * Compiles the graph as a material function.
 * @returns {object} The return object. The success member indicates success, code will contain the compiled material and globalCode the global code necessary for the material.
 */

VG.Nodes.Graph.prototype.compileAsMaterial=function( { code = "", materialName = "material_1", generatePreview = function() {}, physicalBumps = false } = {} )
{
    var rc={ success : false, error : "" };

    // --- Get the global code and the material node

    let materialNode;

    // --- Locate the material node

    this.nodes.forEach(function(n) {
        if ( n.className === "NodeMaterial" )
            materialNode=n;
    } );

    if ( !materialNode ) {
        rc.globalCode = "";
        rc.code = "\nvoid " + materialName + "( in vec3 pos, inout Material material, inout vec3 normal ) {}\n";
        return rc;
    }

    let nodesProcessed=[];

    rc.globalCode = this.collectGlobals( materialNode, nodesProcessed );

    let options = {};
    options.code = "";
    options.globalCode = rc.globalCode;
    options.materialName = materialName;
    options.generatePreview = generatePreview;
    options.physicalBumps = physicalBumps;

    let variables = {};

    options.getVar=function( node, terminal, type ) {
        let rc={};
        rc.name = node.token + "_" + terminal;
        if ( variables[rc.name] ) {
            rc.exists = true;
            rc.code = rc.name;
        } else {
            variables[rc.name] = true;
            rc.code = type + " " + rc.name;
        }
        return rc;
    }.bind( this );

    let outTerminal=materialNode.getOutput( "out" );
    outTerminal.onCall( options );

    // console.log( options.code );

    rc.code = options.code;
    rc.success = true;

    return rc;
};
