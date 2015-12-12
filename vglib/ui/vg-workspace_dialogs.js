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

// ----------------------------------------------------------------------------------- Contact Us

VG.UI.Workspace.prototype.showContactUsDialog=function( subjects )
{
    var dialog=VG.UI.Dialog( "CONTACT US");

    var nameEdit=VG.UI.TextLineEdit();
    var emailEdit=VG.UI.TextLineEdit();
    var subjectMenu=VG.UI.DropDownMenu();
    var messageEdit=VG.UI.TextEdit( "" );
    messageEdit.minimumSize.set( 500, 300 );

    if ( this.userId ) {
        nameEdit.text=this.userName;
        nameEdit.disabled=true;
        emailEdit.setFocus();
    }

    for ( var i=0; i < subjects.length; ++i )
        subjectMenu.addItem( subjects[i] );

    dialog.layout=VG.UI.LabelLayout( "NAME", nameEdit, "EMAIL", emailEdit, "SUBJECT", subjectMenu, "MESSAGE", messageEdit );
    dialog.layout.labelSpacing=20;
    dialog.layout.allowScrollbars=false;
    dialog.layout.labelAlignment=VG.UI.HAlignment.Left;
    dialog.layout.margin.set( 30, 20, 30, 10 );

    dialog.addButton( "CLOSE", function() { dialog.close( dialog ); }.bind( this ) );
    dialog.addButton( "SEND", function() { 

        if ( nameEdit.text.length && emailEdit.text && messageEdit.text ) {
            VG.DB.sendEMailToAppAdmins( this.appId, nameEdit.text, emailEdit.text, subjectMenu.text(), messageEdit.text, function( success ) {

                if ( success ) dialog.close( dialog );
                else dialog.label.text="Login failed";

            }.bind( this ) );
        } else dialog.label="Missing Information";

    }.bind( this ) );

    this.showWindow( dialog );            
};

// ----------------------------------------------------------------------------------- Login Dialog

VG.UI.Workspace.prototype.showLoginDialog=function()
{
    if ( !this.loginDialog ) {

        this.loginDialog=VG.UI.Dialog( "LOGIN DIALOG");

        var layout=VG.UI.LabelLayout();
        layout.margin.set( 30, 20, 30, 10 );
        layout.labelSpacing=40;
        layout.labelAlignment=VG.UI.HAlignment.Left;

        this.login_userNameEdit=VG.UI.TextLineEdit( "" );
        this.login_passwordEdit=VG.UI.TextLineEdit( "" );
        this.login_passwordEdit.password=true;

        layout.addChild( "USERNAME", this.login_userNameEdit );
        layout.addChild( "PASSWORD", this.login_passwordEdit );

        this.loginDialog.layout=layout;

        this.loginDialog.addButton( "CLOSE", function() { this.close( this ); }.bind( this.loginDialog ) );
        this.loginDialog.addButton( "LOGIN", function() { 

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

        this.signupDialog=VG.UI.Dialog( "SIGNUP DIALOG");

        // --- Signup Area

        var layout=VG.UI.LabelLayout();
        layout.labelSpacing=40;
        layout.labelAlignment=VG.UI.HAlignment.Left;

        this.signup_userNameEdit=VG.UI.TextLineEdit( "" );
        this.signup_eMailEdit=VG.UI.TextLineEdit( "" );
        this.signup_passwordEdit=VG.UI.TextLineEdit( "" );
        this.signup_passwordEdit.password=true;

        layout.addChild( "USERNAME", this.signup_userNameEdit );
        layout.addChild( "EMAIL", this.signup_eMailEdit );
        layout.addChild( "PASSWORD", this.signup_passwordEdit );

        // ---

        var widget=VG.UI.Widget();
        widget.html=VG.UI.HtmlView();
        widget.html.elements.body.noframe=true;
        widget.html.elements.body.font=VG.Font.Font( "Open Sans Semibold", 14 );
        widget.html.elements.body.spacing=5;
        widget.html.elements.body.margin.set( 0, 0, 0, 0 );
        widget.html.elements.body.bgColor=VG.context.workspace.canvas.style.skin.Window.BackColor;
        widget.html.html="<b>Sign up</b> to Visual Graphics and sign in to all the applications and games using the Visual Graphics Framework.";
        widget.paintWidget=function( canvas ) {
            var rect=VG.Core.Rect( this.rect.x + 20, this.rect.y, 93, 85 );
            var svgLogo=VG.Utils.getSVGByName( "vglogo.svg"  );
            if ( svgLogo ) {
                canvas.drawSVG( svgLogo, undefined, rect, VG.Core.Color( 255, 255, 255 ) );
            }

            rect.x+=rect.width + 25;
            rect.width=this.rect.width - ( 93 + 10 ) - 50;
            rect.height+=5;
            this.html.rect.set( rect );
            this.html.paintWidget( canvas );

            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x, this.rect.y + this.rect.height - 1, this.rect.width, 1 ), canvas.style.skin.TextEdit.BorderColor1 );
        };

        var vlayout=VG.UI.Layout( widget, layout );
        vlayout.margin.set( 30, 20, 30, 10 );
        vlayout.spacing+=3;

        vlayout.calcSize=function() {
            var size=VG.Core.Size( 550, 250 );
            return size;
        }.bind( this );
        vlayout.vertical=true;        

        this.signupDialog.layout=vlayout;
        this.signupDialog.addButton( "CLOSE", function() { this.close( this ) }.bind( this.signupDialog ) );
        this.signupDialog.addButton( "SIGNUP", function() { VG.context.workspace.showSignupDialog_signUp.call( VG.context.workspace ); } );

    }

    this.signup_userNameEdit.setFocus();
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

        this.userSettingsDialog=VG.UI.Dialog( "CHANGE PASSWORD");

        var layout=VG.UI.LabelLayout();
        layout.labelSpacing=40;
        layout.labelAlignment=VG.UI.HAlignment.Left;

        this.userSettings_passwordEdit1=VG.UI.TextLineEdit( "" );
        this.userSettings_passwordEdit2=VG.UI.TextLineEdit( "" );
        this.userSettings_passwordEdit1.password=true;
        this.userSettings_passwordEdit2.password=true;

        layout.addChild( "NEW PASSWORD", this.userSettings_passwordEdit1 );
        layout.addChild( "REPEAT", this.userSettings_passwordEdit2 );

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

VG.RemoteFileDialog=function( fileType, callback, title, buttonText, allowDownload, defaultName )
{
    if ( !(this instanceof VG.RemoteFileDialog) ) return new VG.RemoteFileDialog( fileType, callback, title, buttonText, allowDownload, defaultName );

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

    this.dc=VG.Data.Collection( "File List" ); 
    this.dc.fileList=[];

    this.fileListWidget=new VG.UI.TableWidget();

    this.fileListController=this.fileListWidget.bind( this.dc, "fileList" );
    this.fileListController.addObserver( "selectionChanged", function() {

        if ( this.fileListController.selected ) this.fileNameEdit.text=this.fileListController.selected.fileName;
        else this.fileNameEdit.text=defaultName;

    }.bind( this ) );

    this.fileListWidget.addColumn( "fileName", "Name", VG.UI.TableWidgetItemType.Label, true, 200 );
    this.fileListWidget.addColumn( "size", "Size", VG.UI.TableWidgetItemType.Label, false, 100 );

    this.fileListWidget.minimumSize.set( 600, 300 );
    this.fileListWidget.horizontalExpanding=true;
    this.fileListWidget.verticalExpanding=true;

    this.fileNameEdit=new VG.UI.TextLineEdit( defaultName );
    this.fileNameEdit.defaultText="Filename";
    this.fileNameEdit.horizontalExpanding=true;
    //this.fileNameEdit.bind( this.dc, "fileList.fileName" );

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

