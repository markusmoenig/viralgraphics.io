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

// ----------------------------------------------------------------- VG.UI.Widget

VG.UI.Window=function( title )
{
    /**Creates an VG.UI.Window object.<br>
     *
     * Windows are standalone, well, windows, floating on the VG.UI.Workspace space. They are not part of any layout inside the Workspace. You can create, or derive, from a Window
     * and apply your own layout to the Window by setting its layout property. In contrast to VG.UI.Dialog, VG.UI.Window is not modal, i.e. you can still use other user interface
     * elements in the Workspace. <br>
     * Windows can be shown by calling the showWindow() member function of VG.UI.Workspace.
     * @param {string} title - The title of the Window
     * @constructor
     **/

    if ( !(this instanceof VG.UI.Window) ) return new VG.UI.Window( title );
    
    VG.UI.Widget.call( this );

    this.supportsFocus=true;

    this.name="Window";
    this.text=title;

    /**The layout of the Window, default is null. You should set your own layout into this property and the Window will adjust its size to fit the layout.
     *  @member {object} */
    this.layout=null;

    this.dragOpStart=VG.Core.Point();
    this.dragOpPos=VG.Core.Point();

    this.dragOp=false;    

    this.closeImage=VG.UI.Image();
    this.closeImage.clicked=function() {
        this.close( this );
    }.bind( this );

    this.childWidgets=[];
    this.childWidgets.push( this.closeImage );
};

VG.UI.Window.prototype=VG.UI.Widget();

VG.UI.Window.prototype.setFocus=function()
{
    /**Applies keyboard and mouse event focus to this Window.
     *
     **/

    VG.context.workspace.setFocus( this );
};

VG.UI.Window.prototype.calcSize=function( canvas )
{
    var size=VG.Core.Size( 0, 0 );

    if ( this.layout ) {
        var layoutSize=this.layout.calcSize( canvas );//VG.Core.Size( 0, 0 );

        //layoutSize.width+=170;
        //layoutSize.height+=10;

        size.width=layoutSize.width;
        size.height=VG.context.style.skin.WindowHeaderHeight + layoutSize.height;

        this.rect.width=size.width;
        this.rect.height=size.height;
    }  

    return size;
};

VG.UI.Window.prototype.paintWidget=function( canvas )
{
    if ( !this.visible ) return;

    VG.context.style.drawWindow( canvas, this );    

    if ( this.layout ) {

        if ( this.buttonLayout ) this.layout.rect.set( this.contentRect.add( 0, 0, 0, -this.buttonLayoutSize.height ) );
        else this.layout.rect.set( this.contentRect );
        this.layout.layout( canvas );
    }
};

VG.UI.Window.prototype.mouseMove=function( event )
{
    if ( this.dragOp ) {

        var offsetX=event.pos.x - this.dragOpStart.x;
        var offsetY=event.pos.y - this.dragOpStart.y;

        this.rect.x=this.dragOpPos.x + offsetX;
        this.rect.y=this.dragOpPos.y + offsetY;
        VG.update();
    }
};

VG.UI.Window.prototype.mouseDown=function( event )
{
    if ( event.pos.y >= this.rect.y && event.pos.y <= (this.rect.y + 40 ) ) {

        this.dragOp=true;
        this.dragOpStart.set( event.pos ); 
        this.dragOpPos.x=this.rect.x; 
        this.dragOpPos.y=this.rect.y; 

        VG.context.workspace.mouseTrackerWidget=this;    
    }
    this.mouseIsDown=true;
};

VG.UI.Window.prototype.mouseUp=function( event )
{
    //this.mouseIsDown=false;

    this.dragOp=0;  
    VG.context.workspace.mouseTrackerWidget=0;    
};

// ----------------------------------------------------------------- VG.UI.Dialog

VG.UI.Dialog=function( title )
{
    /**Creates an VG.UI.Dialog object. VG.UI.Dialog inherits from VG.UI.Window.<br>
     *
     * Dialogs are modal Windows, i.e. other user interface elements in the Workspace will be disabled while a Dialog is visible. Dialogs support a button row at the bottom
     * of the Dialog. You can call addButton() and addButtonSpacer() to populate the Dialog with buttons.
     * Dialogs can be shown by calling the showWindow() member function of VG.UI.Workspace.
     * @param {string} title - The title of the Dialog
     * @constructor
     **/

    if ( !(this instanceof VG.UI.Dialog) ) return new VG.UI.Dialog( title );
    
    VG.UI.Window.call( this );

    this.name="Dialog";   
    this.text=title;

    /**The layout of the Dialog, default is null. You should set your own layout into this property and the Dialog will adjust its size to fit the layout.
     *  @member {object} */
    this.layout=null;

    this.buttonLayout=VG.UI.Layout();
    this.buttonLayout.horizontal=true;
    this.buttonLayout.spacing=10;
    this.buttonLayout.margin.set( 12, 12, 12, 12 );

    this.label=VG.UI.Label( "" );
    this.label.frameType=VG.UI.Frame.None;
    this.label.hAlignment=VG.UI.HAlignment.Left;
    this.label.minimumSize.width=200;
    this.label.horizontalExpanding=true;

    this.buttonLayout.addChild( this.label );

    this.minimumSize=VG.Core.Size( 200, 0 );
    this.buttonLayoutSize=VG.Core.Size();
};

VG.UI.Dialog.prototype=VG.UI.Window();

VG.UI.Dialog.prototype.calcSize=function( canvas )
{
    if ( this.layout ) this.layout.margin.set( 15, 12, 15, 6 );

    var size=VG.UI.Window.prototype.calcSize.call( this );

    this.buttonLayoutSize.set( this.buttonLayout.calcSize( canvas ) );

    //size.width+=this.buttonLayoutSize.width;
    size.height+=this.buttonLayoutSize.height;

    if ( this.buttonLayout.minimumSize.width > size.width ) size.width=this.buttonLayout.minimumSize.width;

    this.checkSizeDimensionsMinMax( size );

    this.rect.width=size.width;
    this.rect.height=size.height;

    return size;
};

VG.UI.Dialog.prototype.addButton=function( text, func )
{
    /**Adds a button to the Dialog. Buttons are added from the left to right. To close the window, the callback function of the button has to call this.close().
     * @param {string} text - The text of the button
     * @param {function} func - The callback function which gets invoked when the button is pressed. Make sure to call this.close() in the callback if you want to
     * close the Dialog
     **/

    var button=VG.UI.Button( text );

    if ( func ) button.clicked=func;
    else button.clicked=function() { this.close( this ); }.bind( this );

    this.buttonLayout.addChild( button );
};

VG.UI.Dialog.prototype.addButtonSpacer=function( space )
{
    /**Adds horizontal space to the button layout. If space is defined, it adds the value of space in pixels, otherwise the space is set to expanding, meaning
     * it will take as much space as available.
     * @param {number} space - The space to add to the button layout in pixels, if undefined, it will take as much space as available (expanding)
     **/    
    var spacer=VG.UI.LayoutHSpacer();

    if ( space ) spacer.maximumSize.width=space;
    this.buttonLayout.addChild( spacer );
};

VG.UI.Dialog.prototype.setFocus=function()
{
    /**Sets the focus to the first widget in the layout which supports focus.
     **/

    var firstResponder=false;
    if ( this.layout && this.layout.children.length )
    {
        for ( var i=0; i < this.layout.children.length; ++i )
        {
            var child=this.layout.children[i];

            if ( child.isWidget && child.supportsFocus )
            {
                VG.context.workspace.setFocus( child );
                firstResponder=true;
                break;
            }
        }
    }

    if ( !firstResponder )
        VG.context.workspace.setFocus( this.layout );
};

VG.UI.Dialog.prototype.paintWidget=function( canvas )
{
    if ( !this.visible ) return;

    VG.context.style.drawDialog( canvas, this );    
    //VG.context.style.drawWindowTitleCloseButton( canvas, this, this.closeButtonState, this.closeButtonRect );

    if ( this.layout ) {

        if ( this.buttonLayout ) this.layout.rect.set( this.contentRect.add( 0, 0, 0, -this.buttonLayoutSize.height ) );
        else this.layout.rect.set( this.contentRect );
        this.layout.layout( canvas );
    }

    this.buttonLayout.rect.set( this.contentRect );
    this.buttonLayout.rect.y=this.contentRect.bottom() - this.buttonLayoutSize.height;
    this.buttonLayout.rect.height=this.buttonLayoutSize.height;

    this.buttonLayout.layout( canvas );
};

// ----------------------------------------------------------------- VG.UI.StatusDialog

VG.UI.StatusDialog=function( type, title, message )
{
    /**Creates an VG.UI.StatusDialog object. VG.UI.StatusDialog inherits from VG.UI.Dialog.<br>
     *
     * Shows an Dialog with a status icon and a user defined message and title. Adds a "Close" button to the Dialog by default.
     * @param {VG.UI.StatusDialog} status - The status icon to show, currently supported are VG.UI.StatusDialog.Type.Error, VG.UI.StatusDialog.Type.Warning and
     * VG.UI.StatusDialog.Type.Question.
     * @param {string} message - The user message to show to the user. Can be multine text.
     * @constructor
     **/

    if ( !(this instanceof VG.UI.StatusDialog) ) return new VG.UI.StatusDialog( type, title, message );
    
    VG.UI.Dialog.call( this );

    this.text=title;
    this.image=VG.UI.Image();

    var imageName="status_success.png";

    if ( type === VG.UI.StatusDialog.Type.Error ) imageName="status_error.png";
    else
    if ( type === VG.UI.StatusDialog.Type.Warning ) imageName="status_warning.png";        
    else
    if ( type === VG.UI.StatusDialog.Type.Question ) imageName="status_question.png";    

    this.image.image=VG.Utils.getImageByName( imageName );
    this.image.horizontalExpanding=false;
    this.image.verticalExpanding=false;

    this.label=VG.UI.Label( message );
    this.label.hAlignment=VG.UI.HAlignment.Left;

    this.layout=VG.UI.Layout( this.image, this.label );
    this.layout.spacing=40;
    this.layout.margin.left=20;
    this.layout.margin.right=20;

    this.addButton( "Close" );

    this.type=type;   
    this.message=message;
};

VG.UI.StatusDialog.prototype=VG.UI.Dialog();

VG.UI.StatusDialog.Type={ "Success" : 0, "Error" : 1, "Warning" : 2, "Question" : 3, "Docs.Enum" : 9000 };

