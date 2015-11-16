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

    // --- Touch Events

    VG.context.workspace=VG.UI.Workspace();

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

    // ---

    VG.context.workspace=VG.UI.Workspace();
    VG.resizeCanvas();

    canvas.onmousedown = mouseDownRelay;
    document.onmouseup = mouseUpRelay;
    document.onmousemove = mouseMoveRelay;  
    document.ondblclick = mouseDoubleClickRelay;  
    document.oncontextmenu = contextMenuRelay;  

    document.onkeydown = keyDownRelay;
    document.onkeypress = keyPressRelay;
    document.onkeyup = keyUpRelay;

    document.onwheel = wheelRelay;

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
