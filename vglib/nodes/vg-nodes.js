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

// ----------------------------------------------------------------- VG.Nodes.NodeFloat

VG.Nodes.NodeFloat=function()
{
    if ( !(this instanceof VG.Nodes.NodeFloat ) ) return new VG.Nodes.NodeFloat();

    this.name="Float Value";
    this.className="NodeFloat";
    this.noPreview=true;

    VG.Nodes.Node.call( this );

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "float", function( options ) {
        let param = this.container.getParamValue( "float" );
        this.customTitle = param.toFixed( 3 );
        return param.toFixed( 3 );
    }.bind( this ) ) );
};

VG.Nodes.NodeFloat.prototype=VG.Nodes.Node();

VG.Nodes.NodeFloat.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Float Settings" );

    group.addParam( VG.Nodes.ParamNumber( data, "float", "Float Value", 0.000, -10000.00, 10000.00, 3 ) );
};

VG.Nodes.availableNodes.set( "Generator.Float", "NodeFloat" );

// ----------------------------------------------------------------- VG.Nodes.NodeShapes

VG.Nodes.NodeShapes2D = function()
{
    if ( !(this instanceof VG.Nodes.NodeShapes2D ) ) return new VG.Nodes.NodeShapes2D();

    this.name="Shapes 2D";
    this.className="NodeShapes2D";
    this.modifiesGlobal = true;

    VG.Nodes.Node.call( this );

    this.boxD = `
        float boxDist_${this.token}(vec2 p, vec2 size, float radius)
        {
            size -= vec2(radius);
            vec2 d = abs(p) - size;
            return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius;
        }
    `;

    this.hexD = `
        float hexDist_${this.token}(vec2 p, vec2 h) {
	        vec2 q = abs(p);
            return max(q.x-h.y,max(q.x+q.y*0.57735,q.y*1.1547)-h.x);
        }
    `;

    this.triangleD = `
        float triangleDist_${this.token}(vec2 p, float width, float height)
        {
            vec2 n = normalize(vec2(height, width / 2.0));
            return max(	abs(p).x*n.x + p.y*n.y - (height*n.y), -p.y);
        }
    `;

    this.strokeCode = `
        float stroke_${this.token}(float dist, float width)
        {
            //dist += 1.0;
            float alpha1 = clamp(dist + width, 0.0, 1.0);
            float alpha2 = clamp(dist, 0.0, 1.0);
            return alpha1 - alpha2;
        }
    `;

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "fill", function( options ) {

        let addVar = options.getVar( this, "dist", "float" );
        if ( !addVar.exists || options.override )
            options.code += "  " + addVar.code + " = " + `NodeShapes2D_${this.token}( pos, normal )` + ";\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + `  material.color = vec3( clamp( - ${addVar.name}, 0., 1.0 ) );\n}`;
            options.generatePreview( self, prevCode );
        }

        return `clamp( -${addVar.name}, 0., 1.)`;

    }.bind( this ) ) );

    this.strokeTerminal = this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "stroke", function( options ) {

        let addVar = options.getVar( this, "dist", "float" );
        if ( !addVar.exists || options.override )
            options.code += "  " + addVar.code + " = " + `NodeShapes2D_${this.token}( pos, normal )` + ";\n";

        let stroke = this.container.getParamValue( "stroke" ).toFixed(3);

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + ` material.color = vec3( stroke_${this.token}( ${addVar.name}, ${stroke} ) );\n}`;
            options.generatePreview( self, prevCode );
        }

        return `stroke_${this.token}( ${addVar.name}, ${stroke} )`;

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "dist", function( options ) {

        let addVar = options.getVar( this, "dist", "float" );
        if ( !addVar.exists || options.override )
            options.code += "  " + addVar.code + " = " + `NodeShapes2D_${this.token}( pos, normal )` + ";\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + `  material.color = vec3( ${addVar.name} );\n}`;
            options.generatePreview( self, prevCode );
        }

        return addVar.name;

    }.bind( this ) ) );
};

VG.Nodes.NodeShapes2D.prototype=VG.Nodes.Node();

VG.Nodes.NodeShapes2D.prototype.getGlobalCode=function( data )
{
    let shape = this.container.getParamValue( "shape" );
    let round = this.container.getParamValue( "round" ).toFixed(3);
    let scale = this.container.getParamValue( "scale" ).toFixed(3);
    let translate = this.container.getParam( "translate" ).toString();
    let rotate = this.container.getParamValue( "rotate" ).toFixed(3);
    let hard = this.container.getParamValue( "hard" ).toFixed(3);
    let size= this.container.getParamValue( "size" );
    let repeat = this.container.getParam( "repeat" ).toString();

    let global = "";

    if ( this.strokeTerminal.isConnected() )
        global += this.strokeCode;

    if ( shape === 0 ) {
        // --- Box
        global += this.boxD;
        global += `
            float NodeShapes2D_${this.token}( in vec3 pos, in vec3 normal )
            {
                vec2 uv;
                vec3 n = abs(normal);
                if(n.x > 0.57735) {
                    uv = pos.yz;
                } else if (n.y>0.57735){
                    uv = pos.xz;
                }else{
                    uv = pos.xy;
                }

                // uv.x -= step(0.5, uv.y)*.5;

                // if ( mod( uv.y * ( ${size.y.toFixed(2)} + (2.0 * ${size.y.toFixed(2)} - ${repeat}.y ) / 2.0 ) / ${scale}, 1.0 ) > 0.5 )
	                // uv.x += 0.5;

                uv /= ${scale};
                uv += ${translate};

                float angle = ${rotate};
	            mat2 m = mat2( cos( angle ), sin( angle ), -sin( angle ), cos( angle ) );
	            uv = uv * m;

                vec2 r=${repeat};
                vec2 q=mod(uv,r)-0.5*r;

                // if ( mod( uv.y * 0.5, 1.0 ) > 0.5 )
	                // uv.x += 0.5;

                float d = boxDist_${this.token}( q, vec2( ${size.x.toFixed(2)}, ${size.y.toFixed(2)} ), ${round} ) * 100.0 * ${hard};
                return d;
            }
        `;
    } else
    if ( shape === 1 ) {
        // --- Hex
        global += this.hexD;
        global += `
            float NodeShapes2D_${this.token}( in vec3 pos, in vec3 normal )
            {
                vec2 uv;
                vec3 n = abs(normal);
                if(n.x > 0.57735) {
                    uv = pos.yz;
                } else if (n.y>0.57735){
                    uv = pos.xz;
                }else{
                    uv = pos.xy;
                }

                uv /= ${scale};
                uv += ${translate};
                float angle = ${rotate};
	            mat2 m = mat2( cos( angle ), sin( angle ), -sin( angle ), cos( angle ) );
	            uv = uv * m;

                vec2 r=${repeat};
                vec2 q=mod(uv,r)-0.5*r;

                float d = hexDist_${this.token}( q, vec2( ${size.x.toFixed(2)}, ${size.y.toFixed(2)} ) ) * 100.0 * ${hard};
                return d;
            }
        `;
    } else
    if ( shape === 2 ) {
        // --- Sphere
        global += this.hexD;
        global += `
            float NodeShapes2D_${this.token}( in vec3 pos, in vec3 normal )
            {
                vec2 uv;
                vec3 n = abs(normal);
                if(n.x > 0.57735) {
                    uv = pos.yz;
                } else if (n.y>0.57735){
                    uv = pos.xz;
                }else{
                    uv = pos.xy;
                }

                uv /= ${scale};
                uv += ${translate};
                float angle = ${rotate};
	            mat2 m = mat2( cos( angle ), sin( angle ), -sin( angle ), cos( angle ) );
	            uv = uv * m;

                vec2 r=${repeat};
                vec2 q=mod(uv,r)-0.5*r;

                float d = ( length( q ) - ${size.x.toFixed(2)} ) * 100.0 * ${hard} ;
                return d;
            }
        `;
    } else
    if ( shape === 3 ) {
        // --- Triangle
        global += this.triangleD;
        global += `
            float NodeShapes2D_${this.token}( in vec3 pos, in vec3 normal )
            {
                vec2 uv;
                vec3 n = abs(normal);
                if(n.x > 0.57735) {
                    uv = pos.yz;
                } else if (n.y>0.57735){
                    uv = pos.xz;
                }else{
                    uv = pos.xy;
                }

                uv /= ${scale};
                uv += ${translate};
                float angle = ${rotate};
	            mat2 m = mat2( cos( angle ), sin( angle ), -sin( angle ), cos( angle ) );
	            uv = uv * m;

                vec2 r=${repeat};
                vec2 q=mod(uv,r)-0.5*r;

                float d = triangleDist_${this.token}( q, ${size.x.toFixed(2)}, ${size.y.toFixed(2)} ) * 100.0 * ${hard};
                return d;
            }
        `;
    }

    // console.log( global );

    return global;
};

VG.Nodes.NodeShapes2D.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Shapes Settings" );

    group.addParam( VG.Nodes.ParamList( data, "shape", "Shape", 0, ["Cube", "Hex", "Sphere", "Triangle"] ) );
    group.addParam( VG.Nodes.ParamVector2( data, "size", "Size", 1.00, 1.00, 0, 100, 2 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "round", "Rounding", 0.2, 0.001, 2.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "hard", "Hardness", 1.0, 0.001, 1.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "stroke", "Stroke", 1.0, 0.001, 20.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamDivider( data, "divider", "Transform" ) );
    group.addParam( VG.Nodes.ParamSlider( data, "scale", "Scale", 1, 0.001, 10.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "rotate", "Rotate", 0, 0.0, 359, 0.1, 2 ) );
    group.addParam( VG.Nodes.ParamVector2( data, "translate", "Translate", 0.00, 0.00, -100, 100, 2 ) );
    group.addParam( VG.Nodes.ParamVector2( data, "repeat", "Repeat", 0.00, 0.00, 0, 100, 2 ) );
    // group.addParam( VG.Nodes.ParamNumber( data, "alternate", "Alternate", 0.00, 0, 100, 2 ) );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Shapes 2D.Shapes 2D", "NodeShapes2D" );

// ----------------------------------------------------------------- VG.Nodes.NodeShapes

VG.Nodes.NodeShapes=function()
{
    if ( !(this instanceof VG.Nodes.NodeShapes ) ) return new VG.Nodes.NodeShapes();

    this.name="Shapes";
    this.className="NodeShapes";

    this.global = `
        float NodeShapes( in vec3 pos, in vec3 normal )
        {
            pos /= <! SCALE !>;

            // vec3 repeat = mix( <! REPEAT !>, vec3(0), step( vec3( 0.999999 ), normal ) );
            //normal.z = mix( repeat.z, 0.0, step( 0.999999, normal.z ) );

            vec3 repeat = <! REPEAT !>;
            // if ( normal.x > 0.999999 ) repeat.x = 0.0;
            // if ( normal.y > 0.999999 ) repeat.y = 0.0;
            if ( normal.z > 0.999999 ) repeat.z = 0.0;

            vec3 tp = mod( pos, repeat ) - 0.5 * repeat;
            <! SHAPE !>

            // vec3 d = abs(tp) - <! SIZE !>;
            // float t = min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));

            return clamp( t, 0., 1. );
        }
    `;

    VG.Nodes.Node.call( this );

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "float", function( options ) {
        // let param = this.container.getParamValue( "float" );
        // this.customTitle = param.toFixed( 3 );
        // return param.toFixed( 3 );

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = vec3( 1.0 - NodeShapes( pos, vec3(1,1,0) ) );\n}";
            options.generatePreview( self, prevCode );
        }

        return "1.0 - NodeShapes( pos, normal )";

    }.bind( this ) ) );
};

VG.Nodes.NodeShapes.prototype=VG.Nodes.Node();

VG.Nodes.NodeShapes.prototype.getGlobalCode=function( data )
{
    let global = this.global;

    let shape = this.container.getParamValue( "shape" );
    let round = this.container.getParamValue( "round" ).toFixed(3);
    let scale = this.container.getParamValue( "scale" ).toFixed(3);
    let size= this.container.getParam( "size" ).toString();
    // let size= "vec3( " + this.container.getParamValue( "size" ).x.toFixed(3) + " - " + round +
        // ", " + this.container.getParamValue( "size" ).y.toFixed(3) + " - " + round +
        // ", " + this.container.getParamValue( "size" ).z.toFixed(3) + " - " + round + ")";
    let repeat = this.container.getParam( "repeat" ).toString();

    let t;
    if ( shape === 0 ) t = "float t = length( max( abs( vec3( tp.x, tp.y, tp.z ) ) - <! SIZE !>, 0.0 ) ) - <! ROUND !> / 10.0;";
    else t = "float t = length( tp - vec3( 0, 0, 0 ) ) - 0.001;//<! SIZE !>;";

    global = global.replace( /<! SHAPE !>/g, t );
    global = global.replace( /<! SCALE !>/g, scale );
    global = global.replace( /<! ROUND !>/g, round );
    global = global.replace( /<! SIZE !>/g, size );
    global = global.replace( /<! REPEAT !>/g, repeat );

    // console.log( global );

    return global;
};

VG.Nodes.NodeShapes.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Shapes Settings" );

    group.addParam( VG.Nodes.ParamList( data, "shape", "Shape", 0, ["Cube", "Sphere"] ) );
    group.addParam( VG.Nodes.ParamVector3( data, "size", "Size", 1.00, 0.50, 1.00, 0, 100, 2 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "round", "Rounding", 0.2, 0.001, 10.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamDivider( data, "divider", "Transform" ) );
    group.addParam( VG.Nodes.ParamSlider( data, "scale", "Scale", 1, 0.001, 3.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamVector3( data, "repeat", "Repeat", 0.00, 0.00, 0.00, -100, 100, 2 ) );
};

// VG.Nodes.availableNodes.set( "Generator.Shapes", "NodeShapes" );
