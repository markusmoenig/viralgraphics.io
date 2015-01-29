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
 * You should have received a copy of the GNU General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// Web specific Implementations

// ----------------------------------------------------------------- Resize Handling

VG.resizeCanvas=function( forceResize ) {

    var canvas=document.getElementById( 'webgl' );

    var width=canvas.clientWidth;
    var height=canvas.clientHeight;

    if ( canvas.width != width || canvas.height != height || forceResize ) 
    {
        canvas.width=width; canvas.height=height;

        VG.context.workspace.resize( canvas.width, canvas.height );
    }
};

// ----------------------------------------------------------------- Default DragOver to disable image on the WebGL canvas

VG.defaultHandleDragOver=function( event ) 
{    
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect='none';
};

// ----------------------------------------------------------------- Main

function main() 
{
    VG.init();
 
    VG.dropZone=document.getElementById( 'dropZone' );

    var canvas=document.getElementById( 'webgl' );

    canvas.addEventListener('dragover', VG.defaultHandleDragOver, false);

    // ---- Plug into browser cut / copy paste

    window.addEventListener('cut', function ( event ) {
        VG.context.workspace.modelCutCallback.call( VG.context.workspace );
        if ( event.clipboardData )
            event.clipboardData.setData('text/plain',  VG.context.workspace.textClipboard );            
        event.preventDefault();
    });

    window.addEventListener('copy', function ( event ) {
        VG.context.workspace.modelCopyCallback.call( VG.context.workspace );
        if ( event.clipboardData )
            event.clipboardData.setData('text/plain',  VG.context.workspace.textClipboard );        
        event.preventDefault();
    });

    window.addEventListener('paste', function ( event ) {

        if ( event.clipboardData ) {
            //console.log('paste event', event.clipboardData.getData( 'text/plain' ) );
            var pasteData=event.clipboardData.getData( 'text/plain' );
            if ( pasteData ) {
                VG.copyToClipboard( "Text", pasteData );
            }
        }

        VG.context.workspace.modelPasteCallback.call( VG.context.workspace );
        event.preventDefault();
    });  

    // ----

    VG.context.workspace=VG.UI.Workspace();

    canvas.onmousedown = mouseDownRelay;
    document.onmouseup = mouseUpRelay;
    document.onmousemove = mouseMoveRelay;  
    document.ondblclick = mouseDoubleClickRelay;  
    document.oncontextmenu = contextMenuRelay;  

    document.onkeydown = keyDownRelay;
    document.onkeypress = keyPressRelay;
    document.onkeyup = keyUpRelay;

    document.onwheel = wheelRelay;

    // --- Add the images of the project to the image pool
    for (var imageName in VG.App.images )  {
        var image=new VG.Core.Image();
        image.name=imageName;

        VG.decompressImageData( VG.App.images[imageName], image );
        VG.context.imagePool.addImage( image );
    }    

    // --- Eval the sources of the App stored in the VG.App Namespace
    for (var sourceName in VG.App.sources )  {

        var decodedSource=VG.Utils.decompressFromBase64( VG.App.sources[sourceName] );

        try {
            eval( decodedSource );
        } catch ( e ) {
            success=false;
            console.log( e.message );
        }        
    }

    // --- Load the Fonts of the project
    for (var fontName in VG.App.fonts )  
    {
        var decodedFont=VG.Utils.decompressFromBase64( VG.App.fonts[fontName] );

        try {
            eval( decodedFont );
        } catch ( e ) {
            success=false;
            console.log( e.message );
        }        
    }   

    VG.fontManager.addFonts();  
    
    // --- Splash Screen 

    if ( VG.App.webSplashScreen )
    {
        var splashScreen=VG.Utils.decompressFromBase64( VG.App.webSplashScreen );
        eval( splashScreen );

        if ( VG.drawSplashScreen ) 
        {
            VG.context.workspace.canvas.setAlpha( 0 );
            VG.splashStartTime=new Date().getTime();
        }
    } 

    VG.resizeCanvas();    

    // ---

    vgMain.call( VG.context, VG.context.workspace );

    tick();

    VG.context.workspace.needsRedraw=true;    
}

window.addEventListener( 'resize', VG.resizeCanvas );

// ----------------------------------------------------------------- Tick Timer

function tick () {

    requestAnimationFrame(tick);

    if ( VG.splashScreenFunc ) VG.splashScreenFunc();
    else
    if ( VG.splashScreenFuncFadeIn ) VG.splashScreenFuncFadeIn();
    else
    {
        VG.context.workspace.tick( VG.context.workspace.needsRedraw );
        VG.context.workspace.needsRedraw=false; 
    }
}

// ----------------------------------------------------------------- Mouse and Key Event Callbacks which get forwarded to the Workspace

function mouseMoveRelay( event ) {
    //VG.context.workspace.mouseMove( event.clientX, event.clientY );
    VG.context.workspace.mouseMove( event.layerX, event.layerY );
}

function mouseDownRelay( event ) {
    VG.context.workspace.mouseDown( isRightMouseButton( event ) ? VG.Events.MouseButton.Right : VG.Events.MouseButton.Left );
}

function mouseUpRelay( event ) {
    VG.context.workspace.mouseUp( isRightMouseButton( event ) ? VG.Events.MouseButton.Right : VG.Events.MouseButton.Left);
}

function mouseDoubleClickRelay() {
    VG.context.workspace.mouseDoubleClick();
}

function contextMenuRelay( event ) {
    VG.context.workspace.showContextMenu();
    event.preventDefault();
}

function wheelRelay( event ) {

    var e = window.event || e;
    var step = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    if ( VG.context.workspace.mouseWheel( step ) )
        event.preventDefault();
}

function keyPressRelay( event ) {
    var code;

    if ( window.event ) code=window.event.keyCode;
    else code=event.which;

    if ( code != VG.Events.KeyCodes.Backspace && code != VG.Events.KeyCodes.Enter &&
         code != VG.Events.KeyCodes.Tab )
      VG.context.workspace.textInput( String.fromCharCode( code ) );

    event.preventDefault();
}

function keyUpRelay( event ) {
    VG.context.workspace.keyUp( event.keyCode );
}

function keyDownRelay( event ) {

    VG.context.workspace.keyDown( event.keyCode );

    if ( event.keyCode === VG.Events.KeyCodes.Backspace || event.keyCode === VG.Events.KeyCodes.Tab ||
         event.keyCode === VG.Events.KeyCodes.ArrowUp || event.keyCode === VG.Events.KeyCodes.ArrowDown || event.keyCode === VG.Events.KeyCodes.ArrowRight ||
         event.keyCode === VG.Events.KeyCodes.ArrowLeft || event.keyCode === VG.Events.KeyCodes.Esc )
        event.preventDefault();    
}

function isRightMouseButton( event )
{
    var isRightMB;
    event = event || window.event;

    if ("which" in event)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB=event.which==3; 
    else if ("button" in e)  // IE, Opera 
        isRightMB=event.button==2; 

    return isRightMB;
}

// ----------------------------------------------------------------- Splash Screen Handler

VG.splashScreenFunc=function() 
{
    var rt=VG.Renderer().mainRT;
    rt.clear( true, true );
    rt.setViewport( VG.context.workspace.rect );

    var ready=true;
    var currentTime = new Date().getTime();

    // --- Check if all images are loaded
    for ( var i=0; i < VG.context.imagePool.images.length; ++i )
    {
        if ( VG.context.imagePool.images[i].locked === true )
        { ready=false; break; }
    }

    var splashFinished=false;

    // --- White Background

    var alpha=VG.context.workspace.canvas.alpha;

    VG.context.workspace.canvas.setAlpha( 1.0 );            
    VG.context.workspace.canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.context.workspace.rect, VG.Core.Color( 255, 255, 255 ) );
    VG.context.workspace.canvas.setAlpha( alpha );

    // --- Draw SplashScreen Code

    VG.context.workspace.canvas.setAlpha( 1.0 - alpha );

    if ( VG.drawSplashScreen )
        splashFinished=VG.drawSplashScreen( VG.context.workspace.rect, VG.context.workspace.canvas, currentTime - VG.splashStartTime );

    VG.context.workspace.canvas.setAlpha( alpha );

    // --- When Finished Fade to White and than pass over to 

    if ( splashFinished && ready )
    {
        if ( VG.context.workspace.canvas.alpha < 1.0 ) 
        {
            VG.context.workspace.canvas.setAlpha( VG.context.workspace.canvas.alpha + 0.05 );
        } else
        {
            if ( !VG.App.webMaximize && VG.getHostProperty( VG.HostProperty.Platform ) === VG.HostProperty.PlatformWeb )
            {
                var canvas=document.getElementById( 'webgl' );
                var body=document.body;

                var w=VG.Utils.decompressFromBase64( VG.App.webCustomWidth );
                var h=VG.Utils.decompressFromBase64( VG.App.webCustomHeight );

                if ( w > 0 ) {
                    var width=w + "px";
                    canvas.style.width=width;
                }

                if ( h > 0 ) {
                    var height=h + "px";
                    body.style.height=height;
                    canvas.style.height=height;                
                }            

                var borderColor=VG.Utils.decompressFromBase64( VG.App.webBorderColor );

                body.style["background-color"]=borderColor;
                canvas.style.margin="0 auto";
                canvas.style.display="block";    

                VG.resizeCanvas( true );      

                var rt=VG.Renderer().mainRT;
                rt.setViewport( VG.context.workspace.rect );                          
            }
            
            VG.context.workspace.canvas.setAlpha( 1 );
            VG.context.workspace.canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.context.workspace.rect, VG.Core.Color( 255, 255, 255 ) );
            VG.context.workspace.canvas.setAlpha( 0 );

            VG.splashScreenFunc=null;
        }
    }
    VG.context.workspace.canvas.flush();        
}

VG.splashScreenFuncFadeIn=function() 
{
    if ( VG.context.workspace.canvas.alpha < 1.0 ) 
    {    
        var alpha=VG.context.workspace.canvas.alpha;

        VG.context.workspace.paintWidget();                    

        VG.context.workspace.canvas.setAlpha( 1.0 - alpha );        
        VG.context.workspace.canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.context.workspace.rect, VG.Core.Color( 255, 255, 255 ) );

        VG.context.workspace.canvas.setAlpha( alpha + 0.05 );        

    } else
    {
        VG.context.workspace.canvas.setAlpha( 1.0 );
        VG.context.workspace.paintWidget();            
        VG.splashScreenFuncFadeIn=null;
    }
    VG.context.workspace.canvas.flush();        
}
