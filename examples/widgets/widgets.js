
// --- main

 function vgMain( workspace )
 {
    this.dc=VG.Data.Collection( "MainData" );
    this.dc.items=[];

    // --- Setup the Toolbar & Statusbar

    var toolbar=VG.UI.Toolbar();
    workspace.addToolbar( toolbar );
    workspace.statusbar=VG.UI.Statusbar();

    // --- Setup the left DockWidget with its ListWidget

    var dockWidget=VG.UI.DockWidget( "Widget Examples" );

    var treeWidget=VG.UI.TreeWidget();

    this.controller=treeWidget.bind( this.dc, "items" );
    this.controller.addObserver( "selectionChanged", function() {

        var current=this.controller.selected;

        if ( current && current.source )
        {
            var widget=current.source( message );
            this.widgetViewer.setWidget( widget );
            this.codeEdit.text=String( current.source );
        }

    }.bind( this ) );

    dockWidget.addItem( treeWidget );

    // --- Style Popup

    this.stylePopup=VG.UI.PopupButton();
    this.popupLayout=VG.UI.Layout( VG.UI.Label("Style" ), this.stylePopup );
    this.popupLayout.margin.set( 0, 0, 0, 10 );    

    for( var i=0; i < VG.Styles.pool.length; ++i ) {
        var style=VG.Styles.pool[i];

        this.stylePopup.addItem( style.name );
    }

    this.stylePopup.changed=function( index ) {
        this.widgetViewer.style=VG.Styles.pool[index];
        VG.update();
    }.bind( this );

    // ---

    this.widgetViewer=new WidgetViewer();
    this.widgetViewer.minimumSize.height=200;
    this.messageWidget=new MessageWidget();
    this.codeEdit=VG.UI.CodeEdit();
    this.codeEdit.readOnly=true;

    this.layout=VG.UI.Layout( this.popupLayout, this.widgetViewer, this.messageWidget );
    this.layout.vertical=true;
    this.layout.margin.clear();//set( 20, 20, 20, 0 );

    // --- Add the Widget Examples

    this.controller.add( "", { text: "Widgets", open : true, children : [] } );

    var firstItem=null;
    for ( var i=0; i < widgetExamples.length; ++i ) {
        var item=this.controller.add( "0", widgetExamples[i] );
        if (!firstItem) firstItem=item;
    }

    this.controller.selected=firstItem;

    // --- Add the Layouts Examples

    this.controller.add( "", { text: "Layouts", open : true, children : [] } );

    var firstItem=null;
    for ( var i=0; i < layoutExamples.length; ++i ) {
        var item=this.controller.add( "1", layoutExamples[i] );
    }

    // --- Add the Node Examples
/*
    this.controller.add( "", { text: "Nodes", open : true, children : [] } );

    var firstItem=null;
    for ( var i=0; i < nodeExamples.length; ++i ) {
        var item=this.controller.add( "2", nodeExamples[i] );
    }    
*/
    // --- Main Layout

    workspace.addDockWidget( dockWidget, VG.UI.DockWidgetLocation.Left );
    workspace.content=VG.UI.SplitLayout( this.layout, 50, this.codeEdit, 50 );
    workspace.content.vertical=true;
}

message=function( message )
{
    VG.context.messageWidget.message( message, 2000 );
};

WidgetViewer=function( resultView )
{
    VG.UI.Widget.call( this );

    this.style=VG.Styles.pool[0];
    this.childWidgets=[];
};

WidgetViewer.prototype=VG.UI.Widget();

WidgetViewer.prototype.setWidget=function( widget )
{
    if ( widget.isWidget )
    {
        this.childWidgets=[ widget ];
        this.layout=widget.layout;
    } else
    {
        this.childWidgets=[];
        this.layout=widget;
    }
    this.widget=widget;
};

WidgetViewer.prototype.paintWidget=function( canvas )
{
    var oldStyle=this.switchStyle( this.style );
    if ( this.widget )
    {
        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect, canvas.style.skin.Widget.BackgroundColor );
        this.widget.rect.set( this.rect );

        if ( this.widget.isWidget )
            this.widget.paintWidget( canvas );
        else
            this.widget.layout( canvas );
    }
    this.switchStyle( oldStyle );
};

WidgetViewer.prototype.switchStyle=function( style )
{
    var oldStyle=VG.context.style;

    VG.context.style=style;
    VG.context.workspace.canvas.style=style;

    return oldStyle;
};

MessageWidget=function()
{    
    VG.UI.Widget.call( this );
    this.name="MessageWidget";

    // ---
    
    this.layout=VG.UI.Layout();

    this.layout.margin.left=0;
    //this.layout.margin.top=0;

    this.label=VG.UI.Label( "" );
    this.label.hAlignment=VG.UI.HAlignment.Left;

    this.layout.addChild( this.label );

    this.maximumSize.height=20;
};

MessageWidget.prototype=VG.UI.Widget();

MessageWidget.prototype.calcSize=function( canvas )
{
    return this.layout.calcSize( canvas );
};

MessageWidget.prototype.message=function( message, timeout )
{
    this.label.text=message;
    if ( timeout ) this.messageTimeOutTime=Date.now() + timeout;
    else this.messageTimeOutTime=0;
}

MessageWidget.prototype.paintWidget=function( canvas )
{
    if ( this.messageTimeOutTime && this.messageTimeOutTime < Date.now() )
        this.label.text="";

    this.layout.rect.set( this.rect );
    this.layout.layout( canvas );
};