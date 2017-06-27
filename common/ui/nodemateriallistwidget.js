// ------------------------------------------------------- NodeMaterialWidget

NodeMaterialListWidget=function( { dc, startRender, materialEdit, editCallback } = {} )
{
    VG.UI.Widget.call( this );

    VG.context.materialsUploadFolder = new VG.DB.Folder( "594cbb016ce4a619606d090f" );
    VG.context.materialsFolder = new VG.DB.Folder( "594cbac26ce4a619606d090e" );

    this.dc = dc;
    this.startRender = startRender;
    this.materialEdit = materialEdit;

    // --- List Widget

    var options={ type : "Materials", uploadFolder : VG.context.materialsUploadFolder, folder : VG.context.materialsFolder,
        newObjectCB : this.createMaterial.bind( this ),
        createObjectForItemCB : this.createMaterialForItem.bind( this ),
        createUploadObjectForItemCB : this.createUploadMaterialForItem.bind( this ),
        editCallback : editCallback,
        customFilter : { items : [ "All", "Metall", "Stone", "Wood" ], member : "category", offset : 1 }
    };
    this.listWidget = new CommunityListWidget( options );

    this.controller=this.listWidget.bind( dc, "materials" );
    this.controller.undoObjectName="Material";
    VG.context.materialsController=this.controller;

    // this.controller.addObserver( "changed", function() {
    // }.bind( this ) );

    // --- Draw Preview

    let itemRect=VG.Core.Rect();
    let itemFont=VG.Font.Font( "Open Sans Semibold", 12 );
    this.listWidget.listWidget.paintItemCallback=function( canvas, item, paintRect, selected )
    {
        if ( !item.previewStripImage || item.previewStripNeedsUpdate )
            this.startRender( "materialStripPreviews" );

        if ( paintRect.width-4 !== item.previewStripWidth ) {
            item.previewStripNeedsUpdate=true;
            item.previewStripWidth=paintRect.width-4;
            item.previewStripHeight=paintRect.height-4;
            this.startRender( "materialStripPreviews" );
        }

        if ( item.previewStripImage ) {
            let rect = paintRect.shrink( 2, 2 );
            canvas.drawImage( rect, item.previewStripImage, rect );
        }
    }.bind( this );

    // --- Get Materials

    VG.context.materialsFolder.getAllContent( function( content ) {
        for ( var i=0; i < content.length; ++i )
        {
            let data=content[i].data;

            let material = { graph : { nodes : [] } };
            material._id = content[i]._id;

            material.text = data.text;
            material.category = data.category;
            material.data = data.data;
            material.graph.nodes = JSON.parse( VG.Utils.decompressFromBase64( material.data ) );

            this.listWidget.addItem( CommunityListWidget.ItemType.CommunityItem, material, true );
        }

        function compare( a, b ) {
            if ( a.text < b.text ) return -1;
            return 1;
        }

        this.dc.materials.sort( compare );
        this.controller.selected = this.dc.materials[0];

    }.bind( this ) );

    // ---

    this.layout=VG.UI.Layout( this.listWidget );
    this.layout.vertical=true;
    this.layout.margin.clear();
};

NodeMaterialListWidget.prototype=VG.UI.Widget();

NodeMaterialListWidget.prototype.addAdminSpecific=function()
{
    this.adminMode=true;
    if ( !this.uploadMaterialsLoaded )
    {
        VG.context.materialsUploadFolder.getAllContent( function( content ) {
            for ( let i=0; i < content.length; ++i ) {
                let data=content[i].data;

                let material = { graph : { nodes : [] } };
                material._id = content[i]._id;

                material.text = data.text;
                material.category = data.category;
                material.data = data.data;
                material.graph.nodes = JSON.parse( VG.Utils.decompressFromBase64( material.data ) );

                this.listWidget.addItem( CommunityListWidget.ItemType.UploadItem, material, true );
            }
        }.bind( this ) );

        this.listWidget.enableAdminMode();
        this.uploadMaterialsLoaded=true;
    }
};

NodeMaterialListWidget.prototype.compileMaterial=function( item, itemNeedsUpdate, verify )
{
    if ( !item ) item = this.controller.selected;

    let rc = VG.context.raysl.compileAsMaterialFunction( item.code, "0", verify );

    if ( item )
        item.previewStripNeedsUpdate = itemNeedsUpdate;

    if ( !rc.isValid ) item.previewStripNeedsUpdate = false;

    if ( item && rc.name ) item.text = rc.name;
    if ( item && rc.category ) item.category = rc.category;

    if ( rc && rc.isValid ) {
        // console.log( rc.code );

        this.rayslPreviewGen.setCompiled( rc );
        // VG.context.editor.setErrorLine();
    } else {
        // VG.context.editor.setErrorLine( rc.line );
        this.rayslPreviewGen.setCompiled( { code : "void texture0( in vec2 uv, inout Material material, inout vec3 normal ) {}\n" } );
    }
    VG.update();
};

NodeMaterialListWidget.prototype.createMaterial=function()
{
    let item = { text : "New Material", graph : { nodes : [ { name : "Material", className : "NodeMaterial" } ] } };

    item.data = VG.Utils.compressToBase64( JSON.stringify( [] ) );
    item.category = "Unknown";
    item.offset = { x : 0, y : 0 };

    item.canBeDeleted = true;
    return item;
};

NodeMaterialListWidget.prototype.createMaterialForItem=function( item )
{
    let material = { text : "New Material", graph : { nodes : [] } };

    if ( !item.offset ) item.offset = { x : 0, y : 0 };

    material.category = item.category;
    material.offset = JSON.parse( JSON.stringify( item.offset ) );
    material.data = this.compressMaterial();
    material.graph.nodes = JSON.parse( VG.Utils.decompressFromBase64( material.data ) );

    material.canBeDeleted = true;

    return material;
};

NodeMaterialListWidget.prototype.createUploadMaterialForItem=function( item )
{
    if ( !item.offset ) item.offset = { x : 0, y : 0 };

    let uploadMaterial={
        text : item.text,
        category : item.category,
        author : VG.context.userName,
        authorId : VG.context.userId,
        id : item.id,
        offset : JSON.parse( JSON.stringify( item.offset ) ),
        data : this.compressMaterial(),
        // token : item.token ? item.token : VG.Utils.createToken(),
    };

    return uploadMaterial;
};

/**
 * Compresses the current material.
 * @returns {string} The compressed material.
 */

NodeMaterialListWidget.prototype.compressMaterial=function()
{
    let arr=[];

    this.materialEdit.graph.nodes.forEach(function(n) {
        arr.push( n.data );
    });

    let data=JSON.stringify( arr );
    return VG.Utils.compressToBase64( data );
};


/*
ProjectDockWidget.prototype.createObjectForItem=function( item )
{
    var shape = new Shape( item.code );
    this.copySupportedShapeParams( shape, item );

    return shape;
};
*/

NodeMaterialListWidget.prototype.paintWidget=function( canvas )
{
    this.layout.rect.copy( this.rect );
    this.layout.layout( canvas );
};