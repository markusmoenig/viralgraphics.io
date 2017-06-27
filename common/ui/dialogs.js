
HtmlView=function( html, textColor )
{
    VG.UI.Widget.call( this );

    this.htmlView=VG.UI.HtmlView();

    this.htmlView.elements.h4.font=VG.Font.Font( "Open Sans Bold", 13 );
    this.htmlView.elements.h4.color.set( 0.8, 0.8, 0.8, 1 );

    this.htmlView.elements.body.margin.left=-2;
    this.htmlView.elements.body.margin.top=0;
    this.htmlView.elements.body.margin.bottom=0;
    this.htmlView.elements.body.spacing=5;
    if ( textColor ) this.htmlView.elements.body.color.set( textColor.r, textColor.g, textColor.b, 1 );

    this.htmlView.elements.body.font=VG.Font.Font( "Open Sans Semibold", 13 );

    this.htmlView.elements.b.font=VG.Font.Font( "Open Sans Bold", 13 );
    if ( textColor ) this.htmlView.elements.b.color.set( textColor.r, textColor.g, textColor.b, 1 );

    this.htmlView.elements.a.font=VG.Font.Font( "Open Sans Bold", 13 );
    this.htmlView.elements.i.font=VG.Font.Font( "Open Sans Semibold Italic", 13 );

    this.htmlView.elements.ol.font=this.htmlView.elements.body.font;
    this.htmlView.elements.ul.font=this.htmlView.elements.body.font;
    this.htmlView.elements.ol.margin.top=10;

    this.htmlView.elements.p.font=VG.Font.Font( "Open Sans Semibold", 13 );
    this.htmlView.elements.p.margin.left=0;
    this.htmlView.elements.p.margin.top=0;

    this.htmlView.html=html;
    this.htmlView.linkCallback=function( link ) { VG.gotoUrl( link ); };

    this.childWidgets=[ this.htmlView ];

    this.layout=VG.UI.Layout( this.htmlView );
    this.layout.margin.clear();
};

HtmlView.prototype=VG.UI.Widget();

HtmlView.prototype.setContent=function( content )
{
    this.htmlView.html=content;
};

HtmlView.prototype.paintWidget=function( canvas )
{
    this.layout.rect.copy( this.rect );
    this.layout.layout( canvas );
};

function createToken()
{
   var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
   var token = [], rnd = Math.random, r;

   for (var i = 0; i < 4; i++)
   {
        r = 0 | rnd()*chars.length;
        token[i] = chars[r];
   }
   return token.join('');
}

// -------------------------------------------------------------------- SaveToMyItems

SaveToMyItemsDialog=function( type, item, callback )
{
    if ( !(this instanceof SaveToMyItemsDialog) ) return new SaveToMyItemsDialog( name, item );

    VG.UI.Dialog.call( this, "Copy " + type + " to  \"My Cloud\" " );

    this.svg=svg;

    var html="When you are logged in the " + type.toLowerCase() + " will be copied to your cloud storage and will be available to you in the future.";

    var nameEdit=VG.UI.TextLineEdit( item.text );
    var htmlWidget = new HtmlView( html );
    htmlWidget.minimumSize.height=80;
    htmlWidget.htmlView.elements.body.margin.bottom=0;

    this.layout=VG.UI.LabelLayout( "Name", nameEdit, "", htmlWidget );

    this.addButton( "CLOSE", function() { this.close( this ); }.bind( this ) );
    this.addButton( "COPY", function() {

        if ( callback ) callback( nameEdit.text, item );

        this.close( this );
    }.bind( this ) );

    nameEdit.setFocus();
};

SaveToMyItemsDialog.prototype=VG.UI.Dialog();

// -------------------------------------------------------------------- ShapeUploadDialog

UploadItemDialog=function( type, object, folder )
{
    if ( !(this instanceof UploadItemDialog) ) return new UploadItemDialog( type, shape, folder );

    VG.UI.Dialog.call( this, "Community " + type + " Upload" );

    this.svg=svg;

    var html="<p>Uploading " + type.toLowerCase() + " to the community will make them available to all users. Your user name will be credited.</p>" +
    "<p>Please make sure that your work is free of any third-party copyright. By uploading you acknowledge that you are the sole copyright holder of this work.</p>" +
    "<p><b>On behalf of the online community we thank you for sharing!<b><p>";

    var htmlWidget = new HtmlView( html );
    htmlWidget.maximumSize.height=150;

    this.layout=VG.UI.Layout( htmlWidget );

    this.addButton( "CLOSE", function() { this.close( this ); }.bind( this ) );
    this.addButton( "UPLOAD", function() {

        folder.addContent( object.text,  JSON.stringify( object ), function( success ) {
            if ( success ) this.label.text=type + " uploaded successfully!";
            else if ( success ) this.label.text=type + " upload failed.";
        }.bind( this ) );

        this.label.text="Uploading...";
    }.bind( this ) );
};

UploadItemDialog.prototype = VG.UI.Dialog();

// -------------------------------------------------------------------- CopyToMyShapesDialog

CopyToMyShapesDialog=function( name, svg )
{
    if ( !(this instanceof CopyToMyShapesDialog) ) return new CopyToMyShapesDialog( name, svg );

    VG.UI.Dialog.call( this, "Copy Vector Path to My Shapes" );

    this.svg=svg;

    var html="When you are logged in the shape will be saved in your <i>PaintSupreme 3D</i> cloud storage and will be available to you next time you use PaintSupreme.";

    var nameEdit=VG.UI.TextLineEdit( name );
    var htmlWidget=new HtmlView( html );
    htmlWidget.minimumSize.height=80;
    // htmlWidget.htmlView.elements.body.margin.bottom=0;

    this.layout=VG.UI.LabelLayout( "Name", nameEdit, "", htmlWidget );

    this.addButton( "Close", function() { this.close( this ); }.bind( this ) );
    this.addButton( "Copy", function() {

        VG.context.shapesDockWidget.addToMyShapes( nameEdit.text, svg );

        this.close( this );
    }.bind( this ) );

    nameEdit.setFocus();
};

CopyToMyShapesDialog.prototype=VG.UI.Dialog();

