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

// ----------------------------------------------------------------- VG.Nodes.GraphEdit

VG.Nodes.GraphEdit=function( { readOnly = false, mapPreview = false, materialPreview = true, closeCallback } = {} )
{
    if ( !(this instanceof VG.Nodes.GraphEdit ) ) return new VG.Nodes.GraphEdit( { readOnly, mapPreview, materialPreview, closeCallback } );

    VG.UI.Widget.call( this );

    this.supportsFocus=true;
    this.nodePreviewRect = VG.Core.Rect( 0, 0, 158, 116 );

    var node;

    // --- DnD source
    this.graphView.addNodeAt=function( pos, className ) {
        node=new VG.Nodes[className]();

        this.addNode( node, false, pos );
    }.bind( this );

    this.nodeNameEdit=VG.UI.TextLineEdit();
    this.nodeNameEdit.disabled=true;
    this.nodeNameEdit.textChanged=function( text ) {
        var selected=this.controller.selected;
        selected.name=text;
    }.bind( this );

    this.nodeNameEditLayout=VG.UI.LabelLayout( "Name", this.nodeNameEdit );
    this.nodeNameEditLayout.margin.bottom=0;

    this.containerLayout=VG.UI.Layout();// this.nodeNameEditLayout );
    this.containerLayout.margin.set( 0, 0, 0, 0 );
    //this.containerLayout.title="Node Name and Settings";
    this.containerLayout.vertical=true;
    this.containerLayout.spacing=0;

    // --- Available Nodes

    this.dc=VG.Data.Collection( "Available Nodes" );
    this.dc.nodes=[];
    this.dc.terminals=[];

	this.availableNodes=VG.UI.ListWidget();
    this.availableNodes.setDragSourceId( "Node" );

    this.availableNodes.paintItemCallback=function( canvas, item, paintRect, selected ) {
        itemRect.copy( paintRect );
        itemRect.x+=7; itemRect.width-=7;
        canvas.drawTextRect( item.text, itemRect, VG.UI.stylePool.current.skin.ListWidget.TextColor, 0, 1 );
        itemRect.width-=7;
        canvas.drawTextRect( item.category, itemRect, VG.UI.stylePool.current.skin.ListWidget.TextColor, 2, 1 );
    }.bind( this );

    this.availableNodesController=this.availableNodes.bind( this.dc, "nodes" );

    // Filter

    this.availableNodesFilterEdit=VG.UI.TextLineEdit();
    this.availableNodesFilterEdit.textChanged=function( text, cont ) {
        this.nodesFilter( text, this.availableNodesFilterDD.text() );
    }.bind( this );

    this.availableNodesFilterDD=VG.UI.DropDownMenu();
    this.availableNodesFilterDD.changed=function( text ) {
        this.nodesFilter( this.availableNodesFilterEdit.text, this.availableNodesFilterDD.text() );
    }.bind( this );

    this.availableNodesFilterLayout=VG.UI.Layout( this.availableNodesFilterEdit, this.availableNodesFilterDD );
    this.availableNodesFilterLayout.margin.set( 2, 2, 2, 2 );

    this.availableNodesLayout=VG.UI.Layout( this.availableNodesFilterLayout, this.availableNodes );
    this.availableNodesLayout.title="Available Nodes";
    this.availableNodesLayout.margin.clear();
    this.availableNodesLayout.vertical=true;
    this.availableNodesLayout.spacing=0;

    this.nodesFilter=function( text, category ) {

        var array=this.dc.dataForPath( "nodes" );
        text=text.toLowerCase();

        // VG.log( text, category );

        for( var i=0; i < array.length; ++i )
        {
            var item=array[i];

            item.visible=true;
            if ( !item.text.toLowerCase().includes( text ) ) item.visible=false;
            if ( category !== "All" && item.category !== category ) item.visible=false;
        }

        VG.update();
        this.availableNodes.changed();

    }.bind( this );


   	this.availableNodes.mouseDoubleClick=function( event ) {
   		if ( this.availableNodesController.selected && this.availableNodesController.selected.className && this.controller.isValid() ) {
            node=new VG.Nodes[this.availableNodesController.selected.className]();
            this.addNode( node );
   		}
   	}.bind( this );

    this.parseAvailableNodes();

    // --- Available Terminals

    this.availableTerminals=VG.UI.ListWidget();
    this.availableTerminalsController=this.availableTerminals.bind( this.dc, "terminals" );

    var itemRect=VG.Core.Rect();
    this.availableTerminals.paintItemCallback=function( canvas, item, paintRect, selected ) {
        itemRect.copy( paintRect );

        itemRect.x+=4;
        itemRect.y+=3;
        itemRect.width=18;
        itemRect.height=18;

        canvas.draw2DShape( VG.Canvas.Shape2D.Circle, itemRect, this.graphView.getTerminalColor( item ) );

        itemRect.copy( paintRect );

        itemRect.x+=30;
        itemRect.width-=30;

        canvas.drawTextRect( item.text, itemRect, VG.UI.stylePool.current.skin.ListWidget.TextColor, 0, 1 );
    }.bind( this );

    this.availableTerminalsLayout=VG.UI.Layout( this.availableTerminals );
    this.availableTerminalsLayout.title="Terminals";
    this.availableTerminalsLayout.margin.clear();

    this.availableLayout=VG.UI.SplitLayout( this.previewWidget, 50, this.availableNodesLayout, 30, this.availableTerminalsLayout, 20 );
    this.availableLayout.margin.clear();
    this.availableLayout.vertical=true;

    var skin=VG.UI.stylePool.current.skin;

    let terminal={ text : "value (float - vec4)", type : VG.Nodes.Terminal.Type.Universal };
    this.availableTerminalsController.add( terminal );
    terminal={ text : "float", type : VG.Nodes.Terminal.Type.Float };
    this.availableTerminalsController.add( terminal );
    terminal={ text : "vec2", type : VG.Nodes.Terminal.Type.Vector2 };
    this.availableTerminalsController.add( terminal );
    terminal={ text : "vec3", type : VG.Nodes.Terminal.Type.Vector3 };
    this.availableTerminalsController.add( terminal );
    terminal={ text : "vec4", type : VG.Nodes.Terminal.Type.Vector4 };
    this.availableTerminalsController.add( terminal );
    terminal={ text : "material", type : VG.Nodes.Terminal.Type.Material };
    this.availableTerminalsController.add( terminal );
    terminal={ text : "function", type : VG.Nodes.Terminal.Type.Function };
    this.availableTerminalsController.add( terminal );

    // --- GraphParams

    this.graphEditButton=VG.UI.ToolButton("Edit Script...");
    this.graphEditButton.clicked=function() {

        var graphData=this.controller.collection.dataForPath( this.controller.path );

        if ( !graphData.graphParamsFunc )
        {
            graphData.graphParamsFunc="";
            graphData.graphParamsData={};
        }

        var dialog=new VG.Nodes.GraphParamsDialog( this, graphData );
        VG.context.workspace.showWindow( dialog );
    }.bind( this );

    this.graphEditWidget=VG.UI.Widget();

    //this.graphParamsLayout=VG.UI.Layout( this.graphEditWidget );
    //this.graphParamsLayout.vertical=true;

    this.emptyWidget=VG.UI.Widget();
    this.graphEditWidget.stackedLayout=VG.UI.StackedLayout( this.emptyWidget );

    this.graphEditWidget.layout=VG.UI.Layout( this.graphEditWidget.stackedLayout, VG.UI.LayoutVSpacer(), VG.UI.Layout( this.graphEditButton ) );
    this.graphEditWidget.layout.margin.clear();
    this.graphEditWidget.layout.vertical=true;

    this.graphEditWidget.paintWidget=function( canvas ) {
        this.layout.rect.copy( this.rect );
        this.layout.layout( canvas );
    }.bind( this.graphEditWidget );

    // ---

    // this.colorWidget=VG.Nodes.FragColorWidget( this.graph );

    // --- Material Layout
/*
    if ( mapPreview )
    {
        this.mapWidget=VG.UI.CodeEdit( "" );
        this.mapWidget.readOnly=true;

        this.middleLayout=VG.UI.SplitLayout( this.mapWidget, 40, this.graphView, 60 );
        this.middleLayout.margin.clear();
        this.middleLayout.vertical=true;
    } else
    if ( materialPreview ) {

        this.materialWidget=VG.Nodes.MaterialWidget( this.graph );

        var materialTypeDD=VG.UI.DropDownMenu( "Flat", "Plane", "Sphere" );
        materialTypeDD.changed=function( val ) {
            this.materialWidget.setType( val );
        }.bind( this );

        var animateLightCB=VG.UI.CheckBox();
        animateLightCB.changed=function( value ) {
            this.materialWidget.setAnimation( value );
        }.bind( this );

        var closeButton=VG.UI.ToolBarButton( "Close Editor" );
        closeButton.clicked=function() {
            closeCallback();
        }.bind( this );

        var materialTB = materialTB=VG.UI.ToolBar( materialTypeDD, VG.UI.Label( "  Animate Light" ), animateLightCB );
        if ( closeCallback ) {
            materialTB.addItem( VG.UI.LayoutHSpacer() );
            materialTB.addItem( closeButton );
        }
        //materialTB.layout.margin.top=materialTB.layout.margin.bottom=0;

        var materialLayout=VG.UI.Layout( materialTB, this.materialWidget );
        materialLayout.margin.clear();
        materialLayout.vertical=true;

        // --- Material Layout

        this.middleLayout=VG.UI.SplitLayout( materialLayout, 50, this.graphView, 50 );
        this.middleLayout.margin.clear();
        this.middleLayout.vertical=true;
    }
*/
    if ( !readOnly ) {
        // this.layout=VG.UI.Layout( this.graphView );

        this.layout=VG.UI.SplitLayout( this.availableLayout, 20, this.graphView, 80 );
        this.layout.margin.clear();
    } else {
        this.layout=VG.UI.Layout( this.middleLayout );
        this.layout.margin.clear();
    }

    this.frameType=VG.UI.Frame.Type.None;

    // --- Called when the Graph needs to be updated.
    this.graph.updateCallback=function() {

        // this.colorWidget.changed=true;

        // if ( this.materialWidget )
            // this.materialWidget.changed=true;

        if ( this.buildGraph )
            this.buildGraph();

        if ( this.graphUpdateCallback ) this.graphUpdateCallback();

    }.bind( this );

    this.minimumSize.width = 280;
};

VG.Nodes.GraphEdit.prototype=VG.UI.Widget();

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

                this.nodeNameEdit.disabled=true;
                this.nodeNameEdit.text="";
    		}

    		if ( node && node.container )
    		{
    			this.containerEdit=VG.Nodes.ParamContainerEdit( node.container );
    			this.containerLayout.addChild( this.containerEdit );
    		}

            if ( node ) {
                this.nodeNameEdit.disabled=false;
                this.nodeNameEdit.text=data.name;
            }

    	}.bind( this ), this );

	    this.controller.addObserver( "parentSelectionChanged", function() {
	    	// --- Resync nodes of Graph
	    	this.controller.syncGraph();

            // this.colorWidget.changed=true;

            if ( this.buildGraph )
                this.buildGraph();

	    }.bind( this ) );
/*
        this.controller.addObserver( "changed", function() {
            this.colorWidget.changed=true;
            this.materialWidget.changed=true;
        }.bind( this ) );*/

      	this.graphView.setController( this.controller );
        collection.addControllerForPath( this.controller, path );
    }

    return this.controller;
};

VG.Nodes.GraphEdit.prototype.parseAvailableNodes=function( node, noUndo )
{
    var categories=[];
    this.availableNodesFilterDD.clear();
    this.availableNodesFilterDD.addItem( "All" );

    this.dc.nodes=[];
    var folderIndex=[];

    // --- Insert all Nodes
    for (var key of VG.Nodes.availableNodes.keys() ) {
        var stringArray=String( key ).split( "." );
        var item={ text : stringArray[1], className : VG.Nodes.availableNodes.get( key ), category : stringArray[0] };
        this.availableNodesController.add( item, true );

        if ( !categories.includes( stringArray[0]) ) {
            this.availableNodesFilterDD.addItem( stringArray[0] );
            categories.push( stringArray[0] );
        }
    }

    function sort(a, b) {
        var nameA = a.text.toUpperCase(); // ignore upper and lowercase
        var nameB = b.text.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    }

    this.dc.nodes.sort( sort );
};

/**
 * Adds the given node to this graph.
 * @param {VG.Nodes.Node} node - The node to add.
 */

VG.Nodes.GraphEdit.prototype.addNode=function( node, noUndo, pos )
{
    this.graph.addNode( node );

    if ( pos ) {
        node.data.xPos=pos.x-this.graphView.rect.x;
        node.data.yPos=pos.y-this.graphView.rect.y;
    }
	if ( this.controller ) this.controller.add( node.data, noUndo );
};

VG.Nodes.GraphEdit.prototype.reload=function( canvas )
{
    this.controller.modelChanged( true );
};

VG.Nodes.GraphEdit.prototype.revalidate=function()
{
    var graphData=this.controller.collection.dataForPath( this.controller.path );
    this.applyGraphParams( graphData, graphData.graphParamsFunc );
};

VG.Nodes.GraphEdit.prototype.applyGraphParams=function( graphData, funcText )
{
    graphData.graphParamsFunc=funcText;

    this.graphSettingsLayout=undefined;
    createParams=undefined;

    try {
        if ( funcText ) {
            eval( funcText );
            if ( createParams ) {
                this.graphSettingsLayout=createParams( this.graph, graphData.graphParamsData );
            }
        }
    } catch ( e ) {
        VG.log( e.message );
    }

    if ( this.graphSettingsLayout )
    {
        this.graphEditWidget.stackedLayout.current=this.graphSettingsLayout;
    } else this.graphEditWidget.stackedLayout.current=this.emptyWidget;
};

VG.Nodes.GraphEdit.prototype.paintWidget=function( canvas )
{
    this.contentRect.copy( this.rect );

	this.layout.rect.copy( this.contentRect );
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
	this.graphOutput=null;

    // --- Called when a node property will change, initiate undo
    this.graph.nodePropertyWillChangeCallback=function( param, data ) {
    	if ( 1 )
    	{
            if ( param.data.className === "NodeMaterial" && param.name === "category" ) {
                // --- Material Node Category, set it to the graph

                let item = this.getGraphObject();

                item.category = data.newValue;
                item.previewStripNeedsUpdate = true;
            }

	    	if ( this.controller.collection && this.controller.collection.__vgUndo )
    	    	this.controller.collection.__vgUndo.controllerProcessedItem( this.controller, VG.Data.UndoItem.ControllerAction.NodeProperty, param.name,
    	    		this.controller.indexOf( param.data ), JSON.stringify( data ) );

            if ( this.nodePropertyChangedCallback )
                this.nodePropertyChangedCallback( param, data );
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
		"TerminalColor5" : VG.Core.Color( "#f175d0" ),

    	"TerminalConnectedColor" : VG.Core.Color( "#000000" ),
    };
};

VG.Nodes.GraphView.prototype=VG.UI.Widget();

VG.Nodes.GraphView.prototype.checkDragSourceItemId=function( pos, id, item )
{
    if ( id === "Node" ) return true;
};

VG.Nodes.GraphView.prototype.acceptDragSourceItem=function( pos, id, item )
{
    if ( this.addNodeAt ) this.addNodeAt( pos, item.className );
};

VG.Nodes.GraphView.prototype.setController=function( controller )
{
	this.controller=controller;
	this.controller.addObserver( "changed", function() { if ( this.graph.updateCallback ) { this.graph.updateCallback(); VG.update(); } }, this );
};

/**
 * Returns the data object for current graph.
 * @returns {object}
 */

VG.Nodes.GraphView.prototype.getGraphObject=function( controller )
{
    let graph = this.controller.collection.controllerForPath( this.controller.path.replace( ".graph", "" ) );
    if ( graph ) graph = graph.object._selected;
    return graph;
};

/**
 * Returns the canvas offset value for the current graph.
 * @returns {object}
 */

VG.Nodes.GraphView.prototype.getGraphCanvasOffset=function( controller )
{
    let graphObject = this.getGraphObject();
    if ( graphObject ) {
        if ( !graphObject.offset ) graphObject.offset = { x: 0, y : 0 };
        return graphObject.offset;
    }

    return { x: 0, y : 0 };
};

VG.Nodes.GraphView.prototype.drawNode=function( canvas, node )
{
    let skin = VG.UI.stylePool.current.skin;

	let nodeHeight = this.getNodeHeight( node );

	let selected = this.controller.selection.indexOf( node.data ) != -1;
    let workRect1 = this.workRect1, workRect2 = this.workRect2;

	if ( !node.rect ) node.rect=VG.Core.Rect();
	if ( !node.data.xPos ) { node.data.xPos=10; node.data.yPos=10; }

	workRect1.set( this.rect.x + node.data.xPos, this.rect.y + node.data.yPos, 158 * this.scale, nodeHeight.total * this.scale );
	node.rect.set( workRect1 );

    // --- Comment

    if ( node.data.comment ) {
	    skin.Nodes.Font.setSize( 18 * this.scale );
	    canvas.pushFont( skin.Nodes.Font );
        canvas.drawTextRect( "// " + node.data.comment, VG.Core.Rect( this.rect.x + node.data.xPos, this.rect.y + node.data.yPos - 22, 300, 20 * this.scale  ),
            skin.Nodes.TitleTextColor, 0, 1 );
        canvas.popFont();
    }

    // --- Outline

    if ( selected ) canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, workRect1.shrink(-1.5, -1.5), skin.Nodes.BorderColor );

    canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, workRect1, skin.Nodes.TopColor );

    // --- Title

	workRect2.set( workRect1.x + 2, workRect1.y + 1, workRect1.width - 4, 1 + 23 * this.scale );

	workRect2.x+=8 * this.scale; this.workRect2.width-=(8 + 8) * this.scale;

	skin.Nodes.Font.setSize( 12 * this.scale );
	canvas.pushFont( skin.Nodes.Font );
    canvas.drawTextRect( node.data.name, workRect2, skin.Nodes.TitleTextColor, 0, 1 );

    this.workRect2.set( workRect1.x, workRect1.y + 24 * this.scale, workRect1.width, 1 * this.scale );
	canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, workRect2, skin.Nodes.SeparatorColor );

    // --- Preview

	workRect1.set( this.rect.x + node.data.xPos, this.rect.y + node.data.yPos, 158 * this.scale, nodeHeight.total * this.scale );
    if ( !node.noPreview ) {
	    if ( !node.previewRect ) node.previewRect=VG.Core.Rect();

        node.previewRect.set( workRect1.x, workRect1.y + nodeHeight.total - 25 - 116 * this.scale, workRect1.width, 116 * this.scale );

        if ( node.image ) canvas.ctx.drawImage( node.image, node.previewRect.x, node.previewRect.y );
        else canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, node.previewRect, VG.Core.Color.Black );
    }

    // --- Body

	workRect1.y+=25 * this.scale; workRect1.height = nodeHeight.body * this.scale;
	canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, workRect1, skin.Nodes.BodyColor );

    // workRect2.x -= 3 * this.scale;
    // workRect2.x+=4 * this.scale;

    workRect2.x+=8 * this.scale;
    workRect2.y+=9 * this.scale; workRect2.width=12 * this.scale; workRect2.height=12 * this.scale;
	workRect1.set( workRect2 );

	workRect2.x+=15 * this.scale;
	workRect2.width=(158 - 2 - 2 * 15) * this.scale;

	let y=workRect1.y;
    let drawTerminalTexts = true;//node.noPreview;

	skin.Nodes.Font.setSize( 11 * this.scale );

    let i, t, color;
	for ( i=0; i < node.outputs.length; ++i )
	{
		t=node.outputs[i];
		color=this.getTerminalColor( t );

        if ( !node.noPreview ) {
            canvas.setAlpha( 0.8 );
		    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x + node.data.xPos, workRect1.y -2, 158, workRect2.height + 4 ), skin.Nodes.BodyColor );
            canvas.setAlpha( 1.0 );
        }

        // if ( !node.noPreview ) {
            // canvas.setAlpha( 0.5 );
		    // canvas.draw2DShape( VG.Canvas.Shape2D.Circle, workRect1.shrink( -2, -2 ), skin.Nodes.BodyColor );
            // canvas.setAlpha( 1.0 );
        // }
		// canvas.draw2DShape( VG.Canvas.Shape2D.Circle, workRect1.shrink( -1.5, -1.5 ), skin.Nodes.BodyColor );
		canvas.draw2DShape( VG.Canvas.Shape2D.Circle, workRect1, color );

		if ( !t.rect ) t.rect=VG.Core.Rect();
		t.rect.set( workRect1 );

        if ( drawTerminalTexts ) {
		    this.workRect2.y=workRect1.y;
    	    canvas.drawTextRect( t.name, workRect2, skin.Nodes.TerminalTextColor, 0, 1 );
        }

		workRect1.y+=(12 + 9) * this.scale;
	}

	workRect1.y=workRect2.y=y;
	workRect1.x=this.rect.x + node.data.xPos + (158 - 1 - 8 - 10) * this.scale;
	// workRect1.x=this.rect.x + node.data.xPos + (158 - 1 - 6) * this.scale;
	// workRect1.x=this.rect.x + node.data.xPos + (158 - 1 - 8) * this.scale;

	workRect2.x=workRect1.x - (5 * this.scale) - workRect2.width;

	for ( i=0; i < node.inputs.length; ++i )
	{
		t=node.inputs[i];

        if ( t.type === VG.Nodes.Terminal.Type.Universal && t.isConnected() )
            color=this.getTerminalColor( t.first() );
        else color=this.getTerminalColor( t );

        // if ( !node.noPreview ) {
            // canvas.setAlpha( 0.5 );
		    // canvas.draw2DShape( VG.Canvas.Shape2D.Circle, workRect1.shrink( -2, -2 ), skin.Nodes.BodyColor );
            // canvas.setAlpha( 1.0 );
        // }
        canvas.draw2DShape( VG.Canvas.Shape2D.Circle, workRect1, color );

		if ( !t.rect ) t.rect=VG.Core.Rect();
		t.rect.set( workRect1 );

        if ( drawTerminalTexts ) {
		    this.workRect2.y=this.workRect1.y;
    	    canvas.drawTextRect( t.name, workRect2, skin.Nodes.TerminalTextColor, 2, 1 );
        }

		workRect1.y+=(12 + 9) * this.scale;
	}

    // --- Bottom Custom Text

    workRect2.set( workRect1.x + 2, workRect1.y + nodeHeight.total - 25 * this.scale, 150, 23 * this.scale );

    if ( node.customTitle ) {
	    workRect2.set( this.rect.x + node.data.xPos + 8, this.rect.y + node.data.yPos + nodeHeight.total - 25, 150 * this.scale, 23 * this.scale );
        canvas.drawTextRect( node.customTitle, workRect2, skin.Nodes.TitleTextColor, 0, 1 );
    }

    canvas.popFont();
};

VG.Nodes.GraphView.prototype.getNodeHeight=function( node )
{
    let rc = {};

    rc.body = node.noPreview ? this.getNodeBodyHeight( node ) : 0;
	rc.total = 25 + rc.body + 25;
    if ( !node.noPreview ) rc.total+=116;

	return rc;
};

VG.Nodes.GraphView.prototype.getNodeBodyHeight=function( node )
{
	var inputHeight=9 + node.inputs.length * 12 + 7; if ( node.inputs.length ) inputHeight+=(node.inputs.length-1) * 9;
	var outputHeight=9 + node.outputs.length * 12 + 7; if ( node.outputs.length > 0 ) outputHeight+=(node.outputs.length-1) * 9;

	return Math.max( inputHeight, outputHeight );
};

VG.Nodes.GraphView.prototype.getTerminalColor=function( t )
{
    var skin=VG.UI.stylePool.current.skin;

	if ( t.type === VG.Nodes.Terminal.Type.Universal ) return VG.Core.Color.White;
	else
	if ( t.type === VG.Nodes.Terminal.Type.Float ) return skin.Nodes.FloatTerminalColor;
    else
	if ( t.type === VG.Nodes.Terminal.Type.Vector3 ) return skin.Nodes.Vector3TerminalColor;
    else
	if ( t.type === VG.Nodes.Terminal.Type.Vector2 ) return skin.Nodes.Vector2TerminalColor;
    else	// else
	//if ( t.type === VG.Nodes.Terminal.Type.String ) return this.style.TerminalColor2;
	// else
	// if ( t.type === VG.Nodes.Terminal.Type.Vector2 || t.type === VG.Nodes.Terminal.Type.Vector3 || t.type === VG.Nodes.Terminal.Type.Vector4 )
		// return skin.Nodes.VectorTerminalColor;
	// else
	if ( t.type === VG.Nodes.Terminal.Type.Material ) return skin.Nodes.MaterialTerminalColor;
	else
	if ( t.type === VG.Nodes.Terminal.Type.Texture ) return skin.Nodes.TextureTerminalColor;
	else
	if ( t.type === VG.Nodes.Terminal.Type.Function ) return skin.Nodes.TextureTerminalColor;

	return VG.Core.Color();
};

VG.Nodes.GraphView.prototype.mouseDown=function( event )
{
    if ( !this.graph ) return;

    var foundNode=false;
    this.connSourceTerminal=null;
    var i, t;

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

			for ( i=0; i < node.inputs.length; ++i )
			{
				t=node.inputs[i];

				if ( t.rect.contains( this.mousePos ) ) {
					this.connSourceTerminal=t;
				}
			}

			for ( i=0; i < node.outputs.length; ++i )
			{
				t=node.outputs[i];

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

    // --- If the clicked source terminal is an connected input, break the connection

    if ( this.connSourceTerminal && this.connSourceTerminal.input === true && this.connSourceTerminal.isConnected() )
    {
    	t=this.connSourceTerminal.connectedTo[0];

    	this.connSourceTerminal.disconnectFrom( t );

	    if ( this.controller.collection && this.controller.collection.__vgUndo )
	    {
	    	// --- Add the NodeDisconnect Undo

	    	var obj={ terminalName: this.connSourceTerminal.name, nodeId: this.connSourceTerminal.node.data.id,
	    		connTerminalName: t.name, connNodeId : t.node.data.id };

    	    this.controller.collection.__vgUndo.controllerProcessedItem( this.controller, VG.Data.UndoItem.ControllerAction.NodeDisconnect,
    	    	this.connSourceTerminal.node.data.id, this.controller.indexOf( this.connSourceTerminal.node.data ), JSON.stringify( obj ) );
    	}

    	this.connSourceTerminal=t;
    	this.connDestTerminal=null;

        if ( this.graph.updateCallback )
		  this.graph.updateCallback();
    }

    if ( !foundNode )
    {
    	this.controller.selected=null;
        this.canvasMoveStart = VG.Core.Point( event.pos );
        this.canvaOffsetStart = VG.Core.Point();

        let graphObject = this.getGraphObject();
        if ( graphObject )
        {
            if ( !graphObject.offset ) graphObject.offset = { x: 0, y : 0 };
            this.canvaOffsetStart.set( graphObject.offset.x, graphObject.offset.y );
        }
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

        if ( this.graph.updateCallback )
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

    var i, t;
	if ( this.connSourceTerminal )
	{
		this.connDestTerminal=null;
		// --- Check if there is a fitting dest terminal under the mouse pointer

	    for (var node of this.graph.nodes.values() )
    	{
    		if ( node !== this.connSourceTerminal.node && node.rect && node.rect.contains( this.mousePos ) )
    		{
				for ( i=0; i < node.inputs.length; ++i )
				{
					t=node.inputs[i];

					if ( t.rect.contains( this.mousePos ) && this.connSourceTerminal.canConnect( t ) ) {
						this.connDestTerminal=t;
					}
				}

				for ( i=0; i < node.outputs.length; ++i )
				{
					t=node.outputs[i];

					if ( t.rect.contains( this.mousePos ) && this.connSourceTerminal.canConnect( t ) ) {
						this.connDestTerminal=t;
					}
				}

    			break;
    		}
    	}

		VG.update();
	}

    if ( !this.controller.selected && this.mouseIsDown )
    {
        let graphObject = this.getGraphObject();
        if ( graphObject ) {
            if ( !graphObject.offset ) graphObject.offset = { x: 0, y : 0 };

            graphObject.offset.x = this.canvaOffsetStart.x + event.pos.x - this.canvasMoveStart.x;
            graphObject.offset.y = this.canvaOffsetStart.y + event.pos.y - this.canvasMoveStart.y;

            VG.update();
        }
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

VG.Nodes.GraphView.prototype.update=function()
{
    /*
    if ( this.previewNode.inputs[0].isConnected() )
    {
        var vector=undefined;

        if ( this.previewNode.inputs.length > 1 && this.previewNode.inputs[1].isConnected() )
            vector=this.previewNode.inputs[1].connectedTo[0].onCall();

        this.graphOutput=this.graph.run( this.previewNode.inputs[0].connectedTo[0], this.previewImage, vector );
        VG.update();
    }*/
};

VG.Nodes.GraphView.prototype.paintWidget=function( canvas )
{
    var rect=this.rect;
    var wrect=this.workRect1;

    var skin=VG.UI.stylePool.current.skin;

    canvas.pushClipRect( this.rect );

    // --- Grid

    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, skin.Nodes.BackColor );

    let offset = this.getGraphCanvasOffset();

    var i;
    wrect.width=1; wrect.height=rect.height;
    for ( i=rect.x + skin.Nodes.GridSize/2 + offset.x % skin.Nodes.GridSize; i < rect.right(); i+=skin.Nodes.GridSize ) {
        wrect.x=i; wrect.y=rect.y;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, wrect, skin.Nodes.BackLineColor );
    }

    wrect.height=1; wrect.width=rect.width;
    for ( i=rect.y + skin.Nodes.GridSize/2 + offset.y % skin.Nodes.GridSize; i < rect.bottom(); i+=skin.Nodes.GridSize ) {
        wrect.x=rect.x; wrect.y=i;
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, wrect, skin.Nodes.BackLineColor );
    }

    // --- Check if Controller has Content

    if ( !this.controller.isValid() ) {
        canvas.popClipRect();
        return;
    }

    if ( offset ) {
        rect.x += offset.x;
        rect.y += offset.y;
    }

    // --- Nodes

    if ( this.graph )
    {
        let arr = Array.from( this.graph.nodes.values() ).reverse();
	    for (let node of arr ) {
    		this.drawNode( canvas, node );
    	}
    }

    // --- Connections

    var originX, originY;
    var destX, destY;

    if ( this.graph )
    {
    	for (var node1 of this.graph.nodes.values() )
    	{
    		for ( var o=0; o < node1.outputs.length; ++o )
    		{
    			var ot=node1.outputs[o];

    			originX=ot.rect.x + 5;
    			originY=ot.rect.y + 5;

    			for ( var c=0; c < ot.connectedTo.length; ++c )
    			{
	    			var it=ot.connectedTo[c];

    				destX=it.rect.x + 5;
    				destY=it.rect.y + 5;

    				canvas.drawCurve( originX, originY, originX - 80, originY, destX + 80, destY, destX, destY, 2.5, 60, this.getTerminalColor( ot ) );
/*
    				var conSize=4; var conOffset=(12-conSize)/2;

    				this.workRect1.set( ot.rect );
    				this.workRect1.x+=conOffset; this.workRect1.y+=conOffset; this.workRect1.width=conSize; this.workRect1.height=conSize;
    				canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, this.style.TerminalConnectedColor );

    				this.workRect1.set( it.rect );
    				this.workRect1.x+=conOffset; this.workRect1.y+=conOffset; this.workRect1.width=conSize; this.workRect1.height=conSize;
    				canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, this.style.TerminalConnectedColor );*/
    			}
    		}
    	}
    }

    // --- Connection preview

    if ( this.connSourceTerminal )
    {
        originX=this.connSourceTerminal.rect.x + 5;
        originY=this.connSourceTerminal.rect.y + 5;

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
            canvas.drawCurve( originX, originY, originX - 80, originY, destX + 80, destY, destX, destY, 2.5, 60, color );
        else canvas.drawCurve( destX, destY, destX - 80, destY, originX + 80, originY, originX, originY, 2.5, 60, color );

        if ( this.connDestTerminal )
        {
            /*
            var conSize=4; var conOffset=(12-conSize)/2;

            this.workRect1.set( this.connSourceTerminal.rect );
            this.workRect1.x+=conOffset; this.workRect1.y+=conOffset; this.workRect1.width=conSize; this.workRect1.height=conSize;
            canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, this.style.TerminalConnectedColor );

            this.workRect1.set( this.connDestTerminal.rect );
            this.workRect1.x+=conOffset; this.workRect1.y+=conOffset; this.workRect1.width=conSize; this.workRect1.height=conSize;
            canvas.draw2DShape( VG.Canvas.Shape2D.Circle, this.workRect1, this.style.TerminalConnectedColor );*/
        }
    }

	canvas.popClipRect();
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

// -------------------------------------------------------------------- VG.Nodes.FragColorWidget

VG.Nodes.FragColorWidget=function( graph )
{
    if ( !(this instanceof VG.Nodes.FragColorWidget ) ) return new VG.Nodes.FragColorWidget( graph );

    VG.UI.Widget.call( this );
    this.graph=graph;

    this.changed=true;
    this.shaderIsValid=false;

    this._mainRT = VG.Renderer().mainRT;

    // --- Shader

    this.shader=new VG.Shader();
    this.shader.depthWrite = true;
    this.shader.depthTest = true;

    this.shader.vSource=[
        "#version 100",
        "precision mediump float;",
        "attribute vec4 aPosition;",
        "attribute vec2 aTexCoord;",

        "varying vec2 vTexCoord;",

        "void main() {",
        "   vTexCoord = vec2(aTexCoord.x, 1.0-aTexCoord.y);",
        "   gl_Position = aPosition;",
        "}", ""
    ].join('\n');

    // --- GPU Frame Buffer

    this.bufferSize=18;

    this.buffer=new VG.GPUBuffer( VG.Type.Float, this.bufferSize, true );
    this.bufferDB = this.buffer.getDataBuffer();
    this.buffer.create();
};

VG.Nodes.FragColorWidget.prototype=VG.UI.Widget();

VG.Nodes.FragColorWidget.prototype.createFrame = function(x, y, w, h, b)
{
    var vw = w;
    var vh = h;

    var x1 = (x - vw / 2) / (vw / 2);
    var y1 = (vh / 2 - y) / (vh / 2);
    var x2 = ((x + w) - vw / 2) / (vw / 2);
    var y2 = (vh / 2 - (y + h)) / (vh / 2);

    var i = 0;
    var db=b.getDataBuffer();

    db.set(i++, x1); db.set(i++, y1); db.set(i++, 0.0); db.set(i++, 1.0);
    db.set(i++, x1); db.set(i++, y2); db.set(i++, 0.0); db.set(i++, 0.0);
    db.set(i++, x2); db.set(i++, y1); db.set(i++, 1.0); db.set(i++, 1.0);
    db.set(i++, x2); db.set(i++, y2); db.set(i++, 1.0); db.set(i++, 0.0);

    b.update();

    return b;
};

VG.Nodes.FragColorWidget.prototype.buildShader=function()
{
    this.shaderIsValid=false;

    var fSource=[
        "#version 100",
        "precision mediump float;\n",

        "varying vec2 vTexCoord;\n",
    ].join('\n');

    var rc=this.graph.compile();

    // VG.log( rc.success, rc.error, rc.globalCode, rc.mainCode );

    if ( rc.success )
    {
        VG.log( "success" );

        fSource+=rc.globalCode;

        fSource+="void main() {\n";
        fSource+=rc.mainCode;

        fSource+="  " + rc.resultNode.resultVar + " = valVec4;\n";
        fSource+="}\n";

        this.shader.fSource=fSource;

        VG.log( this.shader.fSource );

        try {
            this.shader.create();
        } catch( err )
        {
            return;
        }

        this.shaderIsValid=true;
    } else VG.log( rc.error );
};

VG.Nodes.FragColorWidget.prototype.paintWidget=function( canvas )
{
    if ( this.changed )
    {
        this.buildShader();
        this.changed=false;
    }

    if ( this.shaderIsValid )
    {
        var rect=this.rect;

        this.createFrame( 0, 0, rect.width, rect.height, this.buffer );

        var b = this.buffer;
        var shader = this.shader;

        shader.bind();
        b.bind();

        var stride = b.getStride();

        b.vertexAttrib(shader.getAttrib("aPosition"), 2, false, stride * 4, 0);
        b.vertexAttrib(shader.getAttrib("aTexCoord"), 2, false, stride * 4, stride * 2);

        this._mainRT.setViewport( rect );
        b.drawBuffer( VG.Renderer.Primitive.TriangleStrip, 0,  4 );
        this._mainRT.setViewport(VG.context.workspace.rect);
    }
};

// -------------------------------------------------------------------- ShapeUploadDialog

VG.Nodes.GraphParamsDialog=function( graphEditor, graphData )
{
    VG.UI.Dialog.call( this, "Graph Parameters Dialog" );

    var codeEdit=VG.UI.CodeEdit( graphData.graphParamsFunc );

    this.layout=VG.UI.Layout( codeEdit );

    this.addButton( "Close", function() { this.close( this ); }.bind( this ) );
    this.addButton( "Apply", function() {
        graphEditor.applyGraphParams( graphData, codeEdit.text );
        this.close( this );
    }.bind( this ) );
};

VG.Nodes.GraphParamsDialog.prototype=VG.UI.Dialog();

// -------------------------------------------------------------------- VG.Nodes.NodeEditorDialog

 VG.Nodes.NodeEditorDialog=function( title, nodeEditor, callback )
{
    if ( !(this instanceof  VG.Nodes.NodeEditorDialog) ) return new NodeEditorDialog(  nodeEditor, graphData, callback );

    VG.UI.Dialog.call( this, title );

    var screenRect=VG.context.workspace.getVisibleScreenRect();
    this.maximumSize.width=screenRect.width-50;
    this.maximumSize.height=screenRect.height-100;

    this.layout=VG.UI.Layout( nodeEditor );
    this.layout.margin.clear();

    this.addButton( "Close", function() {
        if ( callback ) callback();
        this.close( this );
    }.bind( this ) );

    this.addButton( "Accept", function() {
        if ( callback ) {
            nodeEditor.text=nameEdit.text;
            callback( true, name );
        }
        this.close( this );
    }.bind( this ) );

    this.buttonLayout.insertChildAt( 0, VG.UI.Label( "Graph Name:") );

    var nameEdit=VG.UI.TextLineEdit( nodeEditor.text );
    //this.nodeEditorNameEdit.font=VG.Font.Font( "Open Sans Semibold", 13 );
    nameEdit.maximumSize.width=200;
    nameEdit.toolTip="Name of the Graph.";

    this.buttonLayout.insertChildAt( 1, nameEdit );
};

 VG.Nodes.NodeEditorDialog.prototype=VG.UI.Dialog();
