
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

// --- Constructor for the Phone / eMails of the Contact.

PhoneOrEMail=function()
{
    this.value="";
    this.type=0;
    this.comments="";
};

// --- main

 function vgMain( workspace )
 {
    // --- Create a new Data Collection which will hold the projects data and initialize it
    this.dc=VG.Data.Collection( "MainData" );
    clearDataCollection.call( this );

    // --- Register the Data Collection for automated undo / redo and open / save operations
    this.workspace.registerDataCollection( this.dc, VG.UI.DataCollectionRole.LoadSaveRole | VG.UI.DataCollectionRole.UndoRedoRole, "addressbook" );
    // --- Register Callbacks
    this.workspace.registerCallback( VG.UI.CallbackType.New, clearDataCollection.bind( this ) );
    this.workspace.registerCallback( VG.UI.CallbackType.UndoRedo, setToolbarMessage.bind( this ) );

    // --- Setup the Menus

    var menubar=VG.UI.Menubar();
    workspace.addMenubar( menubar );
    
    VG.Utils.addDefaultFileMenu( menubar );
    VG.Utils.addDefaultEditMenu( menubar );
    VG.Utils.addDefaultViewMenu( menubar );

    // --- Setup the Toolbar

    var toolbar=VG.UI.Toolbar();
    workspace.addToolbar( toolbar );
     
    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.New );
    toolbar.addItem( VG.UI.ToolSeparator() );
    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.Open );
    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.SaveAs );
    toolbar.addItem( VG.UI.ToolSeparator() );
    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.Undo );
    this.workspace.addToolButtonRole( toolbar, VG.UI.ActionItemRole.Redo );
     
    // --- Statusbar

    workspace.statusbar=VG.UI.Statusbar();

    // --- Setup the left DockWidget with its ListWidget and the ToolPanel

    var contactsWidget=VG.UI.ListWidget();
    this.contactsController=contactsWidget.bind( this.dc, "contacts" );
    this.contactsController.contentClassName="Contact";
    this.contactsController.addObserver( "selectionChanged", contactSelectionChanged );

    this.addButton=VG.UI.ToolPanelButton( "+" );
    this.addButton.clicked=addContact;

    this.removeButton=VG.UI.ToolPanelButton( "-" );
    this.removeButton.disabled=true;
    this.removeButton.clicked=removeContact;

    var dockWidget=VG.UI.DockWidget( "Contact List" );

    var contactsWidgetLayout=VG.UI.Layout( contactsWidget );
    contactsWidgetLayout.margin.clear();
    var toolPanel=VG.UI.ToolPanel( this.addButton, this.removeButton );

    dockWidget.addItems( contactsWidgetLayout, toolPanel );    
     
    // --- ContactEditLayout

    this.contactEditLayout=VG.UI.LabelLayout();
    //this.contactEditLayout.margin.set( 30, 15, 30, 15 );
    this.contactEditLayout.labelSpacing=20;
    this.contactEditLayout.disabled=true;

    // --- Company Switch

    this.companyCheckbox=VG.UI.Checkbox();
    this.companyCheckbox.bind( this.dc, "contacts.company" );
    this.companyCheckbox.changed=function() { companySwitch.call( this ); };

    this.contactEditLayout.addChild( "Company:", this.companyCheckbox );    

    // --- Company Name

    this.companyNameEdit=VG.UI.TextLineEdit( "" );
    this.companyNameEdit.bind( this.dc, "contacts.companyName" );
    this.companyNameEdit.textChanged=function() { computeSelectedContactItemText.call( this ); };
    this.companyNameEdit.visible=false;

    this.contactEditLayout.addChild( "Name:", this.companyNameEdit );

    // --- Salutation

    this.salutationEdit=VG.UI.PopupButton( "" );
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

    // --- Phone and eMails Table Widget

    this.phoneOrEMailWidget=new VG.UI.TableWidget();
    this.phoneOrEMailWidget.frameType=VG.UI.Frame.Type.None;

    this.phoneOrEMailController=this.phoneOrEMailWidget.bind( this.dc, "contacts.phoneOrEMail" );
    this.phoneOrEMailController.contentClassName="PhoneOrEMail";
    this.phoneOrEMailController.addObserver( "selectionChanged", function() {
        this.phoneAndEMailRemoveButton.disabled=!this.phoneOrEMailController.canRemove();
    }.bind( this ) );

    this.phoneOrEMailWidget.disabled=true;
    this.phoneOrEMailWidget.addColumn( "value", "Phone / eMail",  VG.UI.TableWidgetItemType.TextLineEdit, true );
    this.phoneOrEMailWidget.addColumn( "type", "Type", VG.UI.TableWidgetItemType.PopupButton, false, 120 );
    this.phoneOrEMailWidget.addColumn( "comments", "Comments", VG.UI.TableWidgetItemType.TextLineEdit, true );

    this.phoneOrEMailWidget.setColumnDefaultText( 0, "Phone / eMail" );
    this.phoneOrEMailWidget.setColumnPopupItems( 1, "Phone", "eMail", "Other" );
    this.phoneOrEMailWidget.setColumnDefaultText( 2, "Comment" );

    this.phoneAndEMailAddButton=this.phoneOrEMailWidget.addButton( "Add" );
    this.phoneAndEMailAddButton.clicked=function() {
        var item=this.phoneOrEMailController.add();
        this.phoneOrEMailController.selected=item;        
    }.bind( this );
    this.phoneAndEMailAddButton.disabled=true;

    this.phoneAndEMailRemoveButton=this.phoneOrEMailWidget.addButton( "Remove" );
    this.phoneAndEMailRemoveButton.clicked=function() {
        this.phoneOrEMailController.remove( this.phoneOrEMailController.selected );
    }.bind( this );
    this.phoneAndEMailRemoveButton.disabled=true;

    // --- Contact Layout

    this.contactLayout=VG.UI.SplitLayout( this.contactEditLayout, 70, this.phoneOrEMailWidget, 30 );
    this.contactLayout.vertical=true;
    this.contactLayout.margin.set( 0, 0, 0, 0 );

    // --- Notes Layout

    this.notesEdit=VG.UI.TextEdit( "" );
    this.notesEdit.bind( this.dc, "contacts.notes" );

    this.notesEditLayout=VG.UI.Layout( this.notesEdit );
    this.notesEditLayout.disabled=true;

    // --- Image Layout

    this.addImageButton=VG.UI.Button( "Select Image" );
    this.addImageButton.clicked=addContactImage;

    this.imageView=VG.UI.Image();
    this.imageView.bind( this.dc, "contacts.image" );

    this.imageEditLayout=VG.UI.Layout( this.imageView, this.addImageButton );
    this.imageEditLayout.disabled=true;
    this.imageEditLayout.vertical=true; 

    // --- Source Code Display

    this.sourceCodeEdit=VG.UI.CodeEdit( vgMain.toString() + "\n\n" + addContact.toString() + "\n\n" + removeContact.toString() + "\n\n" + clearDataCollection.toString()
         + "\n\n" + setToolbarMessage.toString() + "\n\n" + contactSelectionChanged.toString() + "\n\n" + computeSelectedContactItemText.toString() + "\n\n" + companySwitch.toString() 
         + "\n\n" + showContentFor.toString() + "\n\n" + addContactImage.toString() );
    this.sourceCodeEdit.readOnly=true;
    this.sourceCodeLayout=VG.UI.Layout( this.sourceCodeEdit );
    this.sourceCodeLayout.margin.set( 8, 0, 0, 0 );

    // --- DockStrip Widget

    var dockStripWidget=VG.UI.DockStripWidget( "Strip" );
    dockStripWidget.selectionChanged=showContentFor.bind( this );

    this.showAddressButton=VG.UI.DockStripButton( "Contact Info" );
    this.showAddressButton.selected=true;
    this.showNotesButton=VG.UI.DockStripButton( "Notes" );
    this.showImageButton=VG.UI.DockStripButton( "Image" );

    dockStripWidget.addItems( this.showAddressButton, VG.UI.DockStripSeparator(), this.showNotesButton, VG.UI.DockStripSeparator(), this.showImageButton );

    // --- Settup up the main layout

    this.stackedLayout=VG.UI.StackedLayout( this.contactLayout, this.notesEditLayout, this.imageEditLayout );

    var mainLayout=VG.UI.SplitLayout( this.stackedLayout, 50, this.sourceCodeLayout, 50 );
    mainLayout.horizontal=true;
    mainLayout.margin.set( 0, 0, 0, 0 );

    // --- Setting up the workspace

    workspace.addDockWidget( dockWidget, VG.UI.DockWidgetLocation.Left );
    workspace.addDockWidget( dockStripWidget, VG.UI.DockWidgetLocation.Right );
    workspace.content=mainLayout;    

    setToolbarMessage.call( this );
 }

// --- Add a contact to the ListWidget.

function addContact()
{
    var item=this.contactsController.add();// new Contact() );
    this.contactsController.selected=item;

    this.salutationEdit.setFocus();
    setToolbarMessage.call( this );
}

// --- Add a contact to the ListWidget.

function removeContact()
{
    this.contactsController.remove( this.contactsController.selected );
    setToolbarMessage.call( this );
}

// --- Clear the data collection, used as a callback when a "New" action is performed.

function clearDataCollection()
{
    this.dc.contacts=[];
    setToolbarMessage.call( this );
}

// --- Show the number of the current contacts in the statusbar.

function setToolbarMessage()
{
    if ( this.contactsController )
        VG.context.workspace.statusbar.message( this.contactsController.length + " contact(s) listed." );
}

// --- Dis/Enable the Add / Remove Button according to the controller state.

function contactSelectionChanged()
{
    this.removeButton.disabled=!this.contactsController.canRemove();
    this.contactEditLayout.disabled=!this.contactsController.canRemove();  
    this.phoneOrEMailWidget.disabled=!this.contactsController.canRemove();  
    this.phoneAndEMailAddButton.disabled=this.phoneOrEMailWidget.disabled;
    this.notesEditLayout.disabled=!this.contactsController.canRemove();  
    this.imageEditLayout.disabled=!this.contactsController.canRemove();
    if ( !this.contactsController.canRemove() ) this.phoneOrEMailController.selected=null;
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

function showContentFor( widget )
{
    if ( widget === this.showAddressButton )
        this.stackedLayout.current=this.contactLayout;
    else
    if ( widget === this.showNotesButton )
        this.stackedLayout.current=this.notesEditLayout;
    else
    if ( widget === this.showImageButton )
        this.stackedLayout.current=this.imageEditLayout;    
};

function addContactImage()
{
    var fileDialog=VG.OpenFileDialog( VG.UI.FileDialog.Image, function( image ) {
        this.imageView.image=image;
        this.imageView.image.needsUpdate=true;
        image=null;
    }.bind( this ));
};
