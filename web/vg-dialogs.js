/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


// Web specific Implementations

VG.handleImageDropEvent_Dialog=function( event ) 
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
        //if ( file.type.match( /text.*/ ) || file.type.match( /javascript.*/ ) )
            match=true;
    }
    else 
    if ( VG.fileDialog.fileType === VG.UI.FileDialog.Project ) {
            match=true;
    }
    else
    if ( VG.fileDialog.fileType === VG.UI.FileDialog.Binary ) {
        match=true;
    }

    if ( match ) 
    {
        var reader=new FileReader();

        reader.onload = function( e ) 
        {
            VG.fileDialog.fileSelected( file.name, reader.result );
        }

        if ( VG.fileDialog.fileType === VG.UI.FileDialog.Image || VG.fileDialog.fileType === VG.UI.FileDialog.Binary )
            reader.readAsDataURL( file ); 
        else reader.readAsText( file );
    }
}

VG.handleDragOver_Dialog=function( event ) 
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
    VG.handleImageDropEvent=VG.handleImageDropEvent_Dialog;
    VG.handleDragOver=VG.handleDragOver_Dialog;

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
    else
    if ( this.fileType === VG.UI.FileDialog.Binary )
        dropAreaName="\n\n\nDrop File Here\n\n\n";

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
                this.callback( this.image.image.name, this.image.image );
        } else {
            if ( this.callback && this.fileContent ) 
                this.callback( this.fileName, this.fileContent );
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
    if ( this.fileType === VG.UI.FileDialog.Binary )
    { 
        var Base={};
        Base64.byteToCharMap_ = null;
        Base64.charToByteMap_ = null;
        Base64.byteToCharMapWebSafe_ = null;
        Base64.charToByteMapWebSafe_ = null;
        Base64.ENCODED_VALS_BASE =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz' +
            '0123456789';

        Base64.ENCODED_VALS = Base64.ENCODED_VALS_BASE + '+/=';
        Base64.ENCODED_VALS_WEBSAFE = Base64.ENCODED_VALS_BASE + '-_.';

        Base64.encodeByteArray = function(input, opt_webSafe) {
            Base64.init_();

            var byteToCharMap = opt_webSafe ?
                                  Base64.byteToCharMapWebSafe_ :
                                  Base64.byteToCharMap_;

            var output = [];

            for (var i = 0; i < input.length; i += 3) 
            {
                var byte1 = input[i];
                var haveByte2 = i + 1 < input.length;
                var byte2 = haveByte2 ? input[i + 1] : 0;
                var haveByte3 = i + 2 < input.length;
                var byte3 = haveByte3 ? input[i + 2] : 0;

                var outByte1 = byte1 >> 2;
                var outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
                var outByte3 = ((byte2 & 0x0F) << 2) | (byte3 >> 6);
                var outByte4 = byte3 & 0x3F;

                if (!haveByte3) {
                    outByte4 = 64;

                    if (!haveByte2) {
                        outByte3 = 64;
                    }
                }

                output.push(byteToCharMap[outByte1],
                    byteToCharMap[outByte2],
                    byteToCharMap[outByte3],
                    byteToCharMap[outByte4]);
            }

            return output.join('');
        };

        Base64.init_ = function() {
            if (!Base64.byteToCharMap_) {
                Base64.byteToCharMap_ = {};
                Base64.charToByteMap_ = {};
                Base64.byteToCharMapWebSafe_ = {};
                Base64.charToByteMapWebSafe_ = {};

                // We want quick mappings back and forth, so we precompute two maps.
                for (var i = 0; i < Base64.ENCODED_VALS.length; i++) {
                    Base64.byteToCharMap_[i] =
                    Base64.ENCODED_VALS.charAt(i);
                    Base64.charToByteMap_[Base64.byteToCharMap_[i]] = i;
                    Base64.byteToCharMapWebSafe_[i] =
                    Base64.ENCODED_VALS_WEBSAFE.charAt(i);
                    Base64.charToByteMapWebSafe_[
                    Base64.byteToCharMapWebSafe_[i]] = i;
                }
            }
        };

        VG.fileDialog.textEdit.text=data;
        VG.fileDialog.fileContent=Base64.encodeByteArray( data );
        VG.fileDialog.fileName=name;
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
    }.bind( VG.context ), "Select", "Save", true, name );
    VG.context.workspace.showWindow( fileDialog );
};
