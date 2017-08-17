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

VG.UI.RichTextEditor = class extends VG.UI.Widget {

    constructor( { defaultFont, tagList, readOnly = false, margin } = {} ) {
        super();
        this.supportsFocus = true;
        this.margin = margin;

        this.defaultFont = defaultFont ? defaultFont : {
            name : "open sans",
            size : 13.5,
            attributes : { bold : false, italic : false },
            style : 'rgb(244,244,244)',
            text : "13.5px open sans"
        };

        this.tagList = tagList ? tagList : [
            { name : "h1", size : 30 },
            { name : "h2", size : 20 },
            { name : "h3", size : 18 },
            { name : "h4", size : 16 },
            { name : "p", size : 14 },
        ];

        let canvas = document.getElementById( 'workspace' );
        this.richText = new RichText.Editor( { canvas : canvas,
            defaultFont : this.defaultFont,
            tagList : this.tagList,
            selectionStyle : '#c287d4',
            linkStyle : '#7ec5f3',
            readOnly : readOnly,
         } );
        let richText = this.richText;

        richText.needsRedraw( () => VG.update() );
        richText.contentChanged( ( richText, type ) => {
            setTimeout( () => {
                let saveData = richText.save();
                // console.trace( richText, type, richText.export( "text") );
                if ( this.collection && this.path )
                    this.collection.storeDataForPath( { path : this.path, value : saveData, undoText : this.undoText } );
            }, 1000 );
        } );

        richText.gotoUrl( ( url ) => VG.gotoUrl( url ) );

        richText.setScrollBar( VG.UI.stylePool.current.skin.ScrollBar.Size, ( ctx, rect ) => {
            // ctx.fillStyle = 'darkGray';
            // ctx.fillRect( this.contentRect.x + rect.x, this.contentRect.y + rect.y, rect.width, rect.height );

            let widget = {};
            widget.handleRect = new VG.Core.Rect( this.contentRect.x + rect.x, this.contentRect.y + rect.y, rect.width, rect.height );
            let style = VG.UI.stylePool.current;
            widget.contentRect = {
                x : this.contentRect.right() - style.skin.ScrollBar.Size, y :this.contentRect.y,
                width : style.skin.ScrollBar.Size, height : this.contentRect.height
            };
            widget.rect = widget.contentRect;
            widget.direction = VG.UI.ScrollBar.Direction.Vertical;
            style.drawScrollBar( widget, VG.context.workspace.canvas );
        } );

        richText.clearBackground = false;
    }

    /**
     * Binds the widget to the data model. This widget has to be bound to a String value.
     * @param {VG.Data.Collection} collection - The data collection to link this widget to.
     * @param {string} path - The path inside the data collection to bind this widget to.
     * @tutorial Data Model
     */

    bind( collection, path )
    {
        this.collection=collection;
        this.path=path;
        collection.addValueBindingForPath( this, path );
    }

    valueFromModel( value )
    {
        if ( value === null ) this.data = "";
        else this.data = value;

        // if ( this.textChanged )
            // this.textChanged.call( VG.context, value );
        if ( value && value[0] === "{" ) this.richText.load( value, { clear : true, sendNotification : false } );
        else if ( value ) {
            this.richText.clear( false );
            value = value.replace( /</g, "" );
            value = value.replace( />/g, "" );
            this.richText.textInput( value, false );
        }
    }

    /**
     * Feeds plain text input to RichTextJS.
     * @param {*} text
     */

    textInput( text ) {
        // console.log( text );
        this.richText.textInput( text );
        VG.update();
    }

    /**
     * Translates a Viral Graphics key code event to RichTextJS understandable string.
     * @param {number} keyCode
     * @returns {string}
     */

    translateKeyCode( keyCode ) {
        let key = "";

        if ( keyCode === VG.Events.KeyCodes.Enter ) key = "Enter";
        else if ( keyCode === VG.Events.KeyCodes.Backspace || keyCode === VG.Events.KeyCodes.Delete ) key = "Backspace";
        else if ( keyCode === VG.Events.KeyCodes.ArrowLeft ) key = "ArrowLeft";
        else if ( keyCode === VG.Events.KeyCodes.ArrowUp ) key = "ArrowUp";
        else if ( keyCode === VG.Events.KeyCodes.ArrowRight ) key = "ArrowRight";
        else if ( keyCode === VG.Events.KeyCodes.ArrowDown ) key = "ArrowDown";

        return key;
    }

    keyDown( keyCode ) {
        let key = this.translateKeyCode( keyCode );
        if ( key ) this.richText.keyDown( key );
        VG.update();
    }

    mouseDown( event ) {
        let pos = { x : Math.max( event.pos.x - this.contentRect.x, 0), y : Math.max( event.pos.y - this.contentRect.y, 0 ) };
        this.richText.mouseDown( pos );
        VG.update();
    }

    mouseMove( event ) {
        let pos = { x : Math.max( event.pos.x - this.contentRect.x, 0), y : Math.max( event.pos.y - this.contentRect.y, 0 ) };
        this.richText.mouseMove( pos );
        VG.update();
    }

    mouseUp( event ) {
        let pos = { x : Math.max( event.pos.x - this.contentRect.x, 0), y : Math.max( event.pos.y - this.contentRect.y, 0 ) };
        this.richText.mouseUp( pos );
        VG.update();
    }

    mouseWheel( step )
    {
        this.richText.mouseWheel( step );
    }

    focusIn() {
        this.richText.setFocus( true );
    }

    focusOut() {
        this.richText.setFocus( false );
    }

    checkDragSourceItemId( pos, id ) {
        if ( id === "Image" )
        {
            let p = { x : Math.max( pos.x - this.contentRect.x, 0), y : Math.max( pos.y - this.contentRect.y, 0 ) };
            if ( this.richText.needsScrollBar && this.richText.scrollBarWidth )
                p.y += this.richText.vOffset;

            let rc = this.richText.getLocationForMousePos( p );

            if ( rc ) {
                this.richText.cursorLocation = rc;
                this.richText.elements.current = rc.element;

                this.richText.resetBlinkState();
                this.richText.selection = false;
                this.richText._redraw();
            }

            return true;
        } else return false;
    }

    acceptDragSourceItem( pos, id, item ) {
        if ( id === "Image" ) {
            this.richText.setImage( { name: item.text, width: item.image.width, height: item.image.height } );
        }
    }

    clipboardCopyIsAvailable()
    {
        if ( this.richText.selection ) return "Text";
        else return null;
    }

    clipboardPasteIsAvailableForType( type )
    {
        if ( type === "Text" && !this.richText.readOnly ) return true;
        return false;
    }

    clipboardCut()
    {
        if ( !this.richText.selection ) return;

        let out = this.richText.export( "text", true );
        if ( out ) {
            this.richText.deleteSelection();
            VG.copyToClipboard( "Text", out );
        }
    }

    clipboardCopy()
    {
        let out = this.richText.export( "text", true );
        if ( out )
            VG.copyToClipboard( "Text", out );
    }

    clipboardPaste()
    {
        if ( this.richText.selection ) this.richText.deleteSelection();
        this.richText.textInput( VG.clipboardPasteDataForType( "Text" ) );
    }

    clipboardDeleteSelection()
    {
        if ( this.richText.selection ) this.richText.deleteSelection();
    }

    paintWidget( canvas ) {
        let rect = this.contentRect;

        rect.copy( this.rect );

        if ( !this.margin ) this.margin = { x : 2, y : 2 };

        rect.x += this.margin.x;
        rect.y += this.margin.y;
        rect.width -= this.margin.x;
        rect.height -= this.margin.y;

        if ( rect.width !== this.richText.width || rect.height !== this.richText.height )
            this.richText.layout( rect.width, rect.height );

        this.richText.draw( rect.x, rect.y );
    }
};

Object.defineProperty( VG.UI.RichTextEditor.prototype, "content", {
    get: function() {

        return this._content;
    },
    set: function( content ) {
        if ( !content ) content="";
        this._content = content;
        if ( content )
            this.richText.load( content, { clear : true, sendNotification : false } );
    }
});