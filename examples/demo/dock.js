// --- Dock

DockShapes = class DockShapes extends VG.UI.Widget
{
    constructor( dc )
    {
        super();

        this.listWidget = new VG.UI.ListWidget();
        this.controller = this.listWidget.bind( dc, "shapes" );
        this.controller.undoObjectName = "Shape";

        this.layout = VG.UI.SplitLayout( this.listWidget, 30, new ShapeSettings( dc ), 70 );
        this.layout.vertical = true;
        this.layout.margin.clear();

        this.newProject();
    }

    newProject()
    {
        let defaultItem = { text: "Default Shape", pos: [100, 100], size: 200, color: "#ffffff" };
        this.controller.add( defaultItem, true ); // Add the default item without undo
        this.controller.selected = defaultItem;
    }

    paintWidget( canvas )
    {
        this.layout.rect.copy( this.rect );
        this.layout.layout( canvas );
    }
};

// --- ShapeSettings

ShapeSettings = class ShapeSettings extends VG.UI.Widget
{
    constructor( dc )
    {
        super();

        // --- Position and Shape

        let posEdit = new VG.UI.Vector2Edit( 100, 100, 1, 2000 );
        posEdit.bind( dc, "shapes.pos" );

        let sizeSlider = new VG.UI.Slider( { min : 1, max : 400, step : 1, editable : true } );
        sizeSlider.changed = ( value ) => VG.update(); // update UI with every change
        sizeSlider.bind( dc, "shapes.size" );

        let labelLayout1 = new VG.UI.LabelLayout( "Position", posEdit, "Size", sizeSlider );

        // --- Color

        let colorEdit = new VG.UI.ColorEdit();
        colorEdit.bind( dc, "shapes.color" );
        colorEdit.changed = ( value ) => VG.update(); // update UI with every change

        let labelLayout2 = new VG.UI.LabelLayout( "Color", colorEdit );

        // ---

        let snapperWidget = new VG.UI.SnapperWidget();
        snapperWidget.addItem( "Position and Shape", labelLayout1, true );
        snapperWidget.addItem( "Color", labelLayout2, true );

        this.layout = new VG.UI.Layout( snapperWidget );
        this.layout.margin.clear();
    }

    paintWidget( canvas )
    {
        this.layout.rect.copy( this.rect );
        this.layout.layout( canvas );
    }
};