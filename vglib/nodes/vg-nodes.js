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

VG.Nodes.NodeFloat = class extends VG.Nodes.Node
{
    constructor() {
        super();
        this.name="Float Value";
        this.className="NodeFloat";
        this.noPreview=true;

        // --- Terminals

        this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "float", function( options ) {
            let param = this.container.getParamValue( "float" );
            this.customTitle = param.toFixed( 3 );
            return param.toFixed( 3 );
        }.bind( this ) ) );
    }

    createProperties( data ) {
        this.container=VG.Nodes.ParamContainer( this );
        var group=this.container.addGroupByName( "basics", "Float Settings" );

        group.addParam( VG.Nodes.ParamNumber( data, "float", "Float Value", 0.000, -10000.00, 10000.00, 3 ) );
    }
};

VG.Nodes.availableNodes.set( "Generator.Color", "NodeColor" );

// ----------------------------------------------------------------- VG.Nodes.Color

VG.Nodes.NodeColor = class extends VG.Nodes.Node
{
    constructor() {
        super();
        this.name="Color Value";
        this.className="NodeColor";
        this.noPreview=true;

        // --- Terminals

        this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "color", function( options ) {
            let param = this.container.getParam( "color" );
            // this.customTitle = param.toFixed( 3 );
            return `${param.toString()}.xyz`;
        }.bind( this ) ) );
    }

    createProperties( data ) {
        this.container=VG.Nodes.ParamContainer( this );
        var group=this.container.addGroupByName( "basics", "Color Settings" );

        group.addParam( VG.Nodes.ParamColor( data, "color", "Color", VG.Core.Color( "#ffffff" ) ) );
    }
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

    this.funcTerminal = this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "function", function( options ) {
        return `NodeShapes2D_func_${this.token}`;
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

    // --- Axis Code

    let self = this;
    function getAxisCode() {
        let axisParam = self.container.getParam( "axis" );

        if ( self.funcTerminal.isConnected() )
        {
            return 'vec2 uv = pos.xy;';
        } else
        if ( axisParam.data.axis === 0 ) {
            return `
                vec2 uv;
                vec3 n = abs(normal);
                if(n.x > 0.57735) {
                    uv = pos.yz;
                } else if (n.y>0.57735){
                    uv = pos.xz;
                }else{
                    uv = pos.xy;
                }
            `;
        } else
            return `vec2 uv = pos.${axisParam.list[ axisParam.data.axis ].toLowerCase()};`;
    }

    // ---


    if ( shape === 0 ) {
        // --- Box
        global += this.boxD;
        global += `
            float NodeShapes2D_${this.token}( in vec3 pos, in vec3 normal )
            {
                ${getAxisCode()}

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
                ${getAxisCode()}

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
                ${getAxisCode()}

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
                ${getAxisCode()}

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

    if ( this.funcTerminal.isConnected() ) {
        global += `
            vec4 NodeShapes2D_func_${this.token}( in vec3 pos, in vec3 normal )
            {
                return vec4( NodeShapes2D_${this.token}( pos, normal ) );
            }
        `;
    }

    // console.log( global );

    return global;
};

VG.Nodes.NodeShapes2D.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Shapes 2D Settings" );

    group.addParam( VG.Nodes.ParamList( data, "shape", "Shape", 0, ["Cube", "Hex", "Sphere", "Triangle"] ) );
    group.addParam( VG.Nodes.ParamVector2( data, "size", "Size", 1.00, 1.00, 0, 100, 2 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "round", "Rounding", 0.2, 0.001, 2.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "hard", "Hardness", 1.0, 0.001, 1.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "stroke", "Stroke", 1.0, 0.001, 20.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamList( data, "axis", "Pattern Axis", 0, ["Dynamic", "XY", "XZ", "YZ"] ) );
    group.addParam( VG.Nodes.ParamDivider( data, "divider", "Transform" ) );
    group.addParam( VG.Nodes.ParamSlider( data, "scale", "Scale", 1, 0.001, 10.00, 0.1, 3 ) );
    group.addParam( VG.Nodes.ParamSlider( data, "rotate", "Rotate", 0, 0.0, 359, 0.1, 2 ) );
    group.addParam( VG.Nodes.ParamVector2( data, "translate", "Translate", 0.00, 0.00, -100, 100, 2 ) );
    group.addParam( VG.Nodes.ParamVector2( data, "repeat", "Repeat", 0.00, 0.00, 0, 100, 2 ) );
    // group.addParam( VG.Nodes.ParamNumber( data, "alternate", "Alternate", 0.00, 0, 100, 2 ) );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Shapes 2D.Shapes 2D", "NodeShapes2D" );

// ----------------------------------------------------------------- VG.Nodes.NodeShape3DMixer

VG.Nodes.NodeGrid2D = class extends VG.Nodes.Node
{
    constructor() {
        super();

        this.name="Grid";
        this.className="NodeGrid2D";

        // --- Inputs

        this.noiseTerminal = VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "noise" );
        this.addInput( this.noiseTerminal );

        this.shapeTerminals = [];
        this.shapeTerminals[0] = this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "shape1" ) );
        this.shapeTerminals[1] = this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "shape2" ) );
        this.shapeTerminals[2] = this.addInput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "shape3" ) );


        // --- Outputs

        this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "dist", function( options ) {

            let addVar = options.getVar( this, "dist", "float" );
            if ( !addVar.exists || options.override )
                options.code += "  " + addVar.code + " = " + `NodeGrid2D_${this.token}( pos, normal )` + ";\n";

            if ( !this.rt ) {
                let prevCode = options.globalCode + options.code + `  material.color = vec3( clamp( pow( ${addVar.name}, 0.4545 ), 0., 1.0 ) );\n}`;
                options.generatePreview( self, prevCode );
            }

            return `${addVar.name}`;
        }.bind( this ) ) );
    }

    getGlobalCode( data )
    {
        let gridSize = this.container.getParam( "gridSize" ).toString();
        let scale = this.container.getParamValue( "scale" ).toFixed(3);
        let hard = this.container.getParamValue( "hard" ).toFixed(3);
        let round = this.container.getParamValue( "round" ).toFixed(3);
        let randomX = this.container.getParamValue( "randomX" );
        let randomY = this.container.getParamValue( "randomY" );
        let tileSize = this.container.getParam( "tileSize" ).toString();

        let global = "";

        // --- Axis Code

        let self = this;
        function getAxisCode() {
            let axisParam = self.container.getParam( "axis" );

            if ( axisParam.data.axis === 0 ) {
                return `
                    vec2 grid;
                    vec3 n = abs(normal);
                    if(n.x > 0.57735) {
                        grid = pos.yz;
                    } else if (n.y>0.57735){
                        grid = pos.xz;
                    }else{
                        grid = pos.xy;
                    }
                `;
            } else
                return `vec2 grid = pos.${axisParam.list[ axisParam.data.axis ].toLowerCase()};`;
        }

        global += `
            float boxDist_${this.token}(vec2 p, vec2 size, float radius)
            {
                size -= vec2(radius);
                vec2 d = abs(p) - size;
                return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius;
            }
        `;

        // --- Noise Code

        let noiseCode = "float rand = 0.0;";

        if ( this.noiseTerminal.isConnected() ) {
            let func = this.noiseTerminal.first().onCall( { generatePreview : function() {} } );
            noiseCode = `
                float rand = ${func}( vec3( gridCenter, 0 ) ).x;

                ${randomX ? "gridCenter.x -= (0.3 + 0.5 * (rand - 0.5));" : "" }
                ${randomY ? "gridCenter.y -= (0.3 + 0.5 * (rand - 0.5));" : "" }
            `;
        }

        // --- Shape Code

        let shapeCode = `float res = clamp( -boxDist_${this.token}( uv - gridCenter, tileSize, ${round} ) * 100.0 * ${hard}, 0., 1. );`;

        let shapeCount = 0; this.shapeTerminals.forEach( function( t ) { if ( t.isConnected() ) ++shapeCount; } );

        if ( shapeCount ) {
            shapeCode = "float res = 0.0; rand += clamp( rand + 0.3, 0., 1. );";

            let cCount = 0;
            for ( let i = 0; i < 3; ++i ) {
                let t = this.shapeTerminals[i];
                if ( t.isConnected() )
                {
                    let func = t.first().onCall( { generatePreview : function() {} } );
                    if ( shapeCount === 1 ) {
                        shapeCode += `res = clamp( -${func}( vec3( uv - gridCenter, pos.z ), normal ).x, 0., 1. );`;
                    } else
                    {
                        if ( cCount ) shapeCode += " else ";
                        shapeCode += `if ( rand <= ${((cCount +1) * 1.0 / shapeCount).toFixed(3)} )
                            res = clamp( -${func}( vec3( uv - gridCenter, pos.z ), normal ).x, 0., 1. );
                        `;
                    }

                    ++cCount;
                }
            }
        }

        // ---

        global += `
            float NodeGrid2D_${this.token}( in vec3 pos, in vec3 normal )
            {
                pos /= vec3( ${gridSize}, ${gridSize}.x ) * ${scale};
                ${getAxisCode()}

                vec2 uv = grid;

                grid = floor( grid );

	            vec2 gridCenter = vec2(grid.x + 0.5, grid.y + 0.5 );
                vec2 tileSize = ${tileSize} * 0.5;

                ${noiseCode}
                ${shapeCode}

                return res;
            }
        `;

        // console.log( global );

        return global;
    }

    createProperties( data )
    {
        this.container=VG.Nodes.ParamContainer( this );
        var group=this.container.addGroupByName( "basics", "Grid Settings" );

        group.addParam( VG.Nodes.ParamVector2( data, "gridSize", "Grid Size", 1, 1, 0, 10, 3 ) );
        group.addParam( VG.Nodes.ParamSlider( data, "scale", "Scale", 1, 0.001, 3.00, 0.1, 3, 1 ) );
        group.addParam( VG.Nodes.ParamVector2( data, "tileSize", "Tile Size", 1, 1, 0, 10, 3 ) );

        group.addParam( VG.Nodes.ParamSlider( data, "round", "Rounding", 0.2, 0.001, 2.00, 0.1, 3 ) );
        group.addParam( VG.Nodes.ParamSlider( data, "hard", "Hardness", 1.0, 0.001, 1.00, 0.1, 3 ) );
        group.addParam( VG.Nodes.ParamList( data, "axis", "Grid Axis", 0, ["Dynamic", "XY", "XZ", "YZ"] ) );

        group.addParam( VG.Nodes.ParamDivider( data, "random", "Randomness" ) );

        group.addParam( VG.Nodes.ParamBoolean( data, "randomX", "X Pos", false ) );
        group.addParam( VG.Nodes.ParamBoolean( data, "randomY", "Y Pos", false ) );

        this.createDefaultProperties( data );
    }
};

VG.Nodes.availableNodes.set( "Shapes 2D.Grid", "NodeGrid2D" );

// ----------------------------------------------------------------- VG.Nodes.NodeShapes3D

VG.Nodes.NodeShapes3D = class extends VG.Nodes.Node
{
    constructor() {
        super();

        this.name="Shapes 3D";
        this.className="NodeShapes3D";

        this.boxD = `
            float boxDist_${this.token}( vec3 p, vec3 b, float r )
            {
                // return length(max(abs(p)-b,0.0))-r;
	            // vec3 dist = abs(p) - 0.5 * size;
	            // return max(dist.x, max(dist.y, dist.z));

                //vec3 d = abs(p) - b;
                //return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));

	            vec3 dist = abs(p) - 0.5 * b;
	            return max(dist.x, max(dist.y, dist.z));
            }
        `;

        // --- Outputs

        this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "dist", function( options ) {

/*
            let addVar = options.getVar( this, "dist", "float" );
            if ( !addVar.exists || options.override )
                options.code += "  " + addVar.code + " = " + `NodeShapes3D_${this.token}( pos, normal )` + ";\n";

            if ( !this.rt ) {
                let prevCode = options.globalCode + options.code + `  material.color = vec3( clamp( - ${addVar.name}, 0., 1.0 ) );\n}`;
                options.generatePreview( self, prevCode );
            }

            return `${addVar.name}`;*/

            return `NodeShapes3D_${this.token}`;

        }.bind( this ) ) );
    }

    getGlobalCode( data )
    {
        let shape = this.container.getParamValue( "shape" );
        let round = this.container.getParamValue( "round" ).toFixed(3);
        let scale = this.container.getParamValue( "scale" ).toFixed(3);
        let translate = this.container.getParam( "translate" ).toString();
        let rotate = this.container.getParamValue( "rotate" ).toFixed(3);
        let size= this.container.getParamValue( "size" );
        let repeat = this.container.getParam( "repeat" ).toString();

        let global = "";

        // --- Axis Code

        let self = this;
        function getAxisCode() {
            let axisParam = self.container.getParam( "axis" );
/*
            if ( axisParam.data.axis === 0 ) {
                return `
                    vec2 uv;
                    vec3 n = abs(normal);
                    if(n.x > 0.57735) {
                        uv = pos.yz;
                    } else if (n.y>0.57735){
                        uv = pos.xz;
                    }else{
                        uv = pos.xy;
                    }
                `;
            } else*/
                return `vec2 uv = pos.${axisParam.list[ axisParam.data.axis ].toLowerCase()};`;
        }

        // ---

        if ( shape === 0 ) {
            // --- Box
            global += this.boxD;
            global += `
                vec4 NodeShapes3D_${this.token}( in vec3 pos )
                {
                    vec4 rc = vec4( 0 );

                    vec3 c = ${repeat};
                    vec3 tp = mod( pos, c ) - 0.5 * c;

                    rc.x = boxDist_${this.token}( tp, vec3( ${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)} ), ${round} );
                    return rc;
                }
            `;
        }

        console.log( global );

        return global;
    }

    createProperties( data )
    {
        this.container=VG.Nodes.ParamContainer( this );
        var group=this.container.addGroupByName( "basics", "Shapes 3D Settings" );

        group.addParam( VG.Nodes.ParamList( data, "shape", "Shape", 0, ["Cube", "Hex", "Sphere", "Triangle"] ) );
        group.addParam( VG.Nodes.ParamVector3( data, "size", "Size", 1.00, 1.00, 1.00, 0, 100, 2 ) );
        group.addParam( VG.Nodes.ParamSlider( data, "round", "Rounding", 0.2, 0.001, 2.00, 0.1, 3 ) );
        group.addParam( VG.Nodes.ParamList( data, "axis", "Pattern Axis", 0, ["Dynamic", "XY", "XZ", "YZ"] ) );
        group.addParam( VG.Nodes.ParamDivider( data, "divider", "Transform" ) );
        group.addParam( VG.Nodes.ParamSlider( data, "scale", "Scale", 1, 0.001, 10.00, 0.1, 3 ) );
        group.addParam( VG.Nodes.ParamSlider( data, "rotate", "Rotate", 0, 0.0, 359, 0.1, 2 ) );
        group.addParam( VG.Nodes.ParamVector2( data, "translate", "Translate", 0.00, 0.00, -100, 100, 2 ) );
        group.addParam( VG.Nodes.ParamVector3( data, "repeat", "Repeat", 0.00, 0.00, 0.00, 0, 100, 2 ) );
        // group.addParam( VG.Nodes.ParamNumber( data, "alternate", "Alternate", 0.00, 0, 100, 2 ) );

        this.createDefaultProperties( data );
    }
};

// VG.Nodes.availableNodes.set( "Shapes 3D.Shapes 3D", "NodeShapes3D" );

// ----------------------------------------------------------------- VG.Nodes.NodeShape3DMixer

VG.Nodes.NodeShape3DMixer = class extends VG.Nodes.Node
{
    constructor() {
        super();

        this.name="Mix - Shapes 3D";
        this.className="NodeShape3DMixer";

        // --- Inputs

        this.terminals = [];
        this.terminals[0] = VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "A" );
        this.terminals[1] = VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "B" );
        this.terminals[2] = VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "C" );
        this.terminals[3] = VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Function, "D" );

        this.terminals.forEach( function( t ) { this.addInput( t ); }.bind( this ) );

        // --- Outputs

        this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "dist", function( options ) {

            let addVar = options.getVar( this, "dist", "float" );
            if ( !addVar.exists || options.override )
                options.code += "  " + addVar.code + " = " + `NodeShape3DMixer_${this.token}( pos )` + ";\n";

            if ( !this.rt ) {
                let prevCode = options.globalCode + options.code + `  material.color = vec3( clamp( ${addVar.name}, 0., 1.0 ) );\n}`;
                options.generatePreview( self, prevCode );
            }

            return `${addVar.name}`;
        }.bind( this ) ) );
    }

    getGlobalCode( data )
    {
        /*
        let shape = this.container.getParamValue( "shape" );
        let round = this.container.getParamValue( "round" ).toFixed(3);
        let scale = this.container.getParamValue( "scale" ).toFixed(3);
        let translate = this.container.getParam( "translate" ).toString();
        let rotate = this.container.getParamValue( "rotate" ).toFixed(3);
        let size= this.container.getParamValue( "size" );
        let repeat = this.container.getParam( "repeat" ).toString();*/

        let global = "";

        // --- Axis Code

        let self = this;
        function getAxisCode() {
            let axisParam = self.container.getParam( "axis" );
/*
            if ( axisParam.data.axis === 0 ) {
                return `
                    vec2 uv;
                    vec3 n = abs(normal);
                    if(n.x > 0.57735) {
                        uv = pos.yz;
                    } else if (n.y>0.57735){
                        uv = pos.xz;
                    }else{
                        uv = pos.xy;
                    }
                `;
            } else*/
                return `vec2 uv = pos.${axisParam.list[ axisParam.data.axis ].toLowerCase()};`;
        }

        // --- Distance Code, parse the inputs

        let distCode = '';

        for( let i = 0; i < 4; ++ i )
        {
            let t = this.terminals[i];

            if ( t.isConnected() ) {
                let funcName = t.first().onCall();
                distCode += `
                    temp = ${funcName}( pos - p ).x;
                    if ( temp < dist ) dist = temp;
                `;
            }
        }

        // ---

        global += `
            float NodeShape3DMixer_${this.token}( in vec3 p)
            {
                const float MAX_DEPTH = 50.0;
                float depth = 0.0;

                // p.z += 1.0;

                vec3 startPos = p - mapDir * 3.0;
                vec3 dir = mapDir;//vec3( 0, 0, -1 );//(startPos + vec3( 0, 0, 1 )) - startPos;

                for (int i = 0; i < 64; i++) {
                    vec3 pos = startPos + dir * depth;
                    // float dist = SceneDistance(pos);

                    float dist = MAX_DEPTH, temp;

                    // dist = length(max(abs(pos)-vec3( 0.5, 0.5, 0.5 ), 0.0) ) - 0.1;
                    ${distCode}

                    if (dist < 0.005) {
                        return depth;
                    }
                    depth += 0.99 * dist;
                    if (depth >= MAX_DEPTH) {
                        return MAX_DEPTH;
                    }
                }
                return MAX_DEPTH;
            }
        `;

        console.log( global );

        return global;
    }

    createProperties( data )
    {
        this.container=VG.Nodes.ParamContainer( this );
        var group=this.container.addGroupByName( "basics", "Shapes 3D Settings" );

        // group.addParam( VG.Nodes.ParamList( data, "shape", "Shape", 0, ["Cube", "Hex", "Sphere", "Triangle"] ) );
/*
        group.addParam( VG.Nodes.ParamList( data, "shape", "Shape", 0, ["Cube", "Hex", "Sphere", "Triangle"] ) );
        group.addParam( VG.Nodes.ParamVector3( data, "size", "Size", 1.00, 1.00, 0, 100, 2 ) );
        group.addParam( VG.Nodes.ParamSlider( data, "round", "Rounding", 0.2, 0.001, 2.00, 0.1, 3 ) );
        group.addParam( VG.Nodes.ParamList( data, "axis", "Pattern Axis", 0, ["Dynamic", "XY", "XZ", "YZ"] ) );
        group.addParam( VG.Nodes.ParamDivider( data, "divider", "Transform" ) );
        group.addParam( VG.Nodes.ParamSlider( data, "scale", "Scale", 1, 0.001, 10.00, 0.1, 3 ) );
        group.addParam( VG.Nodes.ParamSlider( data, "rotate", "Rotate", 0, 0.0, 359, 0.1, 2 ) );
        group.addParam( VG.Nodes.ParamVector2( data, "translate", "Translate", 0.00, 0.00, -100, 100, 2 ) );
        group.addParam( VG.Nodes.ParamVector2( data, "repeat", "Repeat", 0.00, 0.00, 0, 100, 2 ) );
        // group.addParam( VG.Nodes.ParamNumber( data, "alternate", "Alternate", 0.00, 0, 100, 2 ) );
*/
        this.createDefaultProperties( data );
    }
};

// VG.Nodes.availableNodes.set( "Shapes 3D.Mix - Shapes 3D", "NodeShape3DMixer" );
