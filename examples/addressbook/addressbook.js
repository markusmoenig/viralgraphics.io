
// --- Constructor for our Contact Items. Will be called for each Item to be added to the list.

Contact=function()
{    
    this.company=false;
    this.salutation=0;
    this.companyName="";
    this.firstName="";
    this.lastName="";
    this.address="";
    this.notes="";
    this.image=null;
    this.birthYear=1970;

    this.phoneOrEMail=[];

    this.text="New Contact";
};

// --- vgMain

function vgMain( workspace )
{
    // --- Create a new Data Collection which will hold the projects data
    this.dc=VG.Data.Collection( "MainData" );
    this.dc.contacts=[];

    // --- Register the Data Collection for automated Undo / Redo and Open / Save operations
    this.workspace.registerDataCollection( this.dc, VG.UI.DataCollectionRole.LoadSaveRole | VG.UI.DataCollectionRole.UndoRedoRole, "addressbook" );

    // --- Register New Callback, called when the DataModel needs to be cleared
    this.workspace.registerCallback( VG.UI.CallbackType.New, function () {
        this.dc.contacts=[];
        setToolbarMessage.call( this );
    }.bind( this ) );

    // --- Register Undo / Redo Callback, called to indicate an Undo/Redo action was performed, we just use it to update the StatusBar Message.
    this.workspace.registerCallback( VG.UI.CallbackType.UndoRedo, setToolbarMessage.bind( this ) );

    // --- Setup the Decorated Toolbar
    this.workspace.createDecoratedToolBar();
    //VG.Utils.addDefaultQuickViewMenu();
    //this.workspace.addQuickMenuItem();

    this.addContactQMI=this.workspace.addQuickMenuItem( "ADD CONTACT", function() { this.addButton.clicked(); }.bind( this ) );
    this.removeContactQMI=this.workspace.addQuickMenuItem( "REMOVE CONTACT", function() { this.removeButton.clicked(); }.bind( this ) );
    this.removeContactQMI.disabled=true;
    this.workspace.addQuickMenuItem( "" );
    this.selectImageQMI=this.workspace.addQuickMenuItem( "SELECT IMAGE", function() { this.imageButton.clicked(); }.bind( this ) );
    this.selectImageQMI.disabled=true;

    // --- StatusBar
    workspace.statusBar=VG.UI.StatusBar();

    // --- Setup the left DockWidget / ListWidget

    var contactsWidget=VG.UI.ListWidget();
    this.contactsController=contactsWidget.bind( this.dc, "contacts" );
    this.contactsController.contentClassName="Contact";
    this.contactsController.addObserver( "selectionChanged", contactSelectionChanged );

    this.addButton=VG.UI.ToolButton( "Add" );
    this.addButton.clicked=function() {
        var item=this.contactsController.add();// new Contact() );
        this.contactsController.selected=item;

        this.salutationEdit.setFocus();
        setToolbarMessage.call( this );
    }.bind( this );

    this.removeButton=VG.UI.ToolButton( "Remove" );
    this.removeButton.disabled=true;
    this.removeButton.clicked=function() {
        this.contactsController.remove( this.contactsController.selected );
        setToolbarMessage.call( this );
    }.bind( this );

    this.imageButton=VG.UI.ToolButton( "Image" );
    this.imageButton.disabled=true;
    this.imageButton.clicked=function() {
        var fileDialog=VG.OpenFileDialog( VG.UI.FileDialog.Image, function( name, image ) {
            this.imageView.image=image;
            this.imageView.image.needsUpdate=true;
            image=null;
        }.bind( this ) );
    }.bind( this );    

    contactsWidget.addToolWidget( this.addButton );
    contactsWidget.addToolWidget( this.removeButton );
    contactsWidget.addToolWidget( this.imageButton );

    var dockWidget=VG.UI.DockWidget( "Contact List" );

    var contactsWidgetLayout=VG.UI.Layout( contactsWidget );
    contactsWidgetLayout.margin.clear();

    dockWidget.addItem( contactsWidget );//contactsWidgetLayout );    
     
    // --- ContactEditLayout

    this.contactEditLayout=VG.UI.LabelLayout();
    this.contactEditLayout.labelSpacing=20;
    this.contactEditLayout.disabled=true;
    this.contactEditLayout.addTitle( "Contact Data" );

    // --- Company Switch

    this.companyCheckbox=VG.UI.CheckBox();
    this.companyCheckbox.bind( this.dc, "contacts.company" );
    this.companyCheckbox.changed=function() { companySwitch.call( this ); }.bind( this );

    this.contactEditLayout.addChild( "Company:", this.companyCheckbox );    

    // --- Company Name

    this.companyNameEdit=VG.UI.TextLineEdit( "" );
    this.companyNameEdit.bind( this.dc, "contacts.companyName" );
    this.companyNameEdit.textChanged=function() { computeSelectedContactItemText.call( this ); };
    this.companyNameEdit.visible=false;

    this.contactEditLayout.addChild( "Name:", this.companyNameEdit );

    // --- Salutation

    this.salutationEdit=VG.UI.DropDownMenu( "" );
    this.salutationEdit.addItem( "Mr." );
    this.salutationEdit.addItem( "Ms." );
    this.salutationEdit.addItem( "Doctor" );
    this.salutationEdit.bind( this.dc, "contacts.salutation" );
    //this.salutationEdit.textChanged=function() { computeSelectedContactItemText.call( this ); };

    this.contactEditLayout.addChild( "Salutation:", this.salutationEdit );

    // --- First Name

    this.firstNameEdit=VG.UI.TextLineEdit( "" );
    this.firstNameEdit.bind( this.dc, "contacts.firstName" );
    this.firstNameEdit.textChanged=function() { computeSelectedContactItemText.call( this ); }.bind( this );

    this.contactEditLayout.addChild( "First Name:", this.firstNameEdit );

    // --- Last Name

    this.lastNameEdit=VG.UI.TextLineEdit( "" );
    this.lastNameEdit.bind( this.dc, "contacts.lastName" );
    this.lastNameEdit.textChanged=function() { computeSelectedContactItemText.call( this ); }.bind( this );

    this.contactEditLayout.addChild( "Last Name:", this.lastNameEdit );    

    // --- Year of Birth

    this.birthYearSlider=VG.UI.Slider( 1900, new Date().getFullYear(), 1 );
    this.birthYearSlider.bind( this.dc, "contacts.birthYear" );
    //this.lastNameEdit.textChanged=function() { computeSelectedContactItemText.call( this ); };

    this.contactEditLayout.addChild( "Year of Birth:", this.birthYearSlider );

    // --- Address Edit

    this.addressEdit=VG.UI.TextEdit( "" );
    this.addressEdit.bind( this.dc, "contacts.address" );
    //this.addressEdit.maximumSize.height=200;
    this.contactEditLayout.addChild( "Address:", this.addressEdit );    

    // --- Notes Edit

    this.notesEdit=VG.UI.TextEdit( "" );
    this.notesEdit.bind( this.dc, "contacts.notes" );
    this.contactEditLayout.addChild( "Notes:", this.notesEdit );

    // --- Image Layout

    this.imageView=VG.UI.Image();
    this.imageView.bind( this.dc, "contacts.image" );

    this.imageEditLayout=VG.UI.Layout( this.imageView );
    this.imageEditLayout.disabled=true;
    this.imageEditLayout.addTitle( "Image" );

    // --- Settup up the main layout

    var mainLayout=VG.UI.SplitLayout( this.contactEditLayout, 50, this.imageEditLayout, 50 );
    mainLayout.margin.set( 0, 0, 0, 0 );

    // --- Setting up the workspace

    workspace.addDockWidget( dockWidget, VG.UI.DockWidgetLocation.Left );
    workspace.content=mainLayout;    

    setToolbarMessage.call( this );
}

// --- Show the number of the current contacts in the statusbar.

function setToolbarMessage()
{
    if ( this.contactsController )
        VG.context.workspace.statusBar.message( this.contactsController.length + " contact(s) listed." );
}

// --- Dis/Enable the Add / Remove Button according to the controller state.

function contactSelectionChanged()
{
    this.removeButton.disabled=!this.contactsController.canRemove();
    this.imageButton.disabled=!this.contactsController.canRemove();
    this.removeContactQMI.disabled=!this.contactsController.canRemove();
    this.selectImageQMI.disabled=!this.contactsController.canRemove();
    this.contactEditLayout.disabled=!this.contactsController.canRemove();  

    this.imageEditLayout.disabled=!this.contactsController.canRemove();
}

// --- 

function computeSelectedContactItemText() 
{
    if ( !this.contactsController || !this.contactsController.selected ) return;

    var text;

    if ( !this.companyCheckbox.checked )
    {
        var firstName=this.firstNameEdit.text;
        var lastName=this.lastNameEdit.text;

        if ( !firstName.length && !lastName.length ) {
            text="New Contact";
        } else {
            text=firstName + " " + lastName;
        }
    } else 
    {
        var name=this.companyNameEdit.text;

        if ( name.length ) text=name;
        else text="New Contact";
    }

    this.contactsController.selected.text=text;
}

// --- Switch between the company address type and private address type.

function companySwitch()
{
    if ( this.companyNameEdit.visible !== this.companyCheckbox.checked ) 
    {
        this.contactEditLayout.lockAnimationSourceData.call( this.contactEditLayout );

        this.companyNameEdit.visible=this.companyCheckbox.checked;;
        this.salutationEdit.visible=!this.companyCheckbox.checked;
        this.firstNameEdit.visible=!this.companyCheckbox.checked;
        this.lastNameEdit.visible=!this.companyCheckbox.checked;
        this.birthYearSlider.visible=!this.companyCheckbox.checked;

        this.contactEditLayout.lockAnimationDestData.call( this.contactEditLayout );
        this.contactEditLayout.startAnimation.call( this.contactEditLayout, 1, 200 );
    }

    computeSelectedContactItemText.call( this );
}