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
 * You should have received a copy of the GNU Lesser General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

VG.Data.UndoItem=function()
{    
    if ( !(this instanceof VG.Data.UndoItem) ) return new VG.Data.UndoItem();
};

VG.Data.UndoItem.Type={ "ValueBased" : 0, "ControllerBased" : 1 };
VG.Data.UndoItem.ControllerAction={ "Add" : 0, "Remove" : 1 };

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
};

VG.Data.Undo.prototype.clear=function( dontInvokeClearCallback )
{
    this.steps=[];
    this.stepIndex=0;
    this.updateUndoRedoWidgets();   

    if ( !dontInvokeClearCallback && this.callbackForClear )
        this.callbackForClear();
};

VG.Data.Undo.prototype.pathValueAboutToChange=function( collection, path, value )
{
    //console.log( "pathValueAboutToChange", path, value );

    var undo=VG.Data.UndoItem();

    undo.type=VG.Data.UndoItem.Type.ValueBased;

    undo.collection=collection;
    undo.path=path;
    undo.oldValue=collection.dataForPath( path );
    undo.newValue=value;
    undo.pathIndex=-1;

    if ( path.indexOf( '.') !== -1 ) {
        var parts=path.split( '.' );
        //console.log( "part", parts );
        var controller=collection.controllerForPath( parts[0] ).object;

        //console.log( "test", controller.indexOf( controller.selected ) );
        undo.pathIndex=controller.indexOf( controller.selected );
    }

    // ---
    this.steps=this.steps.slice( 0, this.stepIndex );
    this.stepIndex++;
    this.steps.push( undo );
    this.updateUndoRedoWidgets();
};

VG.Data.Undo.prototype.controllerProcessedItem=function( controller, action, path, index, stringifiedItem )
{
    //console.log( "controllerProcessedItem", action, controller, path, index, stringifiedItem );

    var undo=VG.Data.UndoItem();

    undo.type=VG.Data.UndoItem.Type.ControllerBased;
    undo.action=action;//VG.Data.UndoItem.ControllerAction.Add;

    undo.controller=controller;
    undo.path=path;   
    undo.index=index;
    undo.stringifiedItem=stringifiedItem; 

    //---
    this.steps=this.steps.slice( 0, this.stepIndex );
    this.stepIndex++;
    this.steps.push( undo );    
    this.updateUndoRedoWidgets();    
};

VG.Data.Undo.prototype.undo=function( widget )
{
    this.stepIndex--;
    var undo=this.steps[this.stepIndex];

    if ( undo.type === VG.Data.UndoItem.Type.ValueBased ) 
    {
        // --- Value Based

        if ( undo.pathIndex !== -1 ) 
            this.adjustPathIndex( undo );

        var valueBinding=undo.collection.valueBindingForPath( undo.path );

        valueBinding.object.valueFromModel( undo.oldValue );
        undo.collection.storeDataForPath( undo.path, undo.oldValue, true );
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
        }
    }

    this.updateUndoRedoWidgets();

    if ( this.callbackForUndoRedo )
        this.callbackForUndoRedo();    
};

VG.Data.Undo.prototype.redo=function( widget )
{
    var undo=this.steps[this.stepIndex];
    this.stepIndex++;

    if ( undo.type === VG.Data.UndoItem.Type.ValueBased ) {

        if ( undo.pathIndex !== -1 ) 
            this.adjustPathIndex( undo );

        var valueBinding=undo.collection.valueBindingForPath( undo.path );

        valueBinding.object.valueFromModel( undo.newValue );
        undo.collection.storeDataForPath( undo.path, undo.newValue, true );
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
        {
            // --- This was an Remove action, in the redo step we have to remove this item.

            var item=undo.controller.at( undo.index );
            undo.controller.remove( item, true );            
        }
    }
    
    this.updateUndoRedoWidgets();

    if ( this.callbackForUndoRedo )
        this.callbackForUndoRedo();       
};

VG.Data.Undo.prototype.adjustPathIndex=function( undo )
{
    var parts=undo.path.split( '.' );
    var controllerPath="";

    for( var i=0; i < parts.length-1; ++i ) {
        if ( i > 0 ) controllerPath+=".";
        controllerPath+=parts[i];
    }

    var controller=undo.collection.controllerForPath( controllerPath ).object;

    if ( controller.indexOf( controller.selected ) !== undo.pathIndex )
        controller.selected=controller.at( undo.pathIndex );
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