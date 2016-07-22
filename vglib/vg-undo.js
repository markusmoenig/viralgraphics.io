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

VG.Data.UndoItem=function( undoObject, undoText )
{    
    if ( !(this instanceof VG.Data.UndoItem) ) return new VG.Data.UndoItem( undoObject, undoText );

    this.text=undoText ? undoText : "Edit";

    this.undoObject=undoObject;
    this.subItems=[];
};

VG.Data.UndoItem.prototype.addSubItem=function( path, value )
{
    var subItem=this.undoObject.pathValueAboutToChange( this.collection, path, value, true );
    this.collection.storeDataForPath( "cameraLookAt", value, true );

    this.subItems.push( subItem );
};

VG.Data.UndoItem.Type={ "ValueBased" : 0, "ControllerBased" : 1 };
VG.Data.UndoItem.ControllerAction={ "Add" : 0, "Remove" : 1, "MultipleChanges" : 2 , "Move" : 3, "NodeProperty" : 4, "NodeConnect" : 5, "NodeDisconnect" : 6 };

VG.Data.Undo=function()
{
    if ( !(this instanceof VG.Data.Undo) ) return new VG.Data.Undo();

    //this.dataCollection=0;
    this.undoIsAvailable=false;
    this.redoIsAvailable=false;
    this.newIsAvailable=false;
    this.saveIsAvailable=false;

    this.undoWidgets=[];
    this.redoWidgets=[];
    this.newWidgets=[];
    this.saveWidgets=[];

    this.steps=[];
    this.stepIndex=0;    

    this.maxSteps=25;
};

VG.Data.Undo.prototype.clear=function( dontInvokeClearCallback )
{
    this.steps=[];
    this.stepIndex=0;
    this.updateUndoRedoWidgets();   

    if ( !dontInvokeClearCallback && this.callbackForClear )
        this.callbackForClear();
};

VG.Data.Undo.prototype.pathValueAboutToChange=function( collection, path, value, dontInstall, undoText )
{
    //console.log( "pathValueAboutToChange", path, value );

    var undo=VG.Data.UndoItem( this, undoText );

    undo.type=VG.Data.UndoItem.Type.ValueBased;

    undo.collection=collection;
    undo.path=path;
    undo.oldValue=collection.dataForPath( path );
    undo.newValue=value;
    undo.pathIndex=[];

    if ( path.indexOf( '.') !== -1 ) {
        var parts=path.split( '.' );
        var controllerPath="";

        for ( var i=0; i < parts.length-1; ++i ) {
            if ( i > 0 ) controllerPath+='.';
            controllerPath+=parts[i];

            var controller=collection.controllerForPath( controllerPath ).object;
            if ( controller )
                undo.pathIndex.push( controller.indexOf( controller.selected ) );
            else VG.log( "Controller for path ", controllerPath, " not found!")
        }
    }

    // ---

    if ( !dontInstall ) {
        this.steps=this.steps.slice( 0, this.stepIndex );


        if ( this.stepIndex < this.maxSteps ) {
            this.stepIndex++;
            this.steps.push( undo );
        } else {
            var first=this.steps.shift();
            delete first;

            this.steps.push( undo );    
        }
        
        this.updateUndoRedoWidgets();
    }

    return undo;
};

VG.Data.Undo.prototype.controllerProcessedItem=function( controller, action, path, index, stringifiedItem, undoName )
{
    //console.log( "controllerProcessedItem", action, controller, path, index, stringifiedItem );

    var text="Edit";

    if ( action === VG.Data.UndoItem.ControllerAction.Add ) text="Add";
    else
    if ( action === VG.Data.UndoItem.ControllerAction.Remove ) text="Remove";
    else
    if ( action === VG.Data.UndoItem.ControllerAction.Move ) text="Move";
    if ( controller.undoObjectName ) text+=" " + controller.undoObjectName; 

    if ( undoName ) text=undoName;

    var undo=VG.Data.UndoItem( undefined, text );

    undo.type=VG.Data.UndoItem.Type.ControllerBased;
    undo.action=action;

    undo.controller=controller;
    undo.path=path;   
    undo.index=index;
    undo.stringifiedItem=stringifiedItem; 
    undo.pathIndex=[];
    undo.collection=controller.collection;

    var collection=controller.collection;

    if ( path.indexOf( '.') !== -1 ) {
        var parts=path.split( '.' );
        var controllerPath="";

        for ( var i=0; i < parts.length-1; ++i ) {
            if ( i > 0 ) controllerPath+='.';
            controllerPath+=parts[i];

            var controller=collection.controllerForPath( controllerPath ).object;
            if ( controller )
                undo.pathIndex.push( controller.indexOf( controller.selected ) );
            else VG.log( "Controller for path ", controllerPath, " not found!")
        }
    }

    //---
    this.steps=this.steps.slice( 0, this.stepIndex );

    if ( this.stepIndex < this.maxSteps ) {
        this.stepIndex++;
        this.steps.push( undo );
    } else {
        // --- Reached the limit
        var first=this.steps.shift();
        delete first;

        this.steps.push( undo );        
    }
    this.updateUndoRedoWidgets();    
};

VG.Data.Undo.prototype.undo=function()
{
    this.stepIndex--;
    var undo=this.steps[this.stepIndex];

    if ( undo.pathIndex.length ) 
        this.adjustPathIndex( undo );

    if ( undo.type === VG.Data.UndoItem.Type.ValueBased ) 
    {
        // --- Value Based

        var valueBinding=undo.collection.valueBindingForPath( undo.path );

        valueBinding.object.valueFromModel( undo.oldValue, true );
        undo.collection.storeDataForPath( undo.path, undo.oldValue, true );

        for ( var i=0; i < undo.subItems.length; ++i ) {
            var subItem=undo.subItems[i];
            var valueBinding=undo.collection.valueBindingForPath( subItem.path );

            valueBinding.object.valueFromModel( subItem.oldValue );
            undo.collection.storeDataForPath( subItem.path, subItem.oldValue, true );
        }
    } else
    if ( undo.type === VG.Data.UndoItem.Type.ControllerBased )
    {
        // --- Controller Based: Add / Remove

        if ( undo.action === VG.Data.UndoItem.ControllerAction.Add )
        {
            // --- This was an Add action, in the undo step we have to remove this item.

            var item=undo.controller.at( undo.index );
            undo.controller.remove( item, true );
        } else
        if ( undo.action === VG.Data.UndoItem.ControllerAction.Remove )
        {
            // --- This was an Remove action, in the undo step restore the item.

            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.insert( undo.index, item, true );
            undo.controller.selected=item;   
        } else
        if ( undo.action === VG.Data.UndoItem.ControllerAction.MultipleChanges )
        {
            // --- Apply the changes for multiple items

            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.applyMultipleChanges( item, true );
        } else  
        if ( undo.action === VG.Data.UndoItem.ControllerAction.Move )
        {
            // --- Apply the changes for move

            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.move( item.undo.sourceIndex, item.undo.destIndex, item.undo.mode, true );
        } else  
        if ( undo.action === VG.Data.UndoItem.ControllerAction.NodeProperty )
        {
            // --- Node Property action.

            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.changeProperty( undo.index, undo.path, item.oldValue, true );
        } else
        if ( undo.action === VG.Data.UndoItem.ControllerAction.NodeConnect )
        {
            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.disconnect( undo.index, undo.path, item, true );
        } else
        if ( undo.action === VG.Data.UndoItem.ControllerAction.NodeDisconnect )
        {
            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.connect( undo.index, undo.path, item, true );
        }  
    }

    this.updateUndoRedoWidgets();

    if ( this.callbackForUndoRedo )
        this.callbackForUndoRedo( undo.path );    
};

VG.Data.Undo.prototype.redo=function()
{
    var undo=this.steps[this.stepIndex];
    this.stepIndex++;

    if ( undo.type === VG.Data.UndoItem.Type.ValueBased ) {

        if ( undo.pathIndex.length ) 
            this.adjustPathIndex( undo );

        var valueBinding=undo.collection.valueBindingForPath( undo.path );

        valueBinding.object.valueFromModel( undo.newValue, false );
        undo.collection.storeDataForPath( undo.path, undo.newValue, true );

        for ( var i=0; i < undo.subItems.length; ++i ) {
            var subItem=undo.subItems[i];
            var valueBinding=undo.collection.valueBindingForPath( subItem.path );

            valueBinding.object.valueFromModel( subItem.newValue );
            undo.collection.storeDataForPath( subItem.path, subItem.newValue, true );
        }        
    } else
    if ( undo.type === VG.Data.UndoItem.Type.ControllerBased )
    {
        // --- Controller Based: Add / Remove

        if ( undo.action === VG.Data.UndoItem.ControllerAction.Add )
        {
            // --- This was an Add action, in the redo step restore the item.

            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.insert( undo.index, item, true );
            undo.controller.selected=item;
        } else
        if ( undo.action === VG.Data.UndoItem.ControllerAction.Remove )
        {
            // --- This was an Remove action, in the redo step we have to remove this item.

            var item=undo.controller.at( undo.index );
            undo.controller.remove( item, true );            
        } else
        if ( undo.action === VG.Data.UndoItem.ControllerAction.MultipleChanges )
        {
            // --- Apply the changes for multiple items

            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.applyMultipleChanges( item, false );
        } else
        if ( undo.action === VG.Data.UndoItem.ControllerAction.Move )
        {
            // --- Apply move

            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.move( item.redo.sourceIndex, item.redo.destIndex, item.redo.mode, true );
        } else        
        if ( undo.action === VG.Data.UndoItem.ControllerAction.NodeProperty )
        {
            // --- Node Property action.

            var item=JSON.parse( undo.stringifiedItem );

            undo.controller.changeProperty( undo.index, undo.path, item.newValue, true );
        } else
        if ( undo.action === VG.Data.UndoItem.ControllerAction.NodeConnect )
        {
            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.connect( undo.index, undo.path, item, true );
        } else
        if ( undo.action === VG.Data.UndoItem.ControllerAction.NodeDisconnect )
        {
            var item=JSON.parse( undo.stringifiedItem );
            undo.controller.disconnect( undo.index, undo.path, item, true );
        }           
    }
    
    this.updateUndoRedoWidgets();

    if ( this.callbackForUndoRedo )
        this.callbackForUndoRedo( undo.path );       
};

VG.Data.Undo.prototype.adjustPathIndex=function( undo )
{
    var parts=undo.path.split( '.' );
    var controllerPath="";

    for( var i=0; i < parts.length-1; ++i ) 
    {
        if ( i > 0 ) controllerPath+=".";
        controllerPath+=parts[i];

        var controller=undo.collection.controllerForPath( controllerPath ).object;

        if ( controller ) {
            if ( controller.indexOf( controller.selected ) !== undo.pathIndex[i] )
                controller.selected=controller.at( undo.pathIndex[i] );
        }
    }
};

VG.Data.Undo.prototype.addUndoWidget=function( widget )
{
    widget.disabled=!this.undoIsAvailable;
    widget.clicked=this.undo.bind( this );
    this.undoWidgets.push( widget );
};

VG.Data.Undo.prototype.addRedoWidget=function( widget )
{
    widget.disabled=!this.redoIsAvailable;
    widget.clicked=this.redo.bind( this );
    this.redoWidgets.push( widget );
};

VG.Data.Undo.prototype.addNewWidget=function( widget )
{
    widget.disabled=!this.undoIsAvailable;
    this.newWidgets.push( widget );
};

VG.Data.Undo.prototype.addSaveWidget=function( widget )
{
    widget.disabled=!this.undoIsAvailable;
    this.saveWidgets.push( widget );
};

VG.Data.Undo.prototype.updateUndoRedoWidgets=function()
{
    this.undoIsAvailable=this.stepIndex;
    for( var i=0; i < this.undoWidgets.length; ++i ) {
        this.undoWidgets[i].disabled=!this.undoIsAvailable;
    }    

    this.redoIsAvailable=this.stepIndex < this.steps.length ? true : false;
    for( var i=0; i < this.redoWidgets.length; ++i ) {
        this.redoWidgets[i].disabled=!this.redoIsAvailable;
    }

    this.newIsAvailable=this.undoIsAvailable;
    for( var i=0; i < this.newWidgets.length; ++i ) {
        this.newWidgets[i].disabled=!this.newIsAvailable;        
    }     

    this.saveIsAvailable=this.newIsAvailable;
    for( var i=0; i < this.saveWidgets.length; ++i ) {
        if ( this.saveWidgets[i].role === VG.UI.ActionItemRole.Save )
        {
            // --- Save
            if ( this.saveIsAvailable && VG.context.workspace.filePath )
                this.saveWidgets[i].disabled=false;
            else this.saveWidgets[i].disabled=true;
        } else
        {
            // --- SaveAs
            this.saveWidgets[i].disabled=!this.saveIsAvailable;
        }
    } 

    VG.setHostProperty( VG.HostProperty.ProjectChangedState, this.newIsAvailable );
};