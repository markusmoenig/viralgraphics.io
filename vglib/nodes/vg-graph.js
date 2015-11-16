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

// ----------------------------------------------------------------- VG.Nodes.Graph

VG.Nodes.Graph=function()
{
    /**
     * Creates a Node Graph.<br>
     * 
     * A node graph contains a list of nodes and provides convenient functions to load / save the graph.
     * 
     * @constructor
    */

	if ( !(this instanceof VG.Nodes.Graph ) ) return new VG.Nodes.Graph();

    /**The array of nodes (nodes are derived from VG.Nodes.Node) contained in this graph.
     * @member {array} */  
	this.nodes=new Map();

    this.idCounter=0;
    this.runCounter=-1;
};

VG.Nodes.Graph.prototype.addNode=function( node, customSetup )
{
    /**Adds the given node to this graph.
     * @param {VG.Nodes.Node} node - The node to add.
     */

    node.graph=this;

    if ( !node.data && !customSetup )
    {
        node.data={};

        Object.defineProperty( node.data, "node", { enumerable: false, writable: true } );

        while ( this.nodes.has( this.idCounter ) ) this.idCounter++;

        node.data.id=this.idCounter++;
        node.data.className=node.className;
        node.data.node=node;

        if ( node.createProperties ) 
            node.createProperties( node.data );
    }
    
    this.nodes.set( node.data.id, node );
};

VG.Nodes.Graph.prototype.createNode=function( className)
{
    /**Creates the node of the given class name and add it to this graph
     * @param {string} className - The name of the class.
     */

    var node=new VG.Nodes[className];

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

        if ( node.createProperties ) 
            node.createProperties( node.data );

        this.nodes.set( node.data.id, node );
        node.graph=this;

        return node;
    }

    return null;
};

VG.Nodes.Graph.prototype.getNodeFromId=function( id )
{
    /**Returns the node with the given id.
     * @param {number} id - The id of the node to return.
     * @returns The node associated with the given id.
     */

    if ( id === -1 ) return this.previewNode;
    else return this.nodes.get( id );
};

VG.Nodes.Graph.prototype.load=function( data, displaceImage )
{
    /**Loads the nodes of a compressed graph and returns the output terminal, i.e. the terminal which was connected to the preview node.
     * @param {string} data - The compressed data to load. 
     */

    var string=VG.Utils.decompressFromBase64( data );

    var obj=JSON.parse( string );
    var array=null;

    if ( obj instanceof Array ) array=obj;
    else if ( obj.nodes instanceof Array ) array=obj.nodes;

    if ( !array ) { VG.error( "Graph::load() could not find array."); return; }

    // --- Load the Nodes
    for ( var i=0; i < array.length; ++i )
    {
        var nodeData=array[i];

        Object.defineProperty( nodeData, "node", { 
            enumerable: false, 
            writable: true
        });

        nodeData.node=new VG.Nodes[nodeData.className];
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
    for( var i=0; i < array.length; ++i )
    {
        var nodeData=array[i];
        nodeData.node.readConnections( true );
    }

    return this.outputTerminal;
};

VG.Nodes.Graph.prototype.save=function()
{
    /**Saves the node data of this graph. This is very low level, in a GraphEdit environment this gets taken care of the node controller.
     * @returns {string} data - The compressed data
     */

     var arr=[];

    this.nodes.forEach(function(n) {
        arr.push( n.data );
    });
    var data=JSON.stringify( arr );
    data=VG.Utils.compressToBase64( data );

    return data;
};

VG.Nodes.Graph.prototype.update=function()
{
    /**Called when the graph has changed and the graph has to be rerun.
     */

    if ( this.updateCallback )
        this.updateCallback();
};

VG.Nodes.Graph.prototype.nodePropertyWillChange=function( param, data )
{
    if ( this.nodePropertyWillChangeCallback )
        this.nodePropertyWillChangeCallback( param, data );
};

VG.Nodes.Graph.prototype.clear=function( id )
{
    /**Clears the graph.
     */
    this.nodes.clear();

    this.idCounter=0;
    this.runCounter=-1;    
};

VG.Nodes.Graph.prototype.run=function( terminal, image, sizeVector )
{
    ++this.runCounter;

    var rc=null;

    var ms=Date.now();

    if ( terminal.type === VG.Nodes.Terminal.Type.Float )
    {
        rc=terminal.onCall();     
    } else 
    if ( terminal.type === VG.Nodes.Terminal.Type.String )
    {
        rc=terminal.onCall();
    } else 
    if ( terminal.type === VG.Nodes.Terminal.Type.Vector2 )
    {
        rc=terminal.onCall();
    } else     
    if ( terminal.type === VG.Nodes.Terminal.Type.Vector3 )
    {
        rc=terminal.onCall();
    } else        
    if ( terminal.type === VG.Nodes.Terminal.Type.Vector4 )
    {
        rc=terminal.onCall();
    } else        
    if ( terminal.type === VG.Nodes.Terminal.Type.Sample2D ) 
    {
        var vector=new VG.Math.Vector2();
		var callbreak = false;

        if ( sizeVector && sizeVector.x && sizeVector.y && ( sizeVector.x !== image.width || sizeVector.y !== image.height ) )
        {
            var width, height;

            var  aspectRatio=sizeVector.y / sizeVector.x;
            if ( image.width * aspectRatio > image.height )
            {
                width = image.height / aspectRatio < sizeVector.x ? image.height / aspectRatio : sizeVector.x;
            } else
            {
                width = image.width < sizeVector.x ? image.width : sizeVector.x;
            }
            height = Math.floor( aspectRatio * image.width );
              
            width=Math.floor( width );

            var wOffset=Math.floor( ( (image.width - width)/2 ) );
            var hOffset=Math.floor( ( (image.height - height)/2 ) );

            // --- Connected size input for preview, interpolate pixels for preview
            var x_ratio = sizeVector.x / width;//image.width;
            var y_ratio = sizeVector.y / height;//image.height; 

            for ( var h=0; h < height; h++ ) 
            {
                for ( var w=0; w < width; w++ ) 
                {
                    vector.set( Math.floor(w*x_ratio), Math.floor(h*y_ratio) );
                    rc=terminal.onCall( vector );
					if (!rc)
					{
						callbreak = true;
						break;
					}
                    image.setPixel( w + wOffset, h + hOffset, rc.r, rc.g, rc.b, rc.a );                    
                }
				if (callbreak)
					break;
            }
        } else
        {
            // --- No connected size input for preview, just use preview dimensions
            for( var h=0; h < image.height; ++h )
            {
                for( var w=0; w < image.width; ++w )
                {
                    vector.set( w, h );
                    rc=terminal.onCall( vector );
					if (!rc)
					{
						callbreak = true;
						break;
					}
                    image.setPixel( w, h, rc.r, rc.g, rc.b, rc.a );
                }
				if (callbreak)
					break;
            }
        }

        delete vector;
		image.needsUpdate=true;
        rc=image;
    } else
    if ( terminal.type === VG.Nodes.Terminal.Type.Texture ) 
    {
		var renderer = VG.Renderer();
		renderer.startPingPong(image.getRealWidth(), image.getRealHeight(), image.getWidth(), image.getHeight() );
		rc = terminal.onCall(image.getWidth(), image.getHeight(), image);
		if (rc)
			renderer.endPingPong(rc);
    } else
    if ( terminal.type === VG.Nodes.Terminal.Type.Material ) 
    {
        rc=terminal.onCall();
/*
        var vector=new VG.Math.Vector3();
        for( var h=0; h < image.height; ++h )
        {
            for( var w=0; w < image.width; ++w )
            {
                vector.set( w, h, 0 );
                rc=terminal.onCall( vector );
				if (!rc)
				{
					callbreak = true;
					break;
				}
                image.setPixel( w, h, rc.color.r, rc.color.g, rc.color.b, rc.color.a );
            }
			if (callbreak)
				break;
        }
        delete vector;
        image.needsUpdate=true;*/
    }     

    ms=Date.now() - ms;

    var obj={ output: rc, time: ms };

    if ( this.finishedCallback ) this.finishedCallback( obj );

    return obj;
};
