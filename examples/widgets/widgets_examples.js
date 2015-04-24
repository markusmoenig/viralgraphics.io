var widgetExamples=[
{
    text : "Checkbox",
    source : function checkboxExample( message ) {

    var checkbox=VG.UI.Checkbox();

    checkbox.changed=function( checked ) {
        message( "Checked: " + checked );
    }.bind( this );

    this.layout=VG.UI.LabelLayout( "Checkbox", checkbox );

    return this.layout;
},
},

{
    text : "ListWidget",
    source : function listWidgetExample( message ) {
    var dc=VG.Data.Collection( "MainData" );
    dc.items=[];

    var listWidget=VG.UI.ListWidget();

    this.controller=listWidget.bind( dc, "items" );
    this.controller.addObserver( "selectionChanged", function() {
        var item=this.controller.selected;
        message( "Selected \"" + item.text + "\" at index " + this.controller.indexOf( item ) );
    }.bind( this ) );

    function item( text ) {
        this.text=text;
    }

    this.controller.add( new item( "First Item" ) );
    this.controller.add( new item( "Second Item" ) );
    this.controller.add( new item( "Third Item" ) );

    return listWidget;
},
},

{
    text : "ListWidget - Custom Items",
    source : function listWidgetExample( message ) {
    var dc=VG.Data.Collection( "MainData" );
    dc.items=[];

    var listWidget=VG.UI.ListWidget();

    listWidget.itemHeight=80;
    listWidget.paintItemCallback=function( canvas, item, rect, isSelected )  {

        var image=VG.Utils.getImageByName( "vgstyle_status_question.png" );
        if ( image && image.isValid() ) {
            canvas.drawImage( VG.Core.Point( rect.x + 10, rect.y + (rect.height - image.height)/2 ), image );

            var rect=VG.Core.Rect( rect.x + 10 + image.width + 15, rect.y, rect.width - (10+image.width+15), rect.height );
    
            var color;
            if ( isSelected ) color=canvas.style.skin.ListWidget.Item.SelectedTextColor;
            else color=canvas.style.skin.ListWidget.Item.TextColor;
    
            canvas.drawTextRect( item.text, rect, color, 0, 1 );
        }
    }.bind( this );

    this.controller=listWidget.bind( dc, "items" );
    this.controller.addObserver( "selectionChanged", function() {
        var item=this.controller.selected;
        message( "Selected \"" + item.text + "\" at index " + this.controller.indexOf( item ) );
    }.bind( this ) );

    function item( text ) {
        this.text=text;
    }

    this.controller.add( new item( "First Item" ) );
    this.controller.add( new item( "Second Item" ) );
    this.controller.add( new item( "Third Item" ) );

    return listWidget;
},
},

{
    text : "PopupButton",
    source : function popupWidgetExample( message ) {

    var popupButton=VG.UI.PopupButton();
    popupButton.addItems( "Widget 1", "Widget 2" );

    popupButton.changed=function( index ) {
        if ( !index ) this.stackedLayout.current=this.widget1;
        else this.stackedLayout.current=this.widget2;

        VG.update();
    }.bind( this );

    this.widget1=VG.UI.TextEdit( "Widget 1" );
    this.widget2=VG.UI.TextEdit( "Widget 2" );

    this.stackedLayout=VG.UI.StackedLayout( this.widget1, this.widget2 );

    var labelLayout=VG.UI.LabelLayout( "Current", popupButton );

    this.layout=VG.UI.Layout( labelLayout, this.stackedLayout );
    this.layout.vertical=true;

    return this.layout;
},
},

{
    text : "Slider",
    source : function sliderExample( message ) {

    var slider=VG.UI.Slider( 0, 100, 1 );
    slider.maximumSize.width=200;

    slider.changed=function( checked ) {
        message( "Value: " + checked );
    }.bind( this );

    this.layout=VG.UI.LabelLayout( "Slider", slider );

    return this.layout;
},
},


{
    text : "TableWidget",
    source : function treeWidgetExample( message ) {
    var dc=VG.Data.Collection( "MainData" );
    dc.items=[];

    TableItem=function()
    {
        this.firstName="";
        this.lastName="";
        this.gender=0;
    };

    var tableWidget=VG.UI.TableWidget();

    this.controller=tableWidget.bind( dc, "items" );
    this.controller.contentClassName="TableItem";
    this.controller.addObserver( "selectionChanged", function() {
        var item=this.controller.selected;

        this.removeButton.disabled=!this.controller.canRemove();
        if ( item ) message( "Selected \"" + item.firstName + " " + item.lastName + "\" at index " + this.controller.indexOf( item ) );
    }.bind( this ) );

    tableWidget.addColumn( "firstName", "First Name",  VG.UI.TableWidgetItemType.TextLineEdit, true );
    tableWidget.addColumn( "lastName", "Last Name", VG.UI.TableWidgetItemType.TextLineEdit, true );
    tableWidget.addColumn( "gender", "Gender", VG.UI.TableWidgetItemType.PopupButton, false, 120 );

    tableWidget.setColumnDefaultText( 0, "First Name" );
    tableWidget.setColumnDefaultText( 1, "Last Name" );
    tableWidget.setColumnPopupItems( 2, "Male", "Female" );

    this.addButton=tableWidget.addButton( "Add" );
    this.addButton.clicked=function() {
        var item=this.controller.add();
        this.controller.selected=item;        
    }.bind( this );    

    this.removeButton=tableWidget.addButton( "Remove" );
    this.removeButton.clicked=function() {
        this.controller.remove( this.controller.selected );
    }.bind( this );
    this.removeButton.disabled=true;

    return tableWidget;
},
},

{
    text : "TabWidget",
    source : function tabWidgetExample( message ) {

    var tabWidget=VG.UI.TabWidget(  "Widget 1", VG.UI.TextEdit( "Widget 1" ), "Widget 2", VG.UI.TextEdit( "Widget 2" ) );

    return tabWidget;
},
},

{
    text : "Toolbar",
    source : function toolbarExample( message ) {

    var textButton=VG.UI.ToolButton( "Text Button");
    textButton.clicked=function() { message( "Text Button Clicked" ); }.bind( this );
    var iconButton=VG.UI.ToolButton( "Icon Button", "open.png" );
    iconButton.clicked=function() { message( "Icon Button Clicked" ); }.bind( this );

    var toolbar=VG.UI.Toolbar( textButton, iconButton );

    this.layout=VG.UI.Layout( VG.UI.LayoutVSpacer(), toolbar, VG.UI.LayoutVSpacer() );
    this.layout.vertical=true;

    return this.layout;
},
},

{
    text : "TreeWidget",
    source : function treeWidgetExample( message ) {
    var dc=VG.Data.Collection( "MainData" );
    dc.items=[];

    var treeWidget=VG.UI.TreeWidget();

    this.controller=treeWidget.bind( dc, "items" );
    this.controller.addObserver( "selectionChanged", function() {
        var item=this.controller.selected;
        message( "Selected \"" + item.text + "\" at index " + this.controller.indexOf( item ) );
    }.bind( this ) );

    function folder( text, open, selectable ) {
        this.text=text;
        this.children=[];
        this.open=open;
        this.selectable=selectable;
    }

    function item( text, folder, open ) {
        this.text=text;
    }

    this.controller.add( "", new folder( "Folder #1", true ) );
    this.controller.add( "0", new item( "First Item" ) );
    this.controller.add( "0", new folder( "Selectable Subfolder", false, true ) );
    this.controller.add( "0.1", new item( "Second Item" ) );
    this.controller.add( "", new item( "Third Item" ) );

    return treeWidget;
},
},

];

var layoutExamples=[

{
    text : "LabelLayout",
    source : function labelLayoutExample( message ) {

    var layout=VG.UI.LabelLayout( 
        "PopupButton", VG.UI.PopupButton( "Item #1", "Item #2" ),
        "TextLineEdit", VG.UI.TextLineEdit("TextLineEdit"),
        "TextEdit", VG.UI.TextEdit("TextEdit") );

    return layout;
},
},

{
    text : "Layout",
    source : function layoutExample( message ) {

    var layout=VG.UI.Layout( VG.UI.TextEdit("TextEdit #1"), VG.UI.TextEdit("TextEdit #2"), VG.UI.TextEdit("TextEdit #3") );
    layout.vertical=true;

    return layout;
},
},

{
    text : "SplitLayout - Horizontal",
    source : function splitLayoutExample( message ) {

    var layout=VG.UI.SplitLayout( VG.UI.TextEdit("30 Percent Space"), 30, VG.UI.TextEdit("70 Percent Space"), 70 );

    return layout;
},
},

{
    text : "SplitLayout - Vertical",
    source : function splitLayoutExample( message ) {

    var layout=VG.UI.SplitLayout( VG.UI.TextEdit("30 Percent Space"), 30, VG.UI.TextEdit("70 Percent Space"), 70 );
    layout.vertical=true;

    return layout;
},
},

{
    text : "StackedLayout",
    source : function stackedLayoutExample( message ) {

    var popupButton=VG.UI.PopupButton();
    popupButton.addItems( "Widget 1", "Widget 2" );

    popupButton.changed=function( index ) {
        if ( !index ) this.stackedLayout.current=this.widget1;
        else this.stackedLayout.current=this.widget2;

        VG.update();
    }.bind( this );

    this.widget1=VG.UI.TextEdit( "Widget 1" );
    this.widget2=VG.UI.TextEdit( "Widget 2" );

    this.stackedLayout=VG.UI.StackedLayout( this.widget1, this.widget2 );

    var labelLayout=VG.UI.LabelLayout( "Current", popupButton );

    this.layout=VG.UI.Layout( labelLayout, this.stackedLayout );
    this.layout.vertical=true;

    return this.layout;
},
},

];

var nodeExamples=[
{
    text : "Checker",
    source : function splitLayoutExample( message ) {
    var dc=VG.Data.Collection( "MainData" );
    dc.nodes=[];

    var nodeEdit=VG.Nodes.GraphEdit();
    this.controller=nodeEdit.bind( dc, "nodes" );

    var node=new VG.Nodes.NodeCheckerGen();
    nodeEdit.addNode( node, true );
        
    node.getTerminal( "out" ).connectTo( nodeEdit.graphView.previewNode.inputs[0] );

    return nodeEdit;
},
},

];
