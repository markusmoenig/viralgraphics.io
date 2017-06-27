
VG.Shaders = { fs : [] };

// ---

// VG.loadShader( "vg-renderortho.fs" );

VG.Shaders.RenderOrtho = function()
{
    this._mainRT = VG.Renderer().mainRT;

    // --- Shader

    this.shader = new VG.Shader();
    this.shader.depthTest = true;
    this.shader.depthWrite = true;
    this.changed=true;

    // ---

    this.bufferSize=18;

    this.buffer=new VG.GPUBuffer( VG.Type.Float, this.bufferSize, true );
    this.bufferDB = this.buffer.getDataBuffer();
    this.buffer.create();
};

VG.Shaders.RenderOrtho.prototype.createFrame = function(x, y, w, h, b)
{
    var vw = w;
    var vh = h;

    var x1 = (x - vw / 2) / (vw / 2);
    var y1 = (vh / 2 - y) / (vh / 2);
    var x2 = ((x + w) - vw / 2) / (vw / 2);
    var y2 = (vh / 2 - (y + h)) / (vh / 2);

    var i = 0;
    var db=b.getDataBuffer();

    db.set(i++, x1); db.set(i++, y1); db.set(i++, 0.0); db.set(i++, 1.0);
    db.set(i++, x1); db.set(i++, y2); db.set(i++, 0.0); db.set(i++, 0.0);
    db.set(i++, x2); db.set(i++, y1); db.set(i++, 1.0); db.set(i++, 1.0);
    db.set(i++, x2); db.set(i++, y2); db.set(i++, 1.0); db.set(i++, 0.0);

    b.update();

    return b;
};

VG.Shaders.RenderOrtho.prototype.build=function()
{
    var shader=this.shader;

    if ( this.changed )
    {
        shader.destroy();

        shader.vSource=[
            "#version 100",
            "precision mediump float;",
            "attribute vec4 aPosition;",
            "attribute vec2 aTexCoord;",

            "varying vec2 vTexCoord;",

            "void main() {",
            "   vTexCoord = vec2(aTexCoord.x, aTexCoord.y);",
            "   gl_Position = aPosition;",
            "}", ""
        ].join('\n');

        // VG.log( "build", shaderToUse );

        shader.fSource=VG.Shaders.fs["vg-renderortho.fs"];
        shader.create();

        this.aPosition=shader.getAttrib("aPosition");
        this.aTexCoord=shader.getAttrib("aTexCoord");

        this.uColors=shader.getUniform("uColors");
        this.uMap=shader.getUniform("uMap");
        this.uMapRatio=shader.getUniform("uMapRatio");
        this.uSize=shader.getUniform("uSize");

        this.uLight1Enabled=shader.getUniform("uLight1Enabled");
        this.uLight1Pos=shader.getUniform("uLight1Pos");
        this.uLight1Color=shader.getUniform("uLight1Color");
        this.uLight1Ambient=shader.getUniform("uLight1Ambient");

        this.uLight2Enabled=shader.getUniform("uLight2Enabled");
        this.uLight2Pos=shader.getUniform("uLight2Pos");
        this.uLight2Color=shader.getUniform("uLight2Color");
        this.uLight2Ambient=shader.getUniform("uLight2Ambient");

        this.uLight3Enabled=shader.getUniform("uLight3Enabled");
        this.uLight3Pos=shader.getUniform("uLight3Pos");
        this.uLight3Color=shader.getUniform("uLight3Color");
        this.uLight3Ambient=shader.getUniform("uLight3Ambient");

        this.changed=false;
    }
};

VG.Shaders.RenderOrtho.prototype.render=function( rt, colorMap, map, options )
{
    // ---

    rt.bind();
    rt.setViewportEx( 0, options.realHeight - options.height, options.width, options.height );
    rt.clear( undefined, true );

    var shader=this.shader;

    if ( this.changed ) this.build();

    var b = this.buffer;
    var stride = b.getStride();

    shader.bind();
    b.bind();

    this.createFrame( 0, 0, options.width, options.height, this.buffer );

    b.vertexAttrib( this.aPosition, 2, false, stride * 4, 0);
    b.vertexAttrib( this.aTexCoord, 2, false, stride * 4, stride * 2);

    shader.setTexture( this.uColors, colorMap, 0 );
    shader.setTexture( this.uMap, map, 1 );

    shader.setFloat( this.uMapRatio, [ options.width / options.realWidth, options.height / options.realHeight ] );
    shader.setFloat( this.uSize, [ options.width, options.height ] );

    shader.setBool( this.uLight1Enabled, options.light1Enabled );
    if ( options.light1Enabled ) {
        shader.setFloat( this.uLight1Pos, options.light1Pos );
        shader.setFloat( this.uLight1Color, [options.light1Color.r, options.light1Color.g, options.light1Color.b] );
        shader.setFloat( this.uLight1Ambient, options.light1Ambient );
    }

    shader.setBool( this.uLight2Enabled, options.light2Enabled );
    if ( options.light2Enabled ) {
        shader.setFloat( this.uLight2Pos, options.light2Pos );
        shader.setFloat( this.uLight2Color, [options.light2Color.r, options.light2Color.g, options.light2Color.b] );
        shader.setFloat( this.uLight2Ambient, options.light2Ambient );
    }

    shader.setBool( this.uLight3Enabled, options.light3Enabled );
    if ( options.light3Enabled ) {
        shader.setFloat( this.uLight3Pos, options.light3Pos );
        shader.setFloat( this.uLight3Color, [options.light3Color.r, options.light3Color.g, options.light3Color.b] );
        shader.setFloat( this.uLight3Ambient, options.light3Ambient );
    }

    // ---

    b.drawBuffer(VG.Renderer.Primitive.TriangleStrip, 0,  4);
    rt.unbind();
};