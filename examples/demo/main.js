function vgMain( workspace, args, argc )
{
    // --- The main data collection, register it for undo / redo
    this.dc = VG.Data.Collection( "MainData" );
    this.dc.shapes = [];

    workspace.registerDataCollection( this.dc, VG.UI.DataCollectionRole.UndoRedoRole );

    workspace.registerCallback( VG.UI.CallbackType.New, () => {
        // --- On new just clear the shapes and call the newProject function
        this.dc.shapes = [];
        dockShapes.newProject();
    } );

    // --- Dock

    let dockShapes = new DockShapes( this.dc );

    let dockWidget = new VG.UI.DockWidget( this.dc );
    dockWidget.text = "Shapes";
    dockWidget.addItem( dockShapes );

    workspace.addDockWidget( dockWidget, "Right", 25 );

    // --- Editor
    let editor = new Editor( this.dc );

    // --- Decorated ToolBar and StatusBar
    let decoratedToolBar = workspace.createDecoratedToolBar();
    workspace.statusBar = new VG.UI.StatusBar();

    // --- Set the workspace content
    workspace.content = editor;
}
