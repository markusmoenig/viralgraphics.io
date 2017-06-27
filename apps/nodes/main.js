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

function vgMain( workspace, argc, arg )
{
    this.dc=VG.Data.Collection( "MainData" );
    this.dc.materials=[];

    // --- For the background material renderer
    this.renderOptions = {};
    this.renderer = new VG.Nodes.MaterialRenderer();
    this.rendererGraph = VG.Nodes.Graph();

    // --- Register the Data Collection for automated Undo / Redo and Open / Save operations
    this.workspace.registerDataCollection( this.dc, VG.UI.DataCollectionRole.UndoRedoRole, "addressbook" );

    // --- Register New Callback, called when the DataModel needs to be cleared
    this.workspace.registerCallback( VG.UI.CallbackType.New, function () {
    }.bind( this ) );

    // --- Register LoggedStateChanged Callback
    VG.context.workspace.registerCallback( VG.UI.CallbackType.LoggedStateChanged, function( logged, name, id, isAppAdmin ) {

        if ( logged ) {
            this.userName=name;
            this.userId=id;
        }

        if ( isAppAdmin )
            this.projectDockWidget.materialListWidget.addAdminSpecific();

    }.bind( this ) );


    // --- Register Undo / Redo Callback, called to indicate an Undo/Redo action was performed, we just use it to update the StatusBar Message.
    //this.workspace.registerCallback( VG.UI.CallbackType.UndoRedo, setToolbarMessage.bind( this ) );

    // --- Editor

    this.editor=new VG.Nodes.MaterialEdit();
    this.controller=this.editor.bind( this.dc, "materials.graph" );

    // --- Dock Widget

    this.dockWidget=VG.UI.DockWidget( "Available Graphs" );
    workspace.addDockWidget( this.dockWidget, VG.UI.DockWidgetLocation.Right, 25 );

    // --- Project Dock Widget

    this.projectDockWidget=new ProjectDockWidget( this.editor );
    this.dockWidget.addItem( this.projectDockWidget );

    // ---

    workspace.content = this.editor;

    // ---

    workspace.createDecoratedToolBar();
    //workspace.addQuickMenuItem( "" );
    //var renderQuickItem=workspace.addQuickMenuItem( "RENDER", function() { renderButton.clicked(); renderQuickItem.text=renderButton.text; }.bind( this ) );
    //renderQuickItem.disabled=renderButton.disabled;

    workspace.statusBar=VG.UI.StatusBar();
}