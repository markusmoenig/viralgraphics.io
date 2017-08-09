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

    // --- Figure out which layer is on top, 2D or 3D, 3D by default

    let canvasName = "webgl";

    if ( VG.App.onTop ) {
        let onTop = VG.Utils.decompressFromBase64( VG.App.onTop );
        if ( onTop === "2D" ) {
            document.getElementById("webgl").style.zIndex = 0;
            canvasName = "workspace";
            VG.context.twoDOnTop = true;
        }
    }

    VG.dropZone=document.getElementById( 'dropZone' );
    let canvas=document.getElementById( canvasName );

    canvas.addEventListener('dragover', VG.defaultHandleDragOver, false);

    // ---- Plug into browser cut / copy paste

    window.addEventListener('cut', function ( event ) {
        VG.context.workspace.modelCutCallback.call( VG.context.workspace, true );
        if ( event.clipboardData ) {
            if ( !VG.context.workspace.isElectron() ) {
                event.clipboardData.setData('text/plain',  VG.context.workspace.textClipboard );
            }
        }
        event.preventDefault();
    });

    window.addEventListener('copy', function ( event ) {
        VG.context.workspace.modelCopyCallback.call( VG.context.workspace, true );
        if ( event.clipboardData ) {
            if ( !VG.context.workspace.isElectron() ) {
                if ( VG.context.workspace.imageClipboard ) {
                    event.clipboardData.setData('image/png',  VG.compressImage( VG.context.workspace.imageClipboard ) );
                } else
                event.clipboardData.setData('text/plain',  VG.context.workspace.textClipboard );
            }
        }
        event.preventDefault();
    });

    window.addEventListener('paste', function ( event ) {

        if ( !VG.context.workspace.isElectron() ) {
            let pasteData;
            if ( event.clipboardData ) {

                pasteData=event.clipboardData.getData( 'text/plain' );
                if ( pasteData ) {
                    VG.copyToClipboard( "Text", pasteData );
                }
            }

            // if ( !pasteData )
            {
                let items = (event.clipboardData  || event.originalEvent.clipboardData).items;

                // find pasted image among pasted items
                let blob = null;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") === 0) {
                        blob = items[i].getAsFile();
                    }
                }

                // load image if there is a pasted image
                if (blob !== null) {
                    let reader = new FileReader();
                    reader.onload = function(event) {
                        pasteData=event.target.result;
                        VG.decompressImageData( pasteData, VG.Core.Image(), function( image ) {
                            VG.copyToClipboard( "Image", image );
                            VG.context.workspace.modelPasteCallback.call( VG.context.workspace, true );
                        } );
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
        VG.context.workspace.modelPasteCallback.call( VG.context.workspace, true );
        event.preventDefault();
    });

    // --- Touch Events

    VG.context.workspace=VG.UI.Workspace();
    if ( VG.App.id ) VG.context.workspace.appId = VG.Utils.decompressFromBase64( VG.App.id );
    VG.context.workspace.appName = VG.Utils.decompressFromBase64( VG.App.name );

    window.addEventListener('touchstart', function ( event ) {

        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var touch=touches[i];
            VG.context.workspace.mouseMove( touch.clientX, touch.clientY );
            VG.context.workspace.mouseDown( VG.Events.MouseButton.Left );
        }

        event.preventDefault();
    });

    window.addEventListener('touchmove', function ( event ) {

        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var touch=touches[i];
            VG.context.workspace.mouseMove( touch.clientX, touch.clientY );
        }

        event.preventDefault();
    });

    window.addEventListener('touchend', function ( event ) {

        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var touch=touches[i];
            VG.context.workspace.mouseUp( VG.Events.MouseButton.Left );
        }

        event.preventDefault();
    });

    window.addEventListener('DOMMouseScroll', function ( event ) {
        // --- FF mousewheel
        wheelRelay( event );
        event.preventDefault();
    });

    window.addEventListener("beforeunload", function (e) {
        if ( !VG.context.workspace.isElectron() )
        {
            let confirmationMessage;
            if ( VG.context.workspace && !VG.context.workspace.canBeClosed() ) {
                confirmationMessage = 'You have unsaved changes. If you leave before saving, your changes will be lost.';
            }

            if ( !confirmationMessage ) return undefined;

            (e || window.event).returnValue = confirmationMessage; //Gecko + IE
            return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
        }
    });

    window.addEventListener('focus', function ( event ) {

        VG.context.workspace.focusIn();
    });

    window.addEventListener('blur', function ( event ) {

        VG.context.workspace.focusOut();
    });


    // ---

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
            // todo: seems to never executed, even on error
            success=false;
            console.log('decodedSource:=', decodedSource);
            console.log( e.message );
        }
    }

    // --- Add the SVGs of the project to the pool
    for (var svgName in VG.App.svg )  {
        var decodedSVG=VG.Utils.decompressFromBase64( VG.App.svg[svgName] );

        var svg=VG.Core.SVG( svgName, decodedSVG );
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

    // --- Activate the right Skin

    if ( VG.App.defaultSkin ) {
        var defaultSkin=VG.Utils.decompressFromBase64( VG.App.defaultSkin );
        if ( defaultSkin && defaultSkin.length ) {
            for ( var i=0; i < VG.UI.stylePool.current.skins.length; ++i ) {
                var skin=VG.UI.stylePool.current.skins[i];
                if ( skin.name === defaultSkin ) {
                    VG.UI.stylePool.current.skin=skin;
                    break;
                }
            }
        }
    }

    // --- Splash Screen
/*
    if ( VG.App.splashScreen && VG.App.showSplashScreen )
    {
        var splashScreen=VG.Utils.decompressFromBase64( VG.App.splashScreen );
        eval( splashScreen );

        if ( VG.drawSplashScreen )
        {
            VG.context.workspace.canvas.setAlpha( 0 );
            VG.splashStartTime=new Date().getTime();
        }
    } else
    {
        VG.splashScreenFunc=null;
        //VG.splashScreenFuncFadeIn=null;

        VG.resizeCanvas( true );

        var rt=VG.Renderer().mainRT;
        rt.setViewport( VG.context.workspace.rect );

        VG.context.workspace.canvas.setAlpha( 1 );
        VG.context.workspace.canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.context.workspace.rect, VG.Core.Color( 255, 255, 255 ) );
        VG.context.workspace.canvas.setAlpha( 0 );
    }
*/

    VG.resizeCanvas();

    // --- Set the border color if available

    if ( VG.App.webBorderColor ) {
        let body=document.body;
        let borderColor=VG.Utils.decompressFromBase64( VG.App.webBorderColor );

        body.style["background-color"]=borderColor;
        canvas.style.margin="0 auto";
        canvas.style.display="block";
    }

    // ---

    var arg=[];

    var path=window.location.pathname.split( '/' ).pop();
    if ( path && path.length ) arg.push( path );

    vgMain.call( VG.context, VG.context.workspace, arg.length, arg );

    tick();

    VG.context.workspace.needsRedraw=true;
}

window.addEventListener( 'resize', VG.resizeCanvas );

// ----------------------------------------------------------------- Tick Timer

function tick () {

    requestAnimationFrame(tick);
/*
    if ( VG.splashScreenFunc ) VG.splashScreenFunc();
    else
    if ( VG.splashScreenFuncFadeIn ) VG.splashScreenFuncFadeIn();
    else*/
    {
        if ( VG.context.workspace.tick( VG.context.workspace.needsRedraw ) )
            VG.context.workspace.needsRedraw=false;
    }
}

// ----------------------------------------------------------------- Mouse and Key Event Callbacks which get forwarded to the Workspace

function mouseMoveRelay( event ) {
    VG.context.workspace.mouseMove( event.clientX, event.clientY );
    //VG.context.workspace.mouseMove( event.layerX, event.layerY );
}

function mouseDownRelay( event ) {
    let button = getMouseButton( event );
    VG.context.workspace.mouseDown( button );
}

function mouseUpRelay( event ) {
    let button = getMouseButton( event );
    VG.context.workspace.mouseUp( button );
}

function mouseDoubleClickRelay() {
    VG.context.workspace.mouseDoubleClick();
}

function contextMenuRelay( event ) {
    VG.context.workspace.showContextMenu();
    event.preventDefault();
}

var lastWheelStep;
function wheelRelay( e ) {
    e = window.event || e;
    var step = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    if ( step === 0 && lastWheelStep ) step=lastWheelStep;

    VG.context.workspace.mouseWheel( step );
    e.preventDefault();

    lastWheelStep=step;
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
    let keyCode = event.keyCode;

    // --- Map Firefox Mac Command
    if ( keyCode === 224 && VG.context.workspace.operatingSystem === VG.HostProperty.OSMac )
        keyCode = 91;
    // ---

    VG.context.workspace.keyDown( keyCode );

    if ( event.keyCode === VG.Events.KeyCodes.Backspace || event.keyCode === VG.Events.KeyCodes.Tab ||
         event.keyCode === VG.Events.KeyCodes.ArrowUp || event.keyCode === VG.Events.KeyCodes.ArrowDown || event.keyCode === VG.Events.KeyCodes.ArrowRight ||
         event.keyCode === VG.Events.KeyCodes.ArrowLeft || event.keyCode === VG.Events.KeyCodes.Esc )
        event.preventDefault();
}

function getMouseButton(e)
{
    e = e || window.event;
    let button;

    if (e.which === null)
    {
        button = (e.button < 2) ? VG.Events.MouseButton.Left:
            ((e.button == 4) ? VG.Events.MouseButton.Middle : VG.Events.MouseButton.Right);
    }
    else
    {
        button = (e.which < 2) ? VG.Events.MouseButton.Left :
            ((e.which == 2) ? VG.Events.MouseButton.Middle : VG.Events.MouseButton.Right);
    }

    return button;
}

// ----------------------------------------------------------------- Splash Screen Handler

VG.splashScreenFunc=function()
{
    let rt=VG.Renderer().mainRT;
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

                rt=VG.Renderer().mainRT;
                rt.setViewport( VG.context.workspace.rect );
            }

            VG.context.workspace.canvas.setAlpha( 1 );
            VG.context.workspace.canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.context.workspace.rect, VG.Core.Color( 255, 255, 255 ) );
            VG.context.workspace.canvas.setAlpha( 0 );

            VG.splashScreenFunc=null;
        }
    }
    VG.context.workspace.canvas.flush();
};

VG.splashScreenFuncFadeIn=function()
{
    var alpha=0;

    if ( VG.splashScreenFuncFadeInCounter === undefined ) VG.splashScreenFuncFadeInCounter=Date.now();
    else alpha=( Date.now() - VG.splashScreenFuncFadeInCounter ) / 1000;

    if ( alpha < 1.0 )
    {
        VG.context.workspace.canvas.setAlpha( alpha );
        VG.context.workspace.paintWidget();

        VG.context.workspace.canvas.setAlpha( 1.0 - alpha );
        VG.context.workspace.canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.context.workspace.rect, VG.Core.Color( 255, 255, 255 ) );
    } else
    {
        VG.context.workspace.canvas.setAlpha( 1.0 );
        VG.context.workspace.paintWidget();
        VG.splashScreenFuncFadeIn=null;

        // --- Border Color

        if ( VG.App.webBorderColor ) {
            var borderColor=VG.Utils.decompressFromBase64( VG.App.webBorderColor );
            document.body.style.backgroundColor=borderColor;
        }
    }
    VG.context.workspace.canvas.flush();
};
