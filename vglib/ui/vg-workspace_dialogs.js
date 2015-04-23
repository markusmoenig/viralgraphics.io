/*
 * (C) Copyright 2014, 2015 Markus Moenig.
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
 
// ----------------------------------------------------------------------------------- Login Dialog

VG.UI.Workspace.prototype.showLoginDialog=function()
{
    if ( !this.loginDialog ) {

        this.loginDialog=VG.UI.Dialog( "Login Dialog");

        var layout=VG.UI.LabelLayout();
        layout.labelSpacing=40;
        layout.labelAlignment=VG.UI.HAlignment.Left;

        this.login_userNameEdit=VG.UI.TextLineEdit( "" );
        this.login_passwordEdit=VG.UI.TextLineEdit( "" );
        this.login_passwordEdit.password=true;

        layout.addChild( "Username", this.login_userNameEdit );
        layout.addChild( "Password", this.login_passwordEdit );

        this.loginDialog.layout=layout;
        this.loginDialog.addButton( "Close", function() { this.close( this ); }.bind( this.loginDialog ) );
        this.loginDialog.addButton( "Login", function() { 

            VG.DB.userLogIn( this.login_userNameEdit.text, this.login_passwordEdit.text, function( success, userName, userId, isAdmin ) {
                if ( success ) 
                {
                    this.userName=userName;
                    this.userId=userId;
                    this.userIsAdmin=isAdmin;

                    this.modelLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );

                    if ( this.callbackForLoggedStateChanged )
                        this.callbackForLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );  

                    this.loginDialog.close( this.loginDialog );
                } else this.loginDialog.label.text="Login failed";
            }.bind( this ) );
        }.bind( this ) );
    }

    this.showWindow( this.loginDialog );            
};

// ----------------------------------------------------------------------------------- Signup Dialog

VG.UI.Workspace.prototype.showSignupDialog=function()
{
    if ( !this.signupDialog ) {

        this.signupDialog=VG.UI.Dialog( "Signup Dialog");

        // --- Signup Area

        var layout=VG.UI.LabelLayout();
        layout.labelSpacing=40;
        layout.labelAlignment=VG.UI.HAlignment.Left;

        this.signup_userNameEdit=VG.UI.TextLineEdit( "" );
        this.signup_eMailEdit=VG.UI.TextLineEdit( "" );
        this.signup_passwordEdit=VG.UI.TextLineEdit( "" );
        this.signup_passwordEdit.password=true;
        //this.firstNameEdit.bind( this.dc, "contacts.firstName" );
        //this.firstNameEdit.textChanged=function() { computeSelectedContactItemText.call( this ); };

        layout.addChild( "Username", this.signup_userNameEdit );
        layout.addChild( "eMail", this.signup_eMailEdit );
        layout.addChild( "Password", this.signup_passwordEdit );

        // ---

        var widget=VG.UI.Widget();
        widget.html=VG.UI.HtmlView();
        widget.html.elements.body.noframe=true;
        widget.html.elements.body.font=VG.Font.Font( "Open Sans Semibold", 14 );
        widget.html.elements.body.spacing=5;
        widget.html.elements.body.margin.set( 0, 0, 0, 0 );
        widget.html.elements.body.bgColor=VG.context.workspace.canvas.style.skin.Dialog.BackgroundColor;
        widget.html.html="<b>Sign up</b> to Visual Graphics and sign in to all the applications and games using the Visual Graphics Framework. Applications will only have access " +
        "to your username, never to your eMail.";
        widget.paintWidget=function( canvas ) {
            var rect=VG.Core.Rect( this.rect.x, this.rect.y, canvas.style.skin.NewsScroller.Body.Item.ImageSize.width, canvas.style.skin.NewsScroller.Body.Item.ImageSize.height );

            canvas.draw2DShape( VG.Canvas.Shape2D.RoundedRectangle2px, rect, VG.Core.Color( "#5c6a97") );
            canvas.pushFont( VG.Font.Font( "Visual Graphics", 64 ) );
            canvas.drawTextRect( "a", rect, VG.Core.Color( 248, 248, 248 ), 1, 1 );
            canvas.popFont();

            rect.x+=rect.width + 10;
            rect.width=this.rect.width - ( canvas.style.skin.NewsScroller.Body.Item.ImageSize.width + 10 );
            rect.height+=5;
            this.html.rect.set( rect );
            this.html.paintWidget( canvas );

            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x, this.rect.y + this.rect.height - 1, this.rect.width, 1 ), canvas.style.skin.TextEdit.BorderColor );
        };

        var vlayout=VG.UI.Layout( widget, layout );
    
        vlayout.calcSize=function() {
            var size=VG.Core.Size( 550, 240 );
            return size;
        }.bind( this );
        vlayout.vertical=true;        

        this.signupDialog.layout=vlayout;
        this.signupDialog.addButton( "Close", function() { this.close( this ) }.bind( this.signupDialog ) );
        this.signupDialog.addButton( "Signup", function() { VG.context.workspace.showSignupDialog_signUp.call( VG.context.workspace ); } );
    }

    this.showWindow( this.signupDialog );            
};

VG.UI.Workspace.prototype.showSignupDialog_signUp=function()
{
    //var parameters="email=" + this.signup_eMailEdit.text + "&username=" + this.signup_userNameEdit.text + "&password=" + this.signup_passwordEdit.text;
    var parameters={email : this.signup_eMailEdit.text, username : this.signup_userNameEdit.text, password : this.signup_passwordEdit.text };

    VG.sendBackendRequest( "/user/signup", JSON.stringify(parameters),
        function( response ) { VG.context.workspace.showSignupDialog_finished.call( VG.context.workspace, response ); } );
};

VG.UI.Workspace.prototype.showSignupDialog_finished=function( responseText )
{
    var response=JSON.parse( responseText );

    if ( response.status === "ok" && response.user.username && response.user.username.length )
    {
        if ( this.callbackForLoggedStateChanged )
            this.callbackForLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName );           

        this.signupDialog.close( this.signupDialog );        
    } else {
        this.signupDialog.label.text="Signup Failed";        
    }

    VG.update();  
};

// ----------------------------------------------------------------------------------- User Settings Dialog

VG.UI.Workspace.prototype.showUserSettingsDialog=function()
{
    if ( !this.userSettingsDialog ) {

        this.userSettingsDialog=VG.UI.Dialog( "Change Password");

        var layout=VG.UI.LabelLayout();
        layout.labelSpacing=40;
        layout.labelAlignment=VG.UI.HAlignment.Left;

        this.userSettings_passwordEdit1=VG.UI.TextLineEdit( "" );
        this.userSettings_passwordEdit2=VG.UI.TextLineEdit( "" );
        this.userSettings_passwordEdit1.password=true;
        this.userSettings_passwordEdit2.password=true;

        layout.addChild( "Password", this.userSettings_passwordEdit1 );
        layout.addChild( "Repeat", this.userSettings_passwordEdit2 );

        this.userSettingsDialog.layout=layout;
        this.userSettingsDialog.addButton( "Close", function() { this.close( this ); }.bind( this.userSettingsDialog ) );
        this.userSettingsDialog.addButton( "Change", function() { 
            if ( this.userSettings_passwordEdit1.text.length > 0 && this.userSettings_passwordEdit1.text == this.userSettings_passwordEdit2.text ) {
                VG.DB.userChangePassword( this.userSettings_passwordEdit1.text, function( success ) {
                    if ( success ) this.userSettingsDialog.close( this.userSettingsDialog );
                    else this.userSettingsDialog.label.text="Password change failed";
                }.bind( this ) );
            } else this.userSettingsDialog.label.text="Invalid Password";
        }.bind( this ) );
    }

    this.userSettings_passwordEdit1.text="";
    this.userSettings_passwordEdit2.text="";
    this.userSettingsDialog.label.text="";

    this.showWindow( this.userSettingsDialog );            
};

// ----------------------------------------------------------------------------------- Open / Save Web Dialogs

VG.RemoteFileDialogItem=function()
{
    this.name="";
    this.size=0;
    this.type="";
};

VG.RemoteFileDialog=function( fileType, callback, title, buttonText, allowDownload )
{
    if ( !(this instanceof VG.RemoteFileDialog) ) return new VG.RemoteFileDialog( fileType, callback, title, buttonText, allowDownload );

    // --- Request list of files

    var parameters={};
    var url="/upload/" + VG.context.workspace.appId;

    VG.sendBackendRequest( url, JSON.stringify( parameters ), function( responseText ) {
        var response=JSON.parse( responseText );
        for ( var i =0; i < response.files.length; ++i )
        {
            var item=response.files[i];
            
            var fileItem=new VG.RemoteFileDialogItem();
            fileItem.fileName=item.name;
            fileItem.size=VG.Utils.bytesToSize(item.size);
            this.fileListController.add( fileItem );
        }
        this.label.text="";
    }.bind( this ), "GET" );   

    // ---

    VG.UI.Dialog.call( this, title );

    this.fileType=fileType;
    this.callback=callback;

    this.dc=VG.Data.Collection( "File List" ); this.dc.fileList=[];
    this.fileListWidget=new VG.UI.TableWidget();

    this.fileListController=this.fileListWidget.bind( this.dc, "fileList" );
    this.fileListController.addObserver( "selectionChanged", function() {

    if ( this.fileListController.selected ) this.fileNameEdit.text=this.fileListController.selected.fileName;
    else this.fileNameEdit.text="";

    }.bind( this ) );

    this.fileListWidget.addColumn( "fileName", "Name", VG.UI.TableWidgetItemType.Label, true, 200 );
    this.fileListWidget.addColumn( "size", "Size", VG.UI.TableWidgetItemType.Label, false, 100 );

    this.fileListWidget.minimumSize.set( 600, 300 );
    this.fileListWidget.horizontalExpanding=true;
    this.fileListWidget.verticalExpanding=true;

    this.fileNameEdit=new VG.UI.TextLineEdit( "" );
    this.fileNameEdit.defaultText="Filename";
    this.fileNameEdit.horizontalExpanding=true;
    this.fileNameEdit.bind( this.dc, "fileList.fileName" );

    this.layout=VG.UI.LabelLayout( "", this.fileListWidget, "", this.fileNameEdit );
    this.layout.labelSpacing=0;

    if ( allowDownload ) {
        this.addButton( "Download", function() { 
            if ( this.fileNameEdit.text.length > 0 ) {
                this.callback( { "filePath" : this.fileNameEdit.text, "download" : true } ); 
                this.close( this );        
            } 
        }.bind( this ) );
        this.addButtonSpacer( 10 );
    }

    this.addButton( "Close", function() { this.close( this ); }.bind( this ) );

    this.addButton( buttonText, function() { 
        if ( this.fileNameEdit.text.length > 0 ) {
                this.callback( { "filePath" : this.fileNameEdit.text } ); 
            this.close( this );        
        } 
    }.bind( this ) );

    this.label.text="Receiving File List ...";    
};

VG.RemoteFileDialog.prototype=VG.UI.Dialog();
/*
VG.RemoteFileDialog.prototype.paintWidget=function( canvas )
{
    if ( !this.visible ) return;

    //VG.UI.Dialog.prototype.paintWidget.call( this, canvas );
};*/

