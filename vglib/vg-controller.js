/*
 * Copyright (c) 2014-2016 Markus Moenig <markusm@visualgraphics.tv>
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

/**
 * Contains the controllers of the data model of Visual Graphics.
 * @namespace
 */

VG.Controller = {};

VG.Controller.Observer=function( func, context )
{
    if ( !(this instanceof VG.Controller.Observer) ) return new VG.Controller.Observer();
    
    this.func=func;

    if ( context === undefined ) this.context=VG.context;
    else this.context=context;
};

/**
 * The base class for all controllers. Implements observer handling.
 * @constructor
 */

VG.Controller.Base=function()
{
    if ( !(this instanceof VG.Controller.Base) ) return new VG.Controller.Base();

    this.observerKeys=[];
};

VG.Controller.Base.prototype.addObserverKey=function( key )
{
	this[key]=[];
	this.observerKeys.push( key );
};

/**
 * Adds an observer to the controller.
 * @param {string} key - The observer key
 * @param {function} func - The callback function.
 */

VG.Controller.Base.prototype.addObserver=function( key, func, context )
{
	if ( this.observerKeys.indexOf( key ) !== -1 ) {
		this[key].push( new VG.Controller.Observer( func, context ) );
	}
};

VG.Controller.Base.prototype.notifyObservers=function( key, arg )
{
	if ( this.observerKeys.indexOf( key ) !== -1 ) {
		for( var i=0; i < this[key].length; ++i ) {
			var observer=this[key][i];
			observer.func.call( observer.context, arg );
		}
	}

	if ( key === "selectionChanged" ) {
		// --- Now search all value bindings depending on this controller and send an update message to those who need to be updated.

		for ( var i=0; i < this.collection.__vgValueBindings.length; ++i ) {
			var binding=this.collection.__vgValueBindings[i];

			if ( binding.path.indexOf( this.path ) == 0 ) {
				// --- This binding starts with our controller path

				var restPath=binding.path.slice( this.path.length );
				if ( restPath[0] === '.' ) {
					// --- Sanity Check for the '.' (which represents this controller)
					var restPath=restPath.slice( 1, restPath.length );

					if ( restPath.indexOf( '.' ) === -1 ) {
						// --- The path does not contain any more dots / controllers, update the value

						if ( binding.object.isWidget ) {
							// --- Set the value to the binding object
							if ( !this.selected ) binding.object.valueFromModel( null );
							else 
                            if ( this.selected.hasOwnProperty( restPath ) ) {
                                binding.object.valueFromModel( this.selected[restPath] );
                            }
						}
					}
				}
			}
		}

        // --- Now search all the controller bindings and notify controller in the path that their parent path has changed

        for ( var i=0; i < this.collection.__vgControllerBindings.length; ++i ) {
            var binding=this.collection.__vgControllerBindings[i];   

            if ( this.path != binding.path && binding.path.indexOf( this.path ) == 0 ) {
                // --- This binding starts with our controller path              
                binding.object.notifyObservers( "parentSelectionChanged" );
            }
        }       
	}
};

/**
 * Creates an array controller which handles objects inside a flat array.</br>
 * You will not need to create this controller yourself, it is mostly returned by widgets like {@link VG.UI.ListWidget}.
 * </br>Supports the following observer keys: "parentSelectionChanged", "selectionChanged", "changed", "addItem", "removeItem".
 * @property {object} selected - The currently selected object.
 * @property {array} selection - The currently selected objects when <i>multiSelection</i> is on.
 * @property {bool} multiSelection - Set to true if this controller should handle multiple selections, default is false.
 * @property {number} length - The number of items managed by the controller (read-only).
 * @constructor
 * @tutorial Data Model
 * @augments VG.Controller.Base
 */

VG.Controller.Array=function( collection, path )
{
    if ( !(this instanceof VG.Controller.Array) ) return new VG.Controller.Array( collection, path );

    VG.Controller.Base.call( this );

    this.collection=collection;
    this.path=path;
    this.contentClassName="";

    // ---

    this.multiSelection=false;

    this._selected=0;
    this.selection=[];    

    // --- Init possible OberverKeys

    this.addObserverKey( "parentSelectionChanged" );
    this.addObserverKey( "selectionChanged" );
    this.addObserverKey( "changed" );
    this.addObserverKey( "addItem" );
    this.addObserverKey( "removeItem" );
};

VG.Controller.Array.prototype=VG.Controller.Base();

Object.defineProperty( VG.Controller.Array.prototype, "length", 
{
    get: function() {
    	var array=this.collection.dataForPath( this.path );
        if ( array ) return array.length;
        else return 0;
    }   
});

VG.Controller.Array.prototype.count=function()
{
    return this.length;
};

/**
 * Returns the object at the given index
 * @param {string} index - The index of the object.
 * @returns {object} The object at the given index.
 */

VG.Controller.Array.prototype.at=function( index )
{
    var array=this.collection.dataForPath( this.path );

    if ( index < 0 || index >= array.length ) return undefined;

    return array[index];
};

/**
 * Adds an object to the controller.
 * Triggers installed "addItem" observers.
 * @param {object} item - The object to add. Item can be undefined if you set the <i>contentClassName</i> property of the controller.
 * @param {bool} noUndo - Set to true if you don't want to trigger an undo step for this action inside the data model. Default is false.
 */

VG.Controller.Array.prototype.add=function( item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    if ( item === undefined && this.contentClassName.length ) {
    	item=this.create( this.contentClassName );
    }

    this.notifyObservers( "addItem", item );    

    array.push( item );

    if ( this.collection.__vgUndo && !noUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Add, this.path, array.length-1, JSON.stringify( item ) );

	this.notifyObservers( "changed" );    
    return item;
};

/**
 * Insert an object to the controller.
 * Triggers installed "addItem" observers.
 * @param {number} index - The index position to insert the object at.
 * @param {object} item - The object to add. Item can be undefined if you set the <i>contentClassName</i> property of the controller.
 * @param {bool} noUndo - Set to true if you don't want to trigger an undo step for this action inside the data model. Default is false.
 */

VG.Controller.Array.prototype.insert=function( index, item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    if ( item === undefined && this.contentClassName.length ) {
        item=this.create( this.contentClassName );
    }

    this.notifyObservers( "addItem", item );    

    array.splice( index, 0, item );

    if ( this.collection.__vgUndo && !noUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Add, this.path, index, JSON.stringify( item ) );

    this.notifyObservers( "changed" );    
    return item;
};

/**
 * Removes an object from the controller.
 * Triggers installed "removeItem" observers. 
 * @param {object} item - The object to remove.
 * @param {bool} noUndo - Set to true if you don't want to trigger an undo step for this action inside the data model. Default is false.
 */

VG.Controller.Array.prototype.remove=function( item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    this.notifyObservers( "removeItem", item );    

    var index=array.indexOf( item );
    if ( index >= 0 )
        array.splice( index, 1 );

    if ( this.collection.__vgUndo && !noUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Remove, this.path, index, JSON.stringify( item ) );

	this.notifyObservers( "changed" );

    if ( index-1 < array.length && index-1 >= 0 )
    	this.selected=array[index-1];
    else
        this.selected=array[index];

    this.removeFromSelection( item );
};

VG.Controller.Array.prototype.create=function( strClass )
{
    var args = Array.prototype.slice.call(arguments, 1);
    var clsClass = eval( strClass );

    function F() {
        return clsClass.apply(this, args);
    }
    F.prototype = clsClass.prototype;

    return new F();
};

Object.defineProperty( VG.Controller.Array.prototype, "selected", 
{
    get: function() {
        return this._selected;
    },
    set: function( selected ) {
    	if ( this._selected !== selected ) {

        	this._selected=selected;
        	this.selection=[];

        	if ( selected ) {
        		this.selection.push( selected );
        	}

	        this.notifyObservers( "selectionChanged" );
        }
    }    
});

/**
 * Adds an object to the selection.
 * @param {object} item - The object to add to the selection.
 */

VG.Controller.Array.prototype.addToSelection=function( item )
{
	if ( !this._selected ) this._selected=item;

    var index=this.selection.indexOf( item );
    if ( index === -1 && item )	
		this.selection.push( item );

	this.notifyObservers( "selectionChanged" );	
};

/**
 * Removes an object from the selection.
 * @param {object} item - The object to remove from the selection.
 */

VG.Controller.Array.prototype.removeFromSelection=function( item )
{
	if ( this._selected === item ) this._selected=0;

    var index=this.selection.indexOf( item );
    if ( index >= 0 )
    {
        this.selection.splice( index, 1 );

     //   if ( this.selectionChanged )
     //       this.selectionChanged.call( VG.context );        
    }	

	if ( this._selected === 0 && this.selection.length ) {
		this._selected=this.selection[0];
	}

	this.notifyObservers( "selectionChanged" );    
};

/**
 * Returns true if the given object is selected.
 * @param {object} item - The object to check for selection.
 * @returns {bool} True if the item is selected, false otherwise.
 */

VG.Controller.Array.prototype.isSelected=function( item )
{
    var index=this.selection.indexOf( item );

    if ( index === -1 ) return false;
    else return true;
};

VG.Controller.Array.prototype.setSelected=function( item )
{
    this.selected=item;
};

/**
 * Returns true if you can remove the current item, i.e. if it is non null.
 * @returns {bool} True if you can remove the current item.
 */

VG.Controller.Array.prototype.canRemove=function()
{
	if ( this.selected ) return true;
	else return false;
};

/**
 * Returns the index of the item.
 * @param {object} item - The object to get the index for.
 * @returns {number} The index of the object.
 */

VG.Controller.Array.prototype.indexOf=function( item )
{
    var array=this.collection.dataForPath( this.path );
    return array.indexOf( item );
};

VG.Controller.Array.prototype.applyUndoForMultipleChanges=function( item, undoName )
{
    if ( this.collection.__vgUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.MultipleChanges, 
            this.path, -1, JSON.stringify( item ), undoName );
};

VG.Controller.Array.prototype.applyMultipleChanges=function( undoItem, undo )
{
    var values=undo ? undoItem.oldValues : undoItem.newValues;

    if ( undoItem.parentControllerPath ) {
        // --- Adjust selection of parentController if necessary
        var parentController=this.collection.controllerForPath( undoItem.parentControllerPath );
        parentController.object.selected=parentController.object.at( undoItem.parentIndex );
    }

    for ( var i=0; i < values.length; ++i )
    {
        var object=values[i];
        var item=this.at( object._index );

        for ( var p=0; p < undoItem.propertyNames.length; ++p )
        {
            var propName=undoItem.propertyNames[p];
            item[propName]=object[propName];
        }
    }
};

/**
 * Creates an array controller which handles nested object hierarchies.</br>
 * Note that index locations for this controller are not numbers but string, like "0.1" or "" to indicate the root level.
 * You will not need to create this controller yourself, it is mostly returned by widgets like {@link VG.UI.TreeWidget}.
 * </br>Supports the following observer keys: "selectionChanged", "changed", "addItem", "removeItem".
 * @property {object} selected - The currently selected object.
 * @property {array} selection - The currently selected objects when <i>multiSelection</i> is on.
 * @property {bool} multiSelection - Set to true if this controller should handle multiple selections, default is false.
 * @property {number} length - The number of items managed by the controller (read-only).
 * @constructor
 * @tutorial Data Model
 * @augments VG.Controller.Base 
 */

VG.Controller.Tree=function( collection, path )
{
    if ( !(this instanceof VG.Controller.Tree) ) return new VG.Controller.Tree( collection, path );

    VG.Controller.Base.call( this );

    this.collection=collection;
    this.path=path;
    this.contentClassName="";

    // ---

    this.multiSelection=false;

    this._selected=0;
    this.selection=[];    

    // --- Init possible OberverKeys

    this.addObserverKey( "selectionChanged" );
    this.addObserverKey( "changed" );
    this.addObserverKey( "addItem" );
    this.addObserverKey( "removeItem" );    
};

VG.Controller.Tree.prototype=VG.Controller.Base();

Object.defineProperty( VG.Controller.Tree.prototype, "length", 
{
    get: function() {
        var array=this.collection.dataForPath( this.path );
        if ( !array ) return 0;
        return array.length;
    }   
});

/**
 * Returns the object at the given index
 * @param {string} index - The index of the object.
 * @returns {object} The object at the given index.
 */

VG.Controller.Tree.prototype.at=function( index )
{
    var array=this.collection.dataForPath( this.path );

    var item=0;
    var pathArray;

    index=index.toString();

    if ( index.indexOf( "." ) === -1 )
    {
        item=array[Number(index)];
    } else
    {
        pathArray=index.split( "." );
    }

    if ( !item )
    {
        if ( !pathArray ) return undefined;
        for( var i=0; i < pathArray.length; ++i )
        {
            if ( i === 0 )
            {
                item=array[ pathArray[i] ];
            } else
            {
                item=item.children[ pathArray[i] ];
            }
        }
    }

    return item; 
};

/**
 * Adds an object to the controller.
 * Triggers installed "addItem" observers.
 * @param {object} item - The object to add. Item can be undefined if you set the <i>contentClassName</i> property of the controller.
 * @param {bool} noUndo - Set to true if you don't want to trigger an undo step for this action inside the data model. Default is false.
 */

VG.Controller.Tree.prototype.add=function( index, item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    if ( item === undefined && this.contentClassName.length ) {
        item=this.create( this.contentClassName );
    }

    this.notifyObservers( "addItem", item );    

    // --- Add the item

    var itemIndex;

    if ( index === "" ) 
    {
        // --- New top level item
        array.push( item );
        itemIndex=String( array.length-1 );
    }
    else
    {
        var pathArray;

        if ( index.indexOf( "." ) === -1 )
        {
            pathArray=[];
            pathArray.push( index );
        } else
        {
            pathArray=index.split( "." );
        }

        var obj=array;

        for( var i=0; i < pathArray.length; ++i )
        {
            if ( i === 0 )
            {
                obj=array[ pathArray[i] ];
            } else
            {
                obj=obj.children[ pathArray[i] ];
            }
        }

        obj.children.push( item );
        itemIndex=String(index) + "." + String(obj.children.length-1);
    }

    // ---


    if ( this.collection.__vgUndo && !noUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Add, this.path, itemIndex, JSON.stringify( item ) );

    this.notifyObservers( "changed" );    
    return item;
};

/**
 * Insert an object to the controller.
 * Triggers installed "addItem" observers.
 * @param {number} index - The index position to insert the object at.
 * @param {object} item - The object to add. Item can be undefined if you set the <i>contentClassName</i> property of the controller.
 * @param {bool} noUndo - Set to true if you don't want to trigger an undo step for this action inside the data model. Default is false.
 */

VG.Controller.Tree.prototype.insert=function( index, item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    if ( item === undefined && this.contentClassName.length ) {
        item=this.create( this.contentClassName );
    }

    this.notifyObservers( "addItem", item );    

    // --- Insert the item

    var done=false;

    if ( index === "" ) 
        array.push( item );
    else {
        var pathArray;

        if ( index.indexOf( "." ) === -1 )
        {
            array.splice( Number(index), 0, item );
        } else
        {
            pathArray=index.split( "." );
    
            var obj=array;

            for( var i=0; i < pathArray.length-1; ++i )
            {
                if ( i === 0 )
                {
                    obj=array[ pathArray[i] ];
                } else
                {
                    obj=obj.children[ pathArray[i] ];
                }
            }

            obj.children.splice( Number(pathArray[pathArray.length-1]), 0, item );
        }
    }

    if ( this.collection.__vgUndo && !noUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Add, this.path, index, JSON.stringify( item ) );

    this.notifyObservers( "changed" );    
    return item;
};

/**
 * Removes an object from the controller.
 * Triggers installed "removeItem" observers. 
 * @param {object} item - The object to remove.
 * @param {bool} noUndo - Set to true if you don't want to trigger an undo step for this action inside the data model. Default is false.
 */

VG.Controller.Tree.prototype.remove=function( item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    this.notifyObservers( "removeItem", item );    

    var index=this.indexOf( item );
    var itemArray=this.arrayOfItem( item );
    var itemIndex=itemArray.indexOf( item );

    if ( itemArray )
    {
        itemArray.splice( itemArray.indexOf( item ), 1 );

        if ( this.collection.__vgUndo && !noUndo ) 
            this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Remove, this.path, index, JSON.stringify( item ) );

        this.notifyObservers( "changed" );
        this.removeFromSelection( item );

        itemIndex-=1;
        if ( itemArray.length ) {
            if ( itemIndex >= 0 ) this.selected=itemArray[itemIndex];
            this.selected=itemArray[0];
        }
    }
};

/**
 * Moves an object from one index to another index.
 * @param {string} sourceIndex - The source index of the item.
 * @param {string} destIndex - The destination index of the item.
 * @param {number} mode - 0 noop, 1 below on same hierarchy, 2 new child (expand hierachy)
 * @param {bool} noUndo - Set to true if you don't want to trigger an undo step for this action inside the data model. Default is false.
 */

VG.Controller.Tree.prototype.move=function( sourceIndex, destIndex, mode, noUndo )
{
    // --- mode: 0 noop, 1 below on same hierarchy, 2 new child (expand hierachy)

    var undoItem={
        undo : { sourceIndex : destIndex, destIndex : sourceIndex, mode : 0 },
        redo : { sourceIndex : sourceIndex, destIndex : destIndex, mode : mode },
    };

    var sourceItem=this.at( sourceIndex );
    var sourceArray=this.arrayOfItem( sourceItem );
    var destItem=this.at( destIndex );

    sourceArray.splice( sourceArray.indexOf( sourceItem ), 1 );

    if ( mode === 0 || mode === 1 )
    {
        // --- Stays in same hierarchy
        var destArray=this.arrayOfItem( destItem );
        var destIndex=destArray.indexOf( destItem );
        if ( mode === 1 ) destIndex++;

        destArray.splice( destIndex, 0, sourceItem );
    } else
    {
        // --- Add as a new child

        if ( !noUndo )
        {
            destIndex+=".0";

            undoItem.undo.sourceIndex=destIndex;            
            undoItem.redo.destIndex=destIndex;
            undoItem.undo.mode=mode;
        }

        this.insert( destIndex, sourceItem, true );
    }

    if ( this.collection.__vgUndo && !noUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Move, this.path, sourceIndex, 
            JSON.stringify( undoItem  ) );
};

VG.Controller.Tree.prototype.create=function( strClass )
{
    var args = Array.prototype.slice.call(arguments, 1);
    var clsClass = eval( strClass );

    function F() {
        return clsClass.apply(this, args);
    }
    F.prototype = clsClass.prototype;

    return new F();
};

Object.defineProperty( VG.Controller.Tree.prototype, "selected", 
{
    get: function() {
        return this._selected;
    },
    set: function( selected ) {
        if ( this._selected !== selected ) {

            this._selected=selected;
            this.selection=[];

            if ( selected ) {
                this.selection.push( selected );
            }

            this.notifyObservers( "selectionChanged" );
        }
    }    
});

/**
 * Adds an object to the selection.
 * @param {object} item - The object to add to the selection.
 */

VG.Controller.Tree.prototype.addToSelection=function( item )
{
    if ( !this._selected ) this._selected=item;

    var index=this.selection.indexOf( item );
    if ( index === -1 && item ) 
        this.selection.push( item );

    this.notifyObservers( "selectionChanged" ); 
};

/**
 * Removes an object from the selection.
 * @param {object} item - The object to remove from the selection.
 */

VG.Controller.Tree.prototype.removeFromSelection=function( item )
{
    if ( this._selected === item ) this._selected=0;

    var index=this.selection.indexOf( item );
    if ( index >= 0 )
    {
        this.selection.splice( index, 1 );

     //   if ( this.selectionChanged )
     //       this.selectionChanged.call( VG.context );        
    }   

    if ( this._selected === 0 && this.selection.length ) {
        this._selected=this.selection[0];
    }

    this.notifyObservers( "selectionChanged" );    
};

/**
 * Returns true if the given object is selected.
 * @param {object} item - The object to check for selection.
 * @returns {bool} True if the item is selected, false otherwise.
 */

VG.Controller.Tree.prototype.isSelected=function( item )
{
    var index=this.selection.indexOf( item );

    if ( index === -1 ) return false;
    else return true;
};

/**
 * Returns true if you can remove the current item, i.e. if it is non null.
 * @returns {bool} True if you can remove the current item.
 */

VG.Controller.Tree.prototype.canRemove=function()
{
    if ( this.selected ) return true;
    else return false;
};

VG.Controller.Tree.prototype.arrayOfItemChildren=function( curItem, item )
{
    if ( curItem.children.indexOf( item ) !== -1 )
    {
        return curItem.children;
    } else
    {
        for( var i=0; i < curItem.children.length; ++i )
        {
            var childItem=curItem.children[i];

            if ( childItem.children )
            {
                var rc=this.arrayOfItemChildren( childItem, item );
                if ( rc ) return rc;
            }
        }
    }        
    return 0;
};

VG.Controller.Tree.prototype.arrayOfItem=function( item )
{
    var array=this.collection.dataForPath( this.path );

    var pathArray;
    var index=0;

    if ( array.indexOf( item ) !== -1 ) {
        return array;
    }
    else {
        for( var i=0; i < array.length; ++i )
        {
            var childItem=array[i];

            if ( childItem.children )
            {
                var rc=this.arrayOfItemChildren( childItem, item );
                if ( rc ) return rc;
            }
        }
    }
    return 0;
};

VG.Controller.Tree.prototype.indexOfChildren=function( curItem, path, item )
{
    if ( curItem.children.indexOf( item ) !== -1 )
    {
        path+=curItem.children.indexOf( item ).toString();
        return path;
    } else
    {
        for( var i=0; i < curItem.children.length; ++i )
        {
            var childItem=curItem.children[i];

            if ( childItem.children )
            {
                var childPath=path + i.toString() + ".";

                var rc=this.indexOfChildren( childItem, childPath, item );
                if ( rc != -1 ) return rc;
            }
        }
    }        
    return -1;
};

/**
 * Returns the index of the item.
 * @param {object} item - The object to get the index for.
 * @returns {number} The index of the object.
 */

VG.Controller.Tree.prototype.indexOf=function( item )
{
    var array=this.collection.dataForPath( this.path );

    var pathArray;
    var index=0;

    index=index.toString();

    if ( array.indexOf( item ) !== -1 ) {
        index=array.indexOf( item ).toString();
        return index;
    }
    else {
        for( var i=0; i < array.length; ++i )
        {
            var childItem=array[i];

            if ( childItem.children )
            {
                var childPath=i.toString() + ".";

                var rc=this.indexOfChildren( childItem, childPath, item );
                if ( rc != -1 )
                {
                    index=rc;
                    return index;
                }
            }
        }
    }

    return undefined;
};

VG.Controller.Tree.prototype.parentOfItem=function( item )
{
    var index=this.indexOf( item );

    if ( index !== undefined ) {
        var array=index.split( '.' );
        array.splice( -1, 1 );

        return this.at( array.join( '.' ) );
    }
    
    return undefined;
};

VG.Controller.Tree.prototype.topLevelIndexOfIndex=function( index )
{
    if ( index === undefined ) {
        if ( this.selected )
            index=this.indexOf( this.selected );
    }

    if ( index )
    {
        if ( index.indexOf( '' ) === -1 ) return index;
        else
        {
            var array=index.split('');
            return array[0];
        }
    }
};
