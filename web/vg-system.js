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

VG.downloadRequest=function( url, parameters, method ) 
{ 
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

    var serverUrl="https://visualgraphics.tv";
    /*var serverUrl="http://localhost:3002";*/
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
                return new ActiveXObject(activexmodes[i])
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

VG.setMouseCursor=function( cursor )
{
    VG.setMouseCursorByID( "webgl", cursor );
};

VG.getHostProperty=function( property )
{
    switch ( property )
    {
        case VG.HostProperty.Platform :
            return VG.HostProperty.PlatformWeb;
        break;

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
        break;
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

VG.remoteSaveFile=function( fileName, data )
{
    var parameters={};
    parameters[fileName]=data;

    var string="/upload/" + VG.context.workspace.appId;
    VG.sendBackendRequest( string, JSON.stringify( parameters ), function( responseText ) {
        console.log( responseText );
    }.bind( this ), "POST" );
};

VG.decompressImageData=function( data, image, finishedCallback )
{        
    var im=new Image();
    image.locked=true;

    im.onload=function() 
    { 
        image.data=null;
        image.imageData=data;

        var textureCanvas=document.getElementById( 'textureCanvas' );
        var ctx=textureCanvas.getContext('2d');

        ctx.canvas.width=im.width;
        ctx.canvas.height=im.height;

        image.width=im.width;
        image.height=im.height;
        image.alloc();

        ctx.drawImage(im, 0, 0, im.width, im.height);

        var pixelData=ctx.getImageData( 0, 0, im.width, im.height ).data;

        for ( var h=0; h < im.height; ++h )
        {
            for ( var w=0; w < im.width; ++w )
            {
                var offset=h * image.width * 4 + w * 4
                var dOffset=h * image.modulo + w * 4
                //im.setPixelRGBA( w, h, pixelData[offset], pixelData[offset+1], pixelData[offset+2], pixelData[offset+3] );

                image.data[dOffset]=pixelData[offset];///255.0;
                image.data[dOffset+1]=pixelData[offset+1];///255.0;
                image.data[dOffset+2]=pixelData[offset+2];///255.0;
                image.data[dOffset+3]=pixelData[offset+3];///255.0;
            }
        }

        im=null;
        image.locked=false;
        image.needsUpdate=true;
        VG.update();

        if ( finishedCallback ) finishedCallback();
    }
    im.src=data;  
};

VG.compressImage=function( image )
{
    var ctx=textureCanvas.getContext('2d');
        
    ctx.canvas.width=image.width;
    ctx.canvas.height=image.height;    

    var id=ctx.getImageData( 0, 0, image.width, image.height );
    var pixelData=id.data;
    
    for ( var h=0; h < image.height; ++h )
    {
        for ( var w=0; w < image.width; ++w )
        {
            var offset=h * image.width * 4 + w * 4
            var dOffset=h * image.modulo + w * 4
                //im.setPixelRGBA( w, h, pixelData[offset], pixelData[offset+1], pixelData[offset+2], pixelData[offset+3] );

            pixelData[offset]=image.data[dOffset];
            pixelData[offset+1]=image.data[dOffset+1];
            pixelData[offset+2]=image.data[dOffset+2];
            pixelData[offset+3]=image.data[dOffset+3];
        }
    }

    ctx.putImageData( id, 0, 0 );
    return ctx.canvas.toDataURL();// "image/jpeg" );
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
    else path="vglib/ui/styles/" + style + "/svg/" + svgName;

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
     }

    if ( VG.localVGLibPrefix ) image.src=VG.localVGLibPrefix + "vglib/ui/styles/" + style + "/icons/" + imageName;
    else image.src="vglib/ui/styles/" + style + "/icons/" + imageName;

    image.name=imageName;
    image.stylePath=style;
};

VG.copyToClipboard=function( type, data )
{
    if ( type === "Text" ) VG.context.workspace.textClipboard=data;
    else
    if ( type === "Nodes" ) VG.context.workspace.nodesClipboard=data;
};

VG.clipboardPasteDataForType=function( type )
{
    if ( type === "Text" ) return VG.context.workspace.textClipboard;
    else
    if ( type === "Nodes" ) return VG.context.workspace.nodesClipboard;
    return null;
};

VG.gotoUrl=function( link )
{
    window.open( link );    
};
