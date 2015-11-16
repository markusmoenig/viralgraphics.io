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

// ----------------------------------------------------------------- VG.UI.TableWidgetSeparator

VG.UI.TableWidgetSeparator=function()
{
    if ( !(this instanceof VG.UI.TableWidgetSeparator )) return new VG.UI.TableWidgetSeparator();

    VG.UI.Widget.call( this );
    this.name="TableWidgetSeparator";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;
};

VG.UI.TableWidgetSeparator.prototype=VG.UI.Widget();

VG.UI.TableWidgetSeparator.prototype.calcSize=function()
{
    var size=VG.Core.Size( VG.UI.stylePool.current.skin.TableWidget.SeparatorWidth, 20 );
    return size;
};

VG.UI.TableWidgetSeparator.prototype.paintWidget=function( canvas )
{
    var size=this.calcSize( canvas );
    this.contentRect.set( this.rect );
    
    VG.UI.stylePool.current.drawTableWidgetSeparator( canvas, this );
};

VG.UI.TableWidgetColumn=function( binding, type )
{
    this.binding=binding;
    this.type=type;
};

// ----------------------------------------------------------------- VG.UI.TableWidgetHeaderItem

VG.UI.TableWidgetHeaderItem=function( text )
{
    if ( !(this instanceof VG.UI.TableWidgetHeaderItem )) return new VG.UI.TableWidgetHeaderItem( text );

    VG.UI.Widget.call( this );
    this.name="TableWidgetHeaderItem";

    this.text=text ? text : "";

    this.horizontalExpanding=false;
    this.verticalExpanding=false;
};

VG.UI.TableWidgetHeaderItem.prototype=VG.UI.Widget();

VG.UI.TableWidgetHeaderItem.prototype.calcSize=function( canvas )
{
    var size=canvas.getTextSize( this.text );

    size.width+=10;
    size.height=canvas.getLineHeight();
    if ( size.height < canvas.style.skin.TableWidget.Header.MinHeight )
        size.height=canvas.style.skin.TableWidget.Header.MinHeight;

    this.checkSizeDimensionsMinMax( size );    

    return size;
};

VG.UI.TableWidgetHeaderItem.prototype.paintWidget=function( canvas )
{
    this.font=canvas.style.skin.TableWidget.Font;
    canvas.pushFont(this.font);

    var textColor;

    if ( !this.disabled ) {
        if ( this.customColor ) textColor=this.customColor;
        else textColor=canvas.style.skin.Widget.TextColor;
    } else textColor=canvas.style.skin.Widget.DisabledTextColor;

    if ( this.embedded && this.embeddedSelection ) textColor=canvas.style.skin.Widget.EmbeddedTextColor;

    canvas.drawTextRect( this.text, this.rect.add( canvas.style.skin.TableWidget.Header.TextXOffset, 0, 0, 0 ), textColor, this.hAlignment, 1 );

    canvas.popFont();
};

// ----------------------------------------------------------------- VG.UI.TableWidget

VG.UI.TableWidget=function()
{
    if ( !(this instanceof VG.UI.TableWidget) ) return new VG.UI.TableWidget();
    
    VG.UI.Widget.call( this );
    this.name="TableWidget";

    this.offset=0;

    this.minimumSize.set( 100, 200 );
    this.supportsFocus=true;

    this.vScrollbar=0;
    this.needsVScrollbar=false;
    this.verified=false;

    this.headerLayout=VG.UI.Layout();
    this.headerLayout.spacing=0;
    this.headerLayout.margin.set( /*VG.context.workspace.canvas.style.skin.TableWidgetSeparatorWidth*/0, 0, 0, 0 );
    this.footerLayout=VG.UI.Layout();
    this.footerLayout.margin.set( 0, 0, 0, 0 );

    this.childWidgets=[];

    this.columns=[];

    this.textLineEdits=[];
    this.popupButtons=[];
    this.labels=[];

    this.spacing=VG.context.workspace.canvas.style.skin.TableWidget.Item.Spacing;
    this.itemHeight=VG.context.workspace.canvas.style.skin.TableWidget.RowHeight;
    this.textLineEditModulo=0;
    this.popupButtonModulo=0;

    this.frameType=VG.UI.Frame.Type.Box;

    // --- Setup Default Context Menu

    this.contextMenu=VG.UI.ContextMenu();

    this.addMenuItem=this.contextMenu.addItem( "Add", null, function() { 
        if ( this.controller && this.controller.contentClassName ) this.controller.add(); 
    }.bind( this ));

    this.removeMenuItem=this.contextMenu.addItem( "Remove", null, function() {
        if ( this.controller && this.controller.canRemove() ) this.controller.remove( this.controller.selected ); 
    }.bind( this ));
};

VG.UI.TableWidget.prototype=VG.UI.Widget();

VG.UI.TableWidget.prototype.bind=function( collection, path )
{
    this.controller=collection.controllerForPath( path );
    if ( !this.controller ) {
        this.controller=VG.Controller.Array( collection, path );
        collection.addControllerForPath( this.controller, path );
    } else this.controller=this.controller.object;

    this.controller.addObserver( "changed", this.changed, this );    
    this.controller.addObserver( "selectionChanged", this.selectionChanged, this );
    this.controller.addObserver( "parentSelectionChanged", this.parentSelectionChanged.bind( this ), this );

    this.collection=collection;
    this.path=path;

    return this.controller;
};

VG.UI.TableWidget.prototype.addTextLineEdit=function()
{
    var widget=new VG.UI.TextLineEdit();
    widget.parent=this;
    widget.embedded=true;

    this.textLineEdits.push( widget );

    return widget;
};

VG.UI.TableWidget.prototype.addPopupButton=function()
{
    var widget=new VG.UI.PopupButton();
    widget.parent=this;
    widget.embedded=true;

    this.popupButtons.push( widget );

    return widget;
};

VG.UI.TableWidget.prototype.addLabel=function()
{
    var widget=new VG.UI.Label( "" );
    widget.parent=this;
    widget.embedded=true;

    this.labels.push( widget );

    return widget;
};

VG.UI.TableWidget.prototype.changed=function( )
{
    //console.log( "TableWidget.changed" );
    this.parentSelectionChanged();
    this.verified=false;    
    VG.update();    
};

VG.UI.TableWidget.prototype.selectionChanged=function( )
{
    //console.log( "TableWidget.selectionChanged" );
    this.parentSelectionChanged();

    VG.update();    
};

VG.UI.TableWidget.prototype.parentSelectionChanged=function( )
{
    //console.log( "TableWidget.parentSelectionChanged" );

    // --- Remvove all previous value bindings for this path

    for ( var i=0; i < this.columns.length; ++i )
    {
        var column=this.columns[i];           
        this.collection.removeAllValueBindingsForPath( this.controller.path + "." + column.binding );
    }

    // --- Assign an UI Widget for every row / col

    var textLineEditCounter=0, popupButtonCounter=0, labelCounter=0;

    for( var row=0; row < this.controller.length; ++row )
    {
        var item=this.controller.at( row );

        for ( var i=0; i < this.columns.length; ++i )
        {
            var column=this.columns[i];
            var widget;

            if ( column.type === VG.UI.TableWidgetItemType.TextLineEdit ) {
                if ( textLineEditCounter < this.textLineEdits.length )
                    widget=this.textLineEdits[textLineEditCounter];
                else widget=this.addTextLineEdit();
                ++textLineEditCounter;

                widget.text=item[column.binding];
                if ( column.defaultText ) widget.defaultText=column.defaultText;
            } else
            if ( column.type === VG.UI.TableWidgetItemType.PopupButton ) {
                if ( popupButtonCounter < this.popupButtons.length )
                    widget=this.popupButtons[popupButtonCounter];
                else widget=this.addPopupButton();
                ++popupButtonCounter;

                if ( widget.items.length === 0 && column.popupItems ) {
                    for( var i=0; i < column.popupItems.length; ++i ) {
                        widget.addItem( column.popupItems[i] );
                    }
                }

                widget.index=item[column.binding];                
            } else
            if ( column.type === VG.UI.TableWidgetItemType.Label ) {
                if ( labelCounter < this.labels.length )
                    widget=this.labels[labelCounter];
                else widget=this.addLabel();
                ++labelCounter;

                widget.hAlignment=VG.UI.HAlignment.Left;
                widget.text=item[column.binding];            
            }

            widget.focusInCallback=this.childFocusedIn.bind( this );
            widget.__vgDataRep=item;

            if ( item === this.controller.selected ) {
                widget.bind( this.collection, this.controller.path + "." + column.binding );
            }            
        }
    }

    this.verified=false;    
};

VG.UI.TableWidget.prototype.addColumn=function( binding, text, type, expanding, minimumWidth )
{
    if ( this.headerLayout.children.length )
        this.headerLayout.addChild( VG.UI.TableWidgetSeparator() );

    var label=VG.UI.TableWidgetHeaderItem( text );

    if ( expanding === undefined ) expanding=true;
    if ( minimumWidth ) label.minimumSize.width=minimumWidth;

    label.horizontalExpanding=expanding;
    label.hAlignment=VG.UI.HAlignment.Left;

    this.headerLayout.addChild( label );
    this.columns.push( new VG.UI.TableWidgetColumn( binding, type ) );

    if ( type === VG.UI.TableWidgetItemType.TextLineEdit )
    {
        this.textLineEditModulo=0;
        for( var i=0; i < this.columns.length; ++i ) 
        {
            if ( this.columns[i].type === VG.UI.TableWidgetItemType.TextLineEdit )
                this.textLineEditModulo++;
        }
    } else
    if ( type === VG.UI.TableWidgetItemType.PopupButton )
    {
        this.popupButtonModulo=0;
        for( var i=0; i < this.columns.length; ++i ) 
        {
            if ( this.columns[i].type === VG.UI.TableWidgetItemType.PopupButton )
                this.popupButtonModulo++;
        }
    } else
    if ( type === VG.UI.TableWidgetItemType.Label )
    {
        this.labelModulo=0;
        for( var i=0; i < this.columns.length; ++i ) 
        {
            if ( this.columns[i].type === VG.UI.TableWidgetItemType.Label )
                this.labelModulo++;
        }
    }    
};

VG.UI.TableWidget.prototype.setColumnPopupItems=function( colIndex )
{
    var column=this.columns[colIndex];

    column.popupItems=[];

    for( var i=1; i < arguments.length; ++i )
        column.popupItems.push( arguments[i] );
};

VG.UI.TableWidget.prototype.setColumnDefaultText=function( colIndex, text )
{
    var column=this.columns[colIndex];
    column.defaultText=text;
};

VG.UI.TableWidget.prototype.addButton=function( buttonText)
{
    var button=VG.UI.Button( buttonText );
    button.big=false;

    this.footerLayout.addChild( button );
    //this.layout.addChild( button );

    return button;
};

VG.UI.TableWidget.prototype.focusIn=function()
{
};

VG.UI.TableWidget.prototype.focusOut=function()
{
};

VG.UI.TableWidget.prototype.keyDown=function( keyCode )
{        
    if ( !this.controller.selected ) return;

    var index=this.controller.indexOf( this.controller.selected );
    if ( index === -1 ) return;

    if ( keyCode === VG.Events.KeyCodes.ArrowUp && index > 0 )
    {
        if ( this.offset >= index ) {
            this.offset=index-1;
            this.vScrollbar.scrollTo( this.offset * this.itemHeight + (this.offset-1) * this.spacing );
        }
        this.controller.selected=this.controller.at( index - 1 );
    } else
    if ( keyCode === VG.Events.KeyCodes.ArrowDown && index < this.controller.length-1 )
    {
        if ( Math.floor( this.offset + this.visibleItems ) <= index +1 ) {
            this.offset=index+2-Math.floor(this.visibleItems);
            this.vScrollbar.scrollTo( this.offset * this.itemHeight + (this.offset-1) * this.spacing );            
        }

        this.controller.selected=this.controller.at( index + 1 );
    } 
}

VG.UI.TableWidget.prototype.mouseMove=function( event )
{
};

VG.UI.TableWidget.prototype.mouseDown=function( event )
{
    if ( this.needsVScrollbar && this.vScrollbar && this.vScrollbar.rect.contains( event.pos ) ) {
        this.vScrollbar.mouseDown( event );
        return;
    }

    if ( !this.rect.contains( event.pos ) ) return;

    var selected=this.offset + (event.pos.y - this.contentRect.y) / this.heightPerItem;
    var item=-1;

    if ( selected >=0 && selected < this.controller.length )
        item=this.controller.at( Math.floor( selected ) );

    if ( this.controller.multiSelection ) 
    {/*
        if ( ! (totalSelected) ) {
            item.selected=true;
            changed=true;
        } else {
        if ( item.selected == false ) {
            if ( ! ( event.keysDown.indexOf( VG.Events.KeyCodes.Shift ) >= 0 ) ) {
                this.deselectAll();
            }
            item.selected=true;
            changed=true;
        } else {
            if ( event.keysDown.indexOf( VG.Events.KeyCodes.Shift ) >= 0 ) {
                item.selected=false;
                changed=true;
            }
        }
        }*/
    } else {
        if ( item !== -1 && !this.controller.isSelected( item ) ) {
            this.controller.selected=item;
        }
    } 
};

VG.UI.TableWidget.prototype.vHandleMoved=function( offsetInScrollbarSpace )
{
    var offset=offsetInScrollbarSpace * this.vScrollbar.totalSize / this.vScrollbar.visibleSize;
    var loopOffset=0;

    for ( var i=0; i < this.controller.length; ++i ) {
        var item=this.controller.at( i );

        loopOffset+=this.itemHeight + this.spacing;

        if ( loopOffset >= offset ) {
            this.offset=i;
            break;
        }
    }

    if ( this.offset > this.lastTopItem )
        this.offset=this.lastTopItem;
};

VG.UI.TableWidget.prototype.verifyScrollbar=function( text )
{
    // --- Check if we have enough vertical space for all items

    this.needsVScrollbar=false;

    this.totalItemHeight=this.controller.length * this.itemHeight + (this.controller.length-1) * this.spacing;
    this.heightPerItem=this.totalItemHeight / this.controller.length;
    this.visibleItems=this.contentRect.height / this.heightPerItem;
    this.lastTopItem=Math.ceil( this.controller.length - this.visibleItems );

    if ( this.totalItemHeight > this.contentRect.height )
        this.needsVScrollbar=true;

    if ( this.needsVScrollbar && !this.vScrollbar ) {
        this.vScrollbar=VG.UI.ScrollBar( "TableWidget Scrollbar" );
        this.vScrollbar.callbackObject=this;
        //this.layout.addChild( this.vScrollbar );
        this.childWidgets.push( this.vScrollbar )
    }    

    this.verified=true;
};

VG.UI.TableWidget.prototype.paintWidget=function( canvas )
{
    this.spacing=VG.context.workspace.canvas.style.skin.TableWidget.Item.Spacing;
    this.itemHeight=VG.context.workspace.canvas.style.skin.TableWidget.RowHeight;

    var oldState=this.visualState;
    if ( this.visualState !== VG.UI.Widget.VisualState.Focus ) 
    {
        // --- If one of the childs has focus, draw a focus ring too
        for( var i=0; i < this.childWidgets.length; ++i ) {
            if ( this.childWidgets[i].visualState === VG.UI.Widget.VisualState.Focus )
                this.visualState=VG.UI.Widget.VisualState.Focus;
        }
    }

    VG.UI.Frame.prototype.paintWidget.call( this, canvas );
    //canvas.style.drawGeneralBorder( canvas, this );
    this.visualState=oldState;

    this.childWidgets=[];

    this.contentRect.x+=canvas.style.skin.TableWidget.ContentMargin.left;
    this.contentRect.y+=canvas.style.skin.TableWidget.ContentMargin.top;
    this.contentRect.width-=canvas.style.skin.TableWidget.ContentMargin.left + canvas.style.skin.TableWidget.ContentMargin.right;
    this.contentRect.height-=canvas.style.skin.TableWidget.ContentMargin.top + canvas.style.skin.TableWidget.ContentMargin.bottom;

    //if ( this.needsVScrollbar )
        //this.contentRect.width-=canvas.style.skin.Scrollbar.Size + 4;

    // --- Header Layout

    canvas.pushFont( canvas.style.skin.TableWidget.Header.Font );

    for( var i=0; i < this.headerLayout.children.length; ++i ) {
        var child=this.headerLayout.children[i];
        child.disabled=this.disabled;
    }

    this.headerLayout.rect.set( this.contentRect );
    this.headerLayout.rect.height=canvas.style.skin.TableWidget.Header.Height;
    this.headerLayout.rect.round();

    canvas.style.drawTableWidgetHeaderBackground( canvas, this.headerLayout.rect );
    this.headerLayout.layout( canvas );

    canvas.style.drawTableWidgetHeaderSeparator( canvas, this );

    canvas.popFont();

    // --- Footer Layout

    this.contentRect.y+=this.headerLayout.rect.height + canvas.style.skin.TableWidget.Header.SeparatorHeight;
    this.contentRect.height-=this.headerLayout.rect.height + canvas.style.skin.TableWidget.Header.SeparatorHeight;

    if ( this.footerLayout.children.length )
    {
        // --- Footer Layout

        for( var i=0; i < this.footerLayout.children.length; ++i ) {
            var child=this.footerLayout.children[i];
            this.childWidgets.push( child );
        }

        this.footerLayout.rect.set( this.contentRect.x, this.contentRect.bottom() - canvas.style.skin.TableWidget.Footer.Height, 
            this.contentRect.width, canvas.style.skin.TableWidget.Footer.Height );
        this.footerLayout.margin.set( canvas.style.skin.TableWidget.Footer.Margin );
        this.footerLayout.layout( canvas );    

        canvas.style.drawTableWidgetFooterSeparator( canvas, this );

        this.contentRect.height-=this.footerLayout.rect.height + canvas.style.skin.TableWidget.Footer.SeparatorHeight;
    }

    // ---

    if ( !this.controller || !this.controller.length ) { return; }

    if ( !this.verified || canvas.hasBeenResized )
        this.verifyScrollbar();

    // --- Draw the Contents of it all ----------------------------

    canvas.pushFont( canvas.style.skin.TableWidget.Font );

    var paintRect=VG.Core.Rect( this.contentRect );
    paintRect.height=canvas.style.skin.TableWidget.RowHeight;

    var textLineEditCounter=this.offset * this.textLineEditModulo, popupButtonCounter=this.offset * this.popupButtonModulo, labelCounter=this.offset * this.labelModulo;
    this.visibleHeight=0;

    for( var row=this.offset; row < this.controller.length; ++row )
    {
        var item=this.controller.at( row );

        var rect=VG.Core.Rect( paintRect );
        rect.x=this.rect.x+1; rect.width=this.rect.width-2;

        if ( this.needsVScrollbar ) rect.width-=canvas.style.skin.ScrollBar.Size + 8 + canvas.style.skin.TableWidget.ContentMargin.right;

        canvas.style.drawTableWidgetRowBackground( canvas, this, rect, this.headerLayout, item === this.controller.selected );

        for ( var i=0; i < this.columns.length; ++i )
        {
            var column=this.columns[i];
            var widget;

            if ( column.type === VG.UI.TableWidgetItemType.TextLineEdit ) {
                widget=this.textLineEdits[textLineEditCounter++];
            } else
            if ( column.type === VG.UI.TableWidgetItemType.PopupButton ) {
                widget=this.popupButtons[popupButtonCounter++];
            } else   
            if ( column.type === VG.UI.TableWidgetItemType.Label ) {
                widget=this.labels[labelCounter++];
            }     

            if ( widget === undefined ) break;

            widget.embeddedSelection=item === this.controller.selected;

            var widgetHeight=widget.calcSize( canvas ).height;

            widget.rect.x=this.headerLayout.children[i*2].rect.x;
            widget.rect.y=paintRect.y + ( paintRect.height - widgetHeight ) / 2;
            widget.rect.width=this.headerLayout.children[i*2].rect.width;
            widget.rect.height=widgetHeight;

            if ( column.type === VG.UI.TableWidgetItemType.Label ) {
                widget.rect.x+=canvas.style.skin.TableWidget.Header.TextXOffset;
                widget.rect.width-=canvas.style.skin.TableWidget.Header.TextXOffset;
            }

            if ( !i ) widget.rect.x+=canvas.style.skin.TableWidget.Item.XMargin;
            if ( i === this.columns.length - 1 ) {
                widget.rect.width-=2*canvas.style.skin.TableWidget.Item.XMargin;

                if ( this.needsVScrollbar )
                    widget.rect.width-=canvas.style.skin.ScrollBar.Size + 2;                
            }

            widget.rect.round();
            widget.paintWidget( canvas );
            this.childWidgets.push( widget );
        }
        
        // ---

        paintRect.y+=this.itemHeight + this.spacing;
        this.visibleHeight+=this.itemHeight + this.spacing;                    

        if ( paintRect.bottom() > this.contentRect.bottom() )
            break;        
    }

    // ---

    canvas.popFont();        

    if ( this.needsVScrollbar ) {
        this.vScrollbar.rect=VG.Core.Rect( this.contentRect.right() - canvas.style.skin.ScrollBar.Size - 2, this.contentRect.y, canvas.style.skin.ScrollBar.Size, this.contentRect.height );

        // this.totalItemHeight == Total height of all Items in the list widget including spacing
        // visibleHeight == Total height of all currently visible items
        // this.contentRect.height == Height of the available area for the list items

        this.vScrollbar.setScrollBarContentSize( this.totalItemHeight, this.visibleHeight );
        this.vScrollbar.paintWidget( canvas );
    }    
};

VG.UI.TableWidget.prototype.childFocusedIn=function( widget )
{
    //console.log( "childFocusedIn", widget );
    this.parentSelectionChanged();
    this.controller.selected=widget.__vgDataRep;
};