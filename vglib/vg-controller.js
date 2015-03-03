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

VG.Controller = {};

VG.Controller.Observer=function( func, context )
{
    if ( !(this instanceof VG.Controller.Observer) ) return new VG.Controller.Observer();
    
    this.func=func;

    if ( context === undefined ) this.context=VG.context;
    else this.context=context;
};

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


VG.Controller.Base.prototype.addObserver=function( key, func, context )
{
	if ( this.observerKeys.indexOf( key ) !== -1 ) {
		this[key].push( new VG.Controller.Observer( func, context ) );
	}
};

VG.Controller.Base.prototype.notifyObservers=function( key )
{
	if ( this.observerKeys.indexOf( key ) !== -1 ) {
		for( var i=0; i < this[key].length; ++i ) {
			var observer=this[key][i];
			observer.func.call( observer.context );
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
						//console.log( "Value Binding Needs Update: " + binding.path );

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

// --------------------------------------------- VG.Controller.Array

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

VG.Controller.Array.prototype.at=function( index )
{
    var array=this.collection.dataForPath( this.path );

    if ( index < 0 || index >= array.length ) return undefined;

    return array[index];
};

VG.Controller.Array.prototype.add=function( item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    if ( item === undefined && this.contentClassName.length ) {
    	item=this.create( this.contentClassName );
    }

    array.push( item );

    if ( this.collection.__vgUndo && !noUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Add, this.path, array.length-1, JSON.stringify( item ) );

	this.notifyObservers( "changed" );    
    return item;
};

VG.Controller.Array.prototype.insert=function( index, item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    if ( item === undefined && this.contentClassName.length ) {
        item=this.create( this.contentClassName );
    }

    array.splice( index, 0, item );

    if ( this.collection.__vgUndo && !noUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Add, this.path, array.length-1, JSON.stringify( item ) );

    this.notifyObservers( "changed" );    
    return item;
};

VG.Controller.Array.prototype.remove=function( item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    var index=array.indexOf( item );
    if ( index >= 0 )
        array.splice( index, 1 );

    if ( this.collection.__vgUndo && !noUndo ) 
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Remove, this.path, index, JSON.stringify( item ) );

	this.notifyObservers( "changed" );

    if ( index-1 < array.length )
    	this.selected=array[index-1];
    else

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

VG.Controller.Array.prototype.addToSelection=function( item )
{
	if ( !this._selected ) this._selected=item;

    var index=this.selection.indexOf( item );
    if ( index === -1 && item )	
		this.selection.push( item );

	this.notifyObservers( "selectionChanged" );	
};

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

VG.Controller.Array.prototype.isSelected=function( item )
{
    var index=this.selection.indexOf( item );

    if ( index === -1 ) return false;
    else return true;
};

VG.Controller.Array.prototype.canRemove=function()
{
	if ( this.selected ) return true;
	else return false;
};

VG.Controller.Array.prototype.indexOf=function( item )
{
    var array=this.collection.dataForPath( this.path );
    return array.indexOf( item );
};

// --------------------------------------------- VG.Controller.Tree

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
};

VG.Controller.Tree.prototype=VG.Controller.Base();

Object.defineProperty( VG.Controller.Tree.prototype, "length", 
{
    get: function() {
        var array=this.collection.dataForPath( this.path );
        return array.length;
    }   
});

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

    //console.log( "at", String( index ), item.text );

    return item; 
};

VG.Controller.Tree.prototype.add=function( index, item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    if ( item === undefined && this.contentClassName.length ) {
        item=this.create( this.contentClassName );
    }

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

VG.Controller.Tree.prototype.insert=function( index, item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    if ( item === undefined && this.contentClassName.length ) {
        item=this.create( this.contentClassName );
    }

    // --- Insert the item

    var itemIndex;
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
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Add, this.path, itemIndex, JSON.stringify( item ) );

    this.notifyObservers( "changed" );    
    return item;
};

VG.Controller.Tree.prototype.remove=function( item, noUndo )
{
    var array=this.collection.dataForPath( this.path );

    var index=this.indexOf( item );
    var itemArray=this.arrayOfItem( item );

    if ( itemArray )
    {
        itemArray.splice( itemArray.indexOf( item ), 1 );

        if ( this.collection.__vgUndo && !noUndo ) 
            this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Remove, this.path, index, JSON.stringify( item ) );

        this.notifyObservers( "changed" );
        this.removeFromSelection( item );
    }
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

VG.Controller.Tree.prototype.addToSelection=function( item )
{
    if ( !this._selected ) this._selected=item;

    var index=this.selection.indexOf( item );
    if ( index === -1 && item ) 
        this.selection.push( item );

    this.notifyObservers( "selectionChanged" ); 
};

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

VG.Controller.Tree.prototype.isSelected=function( item )
{
    var index=this.selection.indexOf( item );

    if ( index === -1 ) return false;
    else return true;
};

VG.Controller.Tree.prototype.canRemove=function()
{
    if ( this.selected ) return true;
    else return false;
};

VG.Controller.Tree.prototype.arrayOfItemChildren=function( curItem, item )
{
    //console.log( "indexOfChildren", path, curItem );

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
    //console.log( "indexOfChildren", path, curItem );

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

VG.Controller.Tree.prototype.indexOf=function( item )
{
    var array=this.collection.dataForPath( this.path );

    var pathArray;
    var index=0;

    index=index.toString();

    if ( array.indexOf( item ) !== -1 )
        index=array.indexOf( item ).toString();
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
                    break;
                }
            }
        }
    }

    return index;
};