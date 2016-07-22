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

// -------------------------------------------------------------------- VG.Nodes.MaterialDialog

 VG.Nodes.MaterialDialog=function( graphData, callback )
{
    if ( !(this instanceof  VG.Nodes.MaterialDialog) ) return new ImportOBJDialog(  VG.Nodes.MaterialDialog );

    VG.UI.Dialog.call( this, "Material Dialog" );

    this.graph=VG.Nodes.Graph();

    var terminal, node;

    this.callback=callback;

    if ( graphData )
    {
        terminal=this.graph.load( graphData );
        node=terminal.node;
    }

    var screenRect=VG.context.workspace.getVisibleScreenRect();
    this.maximumSize.width=screenRect.width-100;
    this.maximumSize.height=screenRect.height-100;

    var containerEdit=VG.Nodes.ParamContainerEdit( node.container );
    this.previewWidget=new VG.Nodes.MaterialPreview();
    this.previewWidget.setMtlData( terminal.onCall() );

    var openOBJButton=VG.UI.Button( "Select OBJ..." );
    var openMTLButton=VG.UI.Button( "Add MTL..." );

    var leftLayout=VG.UI.Layout( openOBJButton, openMTLButton );
    leftLayout.vertical=true;

    this.tabWidget=VG.UI.TabWidget();

    this.layout=VG.UI.Layout( this.tabWidget );
    this.layout.margin.clear();

    this.simpleLayout=VG.UI.SplitLayout( leftLayout, 25, this.previewWidget, 50, containerEdit, 25 );
    this.simpleLayout.margin.clear();

    this.tabWidget.addItem( "Simple",  this.simpleLayout );

    this.addButton( "Close", function() { this.close( this ); }.bind( this ) );

    this.addButton( "Accept", function() {
        if ( this.callback ) this.callback( this.graph.save(), terminal.onCall() );
        this.close( this );
    }.bind( this ) );

    this.graph.updateCallback=function()
    {
        this.previewWidget.setMtlData( terminal.onCall() );
    }.bind( this );
};

 VG.Nodes.MaterialDialog.prototype=VG.UI.Dialog();

// -------------------------------------------------------------------- VG.Nodes.MaterialPreview

VG.Nodes.MaterialPreview=function()
{
    /** VG.Nodes.MaterialWidget provides a preview of a given Material
     */

    var oldInterval=VG.context.workspace.autoRedrawInterval;
    VG.UI.RenderWidget.call(this);
    VG.context.workspace.autoRedrawInterval=oldInterval;
    this.clearBackground=false;

    this.init();

    this.setupDefaultScene( this.context, this.scene);

    var mouseDown = false;

    var x = 0;
    var y = 0;

    var storedDelta = 0.001;

    this.mouseMove = function(e)
    {
        var dx = VG.Math.clamp(x - e.pos.x, -1, 1);
        var dy = VG.Math.clamp(y - e.pos.y, -1, 1);

        x = e.pos.x;
        y = e.pos.y;

        if (mouseDown)
        {
            this.camera.incRotation(90 * dx * storedDelta, 0, 0);

            //make sure we have a trace context
            if (this.context.traceContext)
            {
                /* whenever we move either the camera or geometry we have to set this to true 
                 * so the tracing starts from zero again. */
                this.context.traceContext.resetAccumulation = true;
            }
        } 
    }

    this.keyDown = function(e)
    {
        var scaleRatio = context.traceContext.scaleRatio;

        if (e == VG.Events.KeyCodes.One) context.traceContext.scaleRatio = 0.25;
        if (e == VG.Events.KeyCodes.Two) context.traceContext.scaleRatio = 0.50;
        if (e == VG.Events.KeyCodes.Three) context.traceContext.scaleRatio = 1.0;

        if (context.traceContext.scaleRatio != scaleRatio)
        {
            context.traceContext.resetAccumulation = true;
        }
    }

    this.mouseDown = function(e) { mouseDown = true; }
    this.mouseUp = function(e) { mouseDown = false; }

 
    this.render = function(delta)
    {
        storedDelta = delta;
        //TODO update aspect ratio on a resize callback not here / everyframe
        this.camera.aspect = this.rect.width / this.rect.height;
        this.camera.updateProjection();

        this.context.size2D.set(this.rect.width, this.rect.height);
        
        /* Draws the scene with the pipeline and the given render context */
        this.pipeline.drawScene(this.context, this.scene, delta);
    }
}

VG.Nodes.MaterialPreview.prototype = Object.create(VG.UI.RenderWidget.prototype);

VG.Nodes.MaterialPreview.prototype.init = function()
{
    var context = new VG.Render.Context();
    // camera
    this.camera = context.camera;
    this.camera.setProjection(60, this.rect.width / this.rect.height);
    this.camera.setRotation(0, 0, 0);
    this.camera.position.z = 9.0;
    this.camera.position.y = 0.0;

    //enable tracing
    context.trace = false;
    this.context=context;

    this.pipeline = new VG.Render.Pipeline();
    this.scene = new VG.Render.SceneManager();

    // --- Just a default, will be replaced anyway
    this.material = new VG.Render.MtlMaterial( { Ka : [ 0.5, 0.5, 0.5 ], Kd : [ 1, 1, 1 ], Ks : [ 1, 1, 1 ], Ns: 100, name : "white", illum : 2 } );
};

VG.Nodes.MaterialPreview.prototype.setupDefaultScene = function(context, scene)
{
    this.clearColor = new VG.Core.Color();

    // wall thickness
    var wt = 0.1;

    var lights = [
        {
            name: "global ambient light",
            color: {
                ambient: new VG.Core.Color(60, 60, 60)
            }
        },
        {
            name: "point light on ceiling",
            color: {
                ambient: new VG.Core.Color(60, 60, 60),
                diffuse: new VG.Core.Color(200, 200, 200),
                specular: new VG.Core.Color(200, 200, 200)
            },
            position: new VG.Math.Vector4( -0.7, 2, 6, 1),
            attenuation: {
                constant: 0.5,
                linear: 0.02,
                quadratic: 0.03
            }
        }
    ];
    context.lights = lights;

    // --- Object -- Should be sphere when we have it

    this.object = new VG.Render.SphereMesh(scene, 3, 40);
    //this.object.setGeometry(5, 5, 5);
    //this.object.setRotation( 45, 20, 0 );
    this.object.update();
    
    this.object.position.z = 0;
    this.object.position.y = 0;

    this.object.material=this.material;
    //VG.Render.MtlMaterial.recursiveCompile(this.object, context.lights);
}

VG.Nodes.MaterialPreview.prototype.setMtlData = function( mtl )
{
    this.material.opt=mtl;
    this.material.needsUpdate=true;
    //VG.Render.MtlMaterial.recursiveCompile(this.object, this.context.lights);    
};

// -------------------------------------------------------------------- VG.Nodes.MaterialWidget

VG.Nodes.MaterialWidget=function()
{ 
    if ( !(this instanceof VG.Nodes.MaterialWidget) ) return new VG.Nodes.MaterialWidget();

    VG.UI.Widget.call( this );

    this.materialPreview=new VG.Nodes.MaterialPreview();
    //this.materialWidget.setMtlData( this.object[this.dataName] );

    this.childWidgets=[ this.materialPreview ];

    this.materialPreview.mouseDoubleClick = function( event ) 
    {
        var dialog=new VG.Nodes.MaterialDialog( this.value, this.setMaterial.bind( this ) );
        VG.context.workspace.showWindow( dialog );
    }.bind( this );

};

VG.Nodes.MaterialWidget.prototype=VG.UI.Widget();

VG.Nodes.MaterialWidget.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.Nodes.MaterialWidget.prototype.valueFromModel=function( value )
{
    //console.log( "TextEdit.valueFromModel: " + value );

    //if ( value === null ) this.index=0;
    //else this.index=value;

    //if ( this.changed )
    //    this.changed( this.index, this.items[this.index], this );

    if ( value )
    {
        this.mtlData=VG.Utils.materialOutputFromGraph( value );
        this.materialPreview.setMtlData( this.mtlData );
    }
    this.value=value;
};

VG.Nodes.MaterialWidget.prototype.setMaterial=function( graphData, mtlData )
{
    this.value=graphData;
    this.mtlData=mtlData;
    this.materialPreview.setMtlData( this.mtlData );

    if ( this.collection && this.path )
        this.collection.storeDataForPath( this.path, graphData );  

    if ( this.changed ) this.changed( this );
};

VG.Nodes.MaterialWidget.prototype.paintWidget=function( canvas )
{    
    this.materialPreview.rect.copy( this.rect );
    this.materialPreview.paintWidget( canvas );
};