
CommunityListWidget=function( options )
{
    VG.UI.Widget.call( this );

    this.options=options || {};

    this.Inbuilt=0;
    this.MyItem=1;
    this.CommunityItem=2;

    this.listWidget=VG.UI.ListWidget();
    this.listWidget.itemHeight=43;

    // -- Filter

    this.filterEdit=VG.UI.TextLineEdit();
    this.filterEdit.textChanged=function( text, cont ) {
        this.objectFilter( text, this.filterDD.index );
    }.bind( this );

    if ( !options.customFilter )
        this.filterDD=VG.UI.DropDownMenu( "All", "Inbuilt", "My Cloud", "Community" );
    else {
        this.filterDD=VG.UI.DropDownMenu();
        for ( let i=0; i < options.customFilter.items.length; ++i )
        {
            this.filterDD.addItem(  options.customFilter.items[i] );
        }
    }

    this.filterDD.changed=function( text ) {
        this.objectFilter( this.filterEdit.text, this.filterDD.index );
    }.bind( this );

    this.filterLayout=VG.UI.Layout( this.filterEdit, this.filterDD );
    this.filterLayout.margin.set( 2, 2, 2, 2 );

    this.objectFilter=function( text, category ) {

        var array=this.dc.dataForPath( this.controllerPath );
        text=text.toLowerCase();

        if ( !options.customFilter )
        {
            for( let i=0; i < array.length; ++i )
            {
                let item=array[i];

                item.visible=true;
                if ( !item.text.toLowerCase().includes( text ) ) item.visible=false;
                if ( category !== 0 && item.type !== category-1 ) item.visible=false;
            }
        } else
        {
            for( let i=0; i < array.length; ++i )
            {
                let item=array[i];

                item.visible=true;
                if ( !item.text.toLowerCase().includes( text ) ) item.visible=false;
                if ( category !== 0 && item[options.customFilter.member] !== (category-1+options.customFilter.offset) &&
                    item[options.customFilter.member] !== options.customFilter.items[category] ) item.visible=false;
            }
        }

        VG.update();
        this.listWidget.changed();

    }.bind( this );

    // ---

    this.layout=VG.UI.Layout( this.filterLayout, this.listWidget );
    this.layout.margin.clear();
    this.layout.vertical=true;
    this.layout.spacing=0;

    // --- Buttons

    if ( !this.options.dontCreateNew ) {
        this.newButton=VG.UI.ToolBarButton();
        this.newButton.text="New";
        this.newButton.toolTip="Adds a new, empty " + options.type.toLowerCase() + ".";

        this.newButton.clicked=function() {
            var selected=this.controller.selected;

            var object=this.options.newObjectCB();
            this.addItem( CommunityListWidget.ItemType.MyItem, object );
            this.controller.selected=object;

        }.bind( this );
    }

    this.copyButton=VG.UI.ToolBarButton();
    this.copyButton.disabled = true;
    this.copyButton.text="Copy";
    this.copyButton.toolTip="Makes a copy of the " + options.type.toLowerCase() + " and saves it under a new name in your personal cloud storage for later re-use. Changes will be automatically saved and uploaded.";
    this.copyButton.clicked=function() {

        var selected=this.controller.selected;
        var object=this.options.createObjectForItemCB( selected );

        var dialog=new SaveToMyItemsDialog( this.options.type, object, function( name ) {

            object.text=name;
            object.id=createToken();
            // var json=VG.Utils.compressToBase64( JSON.stringify( object ) );

            this.addItem( CommunityListWidget.ItemType.MyItem, object );
            if ( window.writeSettings ) writeSettings();

        }.bind( this ) );
        VG.context.workspace.showWindow( dialog );

    }.bind( this );

    this.editButton=VG.UI.ToolBarButton( "Edit" );
    this.editButton.text="Edit";
    this.editButton.checkable = true;
    this.editButton.checked = false;
    // this.editButton.disabled = true;
    this.editButton.toolTip="Edit the " + options.type.toLowerCase() + ".";
    this.editButton.changed=function( state ) {
        this.options.editCallback( state );
    }.bind( this );

    this.removeButton=VG.UI.ToolBarButton();
    this.removeButton.text="Delete";
    this.removeButton.toolTip="Deletes the " + options.type.toLowerCase() + " from your personal cloud storage.";
    this.removeButton.disabled = true;
    this.removeButton.clicked=function() {

        var selected=this.controller.selected;

        if ( selected.type === CommunityListWidget.ItemType.MyItem ) {
            this.controller.remove( selected );
            if ( window.writeSettings ) writeSettings();
        } else
        if ( selected.type === CommunityListWidget.ItemType.UploadItem )
        {
            this.options.uploadFolder.removeContent( selected._id, function( success ) {
                if ( success ) {
                    this.controller.remove( selected, true );
                    // this.removeFromAllShapes( selected );
                    VG.context.workspace.statusBar.message( this.options.type + " removed successfully.", 4000 );
                }
            }.bind( this ) );
        } else
        if ( selected.type === CommunityListWidget.ItemType.CommunityItem )
        {
            this.options.folder.removeContent( selected._id, function( success ) {
                if ( success ) {
                    this.controller.remove( selected, true );
                    // this.removeFromAllShapes( selected );
                    VG.context.workspace.statusBar.message( this.options.type + " removed successfully.", 4000 );
                }
            }.bind( this ) );
        }

    }.bind( this );

    this.communityButton=VG.UI.ToolBarButton( "Upload" );
    this.communityButton.disabled=true;
    this.communityButton.clicked=function() {

        let selected=this.controller.selected;
        let object=this.options.createUploadObjectForItemCB( selected );

        let folder = this.options.uploadFolder;
        if ( this.adminMode ) folder = this.options.folder;

        var dialog=new UploadItemDialog( this.options.type, object, folder );
        VG.context.workspace.showWindow( dialog );

    }.bind( this );

    this.acceptUploadButton=VG.UI.ToolBarButton( "Accept" );
    this.acceptUploadButton.disabled=true;
    this.acceptUploadButton.clicked=function() {

        var selected=this.controller.selected;
        var object=this.options.createUploadObjectForItemCB( selected );
        var folder=this.options.folder;

        folder.addContent( object.text,  JSON.stringify( object ), function( success ) {
            VG.log( selected.text + " uploaded successfully to public folder." );
        }.bind( this ) );

    }.bind( this );

    if ( !options.noToolIcons )
    {
        if ( !this.options.dontCreateNew )
            this.listWidget.addToolWidget( this.newButton );
        this.listWidget.addToolWidget( this.removeButton );
        if ( this.options.editCallback )
            this.listWidget.addToolWidget( this.editButton );
        this.listWidget.addToolWidget( VG.UI.ToolSeparator() );
        this.listWidget.addToolWidget( this.copyButton );
        this.listWidget.addToolWidget( this.communityButton );
    }
};

CommunityListWidget.prototype=VG.UI.Widget();

CommunityListWidget.ItemType={ "Inbuilt" : 0, "MyItem" : 1, "CommunityItem" : 2, "UploadItem" : 3 };

CommunityListWidget.prototype.bind=function( context, path )
{
    this.dc=context;
    this.controller=this.listWidget.bind( context, path );
    this.controllerPath=path;

    this.controller.addObserver( "selectionChanged", function() {
        this.adjustUIState();
    }.bind( this ) );

    return this.controller;
};

CommunityListWidget.prototype.adjustUIState=function()
{
    var selected=this.controller.selected;
    if ( !selected ) {
        this.copyButton.disabled=true;
        this.removeButton.disabled=true;
        this.communityButton.disabled=true;
        this.acceptUploadButton.disabled=true;

        return;
    }

    this.copyButton.disabled = false;

    // --- Remove

    this.removeButton.disabled=true;
    if ( selected.canBeDeleted )
        this.removeButton.disabled=false;
    else
    if ( selected && this.adminMode )
        this.removeButton.disabled=false;

    // --- Upload

    this.communityButton.disabled = this.adminMode ? false : true;
    if ( selected && selected.canBeDeleted && VG.context.userId && this.options.uploadFolder )
    {
        this.communityButton.disabled=false;
    }

    // --- Accept

    if ( selected.type === CommunityListWidget.ItemType.UploadItem ) {
        this.removeButton.disabled=false;
        this.acceptUploadButton.disabled=false;
    } else this.acceptUploadButton.disabled=true;
};

CommunityListWidget.prototype.enableAdminMode = function()
{
    this.adminMode=true;
    this.listWidget.addToolWidget( this.acceptUploadButton );
};

CommunityListWidget.prototype.addItem=function( type, item, noUndo )
{
    item.type=type;
    item.canBeDeleted=type === CommunityListWidget.ItemType.MyItem;
    this.controller.add( item, noUndo );
};

CommunityListWidget.prototype.paintWidget=function( canvas )
{
    this.layout.rect.copy( this.rect );
    this.layout.layout( canvas );
};