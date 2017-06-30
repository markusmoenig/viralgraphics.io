/*
 * Copyright (c) 2014-2017 Markus Moenig <markusm@visualgraphics.tv> and Contributors
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// ----------------------------------------------------------------- VG.Nodes.NodeArithmeticMix

VG.Nodes.NodeMixColor=function()
{
    if ( !(this instanceof VG.Nodes.NodeMixColor ) ) return new VG.Nodes.NodeMixColor();

    this.name="Mix - Color";
    this.className="NodeMixColor";

    VG.Nodes.Node.call( this );

    // --- Terminals

    var mixTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "mix" );
    this.addInput( mixTerminal );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "color", function( options ) {

        if ( mixTerminal.isConnected() )
        {
            let col1=this.container.getParam( "color1" );
            let col2=this.container.getParam( "color2" );

            let varName = mixTerminal.first().onCall( options );

            let colVar = options.getVar( this, "color", "vec3" );
            if ( !colVar.exists || options.override )
                options.code += "  " + colVar.code + " = mix( " + col1.toString() + ".xyz, " + col2.toString() + ".xyz, " + varName + " );\n";

            if ( !this.rt ) {
                let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + colVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
                options.generatePreview( this, prevCode );
            }

            return colVar.name;
        } else return "vec3 (0)";

    }.bind( this ) ) );
};

VG.Nodes.NodeMixColor.prototype=VG.Nodes.Node();

VG.Nodes.NodeMixColor.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Mix - Color" );

    group.addParam( VG.Nodes.ParamColor( data, "color1", "Color #1", VG.Core.Color( "#000000" ) ) );
    group.addParam( VG.Nodes.ParamColor( data, "color2", "Color #2", VG.Core.Color( "#ffffff" ) ) );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Operator.Mix - Color", "NodeMixColor" );

// ----------------------------------------------------------------- VG.Nodes.NodeNoiseNormalBreaker

VG.Nodes.NodeNoiseNormalBreaker=function()
{
    if ( !(this instanceof VG.Nodes.NodeNoiseNormalBreaker ) ) return new VG.Nodes.NodeNoiseNormalBreaker();

    this.name="Noise - Normal Breaker";
    this.className="NodeNoiseNormalBreaker";
    this.noPreview=true;

    VG.Nodes.Node.call( this );

    // --- Terminals

    let terminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector4, "vec4" );
    this.addInput( terminal );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "float", function( options ) {

        if ( terminal.isConnected() )
        {
            let varName = terminal.first().onCall( options );

            let ntVar = options.getVar( this, "float", "float" );
            if ( !ntVar.exists || options.override )
                options.code += "  " + ntVar.code + " = " + varName + ".x;\n";

            return ntVar.name;
        } else return "0.0";

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "vec3", function( options ) {

        if ( terminal.isConnected() )
        {
            let varName = terminal.first().onCall( options );

            let ntVar = options.getVar( this, "vec3", "vec3" );
            if ( !ntVar.exists || options.override )
                options.code += "  " + ntVar.code + " = " + varName + ".yzw;\n";

            return ntVar.name;
        } else return "vec3(0)";

    }.bind( this ) ) );
};

VG.Nodes.NodeNoiseNormalBreaker.prototype=VG.Nodes.Node();

VG.Nodes.NodeNoiseNormalBreaker.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Noise / Normal Breaker" );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Breaker.Noise - Normal Breaker", "NodeNoiseNormalBreaker" );

// ----------------------------------------------------------------- VG.Nodes.NodePosition

VG.Nodes.NodePosition=function()
{
    if ( !(this instanceof VG.Nodes.NodePosition ) ) return new VG.Nodes.NodePosition();

    this.name="Position";
    this.className="NodePosition";

    VG.Nodes.Node.call( this );

    let self = this;
    function doPreview( options ) {
        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( vec3( pos.yxz ), 0.0, 1.0 );\n}";
            options.generatePreview( self, prevCode );
        }
    }

    // --- Terminals

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "x", function( options ) {

        doPreview( options );
        return "pos.x";

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "y", function( options ) {

        doPreview( options );
        return "pos.y";

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "z", function( options ) {

        doPreview( options );
        return "pos.z";

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector2, "vec2", function( options ) {

        doPreview( options );
        return "(pos.xy)";

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "vec3", function( options ) {

        doPreview( options );
        return "(pos)";

    }.bind( this ) ) );
};

VG.Nodes.NodePosition.prototype=VG.Nodes.Node();

VG.Nodes.NodePosition.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Generator.Position", "NodePosition" );

// ----------------------------------------------------------------- VG.Nodes.NodeOpSingleInputAtom

VG.Nodes.NodeOpSingleInputAtom=function()
{
    if ( !(this instanceof VG.Nodes.NodeOpSingleInputAtom ) ) return new VG.Nodes.NodeOpSingleInputAtom();

    VG.Nodes.Node.call( this );

    // --- Terminals

    let input=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Universal, "A" );
    this.addInput( input );

    let self = this;
    function getInput( options, outType )
    {
        let out = "";

        if ( input.isConnected() ) {
            let varName = input.first().onCall( options );
            let inType = input.getValueType().count;

            out += self.preOp( inType, outType );

            if ( outType === 1 ) {
                if ( inType === 1 ) out += varName;
                else out += varName + ".x";
            } else if ( outType === 2 ) {
                if ( inType === 1 ) out += "vec2( " + varName + " )";
                else if ( inType === 2 ) out += varName;
                else out += varName + ".xy";
            } else if ( outType === 3 ) {
                if ( inType === 1 ) out += "vec3( " + varName + " )";
                else if ( inType === 2 ) out += "vec3( " + varName + ", 0 )";
                else if ( inType === 3 ) out += varName;
                if ( inType === 4 ) out += varName + ".xyz";
            } else if ( outType === 4 ) {
                if ( inType === 1 ) out += "vec4( " + varName + " )";
                else if ( inType === 2 ) out += "vec4( " + varName + ", 0, 0 )";
                else if ( inType === 3 ) out += "vec4( " + varName + ", 0 )";
                if ( inType === 4 ) out += varName;
            }

            out += self.postOp( inType, outType );
            return out;
        }

        return out;
    }

    function doPreview( varName, options ) {
        if ( !self.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + varName + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( self, prevCode );
        }
    }

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "float", function( options ) {
        if ( input.isConnected() ) {
            let varNames = getInput( options, 1 );

            let addVar = options.getVar( this, "float", "float" );
            if ( !addVar.exists || options.override )
                options.code += "  " + addVar.code + " = " + varNames + ";\n";

            doPreview( addVar.name, options );
            return addVar.name;
        } else return "0.0";
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector2, "vec2", function( options ) {
        if ( input.isConnected() ) {
            let varNames = getInput( options, 2 );

            let addVar = options.getVar( this, "vec2", "vec2" );
            if ( !addVar.exists || options.override )
                options.code += "  " + addVar.code + " = " + varNames + ";\n";

            doPreview( addVar.name, options );
            return addVar.name;
        } else return "vec2(0)";
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "vec3", function( options ) {
        if ( input.isConnected() ) {
            let varNames = getInput( options, 3 );

            let addVar = options.getVar( this, "vec3", "vec3" );
            if ( !addVar.exists || options.override )
                options.code += "  " + addVar.code + " = " + varNames + ";\n";

            doPreview( addVar.name, options );
            return addVar.name;
        } else return "vec3(0)";
    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector4, "vec4", function( options ) {
        if ( input.isConnected() ) {
            let varNames = getInput( options, 4 );

            let addVar = options.getVar( this, "vec4", "vec4" );
            if ( !addVar.exists || options.override )
                options.code += "  " + addVar.code + " = " + varNames + ";\n";

            doPreview( addVar.name, options );
            return addVar.name;
        } else return "vec4(0)";
    }.bind( this ) ) );
};

VG.Nodes.NodeOpSingleInputAtom.prototype=VG.Nodes.Node();

// ----------------------------------------------------------------- VG.Nodes.NodeSin

VG.Nodes.NodeSin = class extends VG.Nodes.NodeOpSingleInputAtom
{
    constructor() {
        super();
        this.name = "Sin";
        this.className = "NodeSin";
    }

    preOp() {
        let abs = this.container.getParamValue( "abs" );
        let out = "";

        if ( abs ) out+= "abs(";
        out += "sin(";

        return out;
    }

    postOp() {
        let abs = this.container.getParamValue( "abs" );
        let out = "";

        out += ")";
        if ( abs ) out+= ")";

        return out;
    }

    createProperties( data ) {
        this.container=VG.Nodes.ParamContainer( this );
        var group=this.container.addGroupByName( "basics", "Sin" );

        group.addParam( VG.Nodes.ParamBoolean( data, "abs", "Abs", false ) );

        this.createDefaultProperties( data );
    }
};

VG.Nodes.availableNodes.set( "Operator.Sin", "NodeSin" );

// ----------------------------------------------------------------- VG.Nodes.NodeOneMins

VG.Nodes.NodeOneMinus = class extends VG.Nodes.NodeOpSingleInputAtom
{
    constructor() {
        super();
        this.name = "OneMinus";
        this.className = "NodeOneMinus";
    }

    preOp() {
        let out = "";
        out += "1.0 - ";
        return out;
    }

    postOp() {
        return "";
    }

    createProperties( data ) {
        this.container = VG.Nodes.ParamContainer( this );
        this.createDefaultProperties( data );
    }
};

VG.Nodes.availableNodes.set( "Operator.One Minus", "NodeOneMinus" );

// ----------------------------------------------------------------- VG.Nodes.NodeScale

VG.Nodes.NodeScale = class extends VG.Nodes.NodeOpSingleInputAtom
{
    constructor() {
        super();
        this.name = "Scale";
        this.className = "NodeScale";
    }

    preOp() {
        let out = "";
        out += `${this.container.getParam( "scale" ).toString()} * `;
        return out;
    }

    postOp() {
        return "";
    }

    createProperties( data ) {
        this.container = VG.Nodes.ParamContainer( this );
        let group=this.container.addGroupByName( "basics", "Scale" );
        group.addParam( VG.Nodes.ParamSlider( data, "scale", "Scale", 1.0, 0, 10, 0.01, 3 ) );
        this.createDefaultProperties( data );
    }
};

VG.Nodes.availableNodes.set( "Operator.Scale", "NodeScale" );

// ----------------------------------------------------------------- VG.Nodes.NodeClamp

VG.Nodes.NodeClamp = class extends VG.Nodes.NodeOpSingleInputAtom
{
    constructor() {
        super();
        this.name = "Clamp";
        this.className = "NodeClamp";
    }

    preOp() {
        let out = "clamp( ";
        return out;
    }

    postOp() {
        return `, ${this.container.getParam( "lower" ).toString()}, ${this.container.getParam( "upper" ).toString()} )`;
    }

    createProperties( data ) {
        this.container = VG.Nodes.ParamContainer( this );
        let group=this.container.addGroupByName( "basics", "Clamp" );

        group.addParam( VG.Nodes.ParamSlider( data, "lower", "Lower Border", 0.0, 0, 1, 0.01, 3 ) );
        group.addParam( VG.Nodes.ParamSlider( data, "upper", "Upper Border", 1.0, 0, 1, 0.01, 3 ) );

        this.createDefaultProperties( data );
    }
};

VG.Nodes.availableNodes.set( "Operator.Clamp", "NodeClamp" );

// ----------------------------------------------------------------- VG.Nodes.NodeOneMins

VG.Nodes.NodeOneMinus = class extends VG.Nodes.NodeOpSingleInputAtom
{
    constructor() {
        super();
        this.name = "OneMinus";
        this.className = "NodeOneMinus";
    }

    preOp() {
        let out = "";
        out += "1.0 - ";
        return out;
    }

    postOp() {
        return "";
    }

    createProperties( data ) {
        this.container = VG.Nodes.ParamContainer( this );
        this.createDefaultProperties( data );
    }
};

VG.Nodes.availableNodes.set( "Operator.One Minus", "NodeOneMinus" );

// ----------------------------------------------------------------- VG.Nodes.NodeArithmeticMix

VG.Nodes.NodeArithmetics=function()
{
    if ( !(this instanceof VG.Nodes.NodeArithmetics ) ) return new VG.Nodes.NodeArithmetics();

    this.name="Arithmetics";
    this.className="NodeArithmetics";

    VG.Nodes.Node.call( this );

    // --- Terminals

    let input1=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Universal, "A" );
    let input2=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Universal, "B" );
    let input3=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Universal, "C" );
    this.addInput( input1 );
    this.addInput( input2 );
    this.addInput( input3 );

    let inputs = [input1, input2, input3];
    let modeArray = ["+", "-", "*", "/"];

    this.modeList = ["Addition", "Subtraction", "Multiplication", "Division"];

    function collectInputs( modeText, options, outType )
    {
        let out = "";

        for ( let i = 0; i < 3; ++i ) {
            let input = inputs[i];

            if ( input.isConnected() ) {
                let varName = input.first().onCall( options );
                if ( out !== "" ) out += modeText;

                let inType = input.getValueType().count;

                if ( outType === 1 ) {
                    if ( inType === 1 ) out += varName;
                    else out += varName + ".x";
                } else if ( outType === 2 ) {
                    if ( inType === 1 ) out += "vec2( " + varName + " )";
                    else if ( inType === 2 ) out += varName;
                    else out += varName + ".xy";
                } else if ( outType === 3 ) {
                    if ( inType === 1 ) out += "vec3( " + varName + " )";
                    else if ( inType === 2 ) out += "vec3( " + varName + ", 0 )";
                    else if ( inType === 3 ) out += varName;
                    if ( inType === 4 ) out += varName + ".xyz";
                } else if ( outType === 4 ) {
                    if ( inType === 1 ) out += "vec4( " + varName + " )";
                    else if ( inType === 2 ) out += "vec4( " + varName + ", 0, 0 )";
                    else if ( inType === 3 ) out += "vec4( " + varName + ", 0 )";
                    if ( inType === 4 ) out += varName;
                }
            }
        }

        if ( out === "" ) {
            if ( outType === 1 ) out = "0.0";
            else if ( outType === 2 ) out = "vec2(0)";
            else if ( outType === 3 ) out = "vec3(0)";
            else if ( outType === 4 ) out = "vec4(0)";
        }

        return out;
    }

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "float", function( options ) {

        let mode=this.container.getParamValue( "mode" ); this.customTitle = this.modeList[mode];
        let modeText = modeArray[mode];

        let value1=this.container.getParamValue( "value1" );
        let value2=this.container.getParamValue( "value2" );

        let varNames = collectInputs( modeText, options, 1 );

        let addVar = options.getVar( this, "float", "float" );
        if ( !addVar.exists || options.override )
            options.code += "  " + addVar.code + " = " + varNames + ";\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + addVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( this, prevCode );
        }

        return addVar.name;

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector2, "vec2", function( options ) {

        let mode=this.container.getParamValue( "mode" ); this.customTitle = this.modeList[mode];
        let modeText = modeArray[mode];

        let value1=this.container.getParamValue( "value1" );
        let value2=this.container.getParamValue( "value2" );

        let varNames = collectInputs( modeText, options, 2 );

        let addVar = options.getVar( this, "vec2", "vec2" );
        if ( !addVar.exists || options.override )
            options.code += "  " + addVar.code + " = " + varNames + ";\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + addVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( this, prevCode );
        }

        return addVar.name;

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector3, "vec3", function( options ) {

        let mode=this.container.getParamValue( "mode" ); this.customTitle = this.modeList[mode];
        let modeText = modeArray[mode];

        let value1=this.container.getParamValue( "value1" );
        let value2=this.container.getParamValue( "value2" );

        let varNames = collectInputs( modeText, options, 3 );

        let addVar = options.getVar( this, "vec3", "vec3" );
        if ( !addVar.exists || options.override )
            options.code += "  " + addVar.code + " = " + varNames + ";\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + addVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( this, prevCode );
        }

        return addVar.name;

    }.bind( this ) ) );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector4, "vec4", function( options ) {

        let mode=this.container.getParamValue( "mode" ); this.customTitle = this.modeList[mode];
        let modeText = modeArray[mode];

        let value1=this.container.getParamValue( "value1" );
        let value2=this.container.getParamValue( "value2" );

        let varNames = collectInputs( modeText, options, 4 );

        let addVar = options.getVar( this, "vec4", "vec4" );
        if ( !addVar.exists || options.override )
            options.code += "  " + addVar.code + " = " + varNames + ";\n";

        if ( !this.rt ) {
            let prevCode = options.globalCode + options.code + "  material.color = clamp( pow( vec3(" + addVar.name + "), vec3( 0.4545 ) ), 0.0, 1.0 );\n}";
            options.generatePreview( this, prevCode );
        }

        return addVar.name;

    }.bind( this ) ) );
};

VG.Nodes.NodeArithmetics.prototype=VG.Nodes.Node();

VG.Nodes.NodeArithmetics.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    let group=this.container.addGroupByName( "basics", "Arithmetics" );

    group.addParam( VG.Nodes.ParamList( data, "mode", "Mode", 0, this.modeList ) );

    this.createDefaultProperties( data );
};

VG.Nodes.availableNodes.set( "Operator.Arithmetics", "NodeArithmetics" );

// ----------------------------------------------------------------- VG.Nodes.NodeLuma

VG.Nodes.NodeLuma=function()
{
    if ( !(this instanceof VG.Nodes.NodeLuma ) ) return new VG.Nodes.NodeLuma();

    this.name="Luma";
    this.className="NodeLuma";

    VG.Nodes.Node.call( this );

    // --- Terminals

    var colorTerminal=VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Vector4, "color" );
    this.addInput( colorTerminal );

    this.addOutput( VG.Nodes.Terminal( VG.Nodes.Terminal.Type.Float, "luma", function( options ) {

        var mode=this.container.getParamValue( "mode" );

        var rc1VarName=options.allocVec4Var();

        if ( colorTerminal.isConnected() )
        {
            colorTerminal.first().onCall( options );
            options.code += "  " + rc1VarName + " = valVec4;\n";
        } else options.code += "  " + rc1VarName + " = vec4( 0, 0, 0, 1 );\n";

        if ( mode === 0 )
        {
            options.code+="  valFloat = " + rc1VarName + ".x * 0.2126 + " + rc1VarName + ".y * 0.7152 + " + rc1VarName + ".z * 0.0722;\n";
        } else
        if ( mode === 1 )
        {
            options.code+="  valFloat = " + rc1VarName + ".x * 0.299 + " + rc1VarName + ".y * 0.587 + " + rc1VarName + ".z * 0.114;\n";
        } else
        if ( mode === 2 )
        {
            options.code+="  valFloat = 0.0;\n";
        }

        options.freeVec4Var( rc1VarName );

    }.bind( this ) ) );

};

VG.Nodes.NodeLuma.prototype=VG.Nodes.Node();

VG.Nodes.NodeLuma.prototype.createProperties=function( data )
{
    this.container=VG.Nodes.ParamContainer( this );
    var group=this.container.addGroupByName( "basics", "Luma - Basics" );

    group.addParam( VG.Nodes.ParamList( data, "mode", "Mode", 0, ["Rec. 709", "Rec. 601"] ) );
/*
    group.addParam( VG.Nodes.ParamSlider( data, "weight", "Weight", 0.5, 0, 1, 0.01, 3 ) );

    var group=this.container.addGroupByName( "default", "Defaults" );

    group.addParam( VG.Nodes.ParamVector4( data, "value1", "Value 1", 0.00, 0.00, 0.00, 1, -1000000, 1000000 ) );
    group.addParam( VG.Nodes.ParamVector4( data, "value2", "Value 2", 0.00, 0.00, 0.00, 1, -1000000, 1000000 ) );
*/
};

// ---

// VG.Nodes.availableNodes.set( "Operators.Luma", "NodeLuma" );
