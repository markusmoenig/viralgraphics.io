/*
 * Copyright (c) 2014-2018 Markus Moenig <markusm@visualgraphics.tv> and Contributors
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

VG.UI.Workspace.prototype.showUserDialog=function( defaultState = "Login" )
{
    let state = "Login"; if ( defaultState === "User Settings" ) state = defaultState;
    let redColor = new VG.Core.Color( "f34d4e" );
    let style = this.getCurrentStyle();

    let setState = ( state ) => {
        let dialog = this.userDialog;

        // --- Header
        let addHeader = ( layout, text ) => {
            let widget = new VG.UI.Widget();
            widget.font = new VG.Font.Font( "Open Sans Bold", 20 );
            widget.setFixedSize( 468, text ? 30 : 30 );

            widget.paintWidget = ( canvas ) => {

                let rect = widget.contentRect;
                rect.copy( widget.rect );

                canvas.pushFont( widget.font );
                canvas.drawTextRect( text, rect, VG.UI.stylePool.current.skin.Widget.TextColor, 0, 0 );
                canvas.popFont();

                rect.y += text ? 26 : 26;
                rect.height = 1;
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, style.skin.Window.BorderColor1 );
                rect.y++;
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, style.skin.Window.BorderColor2 );
            };

            layout.addChild( widget );
        };

        // --- Footer
        let addFooter = ( layout ) => {
            // let logo = VG.Utils.getImageByName( "vg_text_logo.png" );

            let widget = new VG.UI.Widget();
            widget.supportsFocus = true;
            widget.vgRect = new VG.Core.Rect();
            widget.bdRect = new VG.Core.Rect();

            widget.vgLogo = VG.Utils.getImageByName( "vg_text_logo.png" );
            if ( !widget.vgLogo.canvasImage ) widget.vgLogo.toCanvasImage();
            widget.bdLogo = VG.Utils.getImageByName( "vg_powered_bd.png" );
            if ( !widget.bdLogo.canvasImage ) widget.bdLogo.toCanvasImage();

            widget.html = new VG.UI.HtmlWidget();
            widget.html.supportsAutoFocus = widget.html.supportsFocus = true;
            widget.html.linkCallback = ( link ) => VG.gotoUrl( link );
            widget.html.html = `<html><p>Sign up to <a href="http://www.viralgraphics.io">ViralGraphics.io</a> and sign in to all the applications using next generation app technology.</p></html>`;

            widget.setFixedSize( 365, 200 );
            widget.paintWidget = ( canvas ) => {

                let rect = widget.contentRect;
                rect.copy( widget.rect );

                rect.y += 15;
                rect.height = 1;
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, style.skin.Window.BorderColor1 );
                rect.y++;
                canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, style.skin.Window.BorderColor2 );

                widget.vgRect.set( widget.rect.x, widget.rect.y + 30, widget.vgLogo.width, widget.vgLogo.height );
                canvas.drawImage( widget.vgRect, widget.vgLogo );


                widget.html.rect.copy( widget.rect );
                widget.html.rect.y += 90;
                widget.html.rect.height = 60;
                widget.html.paintWidget( canvas );

                widget.bdRect.set( widget.rect.x + 260, widget.rect.y + 140, widget.bdLogo.width, widget.bdLogo.height );
                canvas.drawImage( widget.bdRect, widget.bdLogo );
            };

            widget.mouseDown = ( event ) => {
                if ( widget.vgRect.contains( event.pos ) )
                    VG.gotoUrl( `https://www.viralgraphics.io` );
                else
                if ( widget.bdRect.contains( event.pos ) )
                    VG.gotoUrl( `https://www.braindistrict.com` );
            };

            layout.addChild( widget );
        };

        if ( state === "Login" )
        {
            dialog.text = "Login";

            let userNameEdit = new VG.UI.TextLineEdit( "" );
            let passwordEdit = new VG.UI.TextLineEdit( "" );
            let messageLabel = new VG.UI.Label( "" );
            messageLabel.customColor = redColor;
            messageLabel.hAlignment = VG.UI.HAlignment.Left;

            passwordEdit.password = true;
            messageLabel.visible = false;

            let loginLayout = VG.UI.LabelLayout();
            loginLayout.margin.set( 36, 32, 36, 10 );
            loginLayout.labelSpacing = 60;
            loginLayout.labelAlignment = VG.UI.HAlignment.Left;

            loginLayout.addChild( "Username", userNameEdit );
            loginLayout.addChild( "Password", passwordEdit );
            loginLayout.addChild( "", messageLabel );

            let createAccountButton = new VG.UI.Button( "Create Account" );
            createAccountButton.clicked = () => {
                state = "Signup";
                setState( state );
                VG.update();
            };
            let loginButton = new VG.UI.Button( "Login" );
            loginButton.clicked = () => {

                VG.DB.userLogIn( userNameEdit.text, passwordEdit.text, ( { success, userName, userId, isAppAdmin, message } ) => {
                    if ( success )
                    {
                        this.userName = userName;
                        this.userId = userId;
                        this.userIsAdmin = isAppAdmin;

                        this.modelLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );

                        if ( this.callbackForLoggedStateChanged )
                            this.callbackForLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId );

                        messageLabel.customColor = undefined;
                        messageLabel.visible = true;
                        messageLabel.text = "Success";

                        VG.update();
                        if ( VG.Utils.getTextByName( "subscriptions.json" ) && !this.dontHandleRegistrations ) setState( "User Settings" );
                        else setTimeout( dialog.close( dialog ), 1000 );
                    } else {
                        messageLabel.visible = true;
                        messageLabel.text = message;
                    }
                } );
            };

            let buttonLayout = new VG.UI.Layout( createAccountButton, VG.UI.LayoutHSpacer(), loginButton );
            buttonLayout.margin.set( 36, 0, 36, 0 );

            let layout = new VG.UI.Layout( loginLayout, buttonLayout );
            layout.vertical = true;
            layout.spacing = 0;
            layout.margin.clear();

            addFooter( layout );

            layout.calcSize = ( canvas ) => {
                return VG.Core.Size( 440, 360 );
            };

            dialog.layout = layout;
            dialog.calcSize();
            userNameEdit.setFocus();
        } else
        if ( state === "Signup" )
        {
            dialog.text = "Signup";

            let userNameEdit = new VG.UI.TextLineEdit( "" );
            let emailEdit = new VG.UI.TextLineEdit( "" );
            let passwordEdit = new VG.UI.TextLineEdit( "" );
            let repeatPasswordEdit = new VG.UI.TextLineEdit( "" );
            let messageLabel = new VG.UI.Label( "" );
            messageLabel.customColor = redColor;
            messageLabel.hAlignment = VG.UI.HAlignment.Left;

            passwordEdit.password = true;
            repeatPasswordEdit.password = true;
            messageLabel.visible = false;

            let loginLayout = VG.UI.LabelLayout();
            loginLayout.margin.set( 36, 32, 36, 10 );
            loginLayout.labelSpacing = 60;
            loginLayout.labelAlignment = VG.UI.HAlignment.Left;

            loginLayout.addChild( "Username", userNameEdit );
            loginLayout.addChild( "eMail", emailEdit );
            loginLayout.addChild( "Password", passwordEdit );
            loginLayout.addChild( "Repeat Password", repeatPasswordEdit );
            loginLayout.addChild( "", messageLabel );

            let signupButton = new VG.UI.Button( "Signup" );
            signupButton.clicked = () => {

                if ( !userNameEdit.text )
                {
                    messageLabel.visible = true;
                    messageLabel.text = "Username is empty";
                } else
                if ( !emailEdit.text )
                {
                    messageLabel.visible = true;
                    messageLabel.text = "eMail is empty";
                } else
                if ( !passwordEdit.text || passwordEdit.text !== repeatPasswordEdit.text )
                {
                    messageLabel.visible = true;
                    messageLabel.text = "Passwords do not match";
                } else
                {
                    let parameters = {email : emailEdit.text, username : userNameEdit.text, password : passwordEdit.text };

                    VG.sendBackendRequest( "/user/signup", JSON.stringify( parameters ),
                        ( responseText ) => {
                            let response = JSON.parse( responseText );

                            if ( response.status === "error" ) {
                                messageLabel.visible = true;
                                messageLabel.text = response.message;
                                if ( response.detail && response.detail.errors ) {
                                    let errors = response.detail.errors;

                                    for( let key in errors) {
                                        messageLabel.text = errors[key].message;
                                        break;
                                    }
                                }
                            } else
                            if ( response.status === "ok" ) {
                                messageLabel.customColor = undefined;
                                messageLabel.visible = true;
                                messageLabel.text = "Please verify eMail we send you";
                            }
                        }
                    );
                }
            };

            let buttonLayout = new VG.UI.Layout( VG.UI.LayoutHSpacer(), signupButton );
            buttonLayout.margin.set( 36, 0, 36, 0 );

            let layout = new VG.UI.Layout( loginLayout, buttonLayout );
            layout.vertical = true;
            layout.spacing = 0;
            layout.margin.clear();

            addFooter( layout );

            layout.calcSize = ( canvas ) => {
                return VG.Core.Size( 440, 420 );
            };

            dialog.layout = layout;
            dialog.calcSize();
            userNameEdit.setFocus();
        } else
        if ( state === "User Settings" )
        {
            dialog.text = "User Settings";

            let userLabel = new VG.UI.Label( VG.context.workspace.userName );
            // let eMailLabel = new VG.UI.Label( VG.context.workspace.userEmail );
            let passwordEdit = new VG.UI.TextLineEdit( "" );
            let repeatPasswordEdit = new VG.UI.TextLineEdit( "" );
            let messageLabel = new VG.UI.Label( "" );

            userLabel.setFixedSize( 200, 20 );
            // eMailLabel.setFixedSize( 200, 20 );
            userLabel.hAlignment = VG.UI.HAlignment.Left;
            // eMailLabel.hAlignment = VG.UI.HAlignment.Left;

            passwordEdit.maximumSize.width = 200;
            repeatPasswordEdit.maximumSize.width = 200;
            messageLabel.customColor = redColor;
            messageLabel.hAlignment = VG.UI.HAlignment.Left;

            passwordEdit.password = true;
            repeatPasswordEdit.password = true;
            messageLabel.visible = false;

            let loginLayout = VG.UI.LabelLayout();
            loginLayout.margin.set( 0, 10, 0, 10 );
            loginLayout.labelSpacing = 60;
            loginLayout.labelAlignment = VG.UI.HAlignment.Left;

            loginLayout.addChild( "Username", userLabel );
            // loginLayout.addChild( "eMail", eMailLabel );
            loginLayout.addChild( "Password", passwordEdit );
            loginLayout.addChild( "Repeat Password", repeatPasswordEdit );
            loginLayout.addChild( "", messageLabel );

            let changeButton = new VG.UI.Button( "Change Password" );
            changeButton.clicked = () => {

                if ( !passwordEdit.text || passwordEdit.text !== repeatPasswordEdit.text )
                {
                    messageLabel.visible = true;
                    messageLabel.text = "Passwords do not match";
                } else
                {
                    VG.DB.userChangePassword( passwordEdit.text, ( success ) => {
                        if ( success ) {
                            dialog.close( dialog );
                        } else {
                            messageLabel.visible = true;
                            messageLabel.text = "Password change failed.";
                        }
                    } );
                }
            };

            let buttonLayout = new VG.UI.Layout( VG.UI.LayoutHSpacer(), changeButton );
            buttonLayout.margin.set( 0, 0, 0, 0 );

            let layout = new VG.UI.Layout();
            layout.margin.set( 36, 32, 36, 20 );

            addHeader( layout, "Account" );
            layout.addChild( loginLayout );
            layout.addChild( buttonLayout );

            layout.vertical = true;
            layout.spacing = 0;
            // layout.margin.clear();

            // --- Subscriptions

            let subText = VG.Utils.getTextByName( "subscriptions.json" );
            if ( subText && !this.dontHandleRegistrations ) {
                let subs = JSON.parse( subText );
                sub = subs[0];

                addHeader( layout, sub.name );

                let htmlWidget = new VG.UI.HtmlWidget();

                let buildHtml = ( sub, info ) => {
                    let html="<html>" + sub.description;

                    if ( !info )
                    {
                        html+="<p>You can buy a subscription on our <a href=\"" + sub.orderpage + "\">" + sub.product + " Product Page</a>.</p>";
                        html+="<p>After ordering, your will receive your subscription token by eMail.</p>";
                        html+="<p>You can than enter the token into the text entry field below to activate it.</p>";
                    } else {
                        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                        let endDate=new Date( info.endDate );
                        html+="<p>Thanks for subscribing!</p>";
                        html+="<p>If you want to renew or extend your subscription, you can always do so on the <a href=\"" + sub.orderpage + "\">" + sub.product + " Product Page</a>.</p>";
                        html+="<p>The expiration date for your subscription is " + endDate.toLocaleDateString( "en-US",options ) + ".</p>";
                    }

                    html+="</html>";
                    return html;
                };

                htmlWidget.html = buildHtml( sub );
                htmlWidget.margin.set( 0, 5, 0, 0 );
                htmlWidget.emptyP = true;
                htmlWidget.supportsAutoFocus = true;
                htmlWidget.linkCallback = ( link ) => VG.gotoUrl( link );

                layout.addChild( htmlWidget );

                let parameters = {};
                VG.sendBackendRequest( "/app/subscription/" + VG.context.appId + "/" + sub.id + "/check", JSON.stringify( parameters ), (responseText) => {
                    let response = JSON.parse( responseText );
                    if ( response.status === "ok" ) {
                        let subscription = { id : response.subscriptionId, endDate: response.user.end };
                        htmlWidget.html = buildHtml( sub, subscription );
                    }
                }, "GET" );

                // --- Token Edit / Activation

                let activationFeedbackLabel = new VG.UI.Label("");
                activationFeedbackLabel.visible = false;
                activationFeedbackLabel.labelAlignment = VG.UI.HAlignment.Left;

                let tokenEdit = new VG.UI.TextLineEdit();
                tokenEdit.textChanged = ( text ) => {
                    tokenActivateButton.disabled = !tokenEdit.text.length;
                };
                let tokenActivateButton = new VG.UI.Button( "Activate" );
                tokenActivateButton.disabled = true;
                tokenActivateButton.clicked = function() {

                    let token = tokenEdit.text;
                    let parameters={ token : token };

                    VG.sendBackendRequest( "/app/" + VG.context.appId + "/tokens/redeem", JSON.stringify( parameters ), (responseText) => {

                        let response=JSON.parse( responseText );
                        activationFeedbackLabel.visible = true;

                        if ( response.status === "error" ) {
                            activationFeedbackLabel.customColor = redColor;
                            activationFeedbackLabel.text = "Token could not be verified.";
                        } else
                        if ( response.status === "ok" ) {
                            activationFeedbackLabel.customColor = undefined;
                            activationFeedbackLabel.text = "Token accepted. Thanks for subscribing.";

                            htmlWidget.html = buildHtml( sub, subscription );

                            let parameters = {};
                            VG.sendBackendRequest( "/app/subscription/" + VG.context.appId + "/" + sub.id + "/check", JSON.stringify( parameters ), (responseText) => {
                                let response = JSON.parse( responseText );
                                if ( response.status === "ok" ) {
                                    let subscription = { id : response.subscriptionId, endDate: response.user.end };
                                    htmlWidget.html = buildHtml( sub, subscription );
                                }
                            }, "GET" );

                            if ( this.callbackForLoggedStateChanged )
                                this.callbackForLoggedStateChanged( this.userName.length > 0 ? true : false, this.userName, this.userId, this.userIsAppAdmin );
                        }

                        tokenEdit.text = "";
                    }, "POST" );

                }.bind( this );

                let tokenEditLayout = VG.UI.Layout( VG.UI.Label( "Token:" ), tokenEdit, tokenActivateButton );
                tokenEditLayout.margin.clear();
                layout.addChild( activationFeedbackLabel );
                layout.addChild( tokenEditLayout );
            } else subText = undefined;

            // --- Logout

            addHeader( layout, "" );
            let logoutButton = new VG.UI.Button( "Logout" );
            logoutButton.clicked = () => {
                this.logout();
                dialog.close( dialog );
            };
            let logoutLayout = new VG.UI.Layout( VG.UI.LayoutHSpacer(), logoutButton );
            logoutLayout.margin.set( 0, 4, 0, 0 );
            layout.addChild( logoutLayout );

            layout.calcSize = ( canvas ) => {
                return VG.Core.Size( 540, !subText ? 300 : 600 );
            };

            dialog.layout = layout;
            dialog.calcSize();
            passwordEdit.setFocus();
        }
    };

    if ( !this.userDialog ) {
        this.userDialog = new VG.UI.Dialog( "" );
        this.userDialog.buttonLayout = undefined;
    }

    setState( state );
    this.showWindow( this.userDialog );
};

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

        layout.addChild( "New Password", this.userSettings_passwordEdit1 );
        layout.addChild( "Repeat Password", this.userSettings_passwordEdit2 );

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
