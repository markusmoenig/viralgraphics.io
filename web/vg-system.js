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

VG.gotoWebLink=function( link )
{
    window.open( link );    
};
