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

VG.Data = {};

VG.Data.Binding=function( object, path )
{
    if ( !(this instanceof VG.Data.Binding) ) return new VG.Data.Binding();
    
    this.object=object;
    this.path=path;
};

VG.Data.Base=function()
{
    if ( !(this instanceof VG.Data.Base) ) return new VG.Data.Base();

	Object.defineProperty( this, "__vgControllerBindings", { 
        enumerable: false, 
        writable: true
    });

	Object.defineProperty( this, "__vgValueBindings", { 
    	enumerable: false, 
        writable: true
    });

    Object.defineProperty( this, "__vgUndo", { 
        enumerable: false, 
        writable: true
    });

    this.__vgControllerBindings=[];
    this.__vgValueBindings=[];
};

VG.Data.Base.prototype.addControllerForPath=function( controller, path )
{
	var binding=new VG.Data.Binding( controller, path );
	this.__vgControllerBindings.push( binding );
};

VG.Data.Base.prototype.addValueBindingForPath=function( object, path )
{
	var binding=new VG.Data.Binding( object, path );
	this.__vgValueBindings.push( binding );
};

VG.Data.Base.prototype.removeAllValueBindingsForPath=function( path )
{
    //console.log( "removeAllValueBindingsForPath", path );

    var array=[];

    for( var i=0; i < this.__vgValueBindings.length; ++i ) {
        var bind=this.__vgValueBindings[i];
        if ( path !== bind.path ) array.push( bind );
    }    
    this.__vgValueBindings=array;    
};

VG.Data.Base.prototype.controllerForPath=function( path )
{
	for( var i=0; i < this.__vgControllerBindings.length; ++i ) {
		var cont=this.__vgControllerBindings[i];
		if ( path === cont.path ) return cont;
	}
	return 0;
};

VG.Data.Base.prototype.valueBindingForPath=function( path )
{
    for( var i=0; i < this.__vgValueBindings.length; ++i ) {
        var valueBinding=this.__vgValueBindings[i];
        if ( path === valueBinding.path ) return valueBinding;
    }
    return 0;
};

VG.Data.Base.prototype.dataForPath=function( path )
{
    if ( path.indexOf( '.' ) === -1 ) return this[path];
    else {
    	var object=this.objectForPath( path );

    	if ( object ) {
	    	return object[this.valueSegmentOfPath(path)];
    	} 
/*
        else {
            var controller=this.controllerForPath( path );

            if ( controller )
            {
                object=controller.object.selected;

                //console.log( controller.path );
                console.log( "dataForPath returning", controller.path, controller.object, controller.object.selected );
                return object[this.valueSegmentOfPath(path)];

                if ( !object ) return null;
                else return object;
            }
        }*/
    }

    return null;
};

VG.Data.Base.prototype.storeDataForPath=function( path, value, noUndo )
{
    if ( path.indexOf( '.' ) === -1 ) this[path]=value;
    else {
    	var object=this.objectForPath( path );
    	if ( object ) {

            if ( object[this.valueSegmentOfPath(path)] !== value ) {

                if ( this.__vgUndo && !noUndo ) this.__vgUndo.pathValueAboutToChange( this, path, value );
                object[this.valueSegmentOfPath(path)]=value;
            }
    	}
    }
};

VG.Data.Base.prototype.objectForPath=function( path )
{
	var parts=path.split( '.' );
	var object=null;
	var travelingPath="";

    for( var i=0; i < parts.length-1; ++i ) {
    	var segment=parts[i];

		if ( object ) travelingPath+=".";
		travelingPath+=segment;

		var controller=this.controllerForPath( travelingPath );
		if ( controller ) {
			object=controller.object.selected;
			if ( !object ) return null;
		} else return null;
    }

	return object;
};

VG.Data.Base.prototype.valueSegmentOfPath=function( path )
{
	if ( path.indexOf( '.' ) === -1 ) return path;

	var parts=path.split( '.' );
	return parts[parts.length-1];
};

/**
 * Update the top level bindings after the model changed from the outside, like after "New" and "Open" operations.
 * <br><br>
 */

VG.Data.Base.prototype.updateTopLevelBindings=function()
{
    for( var i=0; i < this.__vgControllerBindings.length; ++i ) {
        var cont=this.__vgControllerBindings[i];

        if  ( cont.path.indexOf(".") === -1 ) {
            cont.object.selected=0;
        }

        if ( cont.object.modelChanged ) cont.object.modelChanged();
    }
};

VG.Data.Base.prototype.clearUndo=function()
{
    if ( this.__vgUndo ) 
        this.__vgUndo.clear();
};

// -------------

VG.Data.Collection=function( name )
{
    if ( !(this instanceof VG.Data.Collection) ) return new VG.Data.Collection( name );

    VG.Data.Base.call( this );
};

VG.Data.Collection.prototype=VG.Data.Base();
