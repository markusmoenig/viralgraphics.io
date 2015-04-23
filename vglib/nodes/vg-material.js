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

// ----------------------------------------------------------------- VG.Material --- Maybe move into VG.Core ?

VG.Material=function()
{
    this.color=VG.Core.Color( 128, 128, 128, 255 );
    this.specular=0.0;
    this.glossiness=0.0;
    this.normal=new VG.Math.Vector3();
    this.luminosity=new VG.Math.Vector3();
    this.reflect=new VG.Math.Vector3();
};

// ----------------------------------------------------------------- VG.Nodes.NodeCheckerGen --- Generator.Checker

VG.Nodes.NodeMaterial=function()
{   
    if ( !(this instanceof VG.Nodes.NodeMaterial ) ) return new VG.Nodes.NodeMaterial();

    VG.Nodes.Node.call( this );

    this.name="Material";
    this.className="NodeMaterial";

    this.material=new VG.Material();

    // --- Input Terminal: Color
    this.colTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Sample2D, "color", null, function() {
        // --- onConnect
        this.container.getParam( "color" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "color" ).disabled=false;
    }.bind( this ) );
    this.addInput( this.colTerminal );

    // --- Input Terminal: Specular
    this.specTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "specular", null, function() {
        // --- onConnect
        this.container.getParam( "specular" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "specular" ).disabled=false;
    }.bind( this ) );  
    this.addInput( this.specTerminal );

    // --- Input Terminal: Glossiness
    this.glossTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "glossiness", null, function() {
        // --- onConnect
        this.container.getParam( "glossiness" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "glossiness" ).disabled=false;
    }.bind( this ) );  
    this.addInput( this.glossTerminal );    

    // --- Input Terminal: Normal
    this.normTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "normal", null, function() {
        // --- onConnect
        this.container.getParam( "normal" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "normal" ).disabled=false;
    }.bind( this ) );    
    this.addInput( this.normTerminal );

    // --- Input Terminal: Luminosity
    this.lumTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "luminosity", null, function() {
        // --- onConnect
        this.container.getParam( "luminosity" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "luminosity" ).disabled=false;
    }.bind( this ) );    
    this.addInput( this.lumTerminal );

    // --- Input Terminal: Reflect
    this.reflTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Sample3D, "reflect", null, function() {
        // --- onConnect
        this.container.getParam( "reflect" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "reflect" ).disabled=false;
    }.bind( this ) );    
    this.addInput( this.reflTerminal );    

    // --- Output Terminal

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Material, "out", function( vector ) {

        // --- Color Value
        if ( this.colTerminal.isConnected() ) this.material.color.set( this.colTerminal.connectedTo[0].onCall( vector ) );
        else this.material.color.set( this.container.getParamValue( "color" ) );

        // --- Specular Value
        if ( this.specTerminal.isConnected() ) this.material.specular=this.specTerminal.connectedTo[0].onCall();
        else this.material.specular=this.container.getParamValue( "specular" );    

        // --- Glossiness Value
        if ( this.glossTerminal.isConnected() ) this.material.glossiness=this.glossTerminal.connectedTo[0].onCall();
        else this.material.glossiness=this.container.getParamValue( "glossiness" );        

        // --- Normal Value
        if ( this.normTerminal.isConnected() ) this.material.normal.copy( this.normTerminal.connectedTo[0].onCall() );
        else this.material.normal.copy( this.container.getParamValue( "normal" ) );

        // --- Luminosity Value
        if ( this.lumTerminal.isConnected() ) this.material.luminosity.copy( this.lumTerminal.connectedTo[0].onCall() );
        else this.material.luminosity.copy( this.container.getParamValue( "luminosity" ) );

        // --- reflect Value
        if ( this.reflTerminal.isConnected() ) this.material.reflect.copy( this.reflTerminal.connectedTo[0].onCall( vector ) );
        else this.material.reflect.copy( this.container.getParamValue( "reflect" ) );

        // ---

        return this.material;

    }.bind( this ) ) );
};

VG.Nodes.NodeMaterial.prototype=VG.Nodes.Node();

VG.Nodes.NodeMaterial.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Basics" );

    // --- Luis, you have to adjust the value ranges for the params, I set them to 0..100 for now

    group.addParam( VG.Nodes.ParamColor( data, "color", "Color", this.material.color ) );
    group.addParam( VG.Nodes.ParamNumber( data, "specular", "Specular", this.material.specular, 0, 100 ) );
    group.addParam( VG.Nodes.ParamNumber( data, "glossiness", "Glossiness", this.material.glossiness, 0, 100 ) );
    group.addParam( VG.Nodes.ParamVector3( data, "normal", "Normal", this.material.normal.x, this.material.normal.y, this.material.normal.z, 0, 100 ) );
    group.addParam( VG.Nodes.ParamVector3( data, "luminosity", "Luminosity", this.material.luminosity.x, this.material.luminosity.y, this.material.luminosity.z, 0, 100 ) );
    group.addParam( VG.Nodes.ParamVector3( data, "reflect", "Reflect", this.material.reflect.x, this.material.reflect.y, this.material.reflect.z, 0, 100 ) );
};

// ---

VG.Nodes.availableNodes.set( "Material", "NodeMaterial" );

