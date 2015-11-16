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

// --- This is the internal data structore of the Mtl Material Node

VG.Nodes.NodeMtlMaterialData=function()
{
    // --- This is the internal structure used by the Node for its UI operations (Parameters, including Undo / Redo, Load / Save. Etc.)

    this.ambientColor=VG.Core.Color( 128, 128, 128, 255 );
    this.diffuseColor=VG.Core.Color( 128, 128, 128, 255 );
    this.specularColor=VG.Core.Color( 255, 255, 255, 255 );
    this.illum=1;
    this.specular=100;
    this.dissolve=1;
    this.density=1;
};

// ----------------------------------------------------------------- VG.Nodes.NodeMtlMaterial --- Mtl Material

VG.Nodes.NodeMtlMaterial=function()
{   
    if ( !(this instanceof VG.Nodes.NodeMtlMaterial ) ) return new VG.Nodes.NodeMtlMaterial();

    VG.Nodes.Node.call( this );

    this.name="Mtl Material";
    this.className="NodeMtlMaterial";

    // --- Our internal structure holding the
    this.material=new VG.Nodes.NodeMtlMaterialData();
    this.mtlMaterial={ name : this.name };

    // --- Input Terminal: Ambient Color
    this.ambientColorTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Sample2D, "ambientColor", null, function() {
        // --- onConnect
        this.container.getParam( "ambientColor" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "ambientColor" ).disabled=false;
    }.bind( this ) );
    this.addInput( this.ambientColorTerminal );

    // --- Input Terminal: Diffuse Color
    this.diffuseColorTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Sample2D, "diffuseColor", null, function() {
        // --- onConnect
        this.container.getParam( "diffuseColor" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "diffuseColor" ).disabled=false;
    }.bind( this ) );
    this.addInput( this.diffuseColorTerminal );

    // --- Input Terminal: Specular Color
    this.specularColorTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Sample2D, "specularColor", null, function() {
        // --- onConnect
        this.container.getParam( "specularColor" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "specularColor" ).disabled=false;
    }.bind( this ) );
    this.addInput( this.specularColorTerminal );    

    // --- Input Terminal: Illum
    this.illumTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "illum", null, function() {
        // --- onConnect
        this.container.getParam( "illum" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "illum" ).disabled=false;
    }.bind( this ) );  
    this.addInput( this.illumTerminal );    

    // --- Input Terminal: Specular
    this.specTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "specular", null, function() {
        // --- onConnect
        this.container.getParam( "specular" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "specular" ).disabled=false;
    }.bind( this ) );  
    this.addInput( this.specTerminal );

    // --- Input Terminal: Dissolve
    this.dissTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "dissolve", null, function() {
        // --- onConnect
        this.container.getParam( "dissolve" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "dissolve" ).disabled=false;
    }.bind( this ) );  
    this.addInput( this.dissTerminal );     

    // --- Input Terminal: Density
    this.densTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "density", null, function() {
        // --- onConnect
        this.container.getParam( "density" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "density" ).disabled=false;
    }.bind( this ) );  
    this.addInput( this.densTerminal );

    // --- Output Terminal

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Material, "out", function( vector ) {

        // --- Ambient Color
        if ( this.ambientColorTerminal.isConnected() ) this.colorToArray( this.mtlMaterial, "Ka", this.ambientColorTerminal.connectedTo[0].onCall( vector ) );
        else this.colorToArray( this.mtlMaterial, "Ka", this.container.getParamValue( "ambientColor" ) );

        // --- Diffuse Color
        if ( this.diffuseColorTerminal.isConnected() ) this.colorToArray( this.mtlMaterial, "Kd", this.diffuseColorTerminal.connectedTo[0].onCall( vector ) );
        else this.colorToArray( this.mtlMaterial, "Kd", this.container.getParamValue( "diffuseColor" ) );

        // --- Specular Color
        if ( this.specularColorTerminal.isConnected() ) this.colorToArray( this.mtlMaterial, "Ks", this.specularColorTerminal.connectedTo[0].onCall( vector ) );
        else this.colorToArray( this.mtlMaterial, "Ks", this.container.getParamValue( "specularColor" ) );        

        // --- Illum Value
        if ( this.illumTerminal.isConnected() ) this.mtlMaterial.illum=this.illumTerminal.connectedTo[0].onCall();
        else this.mtlMaterial.illum=this.container.getParamValue( "illum" );

        // --- Specular Value
        if ( this.specTerminal.isConnected() ) this.mtlMaterial.Ns=this.specTerminal.connectedTo[0].onCall();
        else this.mtlMaterial.Ns=this.container.getParamValue( "specular" );          

        // --- Dissolve
        if ( this.dissTerminal.isConnected() ) this.mtlMaterial.d=this.dissTerminal.connectedTo[0].onCall();
        else this.mtlMaterial.d=this.container.getParamValue( "dissolve" );          

        // --- Optical Density
        if ( this.densTerminal.isConnected() ) this.mtlMaterial.Ni=this.densTerminal.connectedTo[0].onCall();
        else this.mtlMaterial.Ni=this.container.getParamValue( "density" );          

        // ---

        return this.mtlMaterial;

    }.bind( this ) ) );
};

VG.Nodes.NodeMtlMaterial.prototype=VG.Nodes.Node();

VG.Nodes.NodeMtlMaterial.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Basics" );

    //group.addParam( VG.Nodes.ParamNumber( data, "illum", "Illum", this.material.illum, 0, 10 ) );
    group.addParam( VG.Nodes.ParamList( data, "illum", "Type", this.material.illum, ["Emissive", "Diffuse", "Specular", "Reflective", "Dissolve", "Fresnel Reflection", "Refraction", "Fresnel Refraction" ],
    function( value ) {
        var spec=this.container.getParam( "specular" );
        var diss=this.container.getParam( "dissolve" );
        var dens=this.container.getParam( "density" );
        if ( spec ) spec.disabled=value < 2 ? true : false;
        if ( diss ) diss.disabled=value === 4 || value === 6 || value === 7 ? false : true;
        if ( dens ) dens.disabled=value < 6 ? true : false;
    }.bind( this ) ) );

    group.addParam( VG.Nodes.ParamSlider( data, "specular", "Highlight", this.material.specular, 0, 1000, 1 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "dissolve", "Alpha", this.material.dissolve, 0, 1, 0.01 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "density", "Optical Density", this.material.density, 0, 10, 0.1 ) );

    group=this.container.addGroupByName( "colors", "Ambient Color", false );
    group.addParam( VG.Nodes.ParamColor( data, "ambientColor", " ", this.material.ambientColor ) );
    group=this.container.addGroupByName( "colors", "Diffuse Color", false );
    group.addParam( VG.Nodes.ParamColor( data, "diffuseColor", " ", this.material.diffuseColor ) );
    group=this.container.addGroupByName( "colors", "Specular Color", false );
    group.addParam( VG.Nodes.ParamColor( data, "specularColor", " ", this.material.specularColor ) );
};

VG.Nodes.NodeMtlMaterial.prototype.colorToArray=function( data, arrayName, color )
{
    if ( data[arrayName] ) delete data[arrayName];

    data[arrayName]=[ color.r, color.g, color.b ];
};

// ---

VG.Nodes.availableNodes.set( "Materials.Mtl", "NodeMtlMaterial" );

// ----------------------------------------------------------------- VG.Nodes.NodePlasticMaterial --- Plastic Material Preset

// --- This is the internal data structore of the Mtl Material Node

VG.Nodes.NodePlasticMaterialData=function()
{
    // --- This is the internal structure used by the Node for its UI operations (Parameters, including Undo / Redo, Load / Save. Etc.)

    this.color=VG.Core.Color( 0, 255, 0, 255 );
    this.type=0;
};

VG.Nodes.NodePlasticMaterial=function()
{   
    if ( !(this instanceof VG.Nodes.NodePlasticMaterial ) ) return new VG.Nodes.NodePlasticMaterial();

    VG.Nodes.Node.call( this );

    this.name="Plastic Material";
    this.className="NodePlasticMaterial";

    // --- Our internal structure holding the
    this.material=new VG.Nodes.NodePlasticMaterialData();
    this.mtlMaterial={ name : this.name };

    // --- Input Terminal: Color
    this.colorTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Sample2D, "color", null, function() {
        // --- onConnect
        this.container.getParam( "color" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "color" ).disabled=false;
    }.bind( this ) );
    this.addInput( this.colorTerminal );

    // --- Input Terminal: Type
    this.typeTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "type", null, function() {
        // --- onConnect
        this.container.getParam( "type" ).disabled=true;
    }.bind( this ), function() {
        // --- onDisconnect
        this.container.getParam( "type" ).disabled=false;
    }.bind( this ) );  
    this.addInput( this.typeTerminal );    

    // --- Output Terminal

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Material, "out", function( vector ) {

        // --- This is just an example, has to be done properly, Ka and Kd are the same, Ks is set to white

        // --- Color
        if ( this.colorTerminal.isConnected() ) 
        {
            this.colorToArray( this.mtlMaterial, "Ka", this.colorTerminal.connectedTo[0].onCall( vector ) );
            this.colorToArray( this.mtlMaterial, "Kd", this.colorTerminal.connectedTo[0].onCall( vector ) );            
        }
        else
        { 
            this.colorToArray( this.mtlMaterial, "Ka", this.container.getParamValue( "color" ) );
            this.colorToArray( this.mtlMaterial, "Kd", this.container.getParamValue( "color" ) );
        }

        this.mtlMaterial.Ks=[1,1,1];
        this.mtlMaterial.illum=2;
        this.mtlMaterial.Ns=0;

        var type;

        if ( this.typeTerminal.isConnected() ) type=this.colorTerminal.connectedTo[0].onCall( vector );
        else type=this.container.getParamValue( "type" );

        if ( type === 0 ) this.mtlMaterial.Ns=10;
        else
        if ( type === 1 ) this.mtlMaterial.Ns=1;

        // ---

        return this.mtlMaterial;

    }.bind( this ) ) );
};

VG.Nodes.NodePlasticMaterial.prototype=VG.Nodes.Node();

VG.Nodes.NodePlasticMaterial.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Basics" );

    group.addParam( VG.Nodes.ParamColor( data, "color", "Color", this.material.color ) );
    group.addParam( VG.Nodes.ParamList( data, "type", "Type", this.material.type, [ "Shiny", "Dull" ] ) );
};

VG.Nodes.NodePlasticMaterial.prototype.colorToArray=function( data, arrayName, color )
{
    if ( data[arrayName] ) delete data[arrayName];

    data[arrayName]=[ color.r, color.g, color.b ];
};

// ---

VG.Nodes.availableNodes.set( "Materials.Plastic", "NodePlasticMaterial" );