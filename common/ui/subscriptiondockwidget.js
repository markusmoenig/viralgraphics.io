
// ------------------------------------------------------- SubscriptionDockWidget

SubscriptionDockWidget=function()
{
    VG.UI.Widget.call( this );

    let subText=VG.Utils.getTextByName( "subscriptions.json" );
    let subs=JSON.parse( subText );
    let widgets=[];

    for( let i=0; i < subs.length; ++i )
    {
        let sub=subs[i];

        widgets.push( new SubscriptionWidget( sub ) );
    }

    // --- Token Edit / Activation

    this.tokenEdit = new VG.UI.TextLineEdit();
    this.tokenActivateButton = new VG.UI.Button( "Activate" );
    this.tokenActivateButton.disabled=true;
    this.tokenActivateButton.clicked=function() {

        var token=this.tokenEdit.text;
        var parameters={ token : token };

        VG.sendBackendRequest( "/app/" + VG.context.appId + "/tokens/redeem", JSON.stringify( parameters ), function(responseText) {
            //applicationChanged.call( this.admin );

            let response=JSON.parse( responseText );

            if ( response.status === "error" ) {
                VG.context.workspace.statusBar.message( "Token could not be verified." );
            } else
            if ( response.status === "ok" ) {
                VG.context.workspace.statusBar.message( "Token accepted. Thanks for subscribing. You Rock!" );

                //{"message":"Subscription activated","subscription":{"name":"Yearly Subscription","_id":"5871b3a9b1e6529f4cdb90b9","users":[],"tokens":"00mVk5TdMfiC","monthsValid":12,"type":"default"},"status":"ok"}
                for( let i=0; i < this.widgets.length; ++i )
                    this.widgets[i].testSubscription();
            }

            this.tokenEdit.text = "";
        }.bind(this), "POST" );

    }.bind( this );


    this.tokenEditLayout = VG.UI.Layout( this.tokenEdit, this.tokenActivateButton );
    // this.tokenEditLayout.margin.clear();

    if ( widgets.length === 1 )
    {
        this.layout=VG.UI.Layout( widgets[0], VG.UI.LayoutVSpacer(), this.tokenEditLayout );
        this.layout.vertical=true;
        this.layout.margin.clear();
    }

    this.widgets=widgets;
};

SubscriptionDockWidget.prototype=VG.UI.Widget();

SubscriptionDockWidget.prototype.setUserInfo=function( name, id, isAppAdmin )
{
    if ( name ) {
        this.tokenActivateButton.disabled=false;

        for( let i=0; i < this.widgets.length; ++i )
            this.widgets[i].testSubscription();

    } else {
        this.tokenActivateButton.disabled=true;
    }
};

SubscriptionDockWidget.prototype.paintWidget=function( canvas )
{
    if ( !this.layout ) return;
    this.layout.rect.copy( this.rect );
    this.layout.layout( canvas );
};

// ------------------------------------------------------- Subscri

SubscriptionWidget=function( sub )
{
    VG.UI.Widget.call( this );
    this.sub=sub;

    this.htmlWidget = new VG.UI.HtmlWidget();
    this.htmlWidget.html=this.buildHtml( sub );
    this.htmlWidget.supportsAutoFocus=true;
    this.htmlWidget.linkCallback=function( link ) { VG.gotoUrl( link ); };

    this.layout=VG.UI.Layout( this.htmlWidget );
    this.layout.vertical=true;
    this.layout.margin.clear();
};

SubscriptionWidget.prototype=VG.UI.Widget();

SubscriptionWidget.prototype.testSubscription=function( sub )
{
    var parameters={};
    VG.sendBackendRequest( "/app/subscription/" + VG.context.appId + "/" + this.sub.id + "/check", JSON.stringify( parameters ), function(responseText) {
        // VG.log( responseText );

        let response=JSON.parse( responseText );

        if ( response.status === "ok" )
        {
            VG.context.workspace.statusBar.message( "Active subscription detected." );

            // ---

            let subscription={ id : response.subscriptionId, endDate: response.user.end };
            VG.context.subscriptions.push( subscription );

            this.htmlWidget.html=this.buildHtml( this.sub );
        }

    }.bind(this), "GET" );
};

SubscriptionWidget.prototype.buildHtml=function( sub )
{
    let item;
    for( let i=0; i < VG.context.subscriptions.length; ++i )
    {
        let testItem=VG.context.subscriptions[i];
        if ( sub.id === testItem.id ) {
            item=testItem;
            break;
        }
    }

    let html="<html>" + sub.description;

    if ( !item )
    {
        html+="<p>You can buy a subscription on our <a href=\"" + sub.orderpage + "\">" + sub.product + " Product Page</a>.</p>";
        html+="<p>After ordering, your will receive your subscription token by eMail.</p>";
        html+="<p>You can than enter the token into the text entry field below to activate it.</p><p>Note that you wil have to be logged into your account to be able to activate your subscription token.</p>";
    } else
    {
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let endDate=new Date( item.endDate );
        html+="<p>Thanks for subscribing!</p>";
        html+="<p>If you want to renew or extend your subscription, you can always do so on the <a href=\"" + sub.orderpage + "\">" + sub.product + " Product Page</a>.</p>";
        html+="<p>The expiration date for your subscription is " + endDate.toLocaleDateString( "en-US",options ) + ".</p>";
    }


    html+="</html>";

    return html;
};

SubscriptionWidget.prototype.paintWidget=function( canvas )
{
    this.layout.rect.copy( this.rect );
    this.layout.layout( canvas );
};