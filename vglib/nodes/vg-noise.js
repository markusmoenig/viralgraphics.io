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

// ----------------------------------------------------------------- VG.Nodes.NodeGradient3D --- Generator.Gradient3D

VG.Nodes.NodeGradient3D=function()
{
    if ( !(this instanceof VG.Nodes.NodeGradient3D ) ) return new VG.Nodes.NodeGradient3D();

    this.name="Gradient Noise";
    this.className="NodeGradient3D";
    this.modifiesGlobals=true;
	this.description = `<html><p>Gradient 3D noise. <a href=\"https://www.shadertoy.com/view/4dffRH">Based on a noise</a> by <a href=\"https://www.shadertoy.com/user/iq\">Inigo Quilez</a>. Released under the MIT license.</p>
        <p>"normal" returns the analytic derivative of the gradient function. You can optionally supply an alternative hash function as input.</p></html>
     `;

    VG.Nodes.Node.call( this );

    this.global=`
// return value noise (in x) and its derivatives (in yzw)
vec4 NodeGradient3D_noised_${this.token}( in vec3 x )
{
    x *= <! SCALE VALUE !>;
    // x += <! OFFSET VALUE !>;

    // grid
    vec3 p = floor(x);
    vec3 w = fract(x);

    #if 1
    // quintic interpolant
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
    #else
    // cubic interpolant
    vec3 u = w*w*(3.0-2.0*w);
    vec3 du = 6.0*w*(1.0-w);
    #endif

    // gradients
    vec3 ga = <! HASH !>( p+vec3(0.0,0.0,0.0) )<! HASH DOMAIN !>;
    vec3 gb = <! HASH !>( p+vec3(1.0,0.0,0.0) )<! HASH DOMAIN !>;
    vec3 gc = <! HASH !>( p+vec3(0.0,1.0,0.0) )<! HASH DOMAIN !>;
    vec3 gd = <! HASH !>( p+vec3(1.0,1.0,0.0) )<! HASH DOMAIN !>;
    vec3 ge = <! HASH !>( p+vec3(0.0,0.0,1.0) )<! HASH DOMAIN !>;
	vec3 gf = <! HASH !>( p+vec3(1.0,0.0,1.0) )<! HASH DOMAIN !>;
    vec3 gg = <! HASH !>( p+vec3(0.0,1.0,1.0) )<! HASH DOMAIN !>;
    vec3 gh = <! HASH !>( p+vec3(1.0,1.0,1.0) )<! HASH DOMAIN !>;

    // projections
    float va = dot( ga, w-vec3(0.0,0.0,0.0) );
    float vb = dot( gb, w-vec3(1.0,0.0,0.0) );
    float vc = dot( gc, w-vec3(0.0,1.0,0.0) );
    float vd = dot( gd, w-vec3(1.0,1.0,0.0) );
    float ve = dot( ge, w-vec3(0.0,0.0,1.0) );
    float vf = dot( gf, w-vec3(1.0,0.0,1.0) );
    float vg = dot( gg, w-vec3(0.0,1.0,1.0) );
    float vh = dot( gh, w-vec3(1.0,1.0,1.0) );

    // interpolations
    return vec4( va + u.x*(vb-va) + u.y*(vc-va) + u.z*(ve-va) + u.x*u.y*(va-vb-vc+vd) + u.y*u.z*(va-vc-ve+vg) + u.z*u.x*(va-vb-ve+vf) + (-va+vb+vc-vd+ve-vf-vg+vh)*u.x*u.y*u.z,    // value
                 ga + u.x*(gb-ga) + u.y*(gc-ga) + u.z*(ge-ga) + u.x*u.y*(ga-gb-gc+gd) + u.y*u.z*(ga-gc-ge+gg) + u.z*u.x*(ga-gb-ge+gf) + (-ga+gb+gc-gd+ge-gf-gg+gh)*u.x*u.y*u.z +   // derivatives
                 du * (vec3(vb,vc,ve) - va + u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) + u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) + u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh) ));
}
    `;

    this.hash = `
        vec3 NodeGradient3D_hash_${this.token}(in vec3 p)
        {
            float time = 0.0;

            p = vec3( dot(p,vec3(127.1, 311.7, 74.7)),
                    dot(p,vec3(269.5, 183.3, 246.1)),
                    dot(p,vec3(113.5, 271.9, 124.6)));

            p = fract(sin(p)*43758.5453123)*2. - 1.;

            float th = time * 2.;
            vec2 a = sin(vec2(1.5707963, 0) + th);

            mat2  m = mat2(a, -a.y, a.x); //in general use 3d rotation
            p.xy = m * p.xy;//rotate gradient vector
            //p.yz = m * p.yz;//rotate gradient vector
            //p.zx = m * p.zx;//rotate gradient vector
            return p;
        }
    `;

    // --- Terminals

    this.hashTerminal=this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "hash" ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "noise", function( options ) {
        let noiseVar = options.getVar( this, "", "vec4" );
        if ( !noiseVar.exists || options.override )
            options.code += "  " + noiseVar.code + ` = NodeGradient3D_noised_${this.token}( pos );\n`;

        let floatVar = options.getVar( this, "float", "float" );
        if ( !floatVar.exists || options.override )
            options.code += "  " + floatVar.code + " = " + noiseVar.name + ".x;\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + floatVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( this, prevCode );
        }

        return floatVar.name;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "normal", function( options ) {
        let noiseVar = options.getVar( this, "", "vec4" );
        if ( !noiseVar.exists )
            options.code += "  " + noiseVar.code + ` = NodeGradient3D_noised_${this.token}( pos );\n`;

        let normalVar = options.getVar( this, "normal", "vec3" );
        if ( !normalVar.exists )
            options.code += "  " + normalVar.code + " = " + noiseVar.name + ".yzw;\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code;

            let floatVar = options.getVar( this, "float", "float" );
            if ( !floatVar.exists || options.override )
                prevCode += "  " + floatVar.code + " = " + noiseVar.name + ".x;\n";

                prevCode += "  material.color = clamp( pow( vec3(" + floatVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( this, prevCode );
        }

        return normalVar.name;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "function", function( options ) {

        if ( !this.rt && options.generatePreview ) {
            let prevCode = options.globalCode + options.code + `  material.color = clamp( pow( vec3( NodeGradient3D_noised_${this.token}(pos).x ), vec3( 0.4545 ) ), 0.0, 1.0 );\n}`;
            options.generatePreview( this, prevCode );
        }
        return `NodeGradient3D_noised_${this.token}`;
    }.bind( this ) ) );
};

VG.Nodes.NodeGradient3D.prototype=VG.Nodes.Node();

VG.Nodes.NodeGradient3D.prototype.getGlobalCode=function( data )
{
    let global = this.global;

    let scale = this.container.getParamValue( "scaleGlobal" ).toFixed(2) + " * " + this.container.getParam( "scale" ).toString();
    global = global.replace( /<! SCALE VALUE !>/g, scale );

    if ( !this.hashTerminal.isConnected() ) {
        global = global.replace( /<! HASH !>/g, `NodeGradient3D_hash_${this.token}` );
        global = global.replace( /<! HASH DOMAIN !>/g, "" );
        global = this.hash + global;
    } else {
        let funcName = this.hashTerminal.first().onCall( {} );
        global = global.replace( /<! HASH !>/g, funcName );
        global = global.replace( /<! HASH DOMAIN !>/g, ".xyz" );
    }

    return global;
};

VG.Nodes.NodeGradient3D.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Gradient 3D Noise" );

    group.addParam( VG.Nodes.ParamSlider( data, "scaleGlobal", "Scale", 1, 0.001, 100.00, 0.5, 3, 3 ) );
    group.addParam( VG.Nodes.ParamVector3( data, "scale", "Scale", 1.00, 1.00, 1.00, 0.001, 50.00 ) );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Noise.Gradient Noise", "NodeGradient3D" );

// ----------------------------------------------------------------- VG.Nodes.NodeVoronoi3D --- Noise.NodeVoronoi3D

VG.Nodes.NodeVoronoi3D=function()
{
    if ( !(this instanceof VG.Nodes.NodeVoronoi3D ) ) return new VG.Nodes.NodeVoronoi3D();

    this.name="Voronoi Noise";
    this.className="NodeVoronoi3D";
    this.modifiesGlobals=true;
	this.description = `<html><p>Voronoi 3D noise. <a href=\"https://www.shadertoy.com/view/ldl3Dl">Based on a noise</a> by <a href=\"https://www.shadertoy.com/user/iq\">Inigo Quilez</a>. Released under the MIT license.</p>
        <p>"noise1" returns the closest distance to a cell, "noise2" the second closest and id the id of the cell. You can optionally supply an alternative hash function as input.</p> </html>
 `;

    VG.Nodes.Node.call( this );

    this.global=`
        // returns closest, second closest, and cell id
        vec4 NodeVoronoi3D_${this.token}( in vec3 x )
        {
            x *= <! SCALE VALUE !>;

            vec3 p = floor( x );
            vec3 f = fract( x );

            float id = 0.0;
            vec2 res = vec2( 100.0 );
            for( int k=-1; k<=1; k++ )
            for( int j=-1; j<=1; j++ )
            for( int i=-1; i<=1; i++ )
            {
                vec3 b = vec3( float(i), float(j), float(k) );
                vec3 r = vec3( b ) - f + <! HASH !>( p + b )<! HASH DOMAIN !>;
                float d = dot( r, r );

                if( d < res.x )
                {
                    id = dot( p+b, vec3(1.0,57.0,113.0 ) );
                    res = vec2( d, res.x );
                }
                else if( d < res.y )
                {
                    res.y = d;
                }
            }

            return vec4( sqrt( res ), abs(id), 0 );
        }
    `;

    this.hash = `
        vec3 NodeVoronoi3D_hash_${this.token}(in vec3 x)
        {
            x = vec3( dot(x,vec3(127.1,311.7, 74.7)),
                    dot(x,vec3(269.5,183.3,246.1)),
                    dot(x,vec3(113.5,271.9,124.6)));

            return fract(sin(x)*43758.5453123);
        }
    `;

    // --- Terminals

    this.hashTerminal=this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "hash" ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "noise 1", function( options ) {
        let noiseVar = options.getVar( this, "", "vec4" );
        if ( !noiseVar.exists || options.override )
            options.code += "  " + noiseVar.code + ` = NodeVoronoi3D_${this.token}( pos );\n`;

        let floatVar = options.getVar( this, "float1", "float" );
        if ( !floatVar.exists || options.override )
            options.code += "  " + floatVar.code + " = " + noiseVar.name + ".x;\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + floatVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( this, prevCode );
        }

        return floatVar.name;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "noise 2", function( options ) {
        let noiseVar = options.getVar( this, "", "vec4" );
        if ( !noiseVar.exists || options.override )
            options.code += "  " + noiseVar.code + ` = NodeVoronoi3D_${this.token}( pos );\n`;

        let floatVar = options.getVar( this, "float2", "float" );
        if ( !floatVar.exists || options.override )
            options.code += "  " + floatVar.code + " = " + noiseVar.name + ".y;\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + floatVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( this, prevCode );
        }

        return floatVar.name;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "id", function( options ) {
        let noiseVar = options.getVar( this, "", "vec4" );
        if ( !noiseVar.exists || options.override )
            options.code += "  " + noiseVar.code + ` = NodeVoronoi3D_${this.token}( pos );\n`;

        let floatVar = options.getVar( this, "float2", "float" );
        if ( !floatVar.exists || options.override )
            options.code += "  " + floatVar.code + " = " + noiseVar.name + ".z;\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + floatVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( this, prevCode );
        }

        return floatVar.name;
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "function", function( options ) {

        if ( !this.rt && options.generatePreview ) {
            let prevCode = options.globalCode + options.code + `  material.color = clamp( pow( vec3( NodeVoronoi3D_${this.token}(pos).x ), vec3( 0.4545 ) ), 0.0, 1.0 );\n}`;
            options.generatePreview( this, prevCode );
        }
        return `NodeVoronoi3D_${this.token}`;
    }.bind( this ) ) );
};

VG.Nodes.NodeVoronoi3D.prototype=VG.Nodes.Node();

VG.Nodes.NodeVoronoi3D.prototype.getGlobalCode=function( data )
{
    let global = this.global;

    let scale = this.container.getParamValue( "scaleGlobal" ).toFixed(2) + " * " + this.container.getParam( "scale" ).toString();
    global = global.replace( /<! SCALE VALUE !>/g, scale );

    if ( !this.hashTerminal.isConnected() ) {
        global = global.replace( /<! HASH !>/g, `NodeVoronoi3D_hash_${this.token}` );
        global = global.replace( /<! HASH DOMAIN !>/g, "" );
        global = this.hash + global;
    } else {
        let funcName = this.hashTerminal.first().onCall( {} );
        global = global.replace( /<! HASH !>/g, funcName );
        global = global.replace( /<! HASH DOMAIN !>/g, ".xyz" );
    }

    // console.log( global );

    return global;
};

VG.Nodes.NodeVoronoi3D.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Gradient 3D Noise" );

    group.addParam( VG.Nodes.ParamSlider( data, "scaleGlobal", "Scale", 1, 0.001, 100.00, 0.5, 3, 3 ) );
    group.addParam( VG.Nodes.ParamVector3( data, "scale", "Scale", 1.00, 1.00, 1.00, 0.001, 50.00 ) );

    // group=this.container.addGroupByName( "about", "About" );

    // group.addParam( VG.Nodes.ParamVector3( data, "scale", "Scale", 1.00, 1.00, 1.00, 0.001, 50.00 ) );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Noise.Voronoi Noise", "NodeVoronoi3D" );

// ----------------------------------------------------------------- VG.Nodes.NodeTurbulence --- Operator.NodeTurbulence

VG.Nodes.NodeTurbulence=function()
{
    if ( !(this instanceof VG.Nodes.NodeTurbulence ) ) return new VG.Nodes.NodeTurbulence();

    this.name="Turbulence";
    this.className="NodeTurbulence";
    this.modifiesGlobals=true;
	this.description = `<html><p>Turbulence or FBM.</p>
        <p>Requires a noise function as input. The "normal" output will only be valid when the input noise has a "normal" output terminal.</p></html>
     `;

    VG.Nodes.Node.call( this );

    this.global=`
/*
        vec4 NodeTurbulence(in vec3 p)
        {
            // Three control factors. Lacunarity and gain are set to common defaults.
            const int layers = 5; //Noise layers. Also called octaves.
            const float lacunarity = 2.; // Frequency change factor. Controls the gaps.
            const float gain = .5; // Amplitue change factor. Controls granularity.

            float res = 0.; // Final result.
            float amp = 1.; // Initial amplitude.
            float tot = 0.; // Total amplitude. Used to normalize the final value.

            // Adding the layers of noise with varying frequencies and amplitudes.
            for(int i=0; i<layers; i++){

                res += <! NOISE FUNC !>(p).x*amp;  // Add noise layers at various amplitudes.
                p *= lacunarity; // Change the layer frequency.
                tot += amp; // Add the amplitude.
                amp *= gain; // Change the amplitude.

            }

            return vec4( res/tot ); // Normalize and return. Range [0, 1]
        }
*/

        vec4 NodeTurbulence_${this.token}(in vec3 p)
        {
            const float scale  = <! SCALE VALUE !>;

            float a = 0.0;
            float b = 0.5;
            float f = 1.0;
            vec3  d = vec3(0.0);
            for( int i=0; i<8; i++ )
            {
                vec4 n = <! NOISE FUNC !>(f*p*scale);
                a += b*n.x;           // accumulate values
                d += b*n.yzw*f*scale; // accumulate derivatives
                b *= 0.5;             // amplitude decrease
                f *= 1.8;             // frequency increase
            }

            return vec4( a, d );
        }
    `;

    // --- Terminals

    let noiseTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "noise" );
    this.noiseTerminal = noiseTerminal;
    this.addInput( noiseTerminal );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "turbulence", function( options ) {

        if ( noiseTerminal.isConnected() ) {

            let funcName = noiseTerminal.first().onCall( options );

            let noiseVar = options.getVar( this, "", "vec4" );
            if ( !noiseVar.exists || options.override )
                options.code += "  " + noiseVar.code + ` = NodeTurbulence_${this.token}( pos );\n`;

            let floatVar = options.getVar( this, "float", "float" );
            if ( !floatVar.exists || options.override )
                options.code += "  " + floatVar.code + " = " + noiseVar.name + ".x;\n";

            if ( !this.rt ) {
                let prevCode = options.globalCode + options.code + `  material.color = clamp( pow( vec3( NodeTurbulence_${this.token}(pos).x ), vec3( 0.4545 ) ), 0.0, 1.0 );\n}`;
                options.generatePreview( this, prevCode );
            }

            return floatVar.name;
        } else return "0.0";

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "normal", function( options ) {

        if ( noiseTerminal.isConnected() ) {

            let funcName = noiseTerminal.first().onCall( options );

            let noiseVar = options.getVar( this, "", "vec4" );
            if ( !noiseVar.exists || options.override )
                options.code += "  " + noiseVar.code + ` = NodeTurbulence_${this.token}( pos );\n`;

            let normalVar = options.getVar( this, "normal", "vec3" );
            if ( !normalVar.exists || options.override )
                options.code += "  " + normalVar.code + " = " + noiseVar.name + ".yzw;\n";

            if ( !this.rt ) {
                let prevCode = options.globalCode + options.code + `  material.color = clamp( pow( vec3( NodeTurbulence_${this.token}(pos).x ), vec3( 0.4545 ) ), 0.0, 1.0 );\n}`;
                options.generatePreview( this, prevCode );
            }

            return normalVar.name;
        } else return "vec3(0)";

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector4, "t + n", function( options ) {

        if ( noiseTerminal.isConnected() ) {

            let funcName = noiseTerminal.first().onCall( options );

            let noiseVar = options.getVar( this, "", "vec4" );
            if ( !noiseVar.exists || options.override )
                options.code += "  " + noiseVar.code + ` = NodeTurbulence_${this.token}( pos );\n`;

            let tnVar = options.getVar( this, "t_n", "vec4" );
            if ( !tnVar.exists || options.override )
                options.code += "  " + tnVar.code + " = " + noiseVar.name + ";\n";

            if ( !this.rt ) {
                let prevCode = options.globalCode + options.code + `  material.color = clamp( pow( vec3( NodeTurbulence_${this.token}(pos).x ), vec3( 0.4545 ) ), 0.0, 1.0 );\n}`;
                options.generatePreview( this, prevCode );
            }

            return tnVar.name;
        } else return "vec4(0)";

    }.bind( this ) ) );

/*
    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "function", function( options ) {
        return `NodeTurbulence_${this.token}`;
    }.bind( this ) ) );
*/
};

VG.Nodes.NodeTurbulence.prototype=VG.Nodes.Node();

VG.Nodes.NodeTurbulence.prototype.getGlobalCode=function( data )
{
    let funcName = "vec3";
    if ( this.noiseTerminal.isConnected() ) {
        funcName = this.noiseTerminal.first().onCall( {} );
    } else return "";

    let global = this.global;
    global = global.replace( /<! NOISE FUNC !>/g, funcName );

    let scaleGlobal = this.container.getParamValue( "scaleGlobal" );
    global = global.replace( /<! SCALE VALUE !>/g, scaleGlobal.toFixed( 2 ) );

    return global;
};

VG.Nodes.NodeTurbulence.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );

    let group=this.container.addGroupByName( "basics", "Turbulence" );

    group.addParam( VG.Nodes.ParamSlider( data, "scaleGlobal", "Scale", 1, 0.001, 100.00, 0.5, 3, 3 ) );

/*
    var group=this.container.addGroupByName( "basics", "Simplex3D - Basics" );

    group.addParam( VG.Nodes.ParamList( data, "output", "Output", 1, ["RGB", "Grayscale"] ) );

    group.addParam( VG.Nodes.ParamSlider( data, "amplitude", "Amplitude", 1, -50, 50, 0.5, 3 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "offset", "Offset", 0.5, -50, 50, 0.5, 3 ) );

    group=this.container.addGroupByName( "scale", "Scale" );
    group.addParam( VG.Nodes.ParamSlider( data, "scaleGlobal", "Scale", 1, 0.001, 50.00, 0.5, 3 ) );
    group.addParam( VG.Nodes.ParamVector3( data, "scale", "Scale", 10.00, 10.00, 10.00, 0.001, 50.00 ) );

    group=this.container.addGroupByName( "fractal", "Fractal" );
    group.addParam( VG.Nodes.ParamBoolean( data, "fractal", "Enable", false ) );
    group.addParam( VG.Nodes.ParamSlider( data, "octaves", "Octaves", 3.0, 1.00, 15.00, 0.5, 3 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "increment", "Increment", 0.5, 0.01, 2.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "lacunarity", "Lacunarity", 2.0, 0.01, 5.00, 0.5, 3 ) );
*/

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Noise.Turbulence", "NodeTurbulence" );

// ----------------------------------------------------------------- VG.Nodes.NodeHash1 --- Hash.NodeHash1

VG.Nodes.NodeHash1=function()
{
    if ( !(this instanceof VG.Nodes.NodeHash1 ) ) return new VG.Nodes.NodeHash1();

    this.name="Hash 1 - Simple";
    this.className="NodeHash1";

    VG.Nodes.Node.call( this );

    this.global=`
        vec4 NodeHash1( vec3 p )
        {
            p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
                    dot(p,vec3(269.5,183.3,246.1)),
                    dot(p,vec3(113.5,271.9,124.6)));

            return vec4( -1.0 + 2.0*fract(sin(p)*43758.5453123), 0 );
        }
    `;

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "function", function( options ) {

        if ( !this.rt && options.generatePreview ) {
            let prevCode = options.globalCode + options.code + `  material.color = clamp( pow( NodeHash1( pos ).xyz, vec3( 0.4545 ) ), 0.0, 1.0 );\n}`;
            options.generatePreview( this, prevCode );
        }
        return "NodeHash1";
    }.bind( this ) ) );
};

VG.Nodes.NodeHash1.prototype=VG.Nodes.Node();

VG.Nodes.NodeHash1.prototype.getGlobalCode=function( data )
{
    let global = this.global;
    return global;
};

VG.Nodes.NodeHash1.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Hash 1" );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Noise.Hash 1 Simple", "NodeHash1" );
