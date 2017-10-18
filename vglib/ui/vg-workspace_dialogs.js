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
    this.login_userNameEdit.setFocus();
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
        widget.html.linkCallback=function( link ) { VG.gotoUrl( link ); };
        widget.html.elements.body.noframe=true;
        widget.html.elements.body.font=VG.Font.Font( "Open Sans Semibold", 14 );
        widget.html.elements.body.spacing=5;
        widget.html.elements.body.margin.set( 0, 0, 0, 0 );
        widget.html.elements.body.bgColor=VG.context.workspace.canvas.style.skin.Window.BackColor;
        widget.html.elements.a.font=widget.html.elements.body.font;
        widget.html.html="<b>Sign up</b> to ViralGraphics.io and sign in to all the applications using the ViralGraphics.io Application Framework.<br><a href='http://www.braindistrict.com'>Powered by BrainDistrict GmbH.</a>";
        widget.paintWidget=function( canvas ) {
            var rect=VG.Core.Rect( this.rect.x + 20, this.rect.y, 93, 85 );
            var svgLogo=VG.Utils.getSVGByName( "vglogo.svg"  );
            if ( svgLogo ) {
                canvas.drawSVG( svgLogo, undefined, rect, VG.Core.Color( 255, 255, 255 ) );
            }

            rect.x+=rect.width + 25;
            rect.width=this.rect.width - ( 93 + 10 ) - 50;
            rect.height+=10;
            this.html.rect.set( rect );
            this.html.paintWidget( canvas );

            this.childWidgets = [ this.html ];
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, VG.Core.Rect( this.rect.x, this.rect.y + this.rect.height - 1 + 3, this.rect.width, 1 ), canvas.style.skin.TextEdit.BorderColor1 );
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
        this.signupDialog.addButton( "CLOSE", function() { this.close( this ); }.bind( this.signupDialog ) );
        this.signupDialog.addButton( "SIGNUP", function() { VG.context.workspace.showSignupDialog_signUp.call( VG.context.workspace ); } );

    }

    this.showWindow( this.signupDialog );
    this.signup_userNameEdit.setFocus();
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
    } else
    if ( response.status === "error" && response.message )
    {
        this.signupDialog.label.text=response.message;
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

// ----------------------------------------------------------------------------------- VG.RemoteOpenProject

VG.RemoteProjectItem=function()
{
    this.name="";
    this.size=0;
    this.type="";
};

VG.RemoteOpenProject=function( workspace, dataReadCallback )
{
    if ( !(this instanceof VG.RemoteOpenProject) ) return new VG.RemoteOpenProject( workspace, dataReadCallback );

    VG.UI.Dialog.call( this, "Open Project" );

    this.buttonLayout.margin.top /= 4;
    this.buttonLayout.margin.spacing /= 4;

    // --- Local Layout

    var dropArea=VG.UI.DropArea( "Project", function( canvas ) {
        // --- Paint Callback
        canvas.draw2DShape( VG.Canvas.Shape2D.RectangleOutlineMin1px, dropArea.rect, VG.UI.stylePool.current.skin.ListWidget.ItemCustomContentBorderColor );
        canvas.drawTextRect( "Drop Project File Here", dropArea.rect, VG.UI.stylePool.current.skin.Widget.TextColor, 1, 1 );
    }.bind( this ), function( name, data ) {
        // --- Drop Callback

        dataReadCallback( name, data );
        workspace.lastSaveType=2;

        // --- Close

        if ( VG.context.workspace.platform === VG.HostProperty.PlatformWeb )
            VG.dropZone.style.display="none";

        this.close( this );
    }.bind( this ) );

    var localLayout=VG.UI.Layout( dropArea );

    // --- Login first Layout

    var loginLabel = VG.UI.Label();
    loginLabel.text = `You have to login first to be able to use the ${VG.context.workspace.appName} Cloud.`;

    var loginLayout=VG.UI.LabelLayout( "", loginLabel );

    loginLayout.margin.left=0;
    loginLayout.vertical=true;

    // --- Visual Graphics Cloud

    var dc=VG.Data.Collection( "File List" );
    dc.fileList=[];

    var treeWidget=new VG.UI.TreeWidget();
    treeWidget.addColumn( { name : "Name", itemName : "text", width : 60 } );
    treeWidget.addColumn( { name : "Type", itemName : "type", width : 20 } );
    treeWidget.addColumn( { name : "Size", itemName : "size", width : 20 } );
    // treeWidget.itemHeight=68;

    var openButton=VG.UI.Button( "OPEN" );
    openButton.toolTip=`Open the Project from the ${VG.context.workspace.appName} Cloud.`;
    openButton.clicked=function() {

        VG.remoteOpenFile( controller.selected.name, function ( responseText ) {
            var data=JSON.parse( responseText );
            dataReadCallback( controller.selected.name, data.file );

            workspace.lastSaveType=1;

            // --- Close

            if ( VG.context.workspace.platform === VG.HostProperty.PlatformWeb )
                VG.dropZone.style.display="none";

            this.close( this );
        }.bind( this ) );

        this.label.text="Opening...";
    }.bind( this );
    treeWidget.addToolWidget( openButton );

    var deleteButton=VG.UI.Button( "DELETE" );
    deleteButton.toolTip=`Delete the selected Project from the ${VG.context.workspace.appName} Cloud.`;
    deleteButton.disabled=true;
    deleteButton.clicked=function() {

        // --- Request list of files

        if ( !controller.selected ) return;

        var parameters={};
        var url="/upload/" + workspace.appId + "/id/" + controller.selected.serverId;

        VG.sendBackendRequest( url, JSON.stringify( parameters ), function( data ) {
            var obj=JSON.parse( data );

            if ( obj.status === 'ok' )
                this.label.text="File deleted successfully.";
            else this.label.text="Error during deletion!";

            getFileList();
        }.bind( this ), "DELETE" );

        this.label.text="Deleting...";

    }.bind( this );
    treeWidget.addToolWidget( deleteButton );

    // ---

    var controller=treeWidget.bind( dc, "fileList" );

    controller.addObserver( "changed", function() {
        deleteButton.disabled=controller.length > 0 ? false : true;
    }.bind( this ) );

    controller.addObserver( "selectionChanged", function() {
        deleteButton.disabled=!controller.selected;
    }.bind( this ) );

    function getFileList() {
        if ( workspace.userName )
        {
            dc.fileList=[];

            // --- Request list of files

            var parameters={};
            var url="/upload/" + workspace.appId;

            VG.sendBackendRequest( url, JSON.stringify( parameters ), function( responseText ) {
                var response=JSON.parse( responseText );
                for ( var i =0; i < response.files.length; ++i )
                {
                    var item=response.files[i];

                    if ( item.user === VG.context.workspace.userId ) {
                        var fileItem=new VG.RemoteProjectItem();
                        fileItem.text=VG.Utils.fileNameFromPath( item.name, true );
                        fileItem.size=VG.Utils.bytesToSize(item.size);
                        fileItem.name=item.name;
                        fileItem.serverId=item._id;
                        fileItem.type=VG.context.workspace.projectShortName ? VG.context.workspace.projectShortName : "";
                        controller.add( "", fileItem );
                    }
                }

                if ( controller.length ) controller.selected=controller.at( 0 );
                //this.label.text="";
            }.bind( this ), "GET" );
        }
    }

    getFileList();

    // --- Top Layout

    var labelLayout=VG.UI.LabelLayout();

    var openFromMenu=VG.UI.DropDownMenu( "Computer", `${VG.context.workspace.appName} Cloud` );
    openFromMenu.menuIsUp=true;
    openFromMenu.changed=function( index ) {
        if ( index === 0 ) {
            stackedLayout.current=localLayout;
            dropArea.makeVisible=true;
        } else
        if  ( index === 1 ) {

            if ( VG.context.workspace.platform === VG.HostProperty.PlatformWeb )
                VG.dropZone.style.display="none";

            if ( !workspace.userName )
                stackedLayout.current=loginLayout;
            else stackedLayout.current=treeWidget;
        }
    }.bind( this );

    labelLayout.addChild( "Open From", openFromMenu );

    // ---

    var stackedLayout=VG.UI.StackedLayout();
    stackedLayout.current= VG.context.workspace.userId ? treeWidget : localLayout;
    openFromMenu.index = VG.context.workspace.userId ? 1 : 0;

    this.layout=VG.UI.Layout( labelLayout, stackedLayout );
    this.layout.vertical=true;
    this.layout.calcSize=function( canvas ) {
        return VG.Core.Size( 800, 480 );
    }.bind( this.layout );

    openFromMenu.setFocus();

    // ---

    this.addButton( "CLOSE", function() {

        if ( VG.context.workspace.platform === VG.HostProperty.PlatformWeb )
            VG.dropZone.style.display="none";

        this.close( this );
    }.bind( this ) );
};

VG.RemoteOpenProject.prototype=VG.UI.Dialog();

// ----------------------------------------------------------------------------------- VG.RemoteSaveProject

VG.RemoteSaveProject=function( workspace, dataWriteCallback )
{
    if ( !(this instanceof VG.RemoteSaveProject) ) return new VG.RemoteSaveProject( workspace, dataWriteCallback );

    VG.UI.Dialog.call( this, "Save Project" );

    this.buttonLayout.margin.top /= 4;
    this.buttonLayout.margin.spacing /= 4;

    //this.layout=VG.UI.LabelLayout();

    // --- Download Layout

    var downloadLabel=VG.UI.Label();
    downloadLabel.text="The Projectfile will be downloaded to the \"Downloads\" folder of your Computer.";

    var downloadButton=VG.UI.Button( "DOWNLOAD" );
    downloadButton.clicked=function() {

        var fileName = nameEdit.text;
        if ( workspace.projectExtension )fileName+=workspace.projectExtension;

        dataWriteCallback( { "filePath" : fileName, "download" : true } );

        this.label.text="\"" + fileName + "\" download request send successfully.";
    }.bind( this );

    var downloadLayout=VG.UI.LabelLayout( "", downloadLabel, "", downloadButton );
    downloadLayout.margin.left=0;
    downloadLayout.vertical=true;

    // --- Login first Layout

    var loginLabel=VG.UI.Label();
    loginLabel.text = `You have to login first to be able to use the ${VG.context.workspace.appName} Cloud.`;

    var loginLayout=VG.UI.LabelLayout( "", loginLabel );

    loginLayout.margin.left=0;
    loginLayout.vertical=true;

    // --- Visual Graphics Cloud

    var dc=VG.Data.Collection( "File List" );
    dc.fileList=[];

    var treeWidget=new VG.UI.TreeWidget();
    treeWidget.addColumn( { name : "Name", itemName : "text", width : 60 } );
    treeWidget.addColumn( { name : "Type", itemName : "type", width : 20 } );
    treeWidget.addColumn( { name : "Size", itemName : "size", width : 20 } );
    // treeWidget.itemHeight=68;

    var saveButton=VG.UI.Button( "SAVE" );
    saveButton.toolTip=`Save the Project to the ${VG.context.workspace.appName} Cloud.`;
    saveButton.clicked=function() {

        var fileName = nameEdit.text;
        if ( workspace.projectExtension ) fileName+=workspace.projectExtension;

        dataWriteCallback( { "filePath" : fileName }, function( data ) {
            var obj=JSON.parse( data );

            if ( obj.status === 'ok' )
                this.label.text="File saved successfully.";
            else this.label.text="Error during saving!";

            getFileList();
        }.bind( this ) );

        this.label.text="Saving...";

    }.bind( this );
    treeWidget.addToolWidget( saveButton );

    var deleteButton=VG.UI.Button( "DELETE" );
    deleteButton.toolTip=`Delete the selected Project from the ${VG.context.workspace.appName} Cloud.`;
    deleteButton.disabled=true;
    deleteButton.clicked=function() {

        // --- Request list of files

        if ( !controller.selected ) return;

        var parameters={};
        var url="/upload/" + workspace.appId + "/id/" + controller.selected.serverId;

        VG.sendBackendRequest( url, JSON.stringify( parameters ), function( data ) {
            var obj=JSON.parse( data );

            if ( obj.status === 'ok' )
                this.label.text="File deleted successfully.";
            else this.label.text="Error during deletion!";

            getFileList();
        }.bind( this ), "DELETE" );

        this.label.text="Deleting...";

    }.bind( this );
    treeWidget.addToolWidget( deleteButton );

    // ---

    var controller=treeWidget.bind( dc, "fileList" );

    controller.addObserver( "changed", function() {
        deleteButton.disabled=controller.length > 0 ? false : true;
    }.bind( this ) );

    controller.addObserver( "selectionChanged", function() {
        deleteButton.disabled=!controller.selected;

        if ( controller.selected )
            nameEdit.text = controller.selected.text;
    }.bind( this ) );

    function getFileList() {
        if ( workspace.userName )
        {
            dc.fileList=[];

            // --- Request list of files

            var parameters={};
            var url="/upload/" + workspace.appId;

            VG.sendBackendRequest( url, JSON.stringify( parameters ), function( responseText ) {
                var response=JSON.parse( responseText );
                for ( var i =0; i < response.files.length; ++i )
                {
                    var item=response.files[i];

                    if ( item.user === VG.context.workspace.userId ) {
                        var fileItem=new VG.RemoteProjectItem();
                        fileItem.text=VG.Utils.fileNameFromPath( item.name, true );
                        fileItem.size=VG.Utils.bytesToSize(item.size);
                        fileItem.type=VG.context.workspace.projectShortName ? VG.context.workspace.projectShortName : "";
                        fileItem.serverId=item._id;
                        controller.add( "", fileItem );
                    }
                }

                // if ( controller.length ) controller.selected=controller.at( 0 );
                //this.label.text="";
            }.bind( this ), "GET" );
        }
    }

    getFileList();

    // --- Top Layout

    var nameEdit=VG.UI.TextLineEdit();
    nameEdit.text=workspace.projectName;

    var extensionLabel=VG.UI.Label();
    extensionLabel.text="An extension of \'" + workspace.projectExtension + "\' will be automatically added.";

    var labelLayout=VG.UI.LabelLayout( "Project Name", nameEdit );
    if ( workspace.projectExtension ) labelLayout.addChild( "", extensionLabel );

    var saveToMenu=VG.UI.DropDownMenu( "Download", `${VG.context.workspace.appName} Cloud` );
    saveToMenu.changed=function( index ) {
        if ( index === 0 ) stackedLayout.current=downloadLayout;
        else
        if  ( index === 1 ) {
            if ( !workspace.userName )
                stackedLayout.current=loginLayout;
            else stackedLayout.current=treeWidget;
        }
    }.bind( this );

    labelLayout.addChild( "Save To", saveToMenu );

    // ---

    var stackedLayout=VG.UI.StackedLayout();
    stackedLayout.current= VG.context.workspace.userId ? treeWidget : downloadLayout;
    saveToMenu.index = VG.context.workspace.userId ? 1 : 0;

    //labelLayout.addChild( "", stackedLayout );

    this.layout=VG.UI.Layout( labelLayout, VG.UI.LayoutVSeparator(), stackedLayout );
    this.layout.vertical=true;
    //this.layout.margin.top=20;
    this.layout.calcSize=function( canvas ) {
        //this.preferredSize.width=400;
        //this.preferredSize.height=420;
        return VG.Core.Size( 800, 480 );
    }.bind( this.layout );

    nameEdit.setFocus();


    // ---

    this.addButton( "CLOSE", function() { this.close( this ); }.bind( this ) );
};

VG.RemoteSaveProject.prototype=VG.UI.Dialog();
