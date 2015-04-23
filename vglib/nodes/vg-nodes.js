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

// ----------------------------------------------------------------- VG.Nodes.NodeFloat --- Primitive.Float

VG.Nodes.NodeFloat=function()
{   
    if ( !(this instanceof VG.Nodes.NodeFloat ) ) return new VG.Nodes.NodeFloat();

    VG.Nodes.Node.call( this );

    this.name="Float";
    this.className="NodeFloat";

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "out", function() {
        return this.container.getParamValue( "value" );
    }.bind( this ) ) );
};

VG.Nodes.NodeFloat.prototype=VG.Nodes.Node();

VG.Nodes.NodeFloat.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "settings", "Settings" );

    group.addParam( VG.Nodes.ParamNumber( data, "value", "Value", 1.0 ) );
};

// ----------------------------------------------------------------- VG.Nodes.NodeVector2 --- Primitive.Vector2

VG.Nodes.NodeVector2=function()
{   
    if ( !(this instanceof VG.Nodes.NodeVector2 ) ) return new VG.Nodes.NodeVector2();

    VG.Nodes.Node.call( this );

    this.name="Vector2";
    this.className="NodeVector2";

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector2, "out", function() {
        return this.container.getParamValue( "value" );
    }.bind( this ) ) );
};

VG.Nodes.NodeVector2.prototype=VG.Nodes.Node();

VG.Nodes.NodeVector2.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "settings", "Settings" );

    group.addParam( VG.Nodes.ParamVector2( data, "value", "Value", 1.0, 1.0 ) );
};

// ----------------------------------------------------------------- VG.Nodes.NodeVector2Breaker --- Breaker.Vector2

VG.Nodes.NodeVector2Breaker=function()
{   
    if ( !(this instanceof VG.Nodes.NodeVector2Breaker ) ) return new VG.Nodes.NodeVector2Breaker();

    this.name="Vector2Breaker";
    this.className="NodeVector2Breaker";

    VG.Nodes.Node.call( this );

    // --- Input Terminal

    this.inputTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector2, "vector2" );
    this.addInput( this.inputTerminal );   

    // --- Output Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "x", function() {
        if ( this.inputTerminal.isConnected() ) return this.inputTerminal.connectedTo[0].onCall().x;
        else return undefined;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "y", function() {
        if ( this.inputTerminal.isConnected() ) return this.inputTerminal.connectedTo[0].onCall().y;
        else return undefined;
    }.bind( this ) ) );
};

VG.Nodes.NodeVector2Breaker.prototype=VG.Nodes.Node();

// ----------------------------------------------------------------- VG.Nodes.NodeVector2Maker --- Maker.Vector2

VG.Nodes.NodeVector2Maker=function()
{   
    if ( !(this instanceof VG.Nodes.NodeVector2Maker ) ) return new VG.Nodes.NodeVector2Maker();

    this.name="Vector2Maker";
    this.className="NodeVector2Maker";

    VG.Nodes.Node.call( this );

    this.vector=new VG.Math.Vector2();

    // --- Input Terminals

    this.xTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "x" );
    this.addInput( this.xTerminal );
    this.yTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "y" );
    this.addInput( this.yTerminal );

    // --- Output Terminal

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector2, "out", function() {
        if ( this.xTerminal.isConnected() ) this.vector.x=this.xTerminal.connectedTo[0].onCall();
        if ( this.yTerminal.isConnected() ) this.vector.y=this.yTerminal.connectedTo[0].onCall();
        return this.vector;
    }.bind( this ) ) );

};

VG.Nodes.NodeVector2Maker.prototype=VG.Nodes.Node();

// ----------------------------------------------------------------- VG.Nodes.NodeVector3 --- Primitive.Vector3

VG.Nodes.NodeVector3=function()
{   
    if ( !(this instanceof VG.Nodes.NodeVector3 ) ) return new VG.Nodes.NodeVector3();

    this.name="Vector3";
    this.className="NodeVector3";

    VG.Nodes.Node.call( this );

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "out", function() {
        return this.container.getParamValue( "value" );
    }.bind( this ) ) );
};

VG.Nodes.NodeVector3.prototype=VG.Nodes.Node();

VG.Nodes.NodeVector3.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "settings", "Settings" );

    group.addParam( VG.Nodes.ParamVector3( data, "value", "Value", 1.0, 1.0, 1.0 ) );
};

// ----------------------------------------------------------------- VG.Nodes.NodeVector3Breaker --- Breaker.Vector3

VG.Nodes.NodeVector3Breaker=function()
{   
    if ( !(this instanceof VG.Nodes.NodeVector3Breaker ) ) return new VG.Nodes.NodeVector3Breaker();

    this.name="Vector3Breaker";
    this.className="NodeVector3Breaker";

    VG.Nodes.Node.call( this );

    // --- Input Terminal

    this.inputTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "vector3" );
    this.addInput( this.inputTerminal );   

    // --- Output Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "x", function() {
        if ( this.inputTerminal.isConnected() ) return this.inputTerminal.connectedTo[0].onCall().x;
        else return undefined;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "y", function() {
        if ( this.inputTerminal.isConnected() ) return this.inputTerminal.connectedTo[0].onCall().y;
        else return undefined;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "z", function() {
        if ( this.inputTerminal.isConnected() ) return this.inputTerminal.connectedTo[0].onCall().z;
        else return undefined;
    }.bind( this ) ) ); 
};

VG.Nodes.NodeVector3Breaker.prototype=VG.Nodes.Node();

// ----------------------------------------------------------------- VG.Nodes.NodeVector3Maker --- Maker.Vector3

VG.Nodes.NodeVector3Maker=function()
{   
    if ( !(this instanceof VG.Nodes.NodeVector3Maker ) ) return new VG.Nodes.NodeVector3Maker();

    this.name="Vector3Maker";
    this.className="NodeVector3Maker";

    VG.Nodes.Node.call( this );

    this.vector=new VG.Math.Vector3();

    // --- Input Terminals

    this.xTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "x" );
    this.addInput( this.xTerminal );
    this.yTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "y" );
    this.addInput( this.yTerminal );
    this.zTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "z" );
    this.addInput( this.zTerminal );

    // --- Output Terminal

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "out", function() {
        if ( this.xTerminal.isConnected() ) this.vector.x=this.xTerminal.connectedTo[0].onCall();
        if ( this.yTerminal.isConnected() ) this.vector.y=this.yTerminal.connectedTo[0].onCall();
        if ( this.zTerminal.isConnected() ) this.vector.z=this.zTerminal.connectedTo[0].onCall();
        return this.vector;
    }.bind( this ) ) );

};

VG.Nodes.NodeVector3Maker.prototype=VG.Nodes.Node();

// ----------------------------------------------------------------- VG.Nodes.NodeVector4 --- Primitive.Vector4

VG.Nodes.NodeVector4=function()
{   
    if ( !(this instanceof VG.Nodes.NodeVector4 ) ) return new VG.Nodes.NodeVector4();

    this.name="Vector4";
    this.className="NodeVector4";

    VG.Nodes.Node.call( this );

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector4, "out", function() {
        return this.container.getParamValue( "value" );
    }.bind( this ) ) );
};

VG.Nodes.NodeVector4.prototype=VG.Nodes.Node();

VG.Nodes.NodeVector4.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "settings", "Settings" );

    group.addParam( VG.Nodes.ParamVector4( data, "value", "Value", 1.0, 1.0, 1.0, 1.0 ) );    
};

// ----------------------------------------------------------------- VG.Nodes.NodeVector4Breaker --- Breaker.Vector4

VG.Nodes.NodeVector4Breaker=function()
{   
    if ( !(this instanceof VG.Nodes.NodeVector4Breaker ) ) return new VG.Nodes.NodeVector4Breaker();

    this.name="Vector4Breaker";
    this.className="NodeVector4Breaker";

    VG.Nodes.Node.call( this );

    // --- Input Terminal

    this.inputTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector4, "vector4" );
    this.addInput( this.inputTerminal );   

    // --- Output Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "x", function() {
        if ( this.inputTerminal.isConnected() ) return this.inputTerminal.connectedTo[0].onCall().x;
        else return undefined;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "y", function() {
        if ( this.inputTerminal.isConnected() ) return this.inputTerminal.connectedTo[0].onCall().y;
        else return undefined;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "z", function() {
        if ( this.inputTerminal.isConnected() ) return this.inputTerminal.connectedTo[0].onCall().z;
        else return undefined;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "w", function() {
        if ( this.inputTerminal.isConnected() ) return this.inputTerminal.connectedTo[0].onCall().w;
        else return undefined;
    }.bind( this ) ) );    
};

VG.Nodes.NodeVector4Breaker.prototype=VG.Nodes.Node();

// ----------------------------------------------------------------- VG.Nodes.NodeVector4Breaker --- Maker.Vector4

VG.Nodes.NodeVector4Maker=function()
{   
    if ( !(this instanceof VG.Nodes.NodeVector4Maker ) ) return new VG.Nodes.NodeVector4Maker();

    this.name="Vector4Maker";
    this.className="NodeVector4Maker";

    VG.Nodes.Node.call( this );

    this.vector=new VG.Math.Vector4();

    // --- Input Terminals

    this.xTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "x" );
    this.addInput( this.xTerminal );
    this.yTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "y" );
    this.addInput( this.yTerminal );
    this.zTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "z" );
    this.addInput( this.zTerminal );
    this.wTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "w" );
    this.addInput( this.wTerminal );

    // --- Output Terminal

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector4, "out", function() {
        if ( this.xTerminal.isConnected() ) this.vector.x=this.xTerminal.connectedTo[0].onCall();
        if ( this.yTerminal.isConnected() ) this.vector.y=this.yTerminal.connectedTo[0].onCall();
        if ( this.zTerminal.isConnected() ) this.vector.z=this.zTerminal.connectedTo[0].onCall();
        if ( this.wTerminal.isConnected() ) this.vector.w=this.wTerminal.connectedTo[0].onCall();
        return this.vector;
    }.bind( this ) ) );

};

VG.Nodes.NodeVector4Maker.prototype=VG.Nodes.Node();

// ----------------------------------------------------------------- VG.Nodes.NodeColor --- Primitive.Color

VG.Nodes.NodeColor=function()
{   
    if ( !(this instanceof VG.Nodes.NodeColor ) ) return new VG.Nodes.NodeColor();

    this.name="Color";
    this.className="NodeColor";

    VG.Nodes.Node.call( this );

    this.vector4=new VG.Math.Vector4();

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Sample2D, "Sample2D", function() {
        return this.container.getParamValue( "color" );
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector4, "Vector4", function() {
        var color=this.container.getParamValue( "color" );
        this.vector4.set( color.r, color.g, color.b, color.a );
        return this.vector4;
    }.bind( this ) ) );
};

VG.Nodes.NodeColor.prototype=VG.Nodes.Node();

VG.Nodes.NodeColor.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "settings", "Settings" );

    group.addParam( VG.Nodes.ParamColor( data, "color", "Color", VG.Core.Color( "#000000" ) ) );    
};

// ----------------------------------------------------------------- VG.Nodes.NodeCheckerGen --- Generator.Checker

VG.Nodes.NodeCheckerGen=function()
{   
    if ( !(this instanceof VG.Nodes.NodeCheckerGen ) ) return new VG.Nodes.NodeCheckerGen();

    this.name="Checker Generator";
    this.className="NodeCheckerGen";

    VG.Nodes.Node.call( this );
    this.size=new VG.Math.Vector2();

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Sample2D, "out", function( vector ) {

        if ( !( Math.floor( vector.x / this.container.getParamValue( "width" ) ) % 2 ) ) 
        {
            if ( !( Math.floor( vector.y / this.container.getParamValue( "height" ) ) % 2 ) ) return this.container.getParamValue( "color1" );
                else return this.container.getParamValue( "color2" );
        } else
        {
            if ( !( Math.floor( vector.y / this.container.getParamValue( "height" ) ) % 2 ) ) return this.container.getParamValue( "color2" );
                else return this.container.getParamValue( "color1" );
        }

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector2, "size", function( vector ) {
        this.size.set( this.container.getParamValue( "width" ) * 2, this.container.getParamValue( "height" ) * 2 );
        return this.size;
    }.bind( this ) ) );       
};

VG.Nodes.NodeCheckerGen.prototype=VG.Nodes.Node();

VG.Nodes.NodeCheckerGen.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "settings", "Settings" );

    group.addParam( VG.Nodes.ParamNumber( data, "width", "Tile Width", 20, 1, 100 ) );
    group.addParam( VG.Nodes.ParamNumber( data, "height", "Tile Height", 20, 1, 100 ) );
    group.addParam( VG.Nodes.ParamColor( data, "color1", "Color 1", VG.Core.Color( "#ffffff" ) ) );
    group.addParam( VG.Nodes.ParamColor( data, "color2", "Color 2", VG.Core.Color( "#000000" ) ) );    
};

// ----------------------------------------------------------------- VG.Nodes.NodeImage --- Image

VG.Nodes.NodeImage=function()
{   
    if ( !(this instanceof VG.Nodes.NodeImage ) ) return new VG.Nodes.NodeImage();

    this.name="Image";
    this.className="NodeImage";

    VG.Nodes.Node.call( this );

    this.color=VG.Core.Color();
    this.size=new VG.Math.Vector2();

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Sample2D, "out", function( vector ) {

        var image=this.container.getParam( "image" ).value;

        if ( image.width && image.height ) {
            image.getPixel( vector.x, vector.y, this.color );
        } else this.color.set( 0, 0, 0, 1 );

        return this.color;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector2, "size", function( vector ) {

        var image=this.container.getParam( "image" ).value;
        this.size.set( image.width, image.height );

        return this.size;
    }.bind( this ) ) );    
};

VG.Nodes.NodeImage.prototype=VG.Nodes.Node();

VG.Nodes.NodeImage.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "settings", "Settings" );

    group.addParam( VG.Nodes.ParamImage( data, "image", "Image" ) );
};

VG.Nodes.NodeImage.prototype.updateFromData=function( data )
{
    // --- Update the image data after undo / redo and load operations

    var param=this.container.getParam( "image" );
    param.updateFromData( param.data );
};

// ---

VG.Nodes.availableNodes.set( "Primitive.Float", "NodeFloat" );
VG.Nodes.availableNodes.set( "Primitive.Vector2", "NodeVector2" );
VG.Nodes.availableNodes.set( "Primitive.Vector3", "NodeVector3" );
VG.Nodes.availableNodes.set( "Primitive.Vector4", "NodeVector4" );
VG.Nodes.availableNodes.set( "Primitive.Color", "NodeColor" );
VG.Nodes.availableNodes.set( "Breaker.Vector2", "NodeVector2Breaker" );
VG.Nodes.availableNodes.set( "Breaker.Vector3", "NodeVector3Breaker" );
VG.Nodes.availableNodes.set( "Breaker.Vector4", "NodeVector4Breaker" );
VG.Nodes.availableNodes.set( "Maker.Vector2", "NodeVector2Maker" );
VG.Nodes.availableNodes.set( "Maker.Vector3", "NodeVector3Maker" );
VG.Nodes.availableNodes.set( "Maker.Vector4", "NodeVector4Maker" );
VG.Nodes.availableNodes.set( "Generator.Checker", "NodeCheckerGen" );
VG.Nodes.availableNodes.set( "Image", "NodeImage" );
