var widgetExamples=[
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
    labelLayout.margin.clear();

    this.layout=VG.UI.Layout( labelLayout, this.stackedLayout );
    this.layout.vertical=true;

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
    text : "SplitLayout - Horizontal",
    source : function splitLayoutExample( message ) {

    var layout=VG.UI.SplitLayout( VG.UI.TextEdit("30 Percent Space"), 30, VG.UI.TextEdit("70 Percent Space"), 70 );
    layout.margin.clear();

    return layout;
},
},

{
    text : "SplitLayout - Vertical",
    source : function splitLayoutExample( message ) {

    var layout=VG.UI.SplitLayout( VG.UI.TextEdit("30 Percent Space"), 30, VG.UI.TextEdit("70 Percent Space"), 70 );
    layout.margin.clear();
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
    labelLayout.margin.clear();

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
