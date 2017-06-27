/*
 * (C) Copyright 2014-2017 Markus Moenig <markusm@visualgraphics.tv>.
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

// --------------------------------------------- VG.Controller.Node

VG.Controller.Node=function( collection, path, graph )
{
    if ( !(this instanceof VG.Controller.Node) ) return new VG.Controller.Node( collection, path, graph );

    VG.Controller.Base.call( this );

    this.collection=collection;
    this.path=path;
    this.contentClassName="";
    this.graph=graph;

    // ---

    this.multiSelection=false;

    this._selected=0;
    this.selection=[];

    // --- Init possible OberverKeys

    this.addObserverKey( "parentSelectionChanged" );
    this.addObserverKey( "selectionChanged" );
    this.addObserverKey( "addItem" );
    this.addObserverKey( "removeItem" );
    this.addObserverKey( "changed" );
};

VG.Controller.Node.prototype=VG.Controller.Base();

Object.defineProperty( VG.Controller.Node.prototype, "length",
{
    get: function() {
        var array=this.collection.dataForPath( this.path ).nodes;
        if ( array ) return array.length;
        else return 0;
    }
});

VG.Controller.Node.prototype.at=function( index )
{
    var array=this.collection.dataForPath( this.path ).nodes;

    if ( index < 0 || index >= array.length ) return undefined;

    return array[index];
};

VG.Controller.Node.prototype.add=function( item, noUndo )
{
    var array=this.collection.dataForPath( this.path ).nodes;
    if ( !array ) { VG.error( "VG.Controller.Node.add() : Controller has no content!" ); return; }

    if ( item.node )
    {
        this.graph.addNode( item.node );
    } else
    if ( item.className )
    {
        Object.defineProperty( item, "node", {
            enumerable: false,
            writable: true
        });

        item.node=new VG.Nodes[item.className]();
        item.node.data=item;

        if ( item.node.createProperties )
            item.node.createProperties( item );

        if ( item.node.updateFromData )
            item.node.updateFromData( item );

        this.graph.addNode( item.node, true );
        item.node.readConnections();
    }

    this.notifyObservers( "addItem", item );

    array.push( item );

    if ( this.collection.__vgUndo && !noUndo )
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Add, this.path, array.length-1, JSON.stringify( item ) );

    this.notifyObservers( "changed" );
    return item;
};

VG.Controller.Node.prototype.insert=function( index, item, noUndo )
{
    var array=this.collection.dataForPath( this.path ).nodes;

    if ( item.node )
    {
        this.graph.addNode( item.node );
    } else
    {
        Object.defineProperty( item, "node", {
            enumerable: false,
            writable: true
        });

        item.node=new VG.Nodes[item.className]();
        item.node.data=item;

        if ( item.node.createProperties )
            item.node.createProperties( item );

        if ( item.node.updateFromData )
            item.node.updateFromData( item );

        this.graph.addNode( item.node, true );
        item.node.readConnections();
    }

    this.notifyObservers( "addItem", item );
    array.splice( index, 0, item );

    if ( this.collection.__vgUndo && !noUndo )
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Add, this.path, array.length-1, JSON.stringify( item ) );

    this.notifyObservers( "changed" );
    return item;
};

VG.Controller.Node.prototype.remove=function( item, noUndo )
{
    var array=this.collection.dataForPath( this.path ).nodes;

    item.node.disconnectAll();
    this.notifyObservers( "removeItem", item );

    var index=array.indexOf( item );
    if ( index >= 0 )
        array.splice( index, 1 );

    this.graph.nodes.delete( item.id );

    if ( this.collection.__vgUndo && !noUndo )
        this.collection.__vgUndo.controllerProcessedItem( this, VG.Data.UndoItem.ControllerAction.Remove, this.path, index, JSON.stringify( item ) );

    this.notifyObservers( "changed" );

    if ( index-1 < array.length && index-1 >= 0 )
        this.selected=array[index-1];
    else
        this.selected=array[index];

    this.removeFromSelection( item );
};

VG.Controller.Node.prototype.changeProperty=function( index, name, data, noUndo )
{
    var array=this.collection.dataForPath( this.path ).nodes;
    var item=array[index];

    if ( data !== null && typeof data === 'object' )
    {
        // --- Object, need to copy content
        var obj=item[name];
        for( var prop in data ) obj[prop]=data[prop];
    } else item[name]=data;

    if ( item.node.updateFromData )
        item.node.updateFromData( item );

    this.selected=item;

    this.notifyObservers( "selectionChanged" );
    this.notifyObservers( "changed" );
    return item;
};

VG.Controller.Node.prototype.keyAdd=function( index, name, data, noUndo )
{
    var array=this.collection.dataForPath( this.path ).nodes;
    var item=array[index];

    var param=item.node.container.getParam( name );
    item.node.container.addKeyFrame( data._frame, param, data[name], true );
    this.notifyObservers( "changed" );
    return item;
};

VG.Controller.Node.prototype.keyRemove=function( index, name, data, noUndo )
{
    var array=this.collection.dataForPath( this.path ).nodes;
    var item=array[index];

    item.node.container.removeKeyFrameAt( data._frame, true );
    this.notifyObservers( "changed" );
    return item;
};

VG.Controller.Node.prototype.keyChange=function( index, name, data, noUndo )
{
    var array=this.collection.dataForPath( this.path ).nodes;
    var item=array[index];

    let param=item.node.container.getParam( name );
    let key=item.node.container.keyFrameAt( param.data, data._frame );

    for( var prop in data ) key[prop]=data[prop];

    VG.update();
    this.notifyObservers( "changed" );
    return item;
};

VG.Controller.Node.prototype.disconnect=function( index, name, data, noUndo )
{
    var array=this.collection.dataForPath( this.path ).nodes;
    var item=array[index];

    var sourceNode, destNode;
    if ( data.nodeId === -1 ) sourceNode=this.graph.previewNode; else sourceNode=this.graph.nodes.get( data.nodeId );
    if ( !sourceNode ) VG.error( "VG.Controller.Node::disconnect Cannot find source node" );
    if ( data.connNodeId === -1 ) destNode=this.graph.previewNode; else destNode=this.graph.nodes.get( data.connNodeId );
    if ( !destNode ) VG.error( "VG.Controller.Node::disconnect Cannot find dest node" );

    var sourceTerminal=sourceNode.getTerminal( data.terminalName );
    var destTerminal=destNode.getTerminal( data.connTerminalName );

    sourceTerminal.disconnectFrom( destTerminal );

    this.notifyObservers( "changed" );
    return item;
};

VG.Controller.Node.prototype.connect=function( index, name, data, noUndo )
{
    var array=this.collection.dataForPath( this.path ).nodes;
    var item=array[index];

    var sourceNode, destNode;
    if ( data.nodeId === -1 ) sourceNode=this.graph.previewNode; else sourceNode=this.graph.nodes.get( data.nodeId );
    if ( !sourceNode ) VG.error( "VG.Controller.Node::connect Cannot find source node" );
    if ( data.connNodeId === -1 ) destNode=this.graph.previewNode; else destNode=this.graph.nodes.get( data.connNodeId );
    if ( !destNode ) VG.error( "VG.Controller.Node::connect Cannot find dest node" );

    var sourceTerminal=sourceNode.getTerminal( data.terminalName );
    var destTerminal=destNode.getTerminal( data.connTerminalName );

    sourceTerminal.connectTo( destTerminal );

    this.notifyObservers( "changed" );
    return item;
};

VG.Controller.Node.prototype.modelChanged=function( forceRenew )
{
    var data=this.collection.dataForPath( this.path );
    var array;

    if ( !data || !this.graph ) return;
    else array=data.nodes;

    if ( this.graph.previewNode )
        this.graph.previewNode.disconnectAll();

    if ( !array || !array.length ) this.graph.clear();
    else
    {
        // --- Initialize new Nodes in controller
        var i, item;
        for( i=0; i < array.length; ++i )
        {
            item=array[i];

            if ( !item.node || forceRenew )
            {
                Object.defineProperty( item, "node", {
                    enumerable: false,
                    writable: true
                });

                Object.defineProperty( item, "readConnections", {
                    enumerable: false,
                    writable: true
                });

                item.node=new VG.Nodes[item.className]();
                item.node.data=item;

                if ( item.node.createProperties )
                    item.node.createProperties( item );

                if ( item.node.updateFromData )
                    item.node.updateFromData( item );

                this.graph.addNode( item.node, true );
                item.readConnections=true;

                this.notifyObservers( "addItem", item );
            }
        }

        // --- Connect new Nodes in controller
        for( i=0; i < array.length; ++i )
        {
            item=array[i];

            if ( item.readConnections ) {
                item.node.readConnections( true );
                item.readConnections=false;
            }
        }
    }

    this.notifyObservers( "changed" );
};

VG.Controller.Node.prototype.syncGraph=function()
{
    var data=this.collection.dataForPath( this.path );
    var array;

    if ( !data ) return;
    else array=data.nodes;

    this.graph.nodes.clear();

    if ( !array ) return;
    for( var i=0; i < array.length; ++i )
    {
        var item=array[i];

        if ( item.node ) this.graph.nodes.set( item.node.data.id, item.node );
        else { this.modelChanged(); return; }

    }
};

VG.Controller.Node.prototype.create=function( strClass )
{
    var args = Array.prototype.slice.call(arguments, 1);
    var clsClass = eval( strClass );

    function F() {
        return clsClass.apply(this, args);
    }
    F.prototype = clsClass.prototype;

    return new F();
};

Object.defineProperty( VG.Controller.Node.prototype, "selected",
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

VG.Controller.Node.prototype.addToSelection=function( item )
{
    if ( !this._selected ) this._selected=item;

    var index=this.selection.indexOf( item );
    if ( index === -1 && item )
        this.selection.push( item );

    this.notifyObservers( "selectionChanged" );
};

VG.Controller.Node.prototype.removeFromSelection=function( item )
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

VG.Controller.Node.prototype.isSelected=function( item )
{
    var index=this.selection.indexOf( item );

    if ( index === -1 ) return false;
    else return true;
};

VG.Controller.Node.prototype.canRemove=function()
{
    if ( this.selected ) return true;
    else return false;
};

VG.Controller.Node.prototype.indexOf=function( item )
{
    var array=this.collection.dataForPath( this.path ).nodes;
    return array.indexOf( item );
};

VG.Controller.Node.prototype.isValid=function()
{
    var data=this.collection.dataForPath( this.path );
    if ( !data || !data.nodes ) return false; else return true;
};