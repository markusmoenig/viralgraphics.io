
function vgMain( workspace, argc, arg )
{
    this.dc=VG.Data.Collection( "MainData" );
    this.dc.nodes=[];

    // --- Register the Data Collection for automated undo / redo and open / save operations
    this.workspace.registerDataCollection( this.dc, VG.UI.DataCollectionRole.LoadSaveRole | VG.UI.DataCollectionRole.UndoRedoRole );
    // --- Register Callbacks
    this.workspace.registerCallback( VG.UI.CallbackType.New, function() {
        this.dc.nodes=[];
    }.bind( this ) );

    // --- Menubar
    var menubar=VG.UI.Menubar();
    workspace.addMenubar( menubar );

    this.fileMenu=VG.Utils.addDefaultFileMenu( menubar );
    this.editMenu=VG.Utils.addDefaultEditMenu( menubar );
    this.nodesMenu=menubar.addMenu( "Nodes" );
    this.viewMenu=VG.Utils.addDefaultViewMenu( menubar );

    for (var key of VG.Nodes.availableNodes.keys() )
    {
        //var stringArray=String( key ).split( "." );

        var menuItem=new VG.UI.MenuItem( key, null, function() {

            var node=new VG.Nodes[this.className];

            VG.context.editor.addNode( node );
            VG.update();
        } );

        menuItem.className=VG.Nodes.availableNodes.get(key);

        this.nodesMenu.addMenuItem( menuItem );
    }

    // --- Toolbar
    var toolbar=VG.UI.Toolbar();
    workspace.addToolbar( toolbar );

    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.New );
    toolbar.addItem( VG.UI.ToolSeparator() );
    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.Open );
    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.SaveAs );
    toolbar.addItem( VG.UI.ToolSeparator() );
    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.Undo );
    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.Redo ); 

    // ---

    workspace.statusbar=VG.UI.Statusbar();

    this.editor=VG.Nodes.GraphEdit();
    this.nodeController=this.editor.bind( this.dc, "nodes" );

    this.editor.graph.finishedCallback=function( output ) {
        workspace.statusbar.message( "Rendered in " + output.time + "ms, count " + this.editor.graph.runCounter + ".", 2000 );
    }.bind( this );

    workspace.content=VG.UI.Layout( this.editor );
    workspace.content.margin.set( 0, 0, 0, 0 );
}
