
// ---

BrowserDockWidget = function()
{
    this.filePreview = new BrowserPreviewWidget();
    this.ps3dProject = new PS3DProject();
    this.ps3dProject.setDragSourceId( "PS3DProject" );
    this.rsdfProject = new RSDFProject();
    this.rsdfProject.setDragSourceId( "RSDFProject" );
    VG.UI.Widget.call( this );

    this.browsers = [];

    let browser = new VGBrowser( { setLayout : this.setLayout.bind( this ), selectionChanged : this.selectionChanged.bind( this )  } );
    this.browsers.push( browser );

    this.currentBrowser = browser;
};

BrowserDockWidget.prototype=VG.UI.Widget();

BrowserDockWidget.prototype.setVGUserInfo=function( name, id, isAdmin )
{
    for ( let i = 0; i < this.browsers.length; ++i )
        this.browsers[i].setVGUserInfo( name, id, isAdmin );
};

BrowserDockWidget.prototype.selectionChanged=function( item )
{
    if ( this.selected && item && this.selected.name === item.name )
        return;

    this.selected = item;

    if ( item.type === "PS3D" )
    {
        if ( !item.data )
        {
            this.currentBrowser.treeWidget.setDragSourceId( "" );
            this.layout.children[1] = this.ps3dProject;
            this.ps3dProject.setLoading();

            this.currentBrowser.getFile( item, function( rItem, data )
            {
                if ( rItem === item )
                {
                    item.data = data;
                    this.ps3dProject.setData( data );
                    this.currentBrowser.treeWidget.setDragSourceId( "PS3DProject" );
                    this.ps3dProject.possibleDnDSource = item;
                }
            }.bind( this ) );
        } else {
            this.ps3dProject.setData( item.data );
            this.ps3dProject.possibleDnDSource = item;
            this.currentBrowser.treeWidget.setDragSourceId( "PS3DProject" );
        }
    } else
    if ( item.type === "RSDF" )
    {
        if ( !item.data )
        {
            this.currentBrowser.treeWidget.setDragSourceId( "" );
            this.layout.children[1] = this.rsdfProject;
            this.rsdfProject.setLoading();

            this.currentBrowser.getFile( item, function( rItem, data )
            {
                if ( rItem === item )
                {
                    item.data = data;
                    this.rsdfProject.setData( data );
                    this.currentBrowser.treeWidget.setDragSourceId( "RSDFProject" );
                    this.rsdfProject.possibleDnDSource = item;
                }
            }.bind( this ) );
        } else {
            this.rsdfProject.setData( item.data );
            this.rsdfProject.possibleDnDSource = item;
            this.currentBrowser.treeWidget.setDragSourceId( "RSDFProject" );
        }
    } else
    this.layout.children[1] = this.filePreview;
};

BrowserDockWidget.prototype.setLayout=function( layout )
{
    if ( !this.layout )
    {
        this.layout = VG.UI.SplitLayout();
        this.layout.addChild( layout, 60 );
        this.layout.addChild( this.filePreview, 40 );
        this.layout.margin.clear();
        this.layout.vertical = true;
    } else {
        this.layout.children[0] = layout;
    }
};

BrowserDockWidget.prototype.paintWidget=function( canvas )
{
    this.layout.rect.copy( this.rect );
    this.layout.layout( canvas );
};

// --- BrowserPreviewWidget

BrowserPreviewWidget = function()
{
    VG.UI.Widget.call( this );
};

BrowserPreviewWidget.prototype=VG.UI.Widget();

BrowserPreviewWidget.prototype.paintWidget=function( canvas )
{
    // this.layout.rect.copy( this.rect );
    // this.layout.layout( canvas );
};
