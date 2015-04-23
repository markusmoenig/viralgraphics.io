/*
 * (C) Copyright 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>.
 *
 * This file is part of Visual Graphics.
 *
 * Visual Graphics is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Visual Graphics is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// Web specific Implementations

VG.handleImageDropEvent=function( event ) 
{    
    event.stopPropagation();
    event.preventDefault();

    var files = event.dataTransfer.files;
    var file = files[0];
    var fileType;

    var match=false;

    if ( VG.fileDialog.fileType === VG.UI.FileDialog.Image )
    {
        if ( file.type.match( /image.*/ ) )
            match=true; 
    } else 
    if ( VG.fileDialog.fileType === VG.UI.FileDialog.Text ) {
        if ( file.type.match( /text.*/ ) || file.type.match( /javascript.*/ ) )
                match=true;
    }
    else 
    if ( VG.fileDialog.fileType === VG.UI.FileDialog.Project ) {
            match=true;
    }

    if ( match ) 
    {
        var reader=new FileReader();

        reader.onload = function( e ) 
        {
            VG.fileDialog.fileSelected( file.name, reader.result );
        }

        if ( VG.fileDialog.fileType === VG.UI.FileDialog.Image )
            reader.readAsDataURL( file ); 
        else reader.readAsText( file );
    }
}

VG.handleDragOver=function( event ) 
{    
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect='copy';
}

VG.OpenFileDialog=function( fileType, callback )
{
    if ( !(this instanceof VG.OpenFileDialog) ) return new VG.OpenFileDialog( fileType, callback );

    VG.UI.Dialog.call( this, "File Dialog" );

    VG.fileDialog=this;
    this.fileType=fileType;
    this.callback=callback;

    var layout=VG.UI.Layout();

    var dropAreaName;

    if ( this.fileType === VG.UI.FileDialog.Image )
        dropAreaName="\n\n\nDrop Image Here\n\n\n";
    else 
    if ( this.fileType === VG.UI.FileDialog.Text )
        dropAreaName="\n\n\nDrop Text File Here\n\n\n";
    else
    if ( this.fileType === VG.UI.FileDialog.Project )
        dropAreaName="\n\n\nDrop Project Here\n\n\n";

    this.dropLabel=VG.UI.Label( dropAreaName );
    this.dropLabel.frameType=VG.UI.Frame.Type.Box;

    this.dropLabel.minimumSize.set( 320, 200 );
    layout.addChild( this.dropLabel );

    if ( this.fileType === VG.UI.FileDialog.Image )
    {
        this.image=VG.UI.Image();

        this.image.horizontalExpanding=false;
        this.image.verticalExpanding=false;
        //this.image.frameType=VG.UI.Frame.Type.Box;

        this.image.minimumSize.set( 200, 200 );
        this.image.maximumSize.set( 200, 200 );

        layout.addChild( this.image );
    } else
    {
        this.textEdit=VG.UI.TextEdit( "" );

        this.textEdit.horizontalExpanding=false;
        this.textEdit.verticalExpanding=false;

        this.textEdit.minimumSize.set( 200, 200 );
        this.textEdit.maximumSize.set( 200, 200 );        

        layout.addChild( this.textEdit );
    }

    // ---

    VG.dropZone.addEventListener('dragover', VG.handleDragOver, false);
    VG.dropZone.addEventListener('drop', VG.handleImageDropEvent, false);
    
    VG.dropZone.width=320;
    VG.dropZone.height=200;

    this.layout=layout;
    this.addButton( "Close", function() { VG.dropZone.style.display="none"; this.close( this ); }.bind( this ) );
    this.addButton( "Accept", function() { 

        VG.dropZone.style.display="none"; 

        if ( this.fileType === VG.UI.FileDialog.Image ) {
            if ( this.callback && this.image.image ) 
                this.callback( this.image.image );
        } else {
            if ( this.callback && this.fileContent ) 
                this.callback( this.fileName, this.textEdit.text );
        }
        this.close( this );
    }.bind( this ) );

    this.makeVisible=true;    

    VG.context.workspace.showWindow( this );
};

VG.OpenFileDialog.prototype=VG.UI.Dialog();

VG.OpenFileDialog.prototype.paintWidget=function( canvas )
{
    if ( !this.visible ) return;

    VG.UI.Dialog.prototype.paintWidget.call( this, canvas );

    VG.dropZone.style.left=String( this.dropLabel.rect.x ) + "px";
    VG.dropZone.style.top=String( this.dropLabel.rect.y ) + "px";
    if ( this.makeVisible ) {
        VG.dropZone.style.display="inline";
        this.makeVisible=false;
    }
};

VG.OpenFileDialog.prototype.fileSelected=function( name, data )
{
    if ( this.fileType === VG.UI.FileDialog.Image )
    {    
        VG.fileDialog.image.image.name=name;
        VG.decompressImageData( data, VG.fileDialog.image.image );
    } else
    {
        VG.fileDialog.textEdit.text=data;

        VG.fileDialog.fileContent=data;
        VG.fileDialog.fileName=name;
    }
    VG.update();
};

VG.OpenFileDialog.prototype.mouseMove=function( event )
{
    var oldDragOp=this.dragOp;

    VG.UI.Dialog.prototype.mouseMove.call( this, event );

    if ( oldDragOp !== this.dragOp )
        VG.dropZone.style.display="none";
};

VG.OpenFileDialog.prototype.mouseUp=function( event )
{
    var oldDragOp=this.dragOp;

    VG.UI.Dialog.prototype.mouseUp.call( this, event );

    if ( oldDragOp !== this.dragOp )
        this.makeVisible=true; 
}

VG.SaveFileDialog=function( fileType, name, data )
{       
    var fileDialog=VG.RemoteFileDialog( fileType, function( callbackObject ) {
        var path=callbackObject.filePath;
        if ( path.length > 0 ) {

            if ( !callbackObject.download ) VG.remoteSaveFile( path, data );
            else
            {
                var params = {};
                params.filename = path;
                params.content = data;

                var url="/api/download";

                if ( fileType === VG.UI.FileDialog.Image )
                    url+="?binary=true";

                VG.downloadRequest( url, params, "POST");
            }
            return data;
        }
    }.bind( VG.context ), "Select", "Save", true );
    VG.context.workspace.showWindow( fileDialog );
};
