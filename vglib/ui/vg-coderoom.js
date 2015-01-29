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
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

VG.UI.CodeRoom=function( code )
{
    if ( !(this instanceof VG.UI.CodeRoom) ) return VG.UI.CodeRoom.creator( arguments );
    
    VG.UI.Widget.call( this );	
    this.name="CodeRoom";

    this.codeEdit=VG.UI.CodeEdit();
    if ( code ) this.codeEdit.text=code;

    this.startButton=VG.UI.Button( "Run" );
    this.startButton.clicked=this.start.bind( this );

    this.stopButton=VG.UI.Button( "Stop" );
    this.stopButton.clicked=this.stop.bind( this );
    this.stopButton.visible=false;

    this.controlLayout=VG.UI.Layout( this.startButton, this.stopButton );
    this.controlLayout.verticalExpanding=false;

    this.childWidgets=[];
    this.childWidgets.push( this.codeEdit );
    this.layout=this.controlLayout;

    this.runWidget=VG.UI.Widget();

	this.runContext={};
	this.runContext.imagePool=VG.Core.ImagePool();
	this.runContext.style=new VG.Styles.VisualGraphics();
	this.runContext.workspace=VG.UI.Workspace();
    this.runContext.workspace.canvas=VG.context.workspace.canvas;

    this.running=false;
};

VG.UI.CodeRoom.prototype=VG.UI.Widget();

VG.UI.CodeRoom.prototype.calcSize=function()
{
    var size=VG.Core.Size( 100, 100 );
    return size;
};

VG.UI.CodeRoom.prototype.stop=function()
{
	console.log( "Stop Script" );

	this.layout.removeChild( this.tempLayout );

	VG.context=null;
	VG.context=this.context;

    this.stopButton.visible=false;
	this.startButton.visible=true;
	this.codeEdit.visible=true;	
	this.runWidget.visible=false;

    this.running=false;

	VG.context.workspace.mouseDownWidget=0;
};

VG.UI.CodeRoom.prototype.start=function()
{
	console.log( "Starting Script" );

	vgMain=null;

	try {
		eval( this.codeEdit.text );
	} catch ( e ) {
		return;
	}

	this.context=VG.context;
	VG.context=this.runContext;

	vgMain.call( VG.context, VG.context.workspace );
	//VG.context.workspace.resize( this.context.workspace.rect.width, this.context.workspace.rect.height );

	VG.context=this.context;

	this.codeEdit.visible=false;
	this.runWidget.visible=true;
    this.stopButton.visible=true;
	this.startButton.visible=false;	
    this.running=true;	
};

VG.UI.CodeRoom.prototype.paintWidget=function( canvas )
{
    this.codeEdit.rect.set( this.rect );
    this.codeEdit.rect.height-=40;

    if ( !this.running ) {
    	this.codeEdit.paintWidget( canvas );
    } else
   	{
   		VG.context=this.runContext;

    	this.runWidget.rect.set( this.rect );
    	this.runWidget.rect.height-=40;
    	//this.runWidget.paintWidget( canvas );

    	VG.context.workspace.rect.set( this.runWidget.rect );
    	//VG.context.workspace.resize( this.runWidget.rect.width, this.runWidget.rect.height );
    	//VG.Renderer().onResize( this.runWidget.rect.width, this.runWidget.rect.height );

    	VG.context.workspace.paintWidget();

    	VG.context=this.context;
    	//VG.Renderer().onResize( VG.context.workspace.rect.width, VG.context.workspace.rect.height );

    	//VG.context.workspace.rect.set( this.rect );
    	//VG.context.workspace.resize( this.rect.width, this.rect.height );
    	//VG.context
   	}

    this.controlLayout.rect.set( this.rect );
    this.controlLayout.rect.y=this.codeEdit.rect.bottom();
    this.controlLayout.rect.height=40;
    this.controlLayout.layout( canvas );
};
