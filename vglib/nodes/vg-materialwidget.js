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

// -------------------------------------------------------------------- VG.Nodes.MaterialWidget

VG.Nodes.MaterialWidget=function( graph )
{
    if ( !(this instanceof VG.Nodes.MaterialWidget ) ) return new VG.Nodes.MaterialWidget( graph );

    VG.UI.Widget.call( this );
    this.graph=graph;

    this.changed=true;
    this.shaderIsValid=false;

    this._mainRT = VG.Renderer().mainRT;

    // --- Shader

    this.shader=new VG.Shader();
    this.shader.depthWrite = true;
    this.shader.depthTest = true;

    this.vSource=[
        "#version 100",
        "precision mediump float;",
        "attribute vec4 aPosition;",
        "attribute vec2 aTexCoord;",

        "varying vec2 iTexCoord;",

        "void main() {",
        "   iTexCoord = vec2(aTexCoord.x, 1.0-aTexCoord.y);",
        "   gl_Position = aPosition;",
        "}", ""
    ].join('\n');

    // --- GPU Frame Buffer

    this.bufferSize=18;

    this.buffer=new VG.GPUBuffer( VG.Type.Float, this.bufferSize, true );
    this.bufferDB = this.buffer.getDataBuffer();
    this.buffer.create();

    // --- Camera

    this.camera = new VG.Render.Camera();
    this.camera.setRotation(0, 0, 0);
    this.camera.position.y = 2.5;
    this.camera.position.z = 4.0;
    this.camera.setProjection(60, this.rect.width / this.rect.height);
    this.camera.setLookAt( new VG.Math.Vector3( 0, 0.5, 0 ), new VG.Math.Vector3( 0, 1, 0 ), undefined, true);

    this._timer = new VG.Core.Timer();
    this.delta=0;
    this.type=0;
};

VG.Nodes.MaterialWidget.prototype=VG.UI.Widget();

VG.Nodes.MaterialWidget.prototype.createFrame = function(x, y, w, h, b)
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

VG.Nodes.MaterialWidget.prototype.setType=function( type )
{
    this.changed=true;
    this.type=type;

    VG.update();
};

VG.Nodes.MaterialWidget.prototype.setAnimation=function( animated )
{
    this.changed=true;
    this.animated=animated;

    VG.context.workspace.autoRedrawInterval=animated ? 10 : 2000;
    VG.update();
};

VG.Nodes.MaterialWidget.prototype.buildShader=function()
{
    if ( this.shaderIsValid ) this.shader.destroy();
    this.shaderIsValid=false;

    var fSource=[
        "#version 100",
        "precision mediump float;\n",

        "varying vec2 iTexCoord;\n",

        "uniform vec3 rayOrigin;",
        "uniform mat4 camTransform;",
        "uniform float camScale, iGlobalTime, iType;",
        "uniform vec2 iResolution;\n",
        "uniform vec4 backColor;",

        "vec3 gPosition;\n"

    ].join('\n');

    var rc=this.graph.compile();

    // VG.log( rc.success, rc.error, rc.globalCode, rc.mainCode );

    if ( rc.success )
    {
        fSource+=rc.globalCode;

        fSource+=[

"  ",
"  // --- scene hit test",
"  ",
"  float map( in vec3 pos, in bool inside )",
"  {",
"      float h;",
"      if ( iType == 0.0 ) h = (pos-vec3( 0.0, 0.5, 0.0 ) ).z;",
"      else if ( iType == 1.0 ) h = (pos-vec3( 0.0, 0.5, 0.0 ) ).y;",
"      else if ( iType == 2.0 ) h = length((pos-vec3( 0.0, 0.5, 0.0 ) ) ) - 1.0;",
"      ",
"      if ( inside ) {",
"          gPosition=pos;",
"          h+=material0().bump - 1.0;",
"      }",
"      ",
"      return h;",
"  }",
"  ",
"  // --- Cast a ray into the scene",
"  ",
"  bool castRay( in vec3 ro, in vec3 rd, out float t )",
"  {",
"      float tmin = 1.0;",
"      float tmax = 3.0;",
"      ",
"      t = tmin;",
"      bool inside=false;",
"  ",
"      float precis = 0.002;",
"      for( int i=0; i<100; i++ )",
"      {",
"          float h = map( ro+rd*t, inside );",
"          if(  h < precis ) {",
"              if ( !inside ) inside=true;",
"              else break;",
"          }",
"          if( t > tmax ) break;        ",
"          t += h;",
"      }",
"  ",
"      if( t > tmax ) return false;",
"      else return true;",
"  }",
"  ",
"  vec3 calcNormal( in vec3 pos )",
"  {",
"      float eps = 0.01; // precission",
"      bool inside=true;",
"  ",
"      float gradX = map( pos + vec3(eps, 0.0, 0.0), inside ) - map( pos - vec3(eps, 0.0, 0.0), inside );",
"      float gradY = map( pos + vec3(0.0, eps, 0.0), inside ) - map( pos - vec3(0.0, eps, 0.0), inside );",
"      float gradZ = map( pos + vec3(0.0, 0.0, eps), inside ) - map( pos - vec3(0.0, 0.0, eps), inside );",
"      return normalize( vec3( gradX, gradY, gradZ ) );",
"  }",
"  ",

"  float softshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax )",
"  {",
"      float res = 1.0;",
"      float t = mint;",
"      for( int i=0; i<160; i++ )",
"      {",
"          vec3 pos=ro + rd * t;",
"          float h = map( pos, false );",
"  ",
"          res = min( res, 8.0*h/t );",
"          t += clamp( h, 0.02, 0.10 );",
"          // t+=0.02;",
"          // t+=0.002;",
"          if( h<0.001 || t>tmax ) break;",
"      }",
"      return clamp( res, 0.0, 1.0 );",
"  ",
"  }",
"  ",

"  ",
"  struct Light {",
"      vec3 pos;",
"      vec3 color;",
"  };",
"  Light lights[1];",
"  ",
"  float G1V ( float dotNV, float k ) {",
"      return 1.0 / (dotNV*(1.0 - k) + k);",
"  }",
"  ",
"  vec3 computePBRLighting ( in Light light, in vec3 position, in vec3 N, in vec3 V, in vec3 albedo, in float roughness, in vec3 F0 ) {",
"  ",
"      float alpha = roughness*roughness;",
"      vec3 L = normalize(light.pos.xyz - position);",
"      vec3 H = normalize (V + L);",
"  ",
"      float dotNL = clamp (dot (N, L), 0.0, 1.0);",
"      float dotNV = clamp (dot (N, V), 0.0, 1.0);",
"      float dotNH = clamp (dot (N, H), 0.0, 1.0);",
"      float dotLH = clamp (dot (L, H), 0.0, 1.0);",
"  ",
"      float D, vis;",
"      vec3 F;",
"  ",
"      // NDF : GGX",
"      float alphaSqr = alpha*alpha;",
"      float pi = 3.1415926535;",
"      float denom = dotNH * dotNH *(alphaSqr - 1.0) + 1.0;",
"      D = alphaSqr / (pi * denom * denom);",
"  ",
"      // Fresnel (Schlick)",
"      float dotLH5 = pow (1.0 - dotLH, 5.0);",
"      F = F0 + (1.0 - F0)*(dotLH5);",
"  ",
"      // Visibility term (G) : Smith with Schlick's approximation",
"      float k = alpha / 2.0;",
"      vis = G1V (dotNL, k) * G1V (dotNV, k);",
"  ",
"      vec3 specular = /*dotNL **/ D * F * vis;",
"  ",
"      vec3 ambient = vec3(0.01);",
"  ",
"      float invPi = 0.31830988618;",
"      vec3 diffuse = (albedo * invPi);",
"  ",
"  ",
"      return ambient + (diffuse + specular) * light.color.xyz * dotNL;",
"  }",
"  ",
"  vec3 addPBR( in vec3 position, in vec3 N, in vec3 V, in vec3 baseColor, in float metalMask, in float smoothness, in float reflectance) {",
"      vec3 color = vec3(0.0);",
"  ",
"      float roughness = 1.0 - smoothness*smoothness;",
"      vec3 F0 = 0.16*reflectance*reflectance * (1.0-metalMask) + baseColor*metalMask;",
"      vec3 albedo = baseColor;",
"  ",
"      float s = 0.0;",
"  ",
"  ",
"      for ( int i = 0; i < 1; ++i ) {",
"          vec3 col = computePBRLighting ( lights[i], position, N, V, albedo, roughness, F0);",
"          color += col;",
"          s += softshadow( position, normalize(lights[i].pos.xyz - position), 1.0, 100.0 );//0.02, 2.5 );",
"      }",
"  ",
"      return color*s;",
"  }",
"  ",
"  vec4 hejlToneMapping (in vec4 color) {",
"      vec4 x = max(vec4(0.0), color-vec4(0.004));",
"      return (x * ((6.2*x)+vec4(0.5))) / max(x * ((6.2*x)+vec4(1.7))+vec4(0.06), vec4(1e-8));",
"  }",
"  ",
"  vec4 render_pbr( in vec3 ro, in vec3 rd, in vec3 pos, in Material material )",
"  {",
"      lights[0] = Light( vec3( 2.5 * sin( iGlobalTime ), 0.5, 2 ), vec3(1.0) );",
"  ",
"      vec3 col=material.diffuse.xyz;",//color.xyz;",
"  ",
"      col = addPBR( pos, calcNormal( pos ), -rd, col, material.metallic, material.smoothness, material.reflectance );",
"  ",
"      // --- Gamma Correction",
"      col = pow( col, vec3(0.4545) );",
"  ",
"      // --- Tone Mapping",
"  ",
// "      float exposure = 0.032 + 0.023*20.0;//time-3.14);",
// "      col = hejlToneMapping(vec4(col, 1.0) * exposure).xyz;",
"  ",
"      return vec4( col, 1.0 );",
"  }",
"  ",
"  ",

"  void shaderMain( out vec4 fragColor, in vec2 fragCoord, in vec3 ro, in vec3 rd )",
"  {",
"      float dist;",
"      bool hit = castRay( ro, rd, dist );",
"      ",
"      if ( hit ) ",
"      {",
"          // --- Phong lighting    ",
"          ",
"          vec3 pos = ro + dist * rd;",
"          vec3 n = calcNormal( pos );",
"          ",
"          vec3 l=normalize( vec3( 2.5 * sin( iGlobalTime ), 0.5, 2 ) );",
"          vec3 ref = reflect( rd, n );",
"          ",
"          gPosition=ro + dist * rd;",
"          valMaterial=material0();",
"          ",
"          fragColor = render_pbr( ro, rd, gPosition, valMaterial );",
"      } else fragColor=backColor;",
"  }",
"  ",

            // ---


            "void main() {\n",

            // --- Calc ray
            "  float scrX=iTexCoord.x * iResolution.x, scrY=iTexCoord.y * iResolution.y;",
            "  float iAspectRatio = iResolution.x / iResolution.y;",

            "  float tx = (2.0 * (scrX + 0.5 ) / iResolution.x - 1.0) * iAspectRatio * camScale;",
            "  float ty = (2.0 * (iResolution.y - scrY + 0.5 ) / iResolution.y - 1.0) * camScale;",

            "  vec4 camDir = vec4( tx, ty, -1, 1 );",
            "  vec3 rayDir = (camTransform * camDir).xyz;",
            "  normalize( rayDir );\n",

            "  vec4 color;",
            "  shaderMain( color, iTexCoord, rayOrigin, rayDir );",
            "  gl_FragColor=color;",
            "}",

        ].join('\n');

        this.shader.vSource=this.vSource;
        this.shader.fSource=fSource;

        // VG.log( this.shader.fSource );

        try {
            // var t=Date.now();
            this.shader.create();
            // VG.log( Date.now() - t );
        } catch( err )
        {
            return;
        }

        this.shaderIsValid=true;
    } else VG.log( rc.error );
};

VG.Nodes.MaterialWidget.prototype.applyCameraToShader=function( shader )
{
    // --- Camera

    var camera=this.camera;

    this.delta+= VG.Math.clamp(this._timer.getDelta(), 0.0001, 0.2);

    camera.eye.x = 0;//2 * Math.cos( 0.5 * this.delta );
    camera.eye.y = 0.5;
    camera.eye.z = 2;//2 * Math.sin( 0.5 * this.delta );

    camera.aspect = this.rect.width / this.rect.height;
    camera.updateProjection();

    var transform=new VG.Math.Matrix4( camera.getTransform() );

    transform.elements[12]=0;
    transform.elements[13]=0;
    transform.elements[14]=0;
    transform.elements[15]=1;

    var origin=camera.eye;
    shader.setFloat( "rayOrigin", [origin.x, origin.y, origin.z] );
    shader.setMatrix( "camTransform", transform.elements );

    var scale = Math.tan( camera.fov * 0.5 * Math.PI / 180.0 );

    shader.setFloat( "camScale", scale );
    shader.setFloat( "iResolution", [this.rect.width, this.rect.height] );

    if ( this.animated ) shader.setFloat( "iGlobalTime", this.delta );
    else shader.setFloat( "iGlobalTime", 0 );

    shader.setFloat( "iType", this.type );
};

VG.Nodes.MaterialWidget.prototype.paintWidget=function( canvas, rt )
{
    if ( this.changed )
    {
        this.buildShader();
        this.changed=false;
    }

    if ( this.shaderIsValid )
    {
        var rect=this.rect;

        var b = this.buffer;
        var shader = this.shader;

        this.createFrame( 0, 0, rect.width, rect.height, this.buffer );

        shader.bind();
        b.bind();

        this.applyCameraToShader( this.shader );

        var backColor=VG.UI.stylePool.current.skin.Nodes.BackColor;
        shader.setFloat( "backColor", [backColor.r, backColor.g, backColor.b, 1] );

        var stride = b.getStride();
        b.vertexAttrib(shader.getAttrib("aPosition"), 2, false, stride * 4, 0);
        b.vertexAttrib(shader.getAttrib("aTexCoord"), 2, false, stride * 4, stride * 2);

        // var t=Date.now();

        if ( !rt )
        {
            this._mainRT.setViewport( rect );
            this._mainRT.clear( undefined, true );
            b.drawBuffer( VG.Renderer.Primitive.TriangleStrip, 0,  4 );
            this._mainRT.setViewport(VG.context.workspace.rect);
        } else
        {
            // rt.resetSize( rect.width, rect.height );
            rt.setViewportEx( 0, 0, rect.width, rect.height );
            rt.bind();
            rt.clear( undefined, true );
            b.drawBuffer( VG.Renderer.Primitive.TriangleStrip, 0,  4 );
            rt.unbind();
        }

        // VG.log( "Run in", Date.now() - t, "ms" );
    }
};

// -------------------------------------------------------------------- VG.Nodes.Material2DWidget

VG.Nodes.Material2DWidget=function( graph )
{
    if ( !(this instanceof VG.Nodes.Material2DWidget ) ) return new VG.Nodes.Material2DWidget( graph );

    VG.UI.Widget.call( this );
    this.graph=graph ? graph : VG.Nodes.Graph();

    this.changed=true;
    this.shaderIsValid=false;

    this._mainRT = VG.Renderer().mainRT;

    // --- Shader

    this.shader=new VG.Shader();
    this.shader.depthWrite = true;
    this.shader.depthTest = true;

    this.vSource=[
        "#version 100",
        "precision mediump float;",
        "attribute vec4 aPosition;",
        "attribute vec2 aTexCoord;",

        "varying vec2 iTexCoord;",

        "void main() {",
        "   iTexCoord = vec2(aTexCoord.x, 1.0-aTexCoord.y);",
        "   gl_Position = aPosition;",
        "}", ""
    ].join('\n');

    // --- GPU Frame Buffer

    this.bufferSize=18;

    this.buffer=new VG.GPUBuffer( VG.Type.Float, this.bufferSize, true );
    this.bufferDB = this.buffer.getDataBuffer();
    this.buffer.create();
};

VG.Nodes.Material2DWidget.prototype=VG.UI.Widget();

VG.Nodes.Material2DWidget.prototype.createFrame = function(x, y, w, h, b)
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

VG.Nodes.Material2DWidget.prototype.buildShader=function()
{
    if ( this.shaderIsValid ) this.shader.destroy();
    this.shaderIsValid=false;

    var fSource=[
        "#version 100",
        "precision mediump float;\n",

        "varying vec2 iTexCoord;\n",
        "vec3 gPosition;\n"

    ].join('\n');

    var rc=this.graph.compile( { noDisplacement : true } );

    // VG.log( rc.success, rc.error, rc.globalCode, rc.mainCode );

    if ( rc.success )
    {
        fSource+=rc.globalCode;

        fSource+=[

            // ---

            "void main() {\n",

            "  gPosition=vec3( iTexCoord.x, 0, iTexCoord.y );",
            "  gl_FragColor=material0().diffuse;",
            // "  gl_FragColor=material0().diffuse;",
            "}",

        ].join('\n');

        this.shader.vSource=this.vSource;
        this.shader.fSource=fSource;

        // VG.log( this.shader.fSource );

        try {
            this.shader.create();
        } catch( err )
        {
            return;
        }

        this.shaderIsValid=true;
    } else VG.log( rc.error );
};

VG.Nodes.Material2DWidget.prototype.paintWidget=function( canvas, rt )
{
    if ( this.changed )
    {
        this.buildShader();
        this.changed=false;
    }

    if ( this.shaderIsValid )
    {
        var rect=this.rect;

        var b = this.buffer;
        var shader = this.shader;

        this.createFrame( 0, 0, rect.width, rect.height, this.buffer );

        shader.bind();
        b.bind();

        var stride = b.getStride();
        b.vertexAttrib(shader.getAttrib("aPosition"), 2, false, stride * 4, 0);
        b.vertexAttrib(shader.getAttrib("aTexCoord"), 2, false, stride * 4, stride * 2);

        if ( !rt )
        {
            this._mainRT.setViewport( rect );
            this._mainRT.clear( undefined, true );
            b.drawBuffer( VG.Renderer.Primitive.TriangleStrip, 0,  4 );
            this._mainRT.setViewport(VG.context.workspace.rect);
        } else
        {
            rt.setViewportEx( 0, rt.realHeight - rect.height, rect.width, rect.height );
            rt.clear( undefined, true );
            b.drawBuffer( VG.Renderer.Primitive.TriangleStrip, 0,  4 );
        }
    }
};