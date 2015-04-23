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

// ----------------------------------------------------------------- VG.UI.BaseText

VG.UI.BaseText=function()
{
    if ( !(this instanceof VG.UI.BaseText) ) return new VG.UI.BaseText();

    VG.UI.Frame.call( this );
    this.name="BaseText";
    
    this.hAlignment=VG.UI.HAlignment.Centered;
    this.vAlignment=VG.UI.VAlignment.Centered;

    this.maxTextLineSize=VG.Core.Size();  
    this.textArray=[];
    this.textLines=0;
    this._textHasChanged=false;
    this.lastTextChangeTime=0;
    this.maxTextLine=0;

    this.cursorPosition=VG.Core.Point();
    this.textOffset=VG.Core.Point();

    this.selectionStart=VG.Core.Point(); // --- Unsorted
    this.selectionEnd=VG.Core.Point();

    this.startSel=VG.Core.Point(); // --- Sorted
    this.endSel=VG.Core.Point();

    this.selectionIsValid=false;

    this.vScrollbar=0;
    this.hScrollbar=0;

    this.needsVScrollbar=false;
    this.needsHScrollbar=false;

    this.supportsScrollbars=false;

    this.verified=false;
    this.spacing=0;
    this.readOnly=false;
};

VG.UI.BaseText.prototype=VG.UI.Frame();

Object.defineProperty( VG.UI.BaseText.prototype, "text", {
    get: function() {
        //return this._text;
        return this.textArray.join( "\n" );
    },
    set: function( newText ) {

        this._text=newText;

        if ( !newText ) newText="";

        this.textArray=newText.split(/\r\n|\r|\n/);

        if ( VG.context.workspace )
        {
            this.verifyText();
            this.checkCursorBounds();
        }
        this.selectionIsValid=false;
    }    
});

Object.defineProperty( VG.UI.BaseText.prototype, "textHasChanged", {
    get: function() {
        return this._textHasChanged;
    },
    set: function( textHasChanged ) {
        this._textHasChanged=textHasChanged;
        this.lastTextChangeTime=Date.now();
    }    
});

VG.UI.BaseText.prototype.checkCursorBounds=function()
{
    // --- Check if cursorposition is in bounds
    if ( this.cursorPosition.y >= this.textLines ) this.cursorPosition.y=this.textLines-1;
    if ( this.cursorPosition.x >= this.textArray[this.cursorPosition.y].length )
        this.cursorPosition.x=this.textArray[this.cursorPosition.y].length;
};

// --------------------- Clipboard

VG.UI.BaseText.prototype.clipboardCopyIsAvailable=function()
{
    if ( this.selectionIsValid ) return "Text";
    else return null;
};

VG.UI.BaseText.prototype.clipboardPasteIsAvailableForType=function( type )
{
    if ( type === "Text" && !this.readOnly ) return true;
    return false;
};

VG.UI.BaseText.prototype.clipboardCut=function()
{
    if ( !this.selectionIsValid ) return;

    VG.copyToClipboard( "Text", this.copySelection() );
    this.deleteSelection();
    this.textHasChanged=true;
    this.focusOut();      
}

VG.UI.BaseText.prototype.clipboardCopy=function()
{
    VG.copyToClipboard( "Text", this.copySelection() );
}

VG.UI.BaseText.prototype.clipboardPaste=function()
{
    if ( this.selectionIsValid ) this.deleteSelection( true );
    this.insertText( VG.clipboardPasteDataForType( "Text" ) );
    this.textHasChanged=true;
    this.focusOut();
};

VG.UI.BaseText.prototype.clipboardDeleteSelection=function()
{
    if ( this.selectionIsValid ) this.deleteSelection( true );
    this.textHasChanged=true;
    this.focusOut();       
};

// --------------------- Clipboard End

// --------------------- Other Functions used Globally

VG.UI.BaseText.prototype.selectAll=function()
{
    this.selectionStart.set( 0, 0 );
    this.selectionEnd.set( this.textArray[this.textLines-1].length, this.textLines-1);

    if ( !this.selectionStart.equals( this.selectionEnd ) )  {
        this.sortSelection();
        this.selectionIsValid=true;
    }    
};

// ---

VG.UI.BaseText.prototype.verifyText=function()
{
    this.textLines=this.textArray.length;
    if ( this.font ) VG.context.workspace.canvas.pushFont( this.font );

    this.maxTextLineSize.set(0, 0);
    this.maxTextLineSize.height=VG.context.workspace.canvas.getLineHeight();
    this.itemHeight=this.maxTextLineSize.height + this.spacing;
    var size=VG.Core.Size();

    for ( var i=0; i < this.textLines; ++i ) {

        VG.context.workspace.canvas.getTextSize( this.textArray[i], size );
        if ( size.width > this.maxTextLineSize.width ) {

            this.maxTextLineSize.width=size.width;
            this.maxTextLine=i;
        }
        //if ( size.height > this.maxTextLineSize.height ) this.maxTextLineSize.height=size.height;
    }

    size=this.calcSize( VG.context.workspace.canvas );
    this.verified=false;    

    if ( this.font ) VG.context.workspace.canvas.popFont();
};

VG.UI.BaseText.prototype.verifyTextForLineChange=function( line )
{
    //if ( line === this.maxTextLine ) { this.verifyText(); return }

    if ( this.font ) VG.context.workspace.canvas.pushFont( this.font );

    var size=VG.Core.Size();

    VG.context.workspace.canvas.getTextSize( this.textArray[line], size );
    if ( size.width > this.maxTextLineSize.width ) {
        this.maxTextLineSize.width=size.width;
        this.maxTextLine=line;
    }

    size=this.calcSize( VG.context.workspace.canvas );
    this.verified=false;

    if ( this.font ) VG.context.workspace.canvas.popFont();
};


VG.UI.BaseText.prototype.vHandleMoved=function( offsetInScrollbarSpace )
{
    this.textOffset.y=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
};

VG.UI.BaseText.prototype.hHandleMoved=function( offsetInScrollbarSpace, customLine )
{
    this.textOffset.x=offsetInScrollbarSpace * this.hScrollbar.totalSize / this.hScrollbar.visibleSize;
};

VG.UI.BaseText.prototype.verifyScrollbar=function()
{
    // --- Check if we have enough vertical space for all text lines

    this.needsVScrollbar=false;

    this.totalItemHeight=this.textLines * this.maxTextLineSize.height + (this.textLines-1) * this.spacing;
    this.heightPerItem=this.totalItemHeight / this.textLines;
    this.visibleItems=Math.floor( this.contentRect.height / this.heightPerItem );
    this.lastTopItem=Math.ceil( this.textLines - this.visibleItems );

    if ( this.supportsScrollbars && this.totalItemHeight > this.contentRect.height )
        this.needsVScrollbar=true;

    if ( this.needsVScrollbar && this.supportsScrollbars && !this.vScrollbar ) {
        this.vScrollbar=VG.UI.Scrollbar( "Text Scrollbar" );
        this.vScrollbar.callbackObject=this;
    }

    if ( !this.needsVScrollbar ) this.textOffset.y=0;    

    // --- Check if we have enough horizontal space for the longest text line

    this.needsHScrollbar=false;

    if ( this.supportsScrollbars && this.maxTextLineSize.width + 10 > this.contentRect.width ) {
         this.needsHScrollbar=true;   
    }

    if ( this.needsHScrollbar && this.supportsScrollbars && !this.hScrollbar ) {
        this.hScrollbar=VG.UI.Scrollbar( "Text Scrollbar" );
        this.hScrollbar.direction=VG.UI.Scrollbar.Direction.Horizontal;
        this.hScrollbar.callbackObject=this;
    }    

    if ( !this.needsHScrollbar ) this.textOffset.x=0;

    this.verified=true;
};

VG.UI.BaseText.prototype.calcSize=function()
{
    var size=VG.Core.Size();
    
    size.width=this.maxTextLineSize.width;
    size.height=this.maxTextLineSize.height * this.textLines;

    if ( this.frameType !== VG.UI.Frame.Type.None ) {
        size.width+=4;
        size.height+=4;
    }

    this.checkSizeDimensionsMinMax( size );    

    return size;
};

VG.UI.BaseText.prototype.applyCursorPos=function( pos )
{
    if ( this.font ) VG.context.workspace.canvas.pushFont( this.font );

    var lineY=Math.floor( (this.textOffset.y + pos.y - this.contentRect.y ) / this.heightPerItem );

    if ( lineY < 0 ) lineY=0;

    if ( lineY >= this.textLines )
        lineY=this.textLines-1;

    this.cursorPosition.y=lineY;

    // --- Get the x cursor position

    var text=this.textArray[this.cursorPosition.y];
    if ( !text ) { if ( this.font ) VG.context.workspace.canvas.popFont(); this.cursorPosition.x=0; return; }

    var size=VG.Core.Size();
    var offset=0;
    var textTester=text.slice( 0, offset );
    var leftPixelPosX=0;

    while ( ( (this.contentRect.x - this.textOffset.x + size.width ) < pos.x ) && offset <= text.length )
    {
        ++offset;
        textTester=text.slice( 0, offset );
        leftPixelPosX=size.width;
        VG.context.workspace.canvas.getTextSize( textTester, size );
    }

    var rightPixelPosX=size.width;

    // --- Place the cursor on the left or right side of the character depending on click position

    if ( ( pos.x - this.contentRect.x ) <= leftPixelPosX + (rightPixelPosX - leftPixelPosX) / 2 ) 
    {
        this.cursorPosition.x=offset-1;
    } else {
        this.cursorPosition.x=offset;
    }

    // --- Bounds check

    if ( this.cursorPosition.x < 0 ) this.cursorPosition.x=0
    if ( this.cursorPosition.x >= text.length ) this.cursorPosition.x=text.length;

    if ( this.font ) VG.context.workspace.canvas.popFont();
};

VG.UI.BaseText.prototype.mouseMove=function( event )
{
    if ( this.needsVScrollbar && this.vScrollbar )
    {
        if ( this.vScrollbar.rect.contains( event.pos ) ) {
            this.vScrollbar.mouseMove( event );
            return;
        } else
        {
            if ( this.vScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) {
                this.vScrollbar.visualState=VG.UI.Widget.VisualState.Normal;
                VG.update();
            }
        }
    }    

    if ( this.needsHScrollbar && this.hScrollbar )
    {
        if ( this.hScrollbar.rect.contains( event.pos ) ) {
            this.hScrollbar.mouseMove( event );
            return;
        } else
        {
            if ( this.hScrollbar.visualState === VG.UI.Widget.VisualState.Hover ) {
                this.hScrollbar.visualState=VG.UI.Widget.VisualState.Normal;
                VG.update();
            }
        }
    }

    // --- If mouse leaves the entry field and the text is changed, accept the text changes if not a TextLineEdit

    if ( !this.rect.contains( event.pos ) && this.textHasChanged && (!(this instanceof VG.UI.TextLineEdit)) ) 
        this.focusOut();

    // --- Selection

    if ( this.dragging ) {
        this.applyCursorPos( event.pos );
    
        this.selectionEnd.set( this.cursorPosition );
        if ( !this.selectionStart.equals( this.selectionEnd ) ) {

            this.sortSelection();
            this.selectionIsValid=true;
            VG.update();
            //VG.Utils.ensureRedrawWithinMs( 50 );
        }
    }
};

VG.UI.BaseText.prototype.mouseDown=function( event )
{    
    if ( event.button !== VG.Events.MouseButton.Left ) return;

    // --- Test if the mouse-click is inside one of the scrollbars

    if ( this.needsVScrollbar && this.vScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
        return;
    }

    if ( this.needsHScrollbar && this.hScrollbar && this.hScrollbar.rect.contains( event.pos ) ) {
        this.hScrollbar.mouseDown( event );
        return;
    }

    if ( this.lastDClickTime && ( ( Date.now() ) - this.lastDClickTime  < 300 ) )
    {
        this.selectionStart.x=0
        this.selectionEnd.x=this.textArray[this.cursorPosition.y].length;

        if ( !this.selectionStart.equals( this.selectionEnd ) )  {
            this.sortSelection();
            this.selectionIsValid=true;
        }            
    } else
    {
        this.dragging=true;

        this.applyCursorPos( event.pos );
        this.selectionStart.set( this.cursorPosition );
        this.selectionEnd.set( this.cursorPosition );
        this.selectionIsValid=false;
    }

    // ---

    this.resetBlinkState();
    VG.update();
};

VG.UI.BaseText.prototype.mouseDoubleClick=function( event )
{
    this.dragging=false; this.selectionIsValid=false;
    this.applyCursorPos( event.pos );

    var text=this.textArray[this.cursorPosition.y];
    this.selectionStart.x=this.selectionEnd.x=this.cursorPosition.x;
    this.selectionStart.y=this.selectionEnd.y=this.cursorPosition.y;

    var boundryItems=[" ", ".", ",", ":", ";", "=", "(", ")", "[", "]", "{", "}", "\"", "'"];

    this.selectionStart.x=this.textBoundry( text, true, boundryItems, this.selectionStart.x );
    this.selectionEnd.x=this.textBoundry( text, false, boundryItems, this.selectionEnd.x );

    if ( !this.selectionStart.equals( this.selectionEnd ) )  {
        this.lastDClickTime=Date.now();    
        this.sortSelection();
        this.selectionIsValid=true;

        VG.Utils.scheduleRedrawInMs( 30 )
        VG.update();
    }

    if ( this.mouseDoubleClickCallback ) this.mouseDoubleClickCallback( this.textArray[this.cursorPosition.y] );
};

VG.UI.BaseText.prototype.textBoundry=function( text, left, boundryItems, offset )
{
    var i=offset;
    while( i > 0 && i < text.length )
    {
        var value=text[i];
        var hit=false;

        for ( var k=0; k < boundryItems.length; ++k ) {
            if ( boundryItems[k] === value ) {
                if ( left && i+1 < text.length ) return i+1;
                else return i;
            }
        }

        if ( !hit ) {
            if ( left ) i-=1;
            else i+=1;
        }
    }
    return i;
};

VG.UI.BaseText.prototype.mouseUp=function( event )
{
    this.dragging=false;
};

VG.UI.BaseText.prototype.keyDown=function( keyCode, keysDown )
{
    //console.log( "BaseText:" + keyCode );
    var recognized=false;
    var hasChanged=false;
    
    if ( keyCode == VG.Events.KeyCodes.ArrowLeft )
    {
        // --- Arrow Key Left

        if ( keysDown.indexOf( VG.Events.KeyCodes.AppleLeft ) !== -1 || keysDown.indexOf( VG.Events.KeyCodes.Ctrl ) !== -1 ) 
        {
            // --- Goto Start of Line

            var oldCursorPos=this.cursorPosition.x;
            this.cursorPosition.x=0;
            var text=this.textArray[this.cursorPosition.y];

            if ( this.enforceJSSyntax ) {
                for( var i=0; i < text.length; ++i ) {
                    if ( text[i] !== " " ) break;
                    else ++this.cursorPosition.x;
                }
            }

            if ( this.cursorPosition.x && this.cursorPosition.x === oldCursorPos )
                this.cursorPosition.x=0;
        } else
        {
            // --- Single Char Left

            if ( this.cursorPosition.x > 0 )
            {
                this.cursorPosition.x-=1;
            } else if ( !this.cursorPosition.x && this.cursorPosition.y > 0 )
            {
                this.cursorPosition.y-=1;            
                this.cursorPosition.x=this.textArray[this.cursorPosition.y].length;
            }
        }

        if ( this.needsHScrollbar )
            this.ensureCursorIsVisible();

        recognized=true;                    
    } else
    if ( keyCode == VG.Events.KeyCodes.ArrowRight )
    {
        // --- Arrow Key Right

        if ( keysDown.indexOf( VG.Events.KeyCodes.AppleLeft ) !== -1 || keysDown.indexOf( VG.Events.KeyCodes.Ctrl ) !== -1 ) 
        {
            // --- Goto End of Line

            this.cursorPosition.x=this.textArray[this.cursorPosition.y].length;
        } else
        {
            // --- Single Char Right
            if ( this.cursorPosition.x < this.textArray[this.cursorPosition.y].length )
            {
                this.cursorPosition.x+=1;
            } else if ( this.cursorPosition.x >= this.textArray[this.cursorPosition.y].length && this.cursorPosition.y < this.textLines-1 )
            {
                this.cursorPosition.y+=1;            
                this.cursorPosition.x=0;
            }
        }

        if ( this.needsHScrollbar )
            this.ensureCursorIsVisible();

        recognized=true;                    
    } else    
    if ( keyCode == VG.Events.KeyCodes.ArrowUp )
    {
        // --- Arrow Key Up

        if ( keysDown.indexOf( VG.Events.KeyCodes.Alt ) !== -1 ) 
        {
            // --- Alt Key: Page Down

            this.cursorPosition.y-=this.visibleItems;
            this.textOffset.y-=this.visibleItems * this.itemHeight;

            if ( this.cursorPosition.y < 0 ) this.cursorPosition.y=0;
            if ( this.textOffset.y < 0 ) this.textOffset.y=0;

            this.vScrollbar.scrollTo( this.textOffset.y );
        } else {
            if ( this.cursorPosition.y > 0 )
            {
                // --- Singe Line Up

                this.cursorPosition.y-=1;

                // --- Correct X Position if necessary
                if ( this.cursorPosition.x > this.textArray[this.cursorPosition.y].length )
                    this.cursorPosition.x=this.textArray[this.cursorPosition.y].length;

                if ( this.needsHScrollbar )
                    this.ensureCursorIsVisible();

                if ( this.needsVScrollbar )
                {
                    // --- Scroll one line up if necessary
                    var y=this.contentRect.y - this.textOffset.y + (this.cursorPosition.y) * (this.maxTextLineSize.height + this.spacing);

                    if ( y < this.contentRect.y ) {
                        this.textOffset.y-=this.itemHeight;
                        this.vScrollbar.scrollTo( this.textOffset.y );                
                    }
                } 
            }
        }        

        recognized=true;                    
    } else
    if ( keyCode == VG.Events.KeyCodes.ArrowDown )
    {
        // --- Arrow Key Down

        if ( keysDown.indexOf( VG.Events.KeyCodes.Alt ) !== -1 ) 
        {
            // --- Alt Key: Page Down

            this.cursorPosition.y+=this.visibleItems;
            this.textOffset.y+=this.visibleItems * this.itemHeight;

            if ( this.cursorPosition.y >= this.textLines-1 ) this.cursorPosition.y=this.textLines-1;

            this.vScrollbar.scrollTo( this.textOffset.y );
        } else {
            if ( this.cursorPosition.y < this.textLines-1 )
            {
                // --- Single Line Down

                this.cursorPosition.y+=1;

                // --- Correct X Position if necessary
                if ( this.cursorPosition.x > this.textArray[this.cursorPosition.y].length ) {
                    this.cursorPosition.x=this.textArray[this.cursorPosition.y].length;

                    if ( this.needsHScrollbar )
                        this.ensureCursorIsVisible();
                }

                if ( this.needsVScrollbar )
                {
                    // --- Scroll one line down if necessary
                    var y=this.contentRect.y - this.textOffset.y + this.cursorPosition.y * (this.maxTextLineSize.height + this.spacing);

                    if ( y + this.maxTextLineSize.height > this.contentRect.bottom() ) {
                        this.textOffset.y+=this.maxTextLineSize.height + this.spacing;
                        this.vScrollbar.scrollTo( this.textOffset.y );                
                    }
                }
            }            
        }

        recognized=true;            
    } else
    if ( keyCode == VG.Events.KeyCodes.Backspace && !this.readOnly )
    {
        // --- Delete Pressed

        if ( this.selectionIsValid )
            this.deleteSelection();
        else
        if ( this.cursorPosition.x > 0 )
        {
            var processed=false;
            var oldText=this.textArray[this.cursorPosition.y];

            if ( this.enforceJSSyntax ) 
            {
                // --- CodeEditor only
                if ( this.settings && this.settings.Spaces )//&& this.cursorPosition.x >= this.settings.Spaces )
                {
                    processed=true; var spacesToEliminate=this.cursorPosition.x % this.settings.Spaces;
                    if ( !spacesToEliminate ) spacesToEliminate=this.settings.Spaces;
                    for( var i=1; i <= spacesToEliminate; ++i ) {
                        if ( oldText[this.cursorPosition.x-i] !== ' ' )
                        { processed=false; break; }
                    }
                    if ( processed ) {
                        this.textArray[this.cursorPosition.y]=oldText.slice( 0, this.cursorPosition.x - spacesToEliminate ) + oldText.slice( this.cursorPosition.x );
                        this.cursorPosition.x-=spacesToEliminate;
                    }
                } 
            }

            if ( !processed ) {
                // --- Delete the previous character

                this.cursorPosition.x-=1;

                var newText=oldText.slice(0, this.cursorPosition.x);
                this.textArray[this.cursorPosition.y]=newText + oldText.slice( this.cursorPosition.x+1 )
            }

            this.textHasChanged=true;   
            hasChanged=true;         
        } else
        if ( this.cursorPosition.y > 0 )
        {
            // --- Remove this line and append this line to the previous line

            var oldText=this.textArray[this.cursorPosition.y];
            this.textArray.splice( this.cursorPosition.y, 1 );

            this.cursorPosition.y-=1;
            this.cursorPosition.x=this.textArray[this.cursorPosition.y].length;

            var newText=this.textArray[this.cursorPosition.y] + oldText;
            this.textArray[this.cursorPosition.y]=newText;

            this.verifyText();
            this.textHasChanged=true;
        }     

        if ( this.needsHScrollbar )
            this.ensureCursorIsVisible();

        recognized=true;
    }

    if ( recognized )
    {
        this.selectionIsValid=false;
        if ( hasChanged ) this.verifyTextForLineChange( this.cursorPosition.y );
        this.resetBlinkState();
        VG.update();
    }

    if ( this.keyDownCallback ) this.keyDownCallback( keyCode, keysDown );   

    return recognized;
};

VG.UI.BaseText.prototype.mouseWheel=function( step )
{
    if ( !this.needsVScrollbar ) return false;

    if ( step > 0 ) 
    {
        this.textOffset.y-=this.itemHeight;
        this.vScrollbar.scrollTo( this.textOffset.y );  
    } else 
    {
        this.textOffset.y+=this.itemHeight;
        this.vScrollbar.scrollTo( this.textOffset.y );   
    }

    this.resetBlinkState();
    VG.update();    
    return true;
};

VG.UI.BaseText.prototype.ensureCursorIsVisible=function()
{
    if ( this.font ) VG.context.workspace.canvas.pushFont( this.font );

    var text=this.textArray[this.cursorPosition.y];
    text=text.slice( 0, this.cursorPosition.x );
    
    var size=VG.context.workspace.canvas.getTextSize( text );

    var cursorPosX=this.contentRect.x + size.width - this.textOffset.x;

    if ( cursorPosX > this.contentRect.right() )
    {
        this.setHScrollbarDimensions( VG.context.workspace.canvas );

        this.textOffset.x+=cursorPosX - this.contentRect.right();
        this.hScrollbar.scrollTo( this.textOffset.x );
    } else
    if ( cursorPosX < this.contentRect.x )
    {
        this.textOffset.x-=this.contentRect.x - cursorPosX;
        this.hScrollbar.scrollTo( this.textOffset.x );
    }

    if ( this.font ) VG.context.workspace.canvas.popFont();  
};

VG.UI.BaseText.prototype.blink=function( canvas, cursorYPos, cursorHeight )
{    
    if ( this.visualState === VG.UI.Widget.VisualState.Focus ) {
        
        var time=Date.now();
        
        if ( time > this.nextAnimationEventAt ) {
            if ( this.blinkState ) this.blinkState=0;
            else this.blinkState=1;
            
            this.nextAnimationEventAt=time + 500;
            VG.context.workspace.redrawList.push( this.nextAnimationEventAt );

            if ( this._textHasChanged && !(this instanceof VG.UI.TextLineEdit) && (Date.now() - this.lastTextChangeTime) > 1000 ) this.focusOut();
        }

        if ( this.blinkState )
        {
            var cursorRect=VG.Core.Rect( this.contentRect );
            cursorRect.x+=this.cursorPosToPixelOffset( this.cursorPosition );

            if ( cursorYPos === undefined ) {
                cursorRect.x-=this.textOffset.x;
                cursorRect.y+=this.cursorPosition.y * this.itemHeight - this.textOffset.y;
                cursorRect.height=this.maxTextLineSize.height;
            } else {
                cursorRect.y=cursorYPos;                
                cursorRect.height=cursorHeight;
            }

            cursorRect.width=1;

            if ( this.password )
                cursorRect.x=this.contentRect.x + (this.cursorPosition.x /*- this.textOffset.x*/) * (10+2);

            var color=VG.context.style.skin.Widget.TextColor;
            if ( this.blinkColor ) color=this.blinkColor;

            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, cursorRect, color );
        }
    }    
};

VG.UI.BaseText.prototype.cursorPosToPixelOffset=function( pos )
{
    if ( this.font ) VG.context.workspace.canvas.pushFont( this.font );    

    var text=this.textArray[pos.y];
    text=text.slice( 0, pos.x );

    var size=VG.context.workspace.canvas.getTextSize( text, size );

    if ( this.font ) VG.context.workspace.canvas.popFont();

    return size.width;
};

VG.UI.BaseText.prototype.insertText=function( text )
{  
    var result="";

    for( var i=0; i < this.cursorPosition.y; ++i)
        result+=this.textArray[i] + "\n";

    result+=this.textArray[this.cursorPosition.y].slice(0, this.cursorPosition.x);

    // --- Chop off whitespace in front of text to insert

    var whitespace=0;
    while( text[whitespace] === " " && whitespace < text.length ) ++whitespace;
    if ( whitespace ) text=text.slice( whitespace );

    // ---

    result+=text;
    result+=this.textArray[this.cursorPosition.y].slice( this.cursorPosition.x );

    // --- If text to insert has no line feed at the end, append one
    if ( text.indexOf( "\n", text.length - 1 ) === -1 ) result+="\n";

    for( var i=this.cursorPosition.y+1; i < this.textLines; ++i)
        result+=this.textArray[i] + "\n";

    if ( result.indexOf( "\n", result.length - 1 ) !== -1 ) result=result.slice( 0, result.length-1 );

    // --- Adjust cursor position to end of inserted text
    var textArray=text.split(/\r\n|\r|\n/);

    if ( textArray.length === 1 )
        this.cursorPosition.x+=textArray[textArray.length-1].length;
    else
    {
        if ( textArray[textArray.length-1].length === 0 )
            textArray=textArray.slice( 0, textArray.length-1);
    
        this.cursorPosition.x=textArray[textArray.length-1].length;
        this.cursorPosition.y+=textArray.length-1;
    }

    this.text=result;
};

VG.UI.BaseText.prototype.sortSelection=function()
{
    if ( this.selectionStart.y === this.selectionEnd.y ) {
        if ( this.selectionStart.x < this.selectionEnd.x ) { this.startSel.set( this.selectionStart ); this.endSel.set( this.selectionEnd ); }
        else { this.startSel.set( this.selectionEnd ); this.endSel.set( this.selectionStart ); }            
    } else if ( this.selectionStart.y < this.selectionEnd.y ) { this.startSel.set( this.selectionStart ); this.endSel.set( this.selectionEnd ); }
    else { this.startSel.set( this.selectionEnd ); this.endSel.set( this.selectionStart ); }    
};

VG.UI.BaseText.prototype.deleteSelection=function( noUndo )
{ 
    var result="";

    for( var i=0; i < this.startSel.y; ++i)
        result+=this.textArray[i] + "\n";

    result+=this.textArray[this.startSel.y].slice(0, this.startSel.x);
    result+=this.textArray[this.endSel.y].slice( this.endSel.x ) + "\n";

    for( var i=this.endSel.y+1; i < this.textLines; ++i)
        result+=this.textArray[i] + "\n";    

    if ( result.indexOf( "\n", result.length - 1 ) !== -1 ) result=result.slice( 0, result.length-1 );

    this.focusOut();

    this.text=result;    
    this.cursorPosition.set( this.startSel );
    this.selectionIsValid=false;    

    if ( !noUndo ) {
        this.textHasChanged=true;
        this.focusOut();
    }
};

VG.UI.BaseText.prototype.copySelection=function( text )
{ 
    var result="";

    if ( this.startSel.y === this.endSel.y )
    {
        result+=this.textArray[this.startSel.y].slice( this.startSel.x, this.endSel.x );
        return result;
    }
    result+=this.textArray[this.startSel.y].slice( this.startSel.x) + "\n";

    for( var i=this.startSel.y+1; i < this.endSel.y; ++i)
        result+=this.textArray[i] + "\n";    

    result+=this.textArray[this.endSel.y].slice( 0, this.endSel.x ) + "\n";

    return result; 
};

VG.UI.BaseText.prototype.resetBlinkState=function()
{
    this.blinkState=0;
    this.nextAnimationEventAt=0;  
};

VG.UI.BaseText.prototype.drawSelectionForLine=function( canvas, i, paintRect, text, color )
{
    var size=VG.Core.Size();

    if ( i >= this.startSel.y && i <= this.endSel.y )
    {
        if ( i === this.startSel.y && i === this.endSel.y ) {
            var bX=paintRect.x, bWidth=paintRect.width;

            paintRect.x=this.contentRect.x - this.textOffset.x + this.cursorPosToPixelOffset( this.startSel );
            paintRect.width=this.cursorPosToPixelOffset( this.endSel ) - this.cursorPosToPixelOffset( this.startSel );

            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, paintRect, color ); 

            paintRect.x=bX;
            paintRect.width=bWidth;
        } else
        if ( i === this.startSel.y && i !== this.endSel.y ) {
            var bX=paintRect.x, bWidth=paintRect.width;

            paintRect.x=this.contentRect.x - this.textOffset.x + this.cursorPosToPixelOffset( this.startSel );
            paintRect.width=this.contentRect.x - this.textOffset.x + canvas.getTextSize( text, size ).width - paintRect.x;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, paintRect, color ); 

            paintRect.x=bX;
            paintRect.width=bWidth;
        } else
        if ( i !== this.startSel.y && i !== this.endSel.y ) {
            var bWidth=paintRect.width;

            paintRect.width=this.contentRect.x - this.textOffset.x + canvas.getTextSize( text, size ).width - paintRect.x;                        
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, paintRect, color ); 

            paintRect.width=bWidth;
        } else                    
        if ( i !== this.startSel.y && i === this.endSel.y ) {
            var bWidth=paintRect.width;

            paintRect.width=this.contentRect.x - this.textOffset.x + this.cursorPosToPixelOffset( this.endSel ) - paintRect.x;
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, paintRect, color ); 

            paintRect.width=bWidth;
        }
    }
};

VG.UI.BaseText.prototype.drawSearchTerm=function( canvas, y, paintRect, text, color )
{
    var offset=-1;

    if ( this.searchTermCaseSensitive ) offset=text.indexOf( this.searchTerm );
    else offset=text.toLowerCase().indexOf( this.searchTerm.toLowerCase() );

    if ( offset !== -1 ) 
    {
        var text1=text.slice( 0, offset );

        var size=canvas.getTextSize( text1 );

        var bX=paintRect.x, bWidth=paintRect.width;

        paintRect.x=this.contentRect.x - this.textOffset.x + size.width;
        paintRect.width=canvas.getTextSize( text.slice( offset, offset+this.searchTerm.length ), size ).width;
        
        if ( this.lastSearchTermResult && this.lastSearchTermResult.x === offset && this.lastSearchTermResult.y === y ) color.a=1.0;
        else color.a=0.5;

        canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, paintRect, color );         

        paintRect.x=bX;
        paintRect.width=bWidth;
    }
};

VG.UI.BaseText.prototype.autoScroll=function()
{
    var pos=VG.context.workspace.mousePos;
    var yPos=this.textOffset.y

    if ( /*this.selectionEnd.y > this.startSel.y &&*/ pos.y > this.contentRect.bottom() - this.contentRect.height / 5 )
    {
        // --- Scroll down
        this.mouseWheel( -1 );
    } else
    if ( /*this.selectionStart.y > this.selectionEnd.y &&*/ pos.y - this.contentRect.y < this.contentRect.height / 5 )
    {
        // --- Scroll up
        this.mouseWheel( 1 );
    }          

    if ( yPos != this.textOffset.y ) 
    {
        this.applyCursorPos( pos );
        this.selectionEnd.set( this.cursorPosition );
        this.sortSelection();

        //VG.Utils.ensureRedrawWithinMs( 10 );
        VG.context.workspace.redrawList.push( Date.now() + 10 );
    }
};

VG.UI.BaseText.prototype.gotoLine=function( lineNr )
{
    if ( this.vScrollbar ) {
        this.verifyScrollbar();

        var line=lineNr;
        line-=this.visibleItems/2;

        this.cursorPosition.x=0;
        this.cursorPosition.y=lineNr;
        this.textOffset.y=line * this.itemHeight;

        this.setVScrollbarDimensions( VG.context.workspace.canvas );
        this.vScrollbar.scrollTo( this.textOffset.y );
    }    
};

VG.UI.BaseText.prototype.gotoNextSearchTerm=function( forward )
{
    if ( !this.searchTerm || this.searchTerm.length === 0 ) return;

    function searchForTerm( text ) {
        var offset=-1;

        if ( this.searchTermCaseSensitive ) offset=text.indexOf( this.searchTerm );
        else offset=text.toLowerCase().indexOf( this.searchTerm.toLowerCase() );

        return offset;
    };

    var x=this.cursorPosition.x, y=this.cursorPosition.y;
    var startY=y, wrap=false;

    //console.log( "gotoNextSearchTerm", x, y );

    if ( forward )
    {
        x+=1;

        while( !(y === startY && wrap) ) 
        {
            var offset=-1;
            var text=this.textArray[y];

            if ( x >= 0 && x < text.length ) {

                if ( x ) offset=searchForTerm.call( this, text.slice(x) );
                else offset=searchForTerm.call( this, text );

                if ( offset !== -1 ) {

                    // --- 

                    //console.log( "found at", x, y );

                    if ( !this.lastSearchTermResult ) this.lastSearchTermResult=VG.Core.Point();
                    this.lastSearchTermResult.set( offset, y );
                    this.selectionIsValid=false;

                    this.gotoLine( y );
                    this.cursorPosition.x=offset;
                    this.cursorPosition.y=y;

                    this.resetBlinkState();

                    return true;
                }
            }

            x=0; ++y;                 
                
            if ( y === this.textLines ) {
                wrap=true;
                y=0;
            }                
        }
    } else
    {  
        if ( x === 0 ) {
            y-=1; if ( y < 0 ) y=this.textLines-1;
        }
        while( !(y === startY && wrap) ) 
        {
            var offset=-1;
            var text=this.textArray[y];

            if ( x >= 0 && x < text.length ) {

                if ( x ) offset=searchForTerm.call( this, text.slice( 0, x ) );
                else offset=searchForTerm.call( this, text );

                if ( offset !== -1 ) {

                    // --- 

                    //console.log( "found at", x, y );

                    if ( !this.lastSearchTermResult ) this.lastSearchTermResult=VG.Core.Point();
                    this.lastSearchTermResult.set( offset, y );
                    this.selectionIsValid=false;

                    this.gotoLine( y );
                    this.cursorPosition.x=offset;
                    this.cursorPosition.y=y;

                    this.resetBlinkState();

                    return true;
                }
            }

            x=0; --y;
            
            if ( y < 0 ) {
                wrap=true;
                y=this.textLines-1;                   
            }
        }
    }

    return false;
};

// ----------------------------------------------------------------- VG.UI.Label

VG.UI.Label=function( text )
{
    if ( !(this instanceof VG.UI.Label) ) return new VG.UI.Label( text );

    VG.UI.BaseText.call( this );
    this.name="Label";
    
    this.font=VG.context.style.skin.DefaultFont;

    this.hAlignment=VG.UI.HAlignment.Centered;
    this.vAlignment=VG.UI.VAlignment.Centered;

    this.horizontalExpanding=false;
    this.verticalExpanding=false;

    this.supportsFocus=true;

    if ( arguments.length ) this.text=arguments[0];
    else this.text="";    
};

VG.UI.Label.prototype=VG.UI.BaseText();

VG.UI.Label.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.Label.prototype.valueFromModel=function( value )
{
    if ( value === null ) this.text="";
    else this.text=value;

    if ( this.textChanged )
        this.textChanged.call( VG.context, value );    
};

VG.UI.Label.prototype.calcSize=function()
{    
    var size=VG.UI.BaseText.prototype.calcSize.call( this );

    this.checkSizeDimensionsMinMax( size );

    return size;
};

VG.UI.Label.prototype.focusIn=function()
{
    if ( this.focusInCallback )
        this.focusInCallback( this );
};

VG.UI.Label.prototype.paintWidget=function( canvas )
{
    VG.UI.Frame.prototype.paintWidget.call( this, canvas );

    this.font=VG.context.style.skin.DefaultFont;
    canvas.pushFont(this.font);

    var rect=VG.Core.Rect( this.contentRect );

    if ( this.frameType !== VG.UI.Frame.Type.None ) {
        rect=rect.add( 2, 2, -4, -4 );
    }

    var totalHeight=this.maxTextLineSize.height * this.textLines;

    rect.height=this.maxTextLineSize.height;

    if ( this.vAlignment === VG.UI.VAlignment.Top ) {
        rect.y=this.contentRect.y;
    } else
    if ( this.vAlignment === VG.UI.VAlignment.Centered ) {
        rect.y=this.contentRect.y + (this.contentRect.height - totalHeight) / 2;
    } else
    if ( this.vAlignment === VG.UI.VAlignment.Bottom ) {
        rect.y=this.contentRect.y + this.contentRect.height - totalHeight;
    }

    var textColor;

    if ( !this.disabled ) {
        if ( this.customColor ) textColor=this.customColor;
        else textColor=VG.context.style.skin.Widget.TextColor;
    } else textColor=VG.context.style.skin.Widget.DisabledTextColor;

    if ( this.embedded && this.embeddedSelection ) textColor=canvas.style.skin.Widget.EmbeddedTextColor;

    for ( var i=0; i < this.textLines; ++i ) {

        canvas.drawTextRect( this.textArray[i], rect, textColor, this.hAlignment, 1 );
        rect.y+=this.maxTextLineSize.height;
    }

    canvas.popFont();
};

// ----------------------------------------------------------------- VG.UI.TextLineEdit

VG.UI.TextLineEdit=function( text )
{
    if ( !(this instanceof VG.UI.TextLineEdit) ) return new VG.UI.TextLineEdit( text );

    VG.UI.BaseText.call( this );
    this.name="TextLineEdit";
    
    this.font=VG.context.style.skin.TextEdit.Font;

    this.supportsFocus=true;
    this.minimumSize.width=40;
    
    this.horizontalExpanding=true;
    this.verticalExpanding=false;
    
    if ( arguments.length ) this.text=arguments[0];
    else this.text="";

    this.verifyScrollbar();

    // --- Setup Default Context Menu

    this.contextMenu=VG.UI.ContextMenu();
    this.contextMenu.aboutToShow=function() {
        this.copyMenuItem.disabled=!this.clipboardCopyIsAvailable( "Text" );
        this.cutMenuItem.disabled=this.copyMenuItem.disabled;
        this.pasteMenuItem.disabled=!VG.clipboardPasteDataForType( "Text" );
    }.bind( this );

    this.cutMenuItem=this.contextMenu.addItem( "Cut", null, function() { 
        VG.copyToClipboard( "Text", this.copySelection() );
        if ( this.selectionIsValid ) this.deleteSelection();
    }.bind( this ));
    
    this.copyMenuItem=this.contextMenu.addItem( "Copy", null, function() { 
        VG.copyToClipboard( "Text", this.copySelection() );
    }.bind( this ));

    this.pasteMenuItem=this.contextMenu.addItem( "Paste", null, function() { 
        if ( this.selectionIsValid ) this.deleteSelection( true );
        this.insertText( VG.clipboardPasteDataForType( "Text" ) );
        this.textHasChanged=true;
        this.focusOut();        
    }.bind( this ));    
};

VG.UI.TextLineEdit.prototype=VG.UI.BaseText();

VG.UI.TextLineEdit.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.TextLineEdit.prototype.valueFromModel=function( value )
{
    //console.log( "TextLineEdit.valueFromModel: " + value );

    if ( value === null ) this.text="";
    else this.text=value;

    if ( this.textChanged )
        this.textChanged.call( VG.context, this.text, true, this );    

    this.verifyScrollbar();
};

VG.UI.TextLineEdit.prototype.calcSize=function( canvas )
{
    var size=VG.Core.Size();

    this.font=VG.context.style.skin.TextEdit.Font;
    canvas.pushFont(this.font);

    VG.context.workspace.canvas.getTextSize( this.text, size );
    
    size.height=VG.context.workspace.canvas.getLineHeight();

    if ( !this.embedded )
        size=size.add( 16, 5 );

    this.maximumSize.height=size.height;
    this.checkSizeDimensionsMinMax( size );

    canvas.popFont();

    return size;
};

VG.UI.TextLineEdit.prototype.focusIn=function()
{
    this.resetBlinkState();

    if ( this.focusInCallback )
        this.focusInCallback( this );
};

VG.UI.TextLineEdit.prototype.focusOut=function()
{ 
    if ( this.textHasChanged ) 
    {
        if ( VG.UI.NumberEdit && this instanceof VG.UI.NumberEdit ) 
        {
            if ( this.changed )
                this.changed.call( VG.context, this.value, false, this );

            if ( this.collection && this.path )
                this.collection.storeDataForPath( this.path, this.value );

        } else
        {
            if ( this.textChanged )
                this.textChanged.call( VG.context, this.text, false, this );

            if ( this.collection && this.path )
                this.collection.storeDataForPath( this.path, this.text );
        }
        this.textHasChanged=false;        
    }    
};

VG.UI.TextLineEdit.prototype.keyDown=function( keyCode, keysDown )
{
    //console.log( "TextLineEdit:" + keyCode );
    
    if ( VG.UI.BaseText.prototype.keyDown.call( this, keyCode, keysDown ) )
        return;

    var recognized=false;

    if ( keyCode == VG.Events.KeyCodes.Enter || keyCode == VG.Events.KeyCodes.Tab )
    {
        if ( this.textHasChanged )
        {
            if (  VG.UI.NumberEdit && this instanceof VG.UI.NumberEdit ) 
            {
                if ( this.collection && this.path )
                    this.collection.storeDataForPath( this.path, this.value );

                if ( this.changed )
                    this.changed( this.value, true, this );            
            } else
            {
                if ( this.collection && this.path )
                    this.collection.storeDataForPath( this.path, this.text );

                if ( this.textChanged )
                    this.textChanged( this.text, true, this );
            }
            this.textHasChanged=false;
        }

        if ( keyCode == VG.Events.KeyCodes.Tab )
            VG.context.workspace.cycleFocus( this );

        recognized=true;
    }  

    if ( recognized )
    {
        //if ( this.textChanged )
        //    this.textChanged.call( VG.context );
    
        this.resetBlinkState();
        VG.update();
    }
};

VG.UI.TextLineEdit.prototype.textInput=function( text )
{
    if ( this.selectionIsValid ) this.deleteSelection( true );
    if ( this.inputFilter ) text=this.inputFilter( text );

    var oldText=this.textArray[this.cursorPosition.y];
    this.textArray[this.cursorPosition.y]=oldText.slice(0, this.cursorPosition.x) + text + oldText.slice( this.cursorPosition.x );

    //if ( this.textChanged )
    //    this.textChanged.call( VG.context );

    this.cursorPosition.x+=text.length;
    this.textHasChanged=true;

    this.resetBlinkState();
    VG.update();
};

VG.UI.TextLineEdit.prototype.paintWidget=function( canvas )
{
    if ( this.backgroundColor ) canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.rect.shrink(1,1), this.backgroundColor );

    VG.context.style.drawTextEditBorder( canvas, this );

    this.contentRect=this.contentRect.shrink( 4, 0 );
    var textLine;

    this.font=VG.context.style.skin.TextEdit.Font;
    canvas.pushFont(this.font);

    if ( !this.textLines || ( this.textArray && !this.textArray[0].length ) && this.visualState !== VG.UI.Widget.VisualState.Focus )
    {
        if ( this.defaultText ) {
            canvas.drawTextRect( this.defaultText, this.contentRect, canvas.style.skin.TextEdit.DefaultTextColor, 0, 1 );   
        }
        canvas.popFont();
        return;
    } else textLine=this.textArray[0];

    var textColor;

    if ( this.embedded && this.embeddedSelection && !this.disabled ) textColor=VG.context.style.skin.TextEdit.EmbeddedTextColor;
    else
    if ( !this.disabled )
    {
        if ( this.visualState === VG.UI.Widget.VisualState.Focus )
            textColor=VG.context.style.skin.TextEdit.FocusTextColor;
        else textColor=VG.context.style.skin.TextEdit.TextColor;
    } else textColor=VG.context.style.skin.TextEdit.DisabledTextColor;

    this.textOffset.x=0;
    if ( textLine !== undefined ) {

        var size=VG.Core.Size();
        var offset=0;
        var text=textLine.slice( offset );
        canvas.getTextSize( text, size );
    
        while ( ( (size.width + 3) > this.contentRect.width ) && text.length )
        {
            // --- Text is too long for the contentRect, cut of chars at the front until it fits.
            ++offset;
            text=textLine.slice( offset );
            canvas.getTextSize( text, size );
        }
    
        if ( this.selectionIsValid )
            this.drawSelectionForLine( canvas, 0, this.contentRect, text, canvas.style.skin.TextEdit.SelectionBackgroundColor );        

        if ( !this.password )
            canvas.drawTextRect( text, this.contentRect, textColor, 0, 1 );
        else 
        {
            canvas.setClipRect( this.contentRect );

            var circleSize=10;
            var rect=VG.Core.Rect( this.contentRect );
            rect.y=rect.y + ( this.contentRect.height - circleSize ) /2;
            rect.width=circleSize; rect.height=circleSize;

            for ( var i=0; i < text.length; ++i )
            {
                canvas.draw2DShape( VG.Canvas.Shape2D.Circle, rect, textColor );
                rect.x+=circleSize + 2;
            }

            canvas.setClipRect();            
        }
    }
    
    this.blink( canvas, this.contentRect.y+2, this.contentRect.height-4 ); 
    canvas.popFont();
};

// ----------------------------------------------------------------- VG.UI.TextEdit

VG.UI.TextEdit=function( text )
{
    if ( !(this instanceof VG.UI.TextEdit) ) return new VG.UI.TextEdit( text );

    VG.UI.BaseText.call( this );
    this.name="TextEdit";

    this.font=VG.context.style.skin.TextEdit.Font;

    this.supportsScrollbars=true;
    this.frameType=VG.UI.Frame.Type.None;
    
    this.supportsFocus=true;
    this.minimumSize.set( 40, 40 );
    
    this.hAlignment=VG.UI.HAlignment.Left;
    this.vAlignment=VG.UI.VAlignment.Top;

    this.horizontalExpanding=true;
    this.verticalExpanding=true;

    this.readOnly=false;
        
    this.previousRect=VG.Core.Rect();

    if ( arguments.length ) this.text=arguments[0];
    else this.text="";

    // --- Setup Default Context Menu

    this.contextMenu=VG.UI.ContextMenu();
    this.contextMenu.aboutToShow=function() {
        this.copyMenuItem.disabled=!this.clipboardCopyIsAvailable( "Text" );
        this.cutMenuItem.disabled=this.copyMenuItem.disabled || this.readOnly;
        this.pasteMenuItem.disabled=!VG.clipboardPasteDataForType( "Text" ) || this.readOnly;
        this.insertMenuItem.disabled=this.readOnly;
    }.bind( this );

    this.cutMenuItem=this.contextMenu.addItem( "Cut", null, function() { 
        VG.copyToClipboard( "Text", this.copySelection() );
        if ( this.selectionIsValid ) this.deleteSelection();
    }.bind( this ));

    this.copyMenuItem=this.contextMenu.addItem( "Copy", null, function() { 
        VG.copyToClipboard( "Text", this.copySelection() );
    }.bind( this ));

    this.pasteMenuItem=this.contextMenu.addItem( "Paste", null, function() { 
        if ( this.selectionIsValid ) this.deleteSelection( true );
        this.insertText( VG.clipboardPasteDataForType( "Text" ) );
        this.textHasChanged=true;
        this.focusOut();        
    }.bind( this ));

    this.contextMenu.addSeparator();

    this.insertMenuItem=this.contextMenu.addItem( "Insert Text...", null, function() { 

        this.fileDialog=VG.OpenFileDialog( VG.UI.FileDialog.Text, function( name, content ) {
            this.insertText( content );
            if ( this.collection && this.path )
                this.collection.storeDataForPath( this.path, this.text );
            
        }.bind( this ) );
    }.bind( this ));

    // --- 
};

VG.UI.TextEdit.prototype=VG.UI.BaseText();

VG.UI.TextEdit.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.TextEdit.prototype.valueFromModel=function( value )
{
    //console.log( "TextEdit.valueFromModel: " + value );

    if ( value === null ) this.text="";
    else this.text=value;
};

VG.UI.TextEdit.prototype.focusIn=function()
{
    this.resetBlinkState();
};

VG.UI.TextEdit.prototype.focusOut=function()
{
    if ( this.textHasChanged ) 
    {
        if ( this.textChanged )
            this.textChanged.call( VG.context );

        if ( this.collection && this.path )
            this.collection.storeDataForPath( this.path, this.text );

        this.textHasChanged=false;
    }
};

VG.UI.TextEdit.prototype.keyDown=function( keyCode, keysDown )
{
    //console.log( "TextLineEdit:" + keyCode );
    
    if ( VG.UI.BaseText.prototype.keyDown.call( this, keyCode, keysDown ) )
        return;

    var recognized=false;

    if ( keyCode == VG.Events.KeyCodes.Enter )
    {
        if ( this.selectionIsValid ) this.deleteSelection( true );

        var oldText=this.textArray[this.cursorPosition.y];

        this.textArray[this.cursorPosition.y]=oldText.slice(0, this.cursorPosition.x);
        this.textArray.splice( this.cursorPosition.y+1, 0, oldText.slice( this.cursorPosition.x ) );

        this.cursorPosition.y+=1;
        this.cursorPosition.x=0;

        if ( this.needsVScrollbar )
        {
            // --- Scroll one line down if necessary
            var y=this.contentRect.y - this.textOffset.y + this.cursorPosition.y * this.itemHeight;

            if ( y + this.maxTextLineSize.height > this.contentRect.bottom() ) {

                this.verifyText();
                this.verifyScrollbar();
                this.setVScrollbarDimensions( VG.context.workspace.canvas );                   

                this.textOffset.y+=this.itemHeight;
                this.vScrollbar.scrollTo( this.textOffset.y );                
            }
        }

        if ( this.needsHScrollbar )
            this.ensureCursorIsVisible();        

        recognized=true;
        this.textHasChanged=true;     
    } else
    if ( keyCode == VG.Events.KeyCodes.Tab )
    {
        if ( this.selectionIsValid ) this.deleteSelection();

        var text="\t";

        var oldText=this.textArray[this.cursorPosition.y];
        this.textArray[this.cursorPosition.y]=oldText.slice(0, this.cursorPosition.x) + text + oldText.slice( this.cursorPosition.x );
        this.cursorPosition.x+=text.length;

        recognized=true;
        this.textHasChanged=true;     
    };

    if ( recognized )
    {
        this.verifyText();
        this.resetBlinkState();
        VG.update();
    }
};

VG.UI.TextEdit.prototype.textInput=function( text )
{
    if ( this.readOnly ) return;
    if ( this.selectionIsValid ) this.deleteSelection( true );

    var oldText=this.textArray[this.cursorPosition.y];
    this.textArray[this.cursorPosition.y]=oldText.slice(0, this.cursorPosition.x) + text + oldText.slice( this.cursorPosition.x );

    var size=VG.Core.Size();
    VG.context.workspace.canvas.getTextSize( text, size );

    this.cursorPosition.x+=text.length;
    this.textHasChanged=true;

    this.verifyTextForLineChange( this.cursorPosition.y );
    this.verifyScrollbar();

    if ( this.needsHScrollbar )
        this.ensureCursorIsVisible();

    this.resetBlinkState();
    VG.update();
};

VG.UI.TextEdit.prototype.paintWidget=function( canvas )
{
    if ( this.dragging && this.selectionIsValid )
        this.autoScroll();

    if ( !this.rect.equals( this.previousRect ) ) this.verified=false;        
    VG.context.style.drawTextEditBorder( canvas, this );

    if ( !this.textLines ) return;

    this.font=VG.context.style.skin.TextEdit.Font;
    canvas.pushFont(this.font);

    canvas.setClipRect( this.contentRect );
    this.contentRect=this.contentRect.add( 4, 2, -8, -4 );

    if ( !this.verified || canvas.hasBeenResized )
        this.verifyScrollbar();

    if ( this.needsVScrollbar )
        this.contentRect.width-=canvas.style.skin.Scrollbar.Size + 2;

    if ( this.needsHScrollbar )
        this.contentRect.height-=canvas.style.skin.Scrollbar.Size + 2;

    // ---

    var textColor;
    if ( !this.disabled ) {
        if ( this.visualState === VG.UI.Widget.VisualState.Focus )
            textColor=VG.context.style.skin.TextEdit.FocusTextColor;
        else textColor=VG.context.style.skin.TextEdit.TextColor;
    } else textColor=VG.context.style.skin.Widget.DisabledTextColor;

    var paintRect=VG.Core.Rect();
    paintRect.x=this.contentRect.x - this.textOffset.x;
    paintRect.y=this.contentRect.y - this.textOffset.y;
    paintRect.width=this.maxTextLineSize.width;
    paintRect.height=this.maxTextLineSize.height;

    for ( var i=0; i < this.textLines; ++i ) {

        if ( paintRect.y + this.itemHeight >= this.contentRect.y || paintRect.y < this.contentRect.bottom() ) {

            var text=this.textArray[i];

            if ( this.selectionIsValid )
                this.drawSelectionForLine( canvas, i, paintRect, text, canvas.style.skin.TextEdit.SelectionBackgroundColor );

            canvas.drawTextRect( text, paintRect, textColor, this.hAlignment, 1 );

            paintRect.y+=this.itemHeight;
        }

        if ( paintRect.y > this.contentRect.bottom() ) break;
    }

    if ( this.needsVScrollbar ) {

        this.setVScrollbarDimensions( canvas );
        this.vScrollbar.paintWidget( canvas );
    }

    if ( this.needsHScrollbar ) {

        this.setHScrollbarDimensions( canvas );
        this.hScrollbar.paintWidget( canvas );
    }

    if ( !this.readOnly ) this.blink( canvas );
    this.previousRect.set( this.rect );

    canvas.popFont();        

    canvas.setClipRect( false );
};

VG.UI.TextEdit.prototype.setVScrollbarDimensions=function( canvas )
{
    this.vScrollbar.rect=VG.Core.Rect( this.contentRect.right() + 2, this.contentRect.y, canvas.style.skin.Scrollbar.Size, this.contentRect.height );

    // this.totalItemHeight == Total height of all Items in the list widget including spacing
    // visibleHeight == Total height of all currently visible items
    // this.contentRect.height == Height of the available area for the list items

    this.vScrollbar.setScrollbarContentSize( this.totalItemHeight, this.contentRect.height );
};

VG.UI.TextEdit.prototype.setHScrollbarDimensions=function( canvas )
{
    this.hScrollbar.rect=VG.Core.Rect( this.contentRect.x, this.contentRect.bottom()  + 1, this.contentRect.width, canvas.style.skin.Scrollbar.Size );

    // this.totalItemHeight == Total height of all Items in the list widget including spacing
    // visibleHeight == Total height of all currently visible items
    // this.contentRect.height == Height of the available area for the list items

    this.hScrollbar.setScrollbarContentSize( this.maxTextLineSize.width, this.contentRect.width );
};

// ----------------------------------------------------------------- VG.UI.CodeEdit

VG.UI.CodeEdit=function( text )
{
    if ( !(this instanceof VG.UI.CodeEdit) ) return new VG.UI.CodeEdit( text );

    this.font=VG.context.style.skin.CodeEdit.Font;

    VG.UI.BaseText.call( this, text );
    this.name="CodeEdit";

    this.supportsScrollbars=true  ;
    this.frameType=VG.UI.Frame.Type.None;
    
    this.supportsFocus=true;
    this.minimumSize.set( 40, 40 );
    
    this.hAlignment=VG.UI.HAlignment.Left;
    this.vAlignment=VG.UI.VAlignment.Top;

    this.horizontalExpanding=true;
    this.verticalExpanding=true;
        
    if ( arguments.length ) this.text=arguments[0];
    else this.text="";

    this.readOnly=false;
    this.blinkColor=VG.Core.Color( 255, 255, 255 );

    this.previousRect=VG.Core.Rect();

    // --- Setup Default Context Menu

    this.contextMenu=VG.UI.ContextMenu();
    this.contextMenu.aboutToShow=function() {
        this.copyMenuItem.disabled=!this.clipboardCopyIsAvailable( "Text" );
        this.cutMenuItem.disabled=this.copyMenuItem.disabled || this.readOnly;
        this.pasteMenuItem.disabled=!VG.clipboardPasteDataForType( "Text" ) || this.readOnly;
        this.insertMenuItem.disabled=this.readOnly;
        this.insertEncodedMenuItem.disabled=this.readOnly;
    }.bind( this );

    this.cutMenuItem=this.contextMenu.addItem( "Cut", null, function() { 
        VG.copyToClipboard( "Text", this.copySelection() );
        if ( this.selectionIsValid ) this.deleteSelection();
    }.bind( this ), VG.context.workspace.shortcutManager.createDefault( VG.Shortcut.Defaults.Cut ) );

    this.copyMenuItem=this.contextMenu.addItem( "Copy", null, function() { 
        VG.copyToClipboard( "Text", this.copySelection() );
    }.bind( this ), VG.context.workspace.shortcutManager.createDefault( VG.Shortcut.Defaults.Copy ) );

    this.pasteMenuItem=this.contextMenu.addItem( "Paste", null, function() { 
        if ( this.selectionIsValid ) this.deleteSelection( true );
        this.insertText( VG.clipboardPasteDataForType( "Text" ) );
        this.textHasChanged=true;
        this.focusOut();

    }.bind( this ), VG.context.workspace.shortcutManager.createDefault( VG.Shortcut.Defaults.Paste ) );

    this.contextMenu.addSeparator();

    this.insertMenuItem=this.contextMenu.addItem( "Insert Text...", null, function() { 

        this.fileDialog=VG.OpenFileDialog( VG.UI.FileDialog.Text, function( name, content ) {
            this.insertText( content );
            if ( this.collection && this.path )
                this.collection.storeDataForPath( this.path, this.text );
            
        }.bind( this ) );
    }.bind( this ), VG.context.workspace.shortcutManager.createDefault( VG.Shortcut.Defaults.InsertText ) );

    this.insertEncodedMenuItem=this.contextMenu.addItem( "Insert Encoded Text...", null, function() { 

        this.fileDialog=VG.OpenFileDialog( VG.UI.FileDialog.Text, function( name, content ) {

            var oname=name; 
            if ( name.indexOf( "." ) ) oname=name.slice( 0, name.indexOf( "." ) );

            var out="// --- Decompress with VG.Utils.decompressFromBase64( " + oname + " );\n"
            out+="var " + oname + "=";
            var encoded=VG.Utils.compressToBase64( content );
            var o=0;

            while ( o < encoded.length ) {
                out+="\"";
                for ( var i=0; i < 80; ++i ) {
                    out+=encoded[o++];
                    if ( o >= encoded.length ) {
                        out+="\";"; break;
                    }
                }

                if ( o < encoded.length )
                    out+="\" +";

                out+="\n";
            }

            this.insertText( out );

            if ( this.collection && this.path )
                this.collection.storeDataForPath( this.path, this.text );
            
        }.bind( this ));        
    }.bind( this ), VG.context.workspace.shortcutManager.createDefault( VG.Shortcut.Defaults.InsertEncodedText ) );

    // ---

    this.settings={ "Spaces" : 4 };
    this.enforceJSSyntax=true;

    this.jsReserved=[ "abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue",
    "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", 
    "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", 
    "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient",
    "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield" ];

    this.jsBuiltIn=[ "Array", "Date", "eval", "function", "hasOwnProperty", "Infinity", "isFinite", "isNaN", "isPrototypeOf", "length", "Math",
    "NaN", "name", "Number", "Object", "prototype", "String", "toString", "undefined", "valueOf" ];

    this.codeSkin={ "Comment" : VG.Core.Color( 121, 124, 131 ), "Text" : VG.Core.Color( 91, 238, 167 ), "Reserved" : VG.Core.Color( 242, 102, 102 ),
    "BuiltIn" : VG.Core.Color( 220, 92, 179 ), "ThisAndParameter" : VG.Core.Color( 156, 165, 230 ), "VG" : VG.Core.Color( 212, 179, 77 ),
    "Digit" : VG.Core.Color( 189, 152, 240 ) }

    // --- 
};

VG.UI.CodeEdit.prototype=VG.UI.BaseText();

VG.UI.CodeEdit.prototype.bind=function( collection, path )
{
    this.collection=collection;
    this.path=path;
    collection.addValueBindingForPath( this, path );
};

VG.UI.CodeEdit.prototype.valueFromModel=function( value )
{
    //console.log( "CodeEdit.valueFromModel: " + value );

    if ( value === null ) this.text="";
    else this.text=value;
};

VG.UI.CodeEdit.prototype.focusIn=function()
{
    this.resetBlinkState();
};

VG.UI.CodeEdit.prototype.focusOut=function()
{
    if ( this.textHasChanged ) 
    {
        if ( this.textChanged )
            this.textChanged.call( VG.context );

        if ( this.collection && this.path )
            this.collection.storeDataForPath( this.path, this.text );

        this.textHasChanged=false;
    }
};

VG.UI.CodeEdit.prototype.keyDown=function( keyCode, keysDown )
{
    //console.log( "TextLineEdit:" + keyCode );

    if ( VG.UI.BaseText.prototype.keyDown.call( this, keyCode, keysDown ) )
        return;

    var recognized=false;
    var hasChanged=false;

    if ( keyCode == VG.Events.KeyCodes.Enter )
    {
        if ( this.selectionIsValid ) this.deleteSelection( true );

        var oldText=this.textArray[this.cursorPosition.y];

        this.textArray[this.cursorPosition.y]=oldText.slice(0, this.cursorPosition.x);
        this.textArray.splice( this.cursorPosition.y+1, 0, oldText.slice( this.cursorPosition.x ) );

        var oldCursorPos=this.cursorPosition.x;
        this.cursorPosition.y+=1;
        this.cursorPosition.x=0;

        // --- Mirror the spaces of the beginning of the previous line

        for( var i=0; i < oldText.length; ++i ) {
            if ( oldText[i] !== " " ) break;
            else { ++this.cursorPosition.x; this.textArray[this.cursorPosition.y]=" " + this.textArray[this.cursorPosition.y]; }
        }

        // --- If the previous line ended with an "{" add the settings amount of spaces

        var addSpaces=false;
        for( var i=oldText.length-1; i >=0; --i ) {
            var chr=oldText[i];
            if ( chr === " " ) continue;
            if ( chr === "{" ) addSpaces=true; 
            break;
        }

        if ( addSpaces && this.settings && this.settings.Spaces ) {

            for( var i=0; i < this.settings.Spaces; ++i ) {
                ++this.cursorPosition.x; 
                this.textArray[this.cursorPosition.y]=" " + this.textArray[this.cursorPosition.y];
            }            
        }

        if ( this.needsVScrollbar )
        {
            // --- Scroll one line down if necessary
            var y=this.contentRect.y - this.textOffset.y + this.cursorPosition.y * this.itemHeight;

            if ( y + this.maxTextLineSize.height > this.contentRect.bottom() ) {

                this.verifyText();
                this.verifyScrollbar();
                this.setVScrollbarDimensions( VG.context.workspace.canvas );                   

                this.textOffset.y+=this.itemHeight;
                this.vScrollbar.scrollTo( this.textOffset.y );                
            }
        }

        if ( this.needsHScrollbar )
            this.ensureCursorIsVisible();

        recognized=true;
        this.textHasChanged=true;

        this.verifyText();        
    } else
    if ( keyCode == VG.Events.KeyCodes.Tab )
    {
        if ( this.selectionIsValid ) this.deleteSelection();

        var text="";

        for( var i=0; i < this.settings.Spaces; ++i ) text+=" ";

        var oldText=this.textArray[this.cursorPosition.y];
        this.textArray[this.cursorPosition.y]=oldText.slice(0, this.cursorPosition.x) + text + oldText.slice( this.cursorPosition.x );
        this.cursorPosition.x+=text.length;

        recognized=true;
        this.textHasChanged=true;     
        hasChanged=true;   
    };

    if ( recognized )
    {
        if ( hasChanged ) this.verifyTextForLineChange( this.cursorPosition.y );
        this.resetBlinkState();
        VG.update();
    }
};

VG.UI.CodeEdit.prototype.textInput=function( text )
{
    if ( this.readOnly ) return;
    if ( this.selectionIsValid ) this.deleteSelection( true );

    VG.context.workspace.canvas.pushFont( this.font );

    var oldText=this.textArray[this.cursorPosition.y];
    this.textArray[this.cursorPosition.y]=oldText.slice(0, this.cursorPosition.x) + text + oldText.slice( this.cursorPosition.x );

    var size=VG.Core.Size();
    VG.context.workspace.canvas.getTextSize( text, size );

    this.cursorPosition.x+=text.length;
    this.textHasChanged=true;

    this.verifyTextForLineChange( this.cursorPosition.y );
    this.verifyScrollbar();

    if ( this.needsHScrollbar )
        this.ensureCursorIsVisible();

    VG.context.workspace.canvas.popFont();

    this.resetBlinkState();
    VG.update();
};

VG.UI.CodeEdit.prototype.paintWidget=function( canvas )
{
    if ( this.dragging && this.selectionIsValid )
        this.autoScroll();

    this.rect.round();

    if ( !this.rect.equals( this.previousRect ) ) this.verified=false;    
    this.contentRect.set( this.rect );
    canvas.setClipRect( this.contentRect, true );

    canvas.pushFont( this.font );

    var size=canvas.getTextSize( String( this.textLines ) );
    var headerColumnWidth=size.width+20;

    this.contentRect.height=2;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.contentRect, VG.context.style.skin.CodeEdit.TopBorderColor ); 

    this.contentRect.y+=2;
    this.contentRect.width=headerColumnWidth;
    this.contentRect.height=this.rect.height-2;
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.contentRect, VG.context.style.skin.CodeEdit.HeaderColor ); 

    this.contentRect.x+=this.contentRect.width;
    this.contentRect.width=this.rect.width - this.contentRect.width;
    var mainClipRect=VG.Core.Rect( this.contentRect );
    canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, this.contentRect, VG.context.style.skin.CodeEdit.BackgroundColor ); 

    this.contentRect=this.contentRect.add( 4, 2, -8, -4 );

    if ( !this.textLines ) { canvas.popFont(); canvas.setClipRect( false ); return; }

    if ( !this.verified || canvas.hasBeenResized )
        this.verifyScrollbar();

    if ( this.needsVScrollbar ) this.contentRect.width-=canvas.style.skin.Scrollbar.Size + 2;
    if ( this.needsHScrollbar ) this.contentRect.height-=canvas.style.skin.Scrollbar.Size + 2;

    // ---

    var paintRect=VG.Core.Rect();
    paintRect.x=this.rect.x + 10;
    paintRect.y=this.contentRect.y - this.textOffset.y;
    paintRect.width=headerColumnWidth;
    paintRect.height=this.maxTextLineSize.height;

    // --- Paint the Line Numbers First

    for ( var i=0; i < this.textLines; ++i ) 
    {
        if ( paintRect.y + this.itemHeight >= this.contentRect.y && paintRect.y < this.contentRect.bottom() )
        {
            // --- Text is visible, draw it
            canvas.drawTextRect( String( i+1 ), paintRect, canvas.style.skin.CodeEdit.HeaderTextColor, 0, 1 );
        }
        paintRect.y+=this.itemHeight;        
    }

    paintRect.x=this.contentRect.x - this.textOffset.x;
    paintRect.y=this.contentRect.y - this.textOffset.y;
    paintRect.width=this.maxTextLineSize.width;
    paintRect.height=this.maxTextLineSize.height;

    canvas.setClipRect( mainClipRect, true );        

    this.multiLineComment=false;
    this.textOut=0;

    // --- Paint the JS text

    for ( var i=0; i < this.textLines; ++i ) {

        var text=this.textArray[i];

        if ( paintRect.y + this.itemHeight >= this.contentRect.y && paintRect.y < this.contentRect.bottom() )
        {
            // --- This line is visible

            if ( this.selectionIsValid )
                this.drawSelectionForLine( canvas, i, paintRect, text, canvas.style.skin.CodeEdit.SelectionBackgroundColor );

            if ( this.searchTerm && this.searchTerm.length > 0 )
                this.drawSearchTerm( canvas, i, paintRect, text, canvas.style.skin.CodeEdit.SearchBackgroundColor );

            this.drawJSLine( canvas, 0, text, paintRect );
            this.textOut=0;
        } else
        {
            // --- Text is not visible, check for multiline state
            if ( this.multiLineComment === false )
            {
                if ( text.indexOf( "/*" ) !== -1 )
                    this.multiLineComment=true;
            }
            if ( this.multiLineComment === true )
            {
                if ( text.indexOf( "*/" ) !== -1 )
                    this.multiLineComment=false;
            }
        }

        paintRect.y+=this.itemHeight;
        if ( paintRect.y > this.contentRect.bottom() ) break;        
    }

    canvas.popFont();

    canvas.setAlpha( 0.7 );

    if ( this.needsVScrollbar ) {
        this.setVScrollbarDimensions();
        this.vScrollbar.paintWidget( canvas, true );
    }

    if ( this.needsHScrollbar ) {
        this.setHScrollbarDimensions();
        this.hScrollbar.paintWidget( canvas, true );
    }

    canvas.setAlpha( 1.0 );

    if ( !this.readOnly ) this.blink( canvas );
    this.previousRect.set( this.rect );    

    canvas.setClipRect( false );    
};

VG.UI.CodeEdit.prototype.drawJSLine=function( canvas, textPixelOffset, text, rect )
{
    //console.log( "drawJSLine", textPixelOffset, text, rect.toString() );

    var singleLineCommentIndex=text.indexOf( "//" );
    var multiLineCommentIndex=text.indexOf( "/*" );

    if ( singleLineCommentIndex === -1 && multiLineCommentIndex === -1 && !this.multiLineComment )
    {
        // --- No comments, check for quotes and keywords

        var keyword=this.getJSKeyword( text );

        var quoteChar="\"";
        var quoteIndex=text.indexOf( quoteChar );
        var quoteIndex2=text.indexOf( "'" );
    
        if ( quoteIndex !== -1 && quoteIndex2 !== -1 )
        {
            if ( quoteIndex > quoteIndex2 ) {
                quoteChar="'"; quoteIndex=quoteIndex2;
            }
        } else
        if ( quoteIndex2 !== -1 ) {
            quoteChar="'"; quoteIndex=quoteIndex2;            
        }

        if ( quoteIndex !== -1 )
        {
            if ( quoteIndex ) textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( 0, quoteIndex ), rect );

            var text2=text.slice( quoteIndex+1 );
            var endQuoteIndex=text2.indexOf( quoteChar );
            var skipped=0;

            // --- Skip end quote chars which have a \ before it
            while ( endQuoteIndex !== -1 && text2[endQuoteIndex-1] === "\\" ) {
                skipped+=endQuoteIndex+1;
                text2=text2.slice( endQuoteIndex+1 );
                endQuoteIndex=text2.indexOf( quoteChar );
            }

            if ( endQuoteIndex !== -1 ) 
            {
                textPixelOffset+=this.drawJSText( canvas, text.slice( quoteIndex, quoteIndex+endQuoteIndex+skipped+2 ), rect.add( textPixelOffset, 0, -textPixelOffset, 0), this.codeSkin.Text );
                textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( quoteIndex+endQuoteIndex+skipped+2 ), rect );
            } else
                textPixelOffset+=this.drawJSText( canvas, text.slice( quoteIndex ), rect.add( textPixelOffset, 0, -textPixelOffset, 0), this.codeSkin.Text );
        } else
        if ( keyword ) 
        {
            // --- Keyword (Reserved + BuiltIn)
            if ( keyword.index ) textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( 0, keyword.index ), rect );
            textPixelOffset+=this.drawJSText( canvas, text.slice( keyword.index, keyword.index + keyword.length ), rect.add( textPixelOffset, 0, -textPixelOffset, 0), keyword.color );
            textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( keyword.index + keyword.length ), rect );  
        } else
        if ( text.indexOf( "VG." ) !== -1 )
        {
            // --- VG.Namespace

            var vgIndex=text.indexOf( "VG." );
            var vgIndexEnd=vgIndex+3;

            while ( vgIndexEnd < text.length && text[vgIndexEnd] !== " " && text[vgIndexEnd] !== "\n" && text[vgIndexEnd] !== "(" && text[vgIndexEnd] !== ";" && text[vgIndexEnd] !== "=" ) vgIndexEnd++;

            if ( vgIndex ) textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( 0, vgIndex ), rect );
            textPixelOffset+=this.drawJSText( canvas, text.slice( vgIndex, vgIndexEnd ), rect.add( textPixelOffset, 0, -textPixelOffset, 0), this.codeSkin.VG );
            textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( vgIndexEnd ), rect );       
        } else
        {
            // --- Last Check: Digit

            var digitIndex = text.search( /\d/ );
            if ( digitIndex !== -1 ) {

                if ( digitIndex ) textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( 0, digitIndex ), rect );
                textPixelOffset+=this.drawJSText( canvas, text.slice( digitIndex, digitIndex+1 ), rect.add( textPixelOffset, 0, -textPixelOffset, 0), this.codeSkin.Digit );
                textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( digitIndex+1 ), rect );      

            } else
                // --- Just plain text, no formatting
                textPixelOffset+=this.drawJSText( canvas, text, rect.add( textPixelOffset, 0, -textPixelOffset, 0), VG.context.style.skin.CodeEdit.TextColor );
        }
    } else
    {
        // --- This line has the start of a comment or is inside a multi-line comment

        if ( this.multiLineComment )
        {
            // --- Line is inside a multi line comment
            var multiLineCommentEndIndex=text.indexOf( "*/" );
            if ( multiLineCommentEndIndex !== -1 )
            {
                // --- Line is inside a multi line comment and has a multi line comment end token

                textPixelOffset+this.drawJSText( canvas, text.slice( 0, multiLineCommentEndIndex+2 ), rect.add( textPixelOffset, 0, -2*textPixelOffset, 0), this.codeSkin.Comment );

                this.multiLineComment=false;
                textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( multiLineCommentEndIndex+2 ), rect );
            } else 
            {
                // --- Line is completely embedded in a multi line comment
                textPixelOffset+=this.drawJSText( canvas, text, rect.add( textPixelOffset, 0, -textPixelOffset, 0), this.codeSkin.Comment );
            }
        } else
        if ( multiLineCommentIndex !== -1 )
        {
            // --- Line has a multi line comment start token
            if ( multiLineCommentIndex ) textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( 0, multiLineCommentIndex ), rect );
            textPixelOffset+=this.drawJSText( canvas, text.slice( multiLineCommentIndex ), rect.add( textPixelOffset, 0, -textPixelOffset, 0), this.codeSkin.Comment );
            this.multiLineComment=true;
        } else
        {
            // --- Line has a single line comment start token
            if ( singleLineCommentIndex ) textPixelOffset=this.drawJSLine( canvas, textPixelOffset, text.slice( 0, singleLineCommentIndex ), rect );
            textPixelOffset+=this.drawJSText( canvas, text.slice( singleLineCommentIndex), rect.add( textPixelOffset, 0, -textPixelOffset, 0), this.codeSkin.Comment );
        }
    }

    return textPixelOffset;
};

VG.UI.CodeEdit.prototype.drawJSText=function( canvas, text, rect, color )
{
    return canvas.drawTextRect( text, rect, color, this.hAlignment, 1 );  
};

VG.UI.CodeEdit.prototype.getJSKeyword=function( text )
{
    var index=text.indexOf( "this" );
    if ( index !== -1 && this.verifyKeyword( text, "this", index ) ) return { "index" : index, "length" : "this".length, "color" : this.codeSkin.ThisAndParameter };

    for ( var i=0; i < this.jsReserved.length; ++i ) {
        var index=text.indexOf( this.jsReserved[i] );
        if ( index !== -1 && this.verifyKeyword( text, this.jsReserved[i], index ) ) return { "index" : index, "length" : this.jsReserved[i].length, "color" : this.codeSkin.Reserved };
    }

    for ( var i=0; i < this.jsBuiltIn.length; ++i ) {
        var index=text.indexOf( this.jsBuiltIn[i] );
        if ( index !== -1 && this.verifyKeyword( text, this.jsBuiltIn[i], index ) ) return { "index" : index, "length" : this.jsBuiltIn [i].length, "color" : this.codeSkin.BuiltIn };
    }

    return null;
};

VG.UI.CodeEdit.prototype.verifyKeyword=function( text, keyword, index )
{
    var left=true, right=true;

    // --- Left Check
    if ( index ) {
        if ( text[index-1] !== " " && text[index-1] !== "=" && text[index-1] !== "." && text[index-1] !== ";" && text[index-1] !== "!" ) left=false;
    }

    // --- Right Check
    var rightIndex=index+keyword.length;
    if ( rightIndex < text.length ) {
        if ( text[rightIndex] !== " " && text[rightIndex] !== "(" && text[rightIndex] !== "." && text[rightIndex] !== ";" ) right=false;
    }

    if ( left && right ) return true;
    else return false;
};

VG.UI.CodeEdit.prototype.setVScrollbarDimensions=function( canvas )
{
    this.vScrollbar.rect=VG.Core.Rect( this.contentRect.right() + 2, this.contentRect.y, VG.context.style.skin.Scrollbar.Size, this.contentRect.height );

    // this.totalItemHeight == Total height of all Items in the list widget including spacing
    // visibleHeight == Total height of all currently visible items
    // this.contentRect.height == Height of the available area for the list items

    this.vScrollbar.setScrollbarContentSize( this.totalItemHeight, this.contentRect.height );    
};

VG.UI.CodeEdit.prototype.setHScrollbarDimensions=function( canvas )
{
    this.hScrollbar.rect=VG.Core.Rect( this.contentRect.x, this.contentRect.bottom() + 1, this.contentRect.width, VG.context.style.skin.Scrollbar.Size );

    // this.totalItemHeight == Total height of all Items in the list widget including spacing
    // visibleHeight == Total height of all currently visible items
    // this.contentRect.height == Height of the available area for the list items

    this.hScrollbar.setScrollbarContentSize( this.maxTextLineSize.width, this.contentRect.width );
};