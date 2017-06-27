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

// ----------------------------------------------------------------- VG.Nodes.NodeArithmeticMix

VG.Nodes.NodeWoodGen=function()
{
    if ( !(this instanceof VG.Nodes.NodeWoodGen ) ) return new VG.Nodes.NodeWoodGen();

    this.name="Wood";
    this.className="NodeWoodGen";

    this.global = `
    float NodeWoodGen_repramp(float x) {
	    return pow(sin(x)*0.5+0.5, 8.0) + cos(x)*0.7 + 0.7;
    }
`;

    VG.Nodes.Node.call( this );

    // --- Terminals

    var noiseTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "noise" );
    this.addInput( noiseTerminal );

    let self = this;
    function getAxis() {
        let axisParam = self.container.getParam( "axis" );
        return axisParam.list[ axisParam.data.axis ].toLowerCase();
    }

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "color", function( options ) {

        if ( noiseTerminal.isConnected() )
        {
            let col1 = this.container.getParam( "color1" );
            let col2 = this.container.getParam( "color2" );

            let ringsVar = options.getVar( this, "rings", "float" );

            let funcName = noiseTerminal.first().onCall( {} );

            // float rings = repramp(length(pos.xz + vec2(NoiseGen(pos*vec3(8.0, 1.5, 8.0)), NoiseGen(-pos*vec3(8.0, 1.5, 8.0)+4.5678))*0.05)*64.0) / 1.8;

            options.code += `  ${ringsVar.code} = NodeWoodGen_repramp(length(pos.${getAxis()} + vec2(${funcName}(pos*vec3(8.0, 1.5, 8.0)).x, ${funcName}(-pos*vec3(8.0, 1.5, 8.0)+4.5678).x)*0.05)*64.0) / 1.8;` + "\n";
            options.code += `  ${ringsVar.name} -= ${funcName}(pos * 1.0).x*0.75;` + "\n";

            let texColorVar = options.getVar( this, "texColor", "vec3" );
            options.code += `  ${texColorVar.code} = mix( ${col1.toString()}.xyz, ${col2.toString()}.xyz, ${ringsVar.name} );` + "\n";
            options.code += `  ${texColorVar.name} = max( vec3( 0.0 ), ${texColorVar.name} );` + "\n";

            let roughVar = options.getVar( this, "rough", "float" );

            options.code += `  ${roughVar.code} = ${funcName}(pos*64.0*vec3(1.0, 0.2, 1.0)).x*0.1+0.9;` + "\n";
            options.code += `  ${texColorVar.name} *= ${roughVar.name};` + "\n";
            options.code += `  ${texColorVar.name} = clamp( ${texColorVar.name}, 0., 1.);` + "\n";

            if ( !this.rt ) {
                let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + texColorVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
                options.generatePreview( this, prevCode );
            }

            return texColorVar.name;
        } else return "vec3(0)";

    }.bind( this ) ) );
};

VG.Nodes.NodeWoodGen.prototype=VG.Nodes.Node();

VG.Nodes.NodeWoodGen.prototype.getGlobalCode=function( data )
{
    return this.global;
};

VG.Nodes.NodeWoodGen.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Mix - Color" );

    group.addParam( VG.Nodes.ParamColor( data, "color1", "Color #1", VG.Core.Color( "#492e12" ) ) );
    group.addParam( VG.Nodes.ParamColor( data, "color2", "Color #2", VG.Core.Color( "#664a21" ) ) );

    group.addParam( VG.Nodes.ParamList( data, "axis", "Pattern Axis", 0, ["XY", "XZ", "YZ"] ) );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Generator.Wood", "NodeWoodGen" );
