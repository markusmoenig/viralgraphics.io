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

// ----------------------------------------------------------------- VG.Nodes.NodeMaterial --- Material

VG.Nodes.NodeMaterial=function()
{
    if ( !(this instanceof VG.Nodes.NodeMaterial ) ) return new VG.Nodes.NodeMaterial();

    this.name="Material";
    this.className="NodeMaterial";
    this.noPreview=true;

    VG.Nodes.Node.call( this );

    // --- Terminals

    let colorTerminal=this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "color" ) );
    this.colorTerminal = colorTerminal;

    let specularTerminal=this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "specular" ) );
    let metallicTerminal=this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "metallic" ) );
    let smoothnessTerminal=this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "smoothness" ) );
    let reflectanceTerminal=this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "reflectance" ) );
    let bumpTerminal=this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "bump" ) );
    let normalTerminal=this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "normal" ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Material, "out", function( options ) {

        options.code += "\nvoid " + options.materialName + "( in vec3 pos, inout Material material, inout vec3 normal ) {\n";

        options.code += "  pos /= " + this.container.getParam("scale").toString() + ";\n";

        options.code += "  material.type = 0;\n";
        options.code += "  material.specularAmount = 0.0;\n";
        options.code += "  material.emission = vec3(0);\n";

        if ( colorTerminal.isConnected() ) {
            let varName = colorTerminal.first().onCall( options );
            options.code += "  material.color = " + varName + ";\n";
        } else options.code += "  material.color = " + this.container.getParam("color").toString() + ".xyz;\n";

        if ( specularTerminal.isConnected() ) {
            let varName = specularTerminal.first().onCall( options );
            options.code += "  material.specularColor = " + varName + ";\n";
        } else options.code += "  material.specularColor = " + this.container.getParam("specular").toString() + ".xyz;\n";

        if ( metallicTerminal.isConnected() )
        {
            let varName = metallicTerminal.first().onCall( options );
            options.code += "  material.metallic = " + varName + ";\n";
        } else options.code += "  material.metallic = " + this.container.getParamValue("metallic").toFixed(4) + ";\n";

        if ( smoothnessTerminal.isConnected() )
        {
            let varName = smoothnessTerminal.first().onCall( options );
            options.code += "  material.smoothness = " + varName + ";\n";
        } else options.code += "  material.smoothness = " + this.container.getParamValue("smoothness").toFixed(4) + ";\n";

        if ( reflectanceTerminal.isConnected() )
        {
            let varName = reflectanceTerminal.first().onCall( options );
            options.code += "  material.reflectance = " + varName + ";\n";
        } else options.code += "  material.reflectance = " + this.container.getParamValue("reflectance").toFixed(4) + ";\n";

        if ( normalTerminal.isConnected() && !options.physicalBumps ) {
            let varName = normalTerminal.first().onCall( options );
            // options.code += "  normal = normalize( " + varName + " );\n";
            options.code += "  normal = ( mix( normal, normalize(" + varName + "), " + this.container.getParamValue("normalWeight").toFixed(2) + " ) );\n";
        } else
        if ( bumpTerminal.isConnected() )
        {
            if ( !options.physicalBumps ) {
                // --- Use bumps to calculate normal
                options.override = true;
                options.code += "  vec2 eps = vec2( 0.0001, 0.0 );\n";

                options.code += "  vec3 origPos = pos;\n";

                options.code += "  pos = origPos + eps.xyy;\n";
                let varName = bumpTerminal.first().onCall( options );
                options.code += "  float nor_1 = " + varName + ";\n";
                options.code += "  pos = origPos - eps.xyy;\n";
                varName = bumpTerminal.first().onCall( options );
                options.code += "  float nor_2 =" + varName + ";\n";

                options.code += "  pos = origPos + eps.yxy;\n";
                varName = bumpTerminal.first().onCall( options );
                options.code += "  float nor_3 = " + varName + ";\n";
                options.code += "  pos = origPos - eps.yxy;\n";
                varName = bumpTerminal.first().onCall( options );
                options.code += "  float nor_4 = " + varName + ";\n";

                options.code += "  pos = origPos + eps.yyx;\n";
                varName = bumpTerminal.first().onCall( options );
                options.code += "  float nor_5 = " + varName + ";\n";
                options.code += "  pos = origPos - eps.yyx;\n";
                varName = bumpTerminal.first().onCall( options );
                options.code += "  float nor_6 = " + varName + ";\n";

                options.code += "  vec3 bumpNormal = normalize( vec3( nor_1 - nor_2, nor_3 - nor_4, nor_5 - nor_6 ) );\n";
                options.code += "  normal = ( mix( normal, bumpNormal, " + this.container.getParamValue("normalWeight").toFixed(2) + " ) );\n";
            } else {
                // --- Pass the physical bump, ignore normal
                let varName = bumpTerminal.first().onCall( options );
                options.code += "  material.bump = " + varName + ";\n"
            }
        }

        options.code+="\n}\n";
        this.category = this.container.getParamValue( "category" );

    }.bind( this ) ) );
};

VG.Nodes.NodeMaterial.prototype=VG.Nodes.Node();

VG.Nodes.NodeMaterial.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "settings", "Material Settings" );

    group.addParam( VG.Nodes.ParamColor( data, "color", "Diffuse", VG.Core.Color( "#000000" ) ) );
    group.addParam( VG.Nodes.ParamColor( data, "specular", "Specular", VG.Core.Color( "#ffffff" ) ) );

    group.addParam( VG.Nodes.ParamSlider( data, "specularWeight", "Spec. Weight", 0, 0, 1, 0.1, 2 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "normalWeight", "Normal Weight", 0.2, 0, 1, 0.1, 2 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "scale", "Global Scale", 1, 0, 10, 0.1, 2 ) );

    group=this.container.addGroupByName( "PBR", "PBR" );

    group.addParam( VG.Nodes.ParamSlider( data, "metallic", "Metallic", 0, 0, 1, 0.1, 2 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "smoothness", "Smoothness", 0, 0, 1, 0.1, 2 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "reflectance", "Reflectance", 0.5, 0, 1, 0.1, 2 ) );
    // group.addParam( VG.Nodes.ParamSlider( data, "bump", "Bump", 1, 0, 1, 0.1, 2 ) );

    group=this.container.addGroupByName( "emissive", "Emissive", false );

    group.addParam( VG.Nodes.ParamBoolean( data, "emissive", "Emissive", false ) );
    group.addParam(VG.Nodes.ParamColor( data, "emissiveColor", "Emissive Color", VG.Core.Color( 255, 255, 255 ) ) );

    group.addParam( VG.Nodes.ParamSlider( data, "emissivePower", "Strength", 1, 0.01, 10, 0.1, 2 ) );

    group=this.container.addGroupByName( "dielectric", "Dielectric", false );

    group.addParam( VG.Nodes.ParamBoolean( data, "dielectric", "Dielectric", false ) );
    group.addParam( VG.Nodes.ParamSlider( data, "IOR", "IOR", 1.5, 0, 5, 0.1, 2 ) );

    group = this.createDefaultProperties( data );
    group.addParam( VG.Nodes.ParamText( data, "category", "Category", "" ) );
};

VG.Nodes.availableNodes.set( "Material.Material", "NodeMaterial" );


