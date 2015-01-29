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
