
// --- Image Model Data

Image=function()
{    
    this.imageData=null;
    this.text="New Image";
};

// --- vgMain

 function vgMain( workspace, argc, arg )
 {
    // --- Create a new Data Collection
    this.dc=VG.Data.Collection( "MainData" );
    this.dc.images=[];
    
    // --- Setup the Toolbar

    var toolbar=VG.UI.Toolbar();
    workspace.addToolbar( toolbar );

    this.addImageButton=VG.UI.ToolButton( "Add Image" );
    this.addImageButton.clicked=addImage.bind( this );
    
    this.removeImageButton=VG.UI.ToolButton( "Remove Image" );
    this.removeImageButton.clicked=removeImage.bind( this );
    this.removeImageButton.disabled=true;

    toolbar.addItems( this.addImageButton, this.removeImageButton );

    // --- Setup the DockWidget

    var imagesWidget=VG.UI.ListWidget();
    this.imagesController=imagesWidget.bind( this.dc, "images" );
    this.imagesController.contentClassName="Image";
    this.imagesController.addObserver( "selectionChanged", function() {
        this.removeImageButton.disabled=!this.imagesController.canRemove();
    }.bind( this ) );

    var dockWidget=VG.UI.DockWidget( "Images" );
    dockWidget.addItems( VG.UI.Layout( imagesWidget ) );
    workspace.addDockWidget( dockWidget, VG.UI.DockWidgetLocation.Left );
    
    this.imageWidget=VG.UI.Image();
    this.imageWidget.horizontalExpanding=true;
    this.imageWidget.bind( this.dc, "images.imageData" );
    
    workspace.content=VG.UI.Layout( this.imageWidget );
 }

// --- Adds an Image

function addImage()
{
    var fileDialog=VG.OpenFileDialog( VG.UI.FileDialog.Image, function( image ) {
        
        var item=this.imagesController.add();
        
        item.text=VG.Utils.fileNameFromPath( image.name );
        item.imageData=image.imageData;        
        this.imagesController.selected=item;

    }.bind( this ));
};

// --- Removes the currently selected image.

function removeImage()
{
    this.imagesController.remove( this.imagesController.selected );
}