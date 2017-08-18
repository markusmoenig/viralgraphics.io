/*
 * Copyright (c) 2014-2017 Markus Moenig <markusm@visualgraphics.tv> and Contributors
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

VG.downloadRequest=function( url, parameters, method )
{
    VG.context.workspace._downloadIP=true;

	var serverUrl="https://visualgraphics.tv";

    method=method || "POST";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", serverUrl + url);

    for(var key in parameters) {
        if(parameters.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", parameters[key]);

            form.appendChild(hiddenField);
         }
    }

    var button = document.createElement('input');
    button.setAttribute('type', 'submit');
    form.appendChild(button);

    document.body.appendChild(form);

    form.submit();
};

VG.sendBackendRequest=function( url, parameters, callback, type, error_callback )
{
    var request = new VG.ajaxRequest();

    request.withCredentials = true;

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if ( request.status == 200 || window.location.href.indexOf("http") ==-1 ) {
                //VG.log( parameters, request.responseText );

                if ( callback ) callback.call( this, request.responseText );
            } else {
                if (error_callback) {
                    error_callback(request.responseText);
            }
            }
        }
    };

    var serverUrl="";

    if ( VG.localVGLibPrefix ) serverUrl="https://visualgraphics.tv";
    var requestType="POST";

    if ( type ) requestType=type;

    request.open( requestType, serverUrl + url, true );
    request.setRequestHeader( "Content-type", "application/json;charset=UTF-8" );
    request.send( parameters );
};

VG.ajaxRequest=function()
{
    var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];

    if ( window.ActiveXObject ) {
        // --- IE
        for (var i=0; i<activexmodes.length; i++) {
            try {
                return new ActiveXObject(activexmodes[i]);
            }

            catch(e) {
                //suppress error
            }
        }
    } else
    {
        if (window.XMLHttpRequest) // --- Mozilla, Safari etc
            return new XMLHttpRequest();
        else return false;
    }
};

VG.setMouseCursorByID=function( id, cursorStyle )
{
    var elem;
    if (document.getElementById && (elem=document.getElementById(id)) ) {
        if (elem.style) elem.style.cursor=cursorStyle;
    }
};

/**
 * Sets the mouse cursor.
 * @param {string} cursor - The name of the CSS value of the mouse cursor, like "default". For a list of possible values see https://developer.mozilla.org/en/docs/Web/CSS/cursor.
 */

VG.setMouseCursor=function( cursor )
{
    VG.setMouseCursorByID( "webgl", cursor );
    VG.activeMouseCursor = cursor;
};

VG.getHostProperty=function( property )
{
    switch ( property )
    {
        case VG.HostProperty.Platform :
            return VG.HostProperty.PlatformWeb;

        case VG.HostProperty.OperatingSystem :
        {
            var OS = "Unknown";
            if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OS=VG.HostProperty.OSWindows;
            if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OS=VG.HostProperty.OSWindows;
            if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OS=VG.HostProperty.OSWindows;
            if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OS=VG.HostProperty.OSWindows;
            if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OS=VG.HostProperty.OSWindows;
            if (window.navigator.userAgent.indexOf("Mac")!=-1) OS=VG.HostProperty.OSMac;
            if (window.navigator.userAgent.indexOf("X11")!=-1) OS=VG.HostProperty.OSUnix;
            if (window.navigator.userAgent.indexOf("Linux")!=-1) OS=VG.HostProperty.OSLinux;

            return OS;
        }
        break;

        case VG.HostProperty.DrawMenus :
            return true;
    }
};

VG.setHostProperty=function( property, value )
{

};

VG.remoteOpenFile=function( fileName, callback )
{
    var parameters={};

    var string="/upload/" + VG.context.workspace.appId + "/" + fileName;
    VG.sendBackendRequest( string, JSON.stringify( parameters ), callback, "GET" );
};

VG.remoteSaveFile=function( fileName, data, callback )
{
    var parameters={};
    parameters[fileName]=data;

    var string="/upload/" + VG.context.workspace.appId;
    VG.sendBackendRequest( string, JSON.stringify( parameters ), callback, "POST" );
};

/**
 * Decompresses encoded image data.
 * @param {string} data - The Base64 encoded data to decompress
 * @param {VG.Core.Image} - The image object to decompress into, can be empty.
 * @param {callback} finishedCallback - Will be called upon completion with the image object as its main parameter.
 * @example
 *
 * VG.decompressImageData( imageData, VG.Core.Image(), function( image ) {
 *     VG.log( "Image decoded successfully." );
 * });
 */

VG.decompressImageData=function( data, image, finishedCallback, options )
{
    var im=new Image();
    image.locked=true;

    im.onload=function()
    {
        //image.data=null;
        image.imageData=data;

        var textureCanvas=document.getElementById( 'textureCanvas' );
        var ctx=textureCanvas.getContext('2d');

        ctx.canvas.width=im.width;
        ctx.canvas.height=im.height;

        var alwaysUseImage=false;
        if ( options && options.alwaysUseImage )
            alwaysUseImage=true;

        if ( !alwaysUseImage ) {
            if ( image.width !== im.width || image.height !== im.height )
                image.resize( im.width, im.height );
        }

        ctx.drawImage(im, 0, 0, im.width, im.height);

        var imageData=ctx.getImageData( 0, 0, im.width, im.height );
        var pixelData=imageData.data;

        for ( var h=0; h < image.height; ++h )
        {
            var offset=h * imageData.width * 4;
            var dOffset=h * image.modulo;

            for ( var w=0; w < image.width; ++w )
            {
                image.data[dOffset++]=pixelData[offset++];
                image.data[dOffset++]=pixelData[offset++];
                image.data[dOffset++]=pixelData[offset++];
                image.data[dOffset++]=pixelData[offset++];
            }
        }

        im=null;
        image.locked=false;
        image.needsUpdate=true;
        VG.update();

        if ( finishedCallback ) finishedCallback( image );
    };
    im.src=data;
};

/**
 * Compresses an image to .PNG or .JPEG.
 * @param {VG.Core.Image} - The image object to compress.
 * @param {string} format - The image format to compress into, can be "PNG" or "JPEG". "PNG" is default.
 * @example
 *
 * var imageData=VG.compressImage( image, "PNG" );
 *
 */

VG.compressImage=function( image, format, quality )
{
    var ctx=textureCanvas.getContext('2d');

    ctx.canvas.width=image.width;
    ctx.canvas.height=image.height;

    var id=ctx.getImageData( 0, 0, image.width, image.height );
    var pixelData=id.data;

    var h, w, offset, dOffset;
    if ( image.elements === 4 )
    {
        for ( h=0; h < image.height; ++h )
        {
            for ( w=0; w < image.width; ++w )
            {
                offset=h * image.width * 4 + w * 4;
                dOffset=h * image.modulo + w * 4;

                pixelData[offset]=image.data[dOffset];
                pixelData[offset+1]=image.data[dOffset+1];
                pixelData[offset+2]=image.data[dOffset+2];
                pixelData[offset+3]=image.data[dOffset+3];
            }
        }
    } else
    if ( image.elements === 1 )
    {
        for ( h=0; h < image.height; ++h )
        {
            for ( w=0; w < image.width; ++w )
            {
                offset=h * image.width * 4 + w * 4;
                dOffset=h * image.modulo + w;
                //im.setPixelRGBA( w, h, pixelData[offset], pixelData[offset+1], pixelData[offset+2], pixelData[offset+3] );

                var val=Math.floor( image.data[dOffset] );
                pixelData[offset]=val;
                pixelData[offset+1]=val;
                pixelData[offset+2]=val;
                pixelData[offset+3]=255;
            }
        }
    }

    ctx.putImageData( id, 0, 0 );

    if ( format && format === "JPEG" )
        return ctx.canvas.toDataURL( "image/jpeg", quality );
    else if ( format )
        return ctx.canvas.toDataURL( "image/" + format.toLowerCase(), quality );
    else return ctx.canvas.toDataURL( "image/png", quality );
};

VG.loadStyleSVG=function( style, svgName, callback )
{
    var request = new VG.ajaxRequest();

    request.withCredentials = true;

    request.onreadystatechange = function() {
        if (request.readyState == 4)
        {
            if ( request.status == 200 || window.location.href.indexOf("http") ==-1 ) {
                VG.Core.SVG( svgName, request.responseText, 20 );
            }
        }
    };

    var path;

    if ( VG.localVGLibPrefix ) path=VG.localVGLibPrefix + "vglib/ui/styles/" + style + "/svg/" + svgName;
    else path="/vglib/ui/styles/" + style + "/svg/" + svgName;

    request.open( "GET", path, true );
    request.setRequestHeader( "Content-type", "application/json;charset=UTF-8" );
    request.send();// parameters );
};

VG.loadStyleHtml=function( style, svgName, callback )
{
    var request = new VG.ajaxRequest();

    request.withCredentials = true;

    request.onreadystatechange = function() {
        if (request.readyState == 4)
        {
            if ( request.status == 200 || window.location.href.indexOf("http") ==-1 ) {
                VG.Shaders.fs[svgName]=request.responseText;
            }
        }
    };

    var path;

    if ( VG.localVGLibPrefix ) path=VG.localVGLibPrefix + "vglib/ui/styles/" + style + "/svg/" + svgName;
    else path="/vglib/ui/styles/" + style + "/svg/" + svgName;

    request.open( "GET", path, true );
    request.setRequestHeader( "Content-type", "application/json;charset=UTF-8" );
    request.send();// parameters );
};


VG.loadShader=function( shaderName )
{
    var request = new VG.ajaxRequest();

    request.withCredentials = true;

    request.onreadystatechange = function() {
        if (request.readyState == 4)
        {
            if ( request.status == 200 || window.location.href.indexOf("http") ==-1 ) {
                VG.Shaders.fs[shaderName]=request.responseText;
            }
        }
    };

    var path;

    if ( VG.localVGLibPrefix ) path=VG.localVGLibPrefix + "vglib/shaders/" + shaderName;
    else path="/vglib/shaders/" + shaderName;

    request.open( "GET", path, true );
    request.setRequestHeader( "Content-type", "application/json;charset=UTF-8" );
    request.send();// parameters );
};

VG.loadStyleImage=function( style, imageName, callback )
{
    var image=new Image();
    image.onload=function()
    {
        var im=VG.Core.Image( image.width, image.height );
        im.name=image.name;

        var textureCanvas=document.getElementById( 'textureCanvas' );
        var ctx=textureCanvas.getContext('2d');

        ctx.canvas.width=image.width;
        ctx.canvas.height=image.height;

        ctx.drawImage(image, 0, 0, image.width, image.height);

        //getImageData is somehow very expensive to call
        var pixelData=ctx.getImageData( 0, 0, image.width, image.height ).data;

        for ( var h=0; h < image.height; ++h )
        {
            for ( var w=0; w < image.width; ++w )
            {
                var offset=h * image.width * 4 + w * 4;

                im.setPixelRGBA( w, h,
                    pixelData[offset],
                    pixelData[offset+1],
                    pixelData[offset+2],
                    pixelData[offset+3]
                );
            }
        }

        VG.context.imagePool.addImage( im );
        image=null;
        VG.update();

        if (callback) callback(im);
     };

    if ( VG.localVGLibPrefix ) image.src=VG.localVGLibPrefix + "vglib/ui/styles/" + style + "/icons/" + imageName;
    else image.src="/vglib/ui/styles/" + style + "/icons/" + imageName;

    image.name=imageName;
    image.stylePath=style;
};

VG.copyToClipboard=function( type, data )
{
    if ( type === "Text" ) VG.context.workspace.textClipboard = data;
    else
    if ( type === "Image" ) VG.context.workspace.imageClipboard = data;
    else
    if ( type === "Nodes" ) VG.context.workspace.nodesClipboard = data;
    else
    VG.context.workspace.textClipboard = data;

    if ( VG.context.workspace.isElectron() )
    {
        const { clipboard, nativeImage } = require('electron');

        if ( type === "Image" ) {
            let imageData = VG.compressImage( data );
            let image = nativeImage.createFromDataURL( imageData );

            clipboard.writeImage( image );
        }
    }
};

VG.clipboardPasteDataForType=function( type )
{
    if ( type === "Text" ) return VG.context.workspace.textClipboard;
    else
    if ( type === "Image" ) return VG.context.workspace.imageClipboard;
    else
    if ( type === "Nodes" ) return VG.context.workspace.nodesClipboard;
    else
    return VG.context.workspace.textClipboard;
};

/**
 * Opens the given Url in a new browser tab.
 * @param {string} url - The url to open.
 *
 */

VG.gotoUrl=function( link )
{
    if ( !VG.context.workspace.isElectron() ) window.open( link );
    else {
        const {shell} = require('electron')
        shell.openExternal( link );
    }
};
