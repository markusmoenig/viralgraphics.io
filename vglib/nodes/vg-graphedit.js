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

// ----------------------------------------------------------------- VG.Nodes.GraphEdit

VG.Nodes.GraphEdit=function( customWidget, customWidgetSpace )
{	
    if ( !(this instanceof VG.Nodes.GraphEdit ) ) return new VG.Nodes.GraphEdit( customWidget, customWidgetSpace );

    VG.UI.Frame.call( this );

    this.supportsFocus=true;
    this.graph=VG.Nodes.Graph();

    this.graphView=VG.Nodes.GraphView( this.graph );

    this.containerLayout=VG.UI.Layout();
    this.containerLayout.margin.set( 0, 0, 0, 0 );

    // --- Available Nodes

    this.dc=VG.Data.Collection( "Available Nodes" );
    this.dc.nodes=[];

	this.availableNodes=VG.UI.TreeWidget();
    this.availableNodesController=this.availableNodes.bind( this.dc, "nodes" );

    NodeFolder=function( name, open )
	{    
    	this.text=name;
    	this.children=[];
    	this.open=open;
    };

    Node=function( name, className )
	{    
    	this.text=name;
    	this.className=className;
    };

   	this.availableNodes.mouseDoubleClick=function( event ) {
   		if ( this.availableNodesController.selected && this.availableNodesController.selected.className ) {
            var node=new VG.Nodes[this.availableNodesController.selected.className];
            this.addNode( node );
   		}
   	}.bind( this );

    var folderIndex=[];
    this.availableNodesController.add( "", new NodeFolder( "Available Nodes", true ), true );

    // --- Get all Folders
    for (var key of VG.Nodes.availableNodes.keys() )
    {
        var stringArray=String( key ).split( "." );

        if ( stringArray.length >1 && folderIndex.indexOf( stringArray[0] ) === -1 )
        {
        	var f=new NodeFolder( stringArray[0], false );
		    this.availableNodesController.add( "0", f, true );

        	folderIndex.push( stringArray[0] );
        }
    }   

	// --- Insert all Nodes
    for (var key of VG.Nodes.availableNodes.keys() )
    {
        var stringArray=String( key ).split( "." );

        if ( stringArray.length > 1 )
        {
        	var index=folderIndex.indexOf( stringArray[0] );

        	var f=new Node( stringArray[1], VG.Nodes.availableNodes.get(key) );
		    this.availableNodesController.add( "0." + index, f, true );
        } else
        {
        	var f=new Node( stringArray[0], VG.Nodes.availableNodes.get(key) );
		    this.availableNodesController.add( "0", f, true );        	
        }
    } 

    // ---

    this.dockLayout=VG.UI.SplitLayout( this.containerLayout, 70, this.availableNodes, 30 );
    this.dockLayout.vertical=true;
    this.dockLayout.margin.clear();

    if ( !customWidget && !customWidgetSpace )
        this.layout=VG.UI.SplitLayout( this.graphView, 80, this.dockLayout, 20 );
    else
    {
        this.customLayout=VG.UI.SplitLayout( this.graphView, 100-customWidgetSpace, customWidget, customWidgetSpace );
        this.customLayout.margin.clear();
        this.customLayout.vertical=true;
        this.layout=VG.UI.SplitLayout( this.customLayout, 80, this.dockLayout, 20 );        
    }
    this.layout.margin.clear();

    this.frameType=VG.UI.Frame.Type.None;
};

VG.Nodes.GraphEdit.prototype=VG.UI.Frame();

VG.Nodes.GraphEdit.prototype.bind=function( collection, path )
{
    this.controller=collection.controllerForPath( path );
    if ( !this.controller ) {
        this.controller=VG.Controller.Node( collection, path, this.graph );

    	this.controller.addObserver( "selectionChanged", function() {

    		var data=this.controller.selected;
    		var node=null;

    		if ( data && data.node ) node=data.node;

    		if ( this.containerEdit ) {
    			this.containerLayout.removeChild( this.containerEdit );
    			this.containerEdit=null;
    		}

    		if ( node && node.container )
    		{
    			this.containerEdit=VG.Nodes.ParamContainerEdit( node.container );
    			this.containerLayout.addChild( this.containerEdit );
    		}

    	}.bind( this ), this );

	    this.controller.addObserver( "parentSelectionChanged", function() {
	    	// --- Resync nodes of Graph
	    	this.controller.syncGraph();
	    }.bind( this ) );

      	this.graphView.setController( this.controller );
        collection.addControllerForPath( this.controller, path );
    }

    //this.controller.addObserver( "changed", this.changed, this );    
    //this.controller.addObserver( "selectionChanged", this.selectionChanged, this );

    return this.controller;
};

VG.Nodes.GraphEdit.prototype.addNode=function( node, noUndo )
{
    /**Adds the given node to this graph.
     * @param {VG.Nodes.Node} node - The node to add.
     */

    this.graph.addNode( node );
	if ( this.controller ) this.controller.add( node.data, noUndo );
};

VG.Nodes.GraphEdit.prototype.getOutputTerminal=function( node )
{
	if ( this.graphView.previewNode.inputs[0].isConnected() )
	{
		return this.graphView.previewNode.inputs[0].connectedTo[0];
	} else return null;
};

VG.Nodes.GraphEdit.prototype.paintWidget=function( canvas )
{
	VG.UI.Frame.prototype.paintWidget.call( this, canvas );

	this.layout.rect.set( this.contentRect );
	this.layout.layout( canvas );
};

// ----------------------------------------------------------------- VG.Nodes.GraphView

VG.Nodes.GraphView=function( graph )
{	
    if ( !(this instanceof VG.Nodes.GraphView ) ) return new VG.Nodes.GraphView( graph );

    VG.UI.Widget.call( this );

    this.supportsFocus=true;
    this.supportsAutoFocus=true;

	this.workRect1=VG.Core.Rect();
	this.workRect2=VG.Core.Rect();

    this.graph=graph;

    this.mousePos=VG.Core.Point();
    this.dragOffset=VG.Core.Point();
    this.dragging=false;
    this.dragNode=null;

    this.connSourceTerminal=null;
    this.connDestTerminal=null;

	this.scale=1.0;

	this.previewNode=VG.Nodes.Node();
    this.previewNode.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Universal, "in", null, function( t ) {
    	// --- onConnect, if connected to a Sample2D terminal add the size terminal

    	if ( t.type === VG.Nodes.Terminal.Type.Sample2D )
			this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector2, "size" ) );

    }.bind( this.previewNode ), function( t ) {
    	// --- onDisconnect, if it exists, remove the size Terminal

    	var sizeTerminal=this.getInput( "size" );
    	if ( sizeTerminal ) this.removeInput( sizeTerminal );

    }.bind( this.previewNode ) ) );

    this.previewNode.data={ id : -1, xPos : 600, yPos : 300 };
	this.previewNode.rect=VG.Core.Rect( 0, 0, 200, 200 );
	this.previewImage=VG.Core.Image( 200, 200 );

	this.graph.previewNode=this.previewNode;

	this.graphOutput=null;

    // --- Called when the Graph needs to be updated.
    this.graph.updateCallback=function() {
    	if ( this.previewNode.inputs[0].isConnected() )
    	{
    		var vector=undefined;

 			if ( this.previewNode.inputs.length > 1 && this.previewNode.inputs[1].isConnected() )
 				vector=this.previewNode.inputs[1].connectedTo[0].onCall();

    		this.graphOutput=this.graph.run( this.previewNode.inputs[0].connectedTo[0], this.previewImage, vector );
    		VG.update();
    	}
    }.bind( this );

    // --- Called when a node property will change, initiate undo
    this.graph.nodePropertyWillChangeCallback=function( param, data ) {
    	if ( 1 )
    	{
	    	if ( this.controller.collection && this.controller.collection.__vgUndo ) 
    	    	this.controller.collection.__vgUndo.controllerProcessedItem( this.controller, VG.Data.UndoItem.ControllerAction.NodeProperty, param.name, 
    	    		this.controller.indexOf( param.data ), JSON.stringify( data ) );
    	}
    }.bind( this );

    this.style={
    	"BorderColor" : VG.Core.Color( "#45505A" ),
    	"SelectedBorderColor" : VG.Core.Color( "#4859b1" ),
    	"TitleGradient1" : VG.Core.Color( "#3f4b57" ),
    	"TitleGradient2" : VG.Core.Color( "#505c68" ),
    	"SelectedTitleGradient1" : VG.Core.Color( "#5c6bc6" ),
    	"SelectedTitleGradient2" : VG.Core.Color( "#6d7cd7" ),
    	"TitleFont" : VG.Font.Font( "Roboto Regular", 12 ),
    	"TitleTextColor" : VG.Core.Color( "#ffffff" ),
    	"SeparatorColor" : VG.Core.Color( "#273747" ),    	
    	"BodyColor" : VG.Core.Color( "#4a545e" ),  
    	"TerminalColor0" : VG.Core.Color( "#ffffff" ),
    	"TerminalColor1" : VG.Core.Color( "#da649d" ),
    	"TerminalColor2" : VG.Core.Color( "#ee804a" ),
    	"TerminalColor3" : VG.Core.Color( "#6775d0" ),
    	"TerminalColor4" : VG.Core.Color( "#f1c200" ),

    	"TerminalConnectedColor" : VG.Core.Color( "#000000" ),
    };
};

VG.Nodes.GraphView.prototype=VG.UI.Widget();

VG.Nodes.GraphView.prototype.setController=function( controller )
{
	this.controller=controller;
	this.controller.addObserver( "changed", function() { this.graph.updateCallback(); VG.update(); }, this );	
};

VG.Nodes.GraphView.prototype.drawNode=function( canvas, node )
{   
	var nodeHeight=this.getNodeHeight( node );
	var selected=this.controller.selection.indexOf( node.data ) != -1;

	if ( !node.rect ) node.rect=VG.Core.Rect();
	if ( !node.data.xPos ) { node.data.xPos=10; node.data.yPos=10; }

	this.workRect1.set( this.rect.x + node.data.xPos, this.rect.y + node.data.yPos, 158 * this.scale, nodeHeight * this.scale );
	node.rect.set( this.workRect1 );

	if ( !selected ) canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, this.workRect1, this.style.BorderColor );
	else canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, this.workRect1, this.style.SelectedBorderColor );

	this.workRect2.set( this.workRect1.x + 1, this.workRect1.y + 1, this.workRect1.width - 2, 23 * this.scale );

	if ( !selected ) canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect2, this.style.TitleGradient1, this.style.TitleGradient2 );	
	else canvas.draw2DShape( VG.Canvas.Shape2D.VerticalGradient, this.workRect2, this.style.SelectedTitleGradient1, this.style.SelectedTitleGradient2 );	

	this.workRect2.x+=8 * this.scale; this.workRect2.width-=(8 + 8) * this.scale;

	this.style.TitleFont.setSize( 12 * this.scale );
	canvas.pushFont( this.style.TitleFont );
    canvas.drawTextRect( node.name, this.workRect2, this.style.TitleTextColor, 0, 1 );	

	this.workRect2.set( this.workRect1.x + 1 * this.scale, this.workRect1.y + 24 * this.scale, this.workRect1.width - 2 * this.scale, 1 * this.scale );    
	canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect2, this.style.SeparatorColor );

	this.workRect1.y+=25 * this.scale; this.workRect1.x+=1 * this.scale; this.workRect1.width-=2 * this.scale; this.workRect1.height-=27 * this.scale;
	canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect1, this.style.BodyColor );	

	this.workRect2.x+=8 * this.scale; this.workRect2.y+=9 * this.scale; this.workRect2.width=12 * this.scale; this.workRect2.height=12 * this.scale;
	this.workRect1.set( this.workRect2 );

	this.workRect2.x+=15 * this.scale;
	this.workRect2.width=(158 - 2 - 2 * 15) * this.scale;

	var y=this.workRect1.y;

	this.style.TitleFont.setSize( 11 * this.scale );

	for ( var i=0; i < node.inputs.length; ++i )
	{
		var t=node.inputs[i];
		var color=this.getTerminalColor( t );

		canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, color );

		if ( !t.rect ) t.rect=VG.Core.Rect();
		t.rect.set( this.workRect1 );

		this.workRect2.y=this.workRect1.y;
    	canvas.drawTextRect( t.name, this.workRect2, this.style.TitleTextColor, 0, 1 );	

		this.workRect1.y+=(12 + 9) * this.scale;
	}

	this.workRect1.y=this.workRect2.y=y;
	this.workRect1.x=this.rect.x + node.data.xPos + (158 - 1 - 8 - 10) * this.scale;

	this.workRect2.x=this.workRect1.x - (5 * this.scale) - this.workRect2.width;

	for ( var i=0; i < node.outputs.length; ++i )
	{
		var t=node.outputs[i];
		var color=this.getTerminalColor( t );

		canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, color );

		if ( !t.rect ) t.rect=VG.Core.Rect();
		t.rect.set( this.workRect1 );

		this.workRect2.y=this.workRect1.y;
		//VG.log( t.name, this.workRect2.toString() );
    	canvas.drawTextRect( t.name, this.workRect2, this.style.TitleTextColor, 2, 1 );	

		this.workRect1.y+=(12 + 9) * this.scale;
	}	

    canvas.popFont();	
};

VG.Nodes.GraphView.prototype.drawPreviewNode=function( canvas, node )
{   
	this.workRect1.set( this.rect.x + node.data.xPos, this.rect.y + node.data.yPos, node.rect.width * this.scale, node.rect.height * this.scale );
	node.rect.set( this.workRect1 );

	canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, this.workRect1, this.style.BorderColor );

	// --- Node Connection

	this.workRect2.set( this.workRect1.x + 8, this.workRect1.y + 6, 12, 12 );

	var it=node.inputs[0];

	if ( !it.rect ) it.rect=VG.Core.Rect();
	it.rect.set( this.workRect2 );

	if ( !it.isConnected() ) canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect2, this.style.TerminalColor0 );
    else
    {
		var color=this.getTerminalColor( it.connectedTo[0] );
    	canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect2, color );
    }

    // --- Separator
	this.workRect2.set( this.workRect1.x + 1 * this.scale, this.workRect1.y + 24 * this.scale, this.workRect1.width - 2 * this.scale, 1 * this.scale );    
	canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.workRect2, this.style.SeparatorColor );

	// --- Title Text
	this.workRect2.set( this.workRect1.x + 1, this.workRect1.y + 1, this.workRect1.width - 2, 23 * this.scale );
	this.workRect2.x+=(8 + 15) * this.scale; this.workRect2.width-=(8 + 8) * this.scale;

	// --- Preview Rect
	this.workRect1.set( this.rect.x + node.data.xPos + 1, this.rect.y + node.data.yPos + 25, node.rect.width-2, node.rect.height - 25 - 2);
	if ( this.previewImage.width !== this.workRect1.width || this.previewImage.height !== this.workRect1.height )
		this.previewImage=VG.Core.Image( this.workRect1.width, this.workRect1.height );

	var text="";

	if ( !node.inputs[0].isConnected() ) text="Preview: Not Connected";
	else
	{
		var connTerminal=node.inputs[0].connectedTo[0];

		var precision=2;

		if ( connTerminal.type === VG.Nodes.Terminal.Type.Universal ) text="Universal";
		else if ( connTerminal.type === VG.Nodes.Terminal.Type.Float )
		{
			text="Preview: Float";

			if ( this.graphOutput )
			{
				this.style.TitleFont.setSize( 14 * this.scale );
				canvas.pushFont( this.style.TitleFont );
    			canvas.drawTextRect( String( parseFloat(this.graphOutput.output).toFixed(precision) ), this.workRect1, this.getTerminalColor( connTerminal ), 1, 1 );
    			canvas.popFont(); 			
    		}
		} else 
		if ( connTerminal.type === VG.Nodes.Terminal.Type.String ) 
		{
			text="String";
		} else 
		if ( connTerminal.type === VG.Nodes.Terminal.Type.Vector2 ) 
		{
			text="Preview: Vector2";

			if ( this.graphOutput )
			{
				this.style.TitleFont.setSize( 14 * this.scale );
				canvas.pushFont( this.style.TitleFont );
    			canvas.drawTextRect( "(" + String( parseFloat(this.graphOutput.output.x).toFixed(precision) ) + "," +  String( parseFloat(this.graphOutput.output.y).toFixed(precision) ) + ")", 
    				this.workRect1, this.getTerminalColor( connTerminal ), 1, 1 );
    			canvas.popFont(); 			
    		}			
		} else 		
		if ( connTerminal.type === VG.Nodes.Terminal.Type.Vector3 ) 
		{
			text="Preview: Vector3";

			if ( this.graphOutput )
			{
				this.style.TitleFont.setSize( 14 * this.scale );
				canvas.pushFont( this.style.TitleFont );
    			canvas.drawTextRect( "(" + String( parseFloat(this.graphOutput.output.x).toFixed(precision) ) + "," +  String( parseFloat(this.graphOutput.output.y).toFixed(precision) ) 
    				+ "," + String( parseFloat(this.graphOutput.output.z).toFixed(precision) ) + ")", this.workRect1, this.getTerminalColor( connTerminal ), 1, 1 );
    			canvas.popFont(); 			
    		}			
		} else 	
		if ( connTerminal.type === VG.Nodes.Terminal.Type.Vector4 ) 
		{
			text="Preview: Vector4";

			if ( this.graphOutput )
			{
				this.style.TitleFont.setSize( 14 * this.scale );
				canvas.pushFont( this.style.TitleFont );
    			canvas.drawTextRect( "(" + String( parseFloat(this.graphOutput.output.x).toFixed(precision) ) + "," + String( parseFloat(this.graphOutput.output.y).toFixed(precision) ) + "," 
    				+ String( parseFloat(this.graphOutput.output.z).toFixed(precision) ) + "," + String( parseFloat(this.graphOutput.output.w).toFixed(precision) ) + ")", this.workRect1, this.getTerminalColor( connTerminal ), 1, 1 );
    			canvas.popFont(); 			
    		}			
		} else 	
		if ( connTerminal.type === VG.Nodes.Terminal.Type.Sample2D ) 
		{
			text="Preview: Sample2D";

			if ( this.graphOutput )
				canvas.drawImage( this.workRect1.pos(), this.graphOutput.output );

			// --- Draw the optional input terminals

			if ( node.inputs.length > 1 )
			{
				this.style.TitleFont.setSize( 12 * this.scale );
				canvas.pushFont( this.style.TitleFont );	

				this.workRect1.x+=8 * this.scale; this.workRect1.y+=9 * this.scale; this.workRect1.height=12 * this.scale;
				this.workRect1.width=12 * this.scale;
				var y=this.workRect1.y;

				for( var i=1; i < node.inputs.length; ++i )
				{
					var t=node.inputs[i];
					var color=this.getTerminalColor( t );

					this.workRect1.x-=4; this.workRect1.width=15 * this.scale + canvas.getTextSize( t.name ).width + 8;
					this.workRect1.y-=4; this.workRect1.height+=8;
					canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, this.workRect1, VG.Core.Color( 0, 0, 0, 160 ) );
					this.workRect1.x+=4; this.workRect1.width=12 * this.scale;
					this.workRect1.y+=4; this.workRect1.height-=8;
					
					canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, color );

					if ( !t.rect ) t.rect=VG.Core.Rect();
					t.rect.set( this.workRect1 );

					this.workRect1.x+=15 * this.scale;
					this.workRect1.width=(158 - 2 - 2 * 15) * this.scale;		

	    			canvas.drawTextRect( t.name, this.workRect1, this.style.TitleTextColor, 0, 1 );	
	    		}
	    		canvas.popFont();
	    	}
		} else
		if ( connTerminal.type === VG.Nodes.Terminal.Type.Material ) 
		{
			text="Preview: Material";

			// --- Fake Preview

			if ( this.graphOutput )
			{
				canvas.drawImage( this.workRect1.pos(), this.graph.outputImage );

				this.style.TitleFont.setSize( 14 * this.scale );
				canvas.pushFont( this.style.TitleFont );

				this.workRect1.y=this.rect.y + node.data.yPos + 25;
				this.workRect1.height=14 * this.scale + 2 * this.scale;

    			canvas.drawTextRect( "Specular: " + String( parseFloat(this.graphOutput.output.specular).toFixed(precision) ), this.workRect1, this.getTerminalColor( connTerminal ), 0, 1 );
				this.workRect1.y+=this.workRect1.height;    			
    			canvas.drawTextRect( "Glossiness: " + String( parseFloat(this.graphOutput.output.glossiness).toFixed(precision) ), this.workRect1, this.getTerminalColor( connTerminal ), 0, 1 );
				this.workRect1.y+=this.workRect1.height;    			
    			canvas.drawTextRect( "Normal: " + String( parseFloat(this.graphOutput.output.normal.x).toFixed(precision) ) + ", " +
    				String( parseFloat(this.graphOutput.output.normal.y).toFixed(precision) ) + ", " +
    				String( parseFloat(this.graphOutput.output.normal.z).toFixed(precision) ),
					this.workRect1, this.getTerminalColor( connTerminal ), 0, 1 );
				this.workRect1.y+=this.workRect1.height;    			    			
    			canvas.drawTextRect( "Luminosity: " + String( parseFloat(this.graphOutput.output.luminosity.x).toFixed(precision) ) + ", " +
    				String( parseFloat(this.graphOutput.output.luminosity.y).toFixed(precision) ) + ", " +
    				String( parseFloat(this.graphOutput.output.luminosity.z).toFixed(precision) ),
					this.workRect1, this.getTerminalColor( connTerminal ), 0, 1 );
				this.workRect1.y+=this.workRect1.height;    			    			
    			canvas.drawTextRect( "Reflect: " + String( parseFloat(this.graphOutput.output.reflect.x).toFixed(precision) ) + ", " +
    				String( parseFloat(this.graphOutput.output.reflect.y).toFixed(precision) ) + ", " +
    				String( parseFloat(this.graphOutput.output.reflect.z).toFixed(precision) ),
					this.workRect1, this.getTerminalColor( connTerminal ), 0, 1 );

    			canvas.popFont();
			}
		}	
	}
	
	this.style.TitleFont.setSize( 12 * this.scale );
	canvas.pushFont( this.style.TitleFont );	
    canvas.drawTextRect( text, this.workRect2, this.style.TitleTextColor, 0, 1 );
    canvas.popFont();    
};

VG.Nodes.GraphView.prototype.getNodeHeight=function( node )
{ 
	var height=25 + this.getNodeBodyHeight( node );

	return height;
};

VG.Nodes.GraphView.prototype.getNodeBodyHeight=function( node )
{ 
	var inputHeight=9 + node.inputs.length * 12 + 7; if ( node.inputs.length ) inputHeight+=(node.inputs.length-1) * 9;
	var outputHeight=9 + node.outputs.length * 12 + 7; if ( node.outputs.length > 0 ) outputHeight+=(node.outputs.length-1) * 9;

	return Math.max( inputHeight, outputHeight );
};

VG.Nodes.GraphView.prototype.getTerminalColor=function( t )
{ 
	if ( t.type === VG.Nodes.Terminal.Type.Universal ) return this.style.TerminalColor0;
	else	
	if ( t.type === VG.Nodes.Terminal.Type.Float ) return this.style.TerminalColor1;
	else
	if ( t.type === VG.Nodes.Terminal.Type.String ) return this.style.TerminalColor2;
	else
	if ( t.type === VG.Nodes.Terminal.Type.Vector2 || t.type === VG.Nodes.Terminal.Type.Vector3 || t.type === VG.Nodes.Terminal.Type.Vector4 ) 
		return this.style.TerminalColor3;
	else		
	if ( t.type === VG.Nodes.Terminal.Type.Sample2D || t.type === VG.Nodes.Terminal.Type.Sample3D ) return this.style.TerminalColor4;	
	else
	if ( t.type === VG.Nodes.Terminal.Type.Material ) return this.style.TerminalColor2;

	return VG.Core.Color();
};

VG.Nodes.GraphView.prototype.mouseDown=function( event )
{
    if ( !this.graph ) return;

    var foundNode=false;
    this.connSourceTerminal=null;

    for (var node of this.graph.nodes.values() )    
    {
    	if ( node.rect && node.rect.contains( this.mousePos ) )
    	{
			foundNode=true;

    		this.dragOffset.set( this.mousePos.x - node.rect.x, this.mousePos.y - node.rect.y );

    		if ( this.dragOffset.y < 25 * this.scale ) {
    			this.dragging=true;
    			this.dragNode=node;

    			VG.update();
    		}

			for ( var i=0; i < node.inputs.length; ++i )
			{
				var t=node.inputs[i];

				if ( t.rect.contains( this.mousePos ) ) {
					this.connSourceTerminal=t;
				}
			}

			for ( var i=0; i < node.outputs.length; ++i )
			{
				var t=node.outputs[i];

				if ( t.rect.contains( this.mousePos ) ) {
					this.connSourceTerminal=t;
				}
			}

    		if ( node !== this.controller.selected )
    		{
    			this.controller.selected=node.data;
    		}

    		if ( this.controller.selection.indexOf( node.data ) === -1 )
    		{
    			this.controller.addToSelection( node.data );
    			VG.update();
    		}

    		break;
    	}
    }

    if ( foundNode === false && this.previewNode.rect.contains( this.mousePos ) ) {
		foundNode=true;

    	//this.selected=this.previewNode;
    	//if ( this.currentNodeChanged ) this.currentNodeChanged( this.current );

		for ( var i=0; i < this.previewNode.inputs.length; ++i )
		{
			var t=this.previewNode.inputs[i];

			if ( t.rect.contains( this.mousePos ) )
					this.connSourceTerminal=t;
		}

		if ( !this.connSourceTerminal )
		{
    		this.dragging=true;
    		this.dragNode=this.previewNode;

    		this.dragOffset.set( this.mousePos.x - this.previewNode.rect.x, this.mousePos.y - this.previewNode.rect.y );
		}
    }

    // --- If the clicked source terminal is an connected input, break the connection

    if ( this.connSourceTerminal && this.connSourceTerminal.input === true && this.connSourceTerminal.isConnected() )
    {
    	var t=this.connSourceTerminal.connectedTo[0];

    	this.connSourceTerminal.disconnectFrom( t );

	    if ( this.controller.collection && this.controller.collection.__vgUndo )
	    {
	    	// --- Add the NodeDisconnect Undo

	    	var obj={ terminalName: this.connSourceTerminal.name, nodeId: this.connSourceTerminal.node.data.id, 
	    		connTerminalName: t.name, connNodeId : t.node.data.id };

    	    this.controller.collection.__vgUndo.controllerProcessedItem( this.controller, VG.Data.UndoItem.ControllerAction.NodeDisconnect, 
    	    	this.connSourceTerminal.node.data.id, this.controller.indexOf( this.connSourceTerminal.node.data ), JSON.stringify( obj ) );
    	}

    	if ( this.previewTerminalChangedCallback && this.connSourceTerminal.node.data.id === -1  && this.connSourceTerminal.node.inputs.indexOf( this.connSourceTerminal ) === 0 )
    		this.previewTerminalChangedCallback( null );

    	if ( this.previewTerminalChangedCallback && t.node.data.id === -1 && t.node.inputs.indexOf( t ) === 0)
    		this.previewTerminalChangedCallback( null );    	

    	this.connSourceTerminal=t;
    	this.connDestTerminal=null;

		this.graph.updateCallback();
    }

    if ( !foundNode ) 
    {
    	this.controller.selected=null;
    }

    this.mouseIsDown=true;
};

VG.Nodes.GraphView.prototype.mouseUp=function( event )
{
    this.mouseIsDown=false;
    this.dragging=false;
    this.dragNode=null;

    if ( this.connSourceTerminal && this.connDestTerminal )
    {
    	// --- Connect the two terminals.
    	this.connSourceTerminal.connectTo( this.connDestTerminal );

	    if ( this.controller.collection && this.controller.collection.__vgUndo )
	    {
	    	// --- Add the NodeConnect Undo

	    	var obj={ terminalName: this.connSourceTerminal.name, nodeId: this.connSourceTerminal.node.data.id, 
	    		connTerminalName: this.connDestTerminal.name, connNodeId : this.connDestTerminal.node.data.id };

    	    this.controller.collection.__vgUndo.controllerProcessedItem( this.controller, VG.Data.UndoItem.ControllerAction.NodeConnect, 
    	    	this.connSourceTerminal.node.data.id, this.controller.indexOf( this.connSourceTerminal.node.data ), JSON.stringify( obj ) );
    	}

    	if ( this.previewTerminalChangedCallback && this.connSourceTerminal.node.data.id === -1  && this.connSourceTerminal.node.inputs.indexOf( this.connSourceTerminal ) === 0 )
    		this.previewTerminalChangedCallback( this.connDestTerminal );

    	if ( this.previewTerminalChangedCallback && this.connDestTerminal.node.data.id === -1 && this.connDestTerminal.node.inputs.indexOf( this.connDestTerminal ) === 0)
    		this.previewTerminalChangedCallback( this.connSourceTerminal );

		this.graph.updateCallback();
    }

   	this.connSourceTerminal=null;
   	this.connDestTerminal=null;    
};

VG.Nodes.GraphView.prototype.mouseMove=function( event )
{
	this.mousePos.set( event.pos );

	if ( this.dragNode && this.dragging ) {
		this.dragNode.data.xPos=this.mousePos.x - this.dragOffset.x - this.rect.x;
		this.dragNode.data.yPos=this.mousePos.y - this.dragOffset.y - this.rect.y;

		VG.update();
	}

	if ( this.connSourceTerminal )
	{
		this.connDestTerminal=null;
		// --- Check if there is a fitting dest terminal under the mouse pointer

	    for (var node of this.graph.nodes.values() )    
    	{
    		if ( node !== this.connSourceTerminal.node && node.rect && node.rect.contains( this.mousePos ) )
    		{
				for ( var i=0; i < node.inputs.length; ++i )
				{
					var t=node.inputs[i];

					if ( t.rect.contains( this.mousePos ) && this.connSourceTerminal.canConnect( t ) ) {
						this.connDestTerminal=t;
					}
				}

				for ( var i=0; i < node.outputs.length; ++i )
				{
					var t=node.outputs[i];

					if ( t.rect.contains( this.mousePos ) && this.connSourceTerminal.canConnect( t ) ) {
						this.connDestTerminal=t;
					}
				}

    			break;
    		}
    	}

    	if ( !this.connDestTerminal )
    	{
			for ( var i=0; i < this.previewNode.inputs.length; ++i )
			{
				var t=this.previewNode.inputs[i];

				if ( t !== this.connSourceTerminal && t.rect.contains( this.mousePos ) && this.connSourceTerminal.canConnect( t ) )
					this.connDestTerminal=t;
			}    		
    	}

		VG.update();		
	}
};

VG.Nodes.GraphView.prototype.keyDown=function( keyCode, keysDown )
{
	if ( keyCode == VG.Events.KeyCodes.Backspace )
    {
    	if ( this.controller.selected ) 
    		this.controller.remove( this.controller.selected );
    }
 };

VG.Nodes.GraphView.prototype.paintWidget=function( canvas )
{   
    var rect=this.rect;

    canvas.setClipRect( this.rect );

    // --- Background

    if ( !this.bgImage ) this.bgImage=VG.Utils.getImageByName( "nodes_bg.jpg" );
    if ( this.bgImage ) {

    	var pt=VG.Core.Point( rect.x, rect.y );

   		for( ; pt.y < rect.bottom(); pt.y+=this.bgImage.height ) {
   			pt.x=rect.x;
    		for( ; pt.x < rect.right(); pt.x+=this.bgImage.width )
				canvas.drawImage( pt, this.bgImage );
		}
    }

    // --- Nodes

    if ( this.graph ) 
    {
	    for (var node of this.graph.nodes.values() )    
    	{
    		this.drawNode( canvas, node );
    	}
    }

    this.drawPreviewNode( canvas, this.previewNode );

    // --- Connections

    if ( this.graph ) 
    {
    	for (var node of this.graph.nodes.values() )    
    	{
    		for ( var o=0; o < node.outputs.length; ++o )
    		{
    			var ot=node.outputs[o];

    			var originX=ot.rect.x + 5;
    			var originY=ot.rect.y + 5;

    			for ( var c=0; c < ot.connectedTo.length; ++c )
    			{
	    			var it=ot.connectedTo[c];

    				var destX=it.rect.x + 5;
    				var destY=it.rect.y + 5;

    				canvas.drawCurve( originX, originY, originX + 80, originY, destX - 80, destY, destX, destY, 2.5, 60, this.getTerminalColor( ot ) );

    				var conSize=4; var conOffset=(12-conSize)/2;

    				this.workRect1.set( ot.rect );
    				this.workRect1.x+=conOffset; this.workRect1.y+=conOffset; this.workRect1.width=conSize; this.workRect1.height=conSize;
    				canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, this.style.TerminalConnectedColor );

    				this.workRect1.set( it.rect );
    				this.workRect1.x+=conOffset; this.workRect1.y+=conOffset; this.workRect1.width=conSize; this.workRect1.height=conSize;
    				canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, this.style.TerminalConnectedColor );    				
    			}
    		}
    	}
    }

    // --- Connection preview

    if ( this.connSourceTerminal )
    {
    	var originX=this.connSourceTerminal.rect.x + 5;
    	var originY=this.connSourceTerminal.rect.y + 5;

    	var destX;
    	var destY;

    	var color;

    	if ( !this.connDestTerminal )
    	{
    		color=this.getTerminalColor( this.connSourceTerminal );

    		destX=this.mousePos.x;
    		destY=this.mousePos.y;
    	} else
    	{
    		// --- Adjust Universal terminal color to switch to color of the potential new connection

    		if ( this.connSourceTerminal.type !== VG.Nodes.Terminal.Type.Universal ) color=this.getTerminalColor( this.connSourceTerminal );
    		else
    		{ 
    			color=this.getTerminalColor( this.connDestTerminal );
    			canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.connSourceTerminal.rect, color );
    		}

    		if ( this.connDestTerminal.type === VG.Nodes.Terminal.Type.Universal )
    			canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.connDestTerminal.rect, this.getTerminalColor( this.connSourceTerminal ) );


    		destX=this.connDestTerminal.rect.x + 5;
    		destY=this.connDestTerminal.rect.y + 5;
    	}

    	if ( this.connSourceTerminal.output )
    		canvas.drawCurve( originX, originY, originX + 80, originY, destX - 80, destY, destX, destY, 2.5, 60, color );
    	else canvas.drawCurve( destX, destY, destX + 80, destY, originX - 80, originY, originX, originY, 2.5, 60, color );

    	if ( this.connDestTerminal )
    	{
    		var conSize=4; var conOffset=(12-conSize)/2;

    		this.workRect1.set( this.connSourceTerminal.rect );
    		this.workRect1.x+=conOffset; this.workRect1.y+=conOffset; this.workRect1.width=conSize; this.workRect1.height=conSize;
    		canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, this.style.TerminalConnectedColor );

    		this.workRect1.set( this.connDestTerminal.rect );
    		this.workRect1.x+=conOffset; this.workRect1.y+=conOffset; this.workRect1.width=conSize; this.workRect1.height=conSize;
    		canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, this.style.TerminalConnectedColor );       		
    	}
    }

	canvas.setClipRect();
};

// --------------------- Clipboard

VG.Nodes.GraphView.prototype.clipboardCopyIsAvailable=function()
{
    if ( this.controller.selected ) return "Nodes";
    else return null;
};

VG.Nodes.GraphView.prototype.clipboardPasteIsAvailableForType=function( type )
{
    if ( type === "Nodes" ) return true;
    return false;
};

VG.Nodes.GraphView.prototype.clipboardCut=function()
{
    VG.copyToClipboard( "Nodes", JSON.stringify( this.controller.selected ) );
    if ( this.controller.selected ) this.controller.remove( this.controller.selected );
};

VG.Nodes.GraphView.prototype.clipboardCopy=function()
{
    VG.copyToClipboard( "Nodes", JSON.stringify( this.controller.selected ) );
};

VG.Nodes.GraphView.prototype.clipboardPaste=function()
{
	var data=JSON.parse( VG.clipboardPasteDataForType( "Nodes" ) );
	data.id=this.graph.idCounter++;
	data.connections={};

	this.controller.add( data );
};

VG.Nodes.GraphView.prototype.clipboardDeleteSelection=function()
{
    if ( this.controller.selected ) this.controller.remove( this.controller.selected );
};

// --------------------- Clipboard End
