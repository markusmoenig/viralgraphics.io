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

// ----------------------------------------------------------------- VG.Nodes.MaterialEdit

VG.Nodes.MaterialEdit=function( { readOnly = false, mapPreview = false, materialPreview = true, closeCallback } = {} )
{
    if ( !(this instanceof VG.Nodes.MaterialEdit ) ) return new VG.Nodes.MaterialEdit( { readOnly, mapPreview, materialPreview, closeCallback } );

    this.graph = VG.Nodes.Graph();
    this.graphView = new VG.Nodes.MaterialView( this.graph );

    this.previewWidget = VG.UI.Widget();
    this.previewRect = VG.Core.Rect();
    this.previewIsValid = false;
    this.previewIsInit = false;

    VG.Nodes.GraphEdit.call( this );

    this._mainRT = VG.Renderer().mainRT;

    this.renderer = new VG.Nodes.MaterialRenderer();

    // --- Node Prevew

    this.prevShader=new VG.Shader();
    this.prevShader.depthWrite = true;
    this.prevShader.depthTest = true;

    this.prevBuffer=new VG.GPUBuffer( VG.Type.Float, 18, true );
    this.prevBufferDB = this.prevBuffer.getDataBuffer();
    this.prevBuffer.create();

    this.nodesToRender = [];

    // --- Setup Preview Widget

    this.rt = new VG.RenderTarget(); // Used for node preview
    let pW = this.previewWidget; this.pW = pW;

    pW.typeDD = VG.UI.DropDownMenu( "Shape: Plain", "Shape: Sphere", "Shape: Twisted", "Shape: Floor" );
    pW.typeDD.changed = function() {
        this.buildShader.bind( this );
        this.iter = 0;
        this.previewIsValid = false;
        this.previewIsRendered = false;
        VG.update();
    }.bind( this );
    pW.qualityDD = VG.UI.DropDownMenu( "Quality: Fast", "Quality: Good" );
    pW.qualityDD.changed = pW.typeDD.changed;
    pW.toolBar = VG.UI.ToolBar( pW.typeDD, pW.qualityDD );
    pW.childWidgets = [ pW.typeDD, pW.qualityDD ];
    pW.minimumSize.height = 100;
    pW.paintWidget = function( canvas ) {
        let skin=VG.UI.stylePool.current.skin;

        pW.toolBar.rect.copy( pW.rect );
        pW.toolBar.rect.height = skin.ToolBar.Height;

        pW.toolBar.paintWidget( canvas );

        if ( this.previewRect.width !== pW.rect.width || this.previewRect.height !== pW.rect.height - skin.ToolBar.Height ) {
            this.previewIsValid = false;
            this.previewIsRendered = false;
            this.iter = 0;
        }

        this.previewRect.copy( pW.rect );
        this.previewRect.y += skin.ToolBar.Height;
        this.previewRect.height -= skin.ToolBar.Height;

        if ( !this.previewIsValid )
            setTimeout( this.buildShader.bind( this ), 1 );
        else
        // if ( !this.previewIsRendered )
        {
            if ( this.renderer.iter < 50 ) {
                if ( this.renderer.getTiming() !== undefined ) this.runShader();
                VG.context.workspace.autoRedrawInterval = 60;
            } else VG.context.workspace.autoRedrawInterval = 2000;
        }

        if ( this.previewIsInit ) {
            canvas.pushClipRect( this.previewRect );
            canvas.drawImage( this.previewRect, this.resultRT );
            canvas.popClipRect();
            // canvas.drawTextRect( String( this.iter ), pW.rect, VG.Core.Color.Black, 0, 2 );
        }

        if ( this.nodesToRender.length )
            setTimeout( this.runNextNodePreview.bind( this ), 1 );

    }.bind( this );

    // --- Extensions

    if ( !VG.webgl2 )
        this.queryExt = VG.WebGL.gl.getExtension('EXT_disjoint_timer_query');
};

VG.Nodes.MaterialEdit.prototype=Object.create(VG.Nodes.GraphEdit.prototype);

VG.Nodes.MaterialEdit.prototype.createFrame = function(x, y, w, h, b)
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

VG.Nodes.MaterialEdit.prototype.buildGraph=function()
{
    this.nodesToRender = [];
    this.rc = this.graph.compileAsMaterial( { generatePreview : this.genNodePreview.bind( this ) } );

    this.renderer.iter = 0;
    this.previewIsValid = false;
    this.previewIsRendered = false;
};

VG.Nodes.MaterialEdit.prototype.buildShader=function()
{
    if ( !this.rc ) return;
    if ( !this.previewRect.width || !this.previewRect.height ) return;

    if ( !this.pW.qualityDD.index )
        this.renderer.build( { globalCode : this.rc.globalCode, code : this.rc.code, type : this.pW ? this.pW.typeDD.index : 0 } );
    else this.renderer.build_path( { globalCode : this.rc.globalCode, code : this.rc.code, type : this.pW ? this.pW.typeDD.index : 0 } );

    this.previewIsValid = true;
};

VG.Nodes.MaterialEdit.prototype.runShader=function()
{
    this.resultRT = this.renderer.render( this.previewRect );

    this.previewIsRendered = true;
    this.previewIsInit = true;
};

VG.Nodes.MaterialEdit.prototype.genNodePreview=function( node, code )
{
    // console.log( "genNodePreview", node, code );

    let exists = false;
    this.nodesToRender.forEach( function ( n ) {
        if ( n.token === node.token ) exists=true;
    } );
    if ( exists ) return;

    let frag = `
        #version 100
        precision highp float;

        varying vec2 vTexCoord;

        struct Material {
            int type;
            vec3 color;
            vec3 specularColor;
            float specularAmount;
            float metallic;
            float smoothness;
            float reflectance;
            float bump;
            vec3 emission;
            float ior;
        };
    `;

    frag += code;
    frag += `

        void main()
        {
            // vec3 pos = vec3( vTexCoord.x * ${this.nodePreviewRect.width.toFixed(1)}, vTexCoord.y * ${this.nodePreviewRect.height.toFixed(1)}, 0.0 );
            vec3 pos = vec3( vTexCoord.x, vTexCoord.y, 0.0 );
            Material material;
            vec3 normal = vec3(0);

            material_1( pos, material, normal );
            gl_FragColor = vec4( material.color, 1.0 );
        }
    `;

    this.nodesToRender.push( { node : node, code : frag } );
};

VG.Nodes.MaterialEdit.prototype.runNextNodePreview=function()
{
    if ( !this.nodesToRender.length ) return;
    if ( !this.previewIsRendered ) return;

    let item = this.nodesToRender.pop();
    this.runNodePreview( item.node, item.code );
};

VG.Nodes.MaterialEdit.prototype.runNodePreview=function( node, code )
{
    // console.log( "runNodePreview", node, code );

    if ( this.prevShader.fSource ) this.prevShader.destroy();

    this.prevShader.vSource = `
        #version 100
        precision highp float;
        attribute vec4 aPosition;
        attribute vec2 aTexCoord;

        varying vec2 vTexCoord;

        void main() {
            vTexCoord = vec2(aTexCoord.x, 1.0-aTexCoord.y);
            gl_Position = aPosition;
        }
    `;

    this.prevShader.fSource = code;

    // console.log( this.shader.fSource );

    try {
        this.prevShader.create();
    } catch( err )
    {
        // console.log( this.shader.fSource );
        return;
    }

    // --- Run it

    let b = this.prevBuffer;
    let shader = this.prevShader;

    let rt = this.rt;

    rt.resize( this.nodePreviewRect.width, this.nodePreviewRect.height );
    rt.bind();
    rt.setViewport( this.nodePreviewRect );
    rt.clear( undefined, true );

    this.createFrame( 0, 0, this.nodePreviewRect.width, this.nodePreviewRect.width, b );

    shader.bind();
    b.bind();

    // this.applyCameraToShader( this.shader );

    var stride = b.getStride();
    b.vertexAttrib(shader.getAttrib("aPosition"), 2, false, stride * 4, 0);
    b.vertexAttrib(shader.getAttrib("aTexCoord"), 2, false, stride * 4, stride * 2);

    b.drawBuffer( VG.Renderer.Primitive.TriangleStrip, 0,  4 );
    rt.unbind();

    this._mainRT.setViewport(VG.context.workspace.rect);

    node.image = VG.Utils.renderTargetToHTML5Image( rt );
    VG.update();
};

// ----------------------------------------------------------------- VG.Nodes.MaterialView

VG.Nodes.MaterialView=function( graph )
{
    if ( !(this instanceof VG.Nodes.MaterialView ) ) return new VG.Nodes.MaterialView( graph );

    VG.Nodes.GraphView.call( this, graph );
};

VG.Nodes.MaterialView.prototype=Object.create(VG.Nodes.GraphView.prototype);

// ----------------------------------------------------------------- VG.Nodes.MaterialRenderer

/**
 * The VG.Nodes.MaterialRenderer class.
 * @constructor
 */

VG.Nodes.MaterialRenderer=function()
{
    if ( !(this instanceof VG.Nodes.MaterialRenderer ) ) return new VG.Nodes.MaterialRenderer();

    // --- Shader Stuff

    this._mainRT = VG.Renderer().mainRT;

    this.shader=new VG.Shader();
    this.shader.depthWrite = true;
    this.shader.depthTest = true;

    this.buffer=new VG.GPUBuffer( VG.Type.Float, 18, true );
    this.bufferDB = this.buffer.getDataBuffer();
    this.buffer.create();

    this.camera = new VG.Render.Camera(80);
    this.camera.setLookAt(new VG.Math.Vector3(0, 0, 0), new VG.Math.Vector3(0, 1, 0), new VG.Math.Vector3(0, 0, 5), true);

    // --- Setup Preview Widget

    this.rt = new VG.RenderTarget();
    // this.rt.floatTexture = true;
    this.rt1 = new VG.RenderTarget();
    // this.rt1.floatTexture = true;

    this.iter = 0;

    // --- Extensions

    if ( !VG.webgl2 )
        this.queryExt = VG.WebGL.gl.getExtension('EXT_disjoint_timer_query');
};

VG.Nodes.MaterialRenderer.prototype.copyRenderTarget=function copyRenderTarget( source, dest )
{
    let raster=VG.context.workspace.canvas;
    let width=source.width, height=source.height;

    source.setViewportEx( 0, 0, width, height );
    dest.setViewportEx( 0, 0, width, height );

    raster.flush();
    dest.bind();

    let blendType = raster.renderer.shaderTex2d.blendType;
    raster.renderer.shaderTex2d.blendType = VG.Shader.Blend.None;
    raster.renderer.drawQuad( source, width, height, 0, 0, 1.0, VG.Core.Size( width, height ) );
    raster.renderer.shaderTex2d.blendType = blendType;

    raster.flush();
    dest.unbind();
};

VG.Nodes.MaterialRenderer.prototype.createFrame = function(x, y, w, h, b)
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

/**
 * Builds path traced shader.
 * @param {string} globalCode - The global code needed to render the material. These are functions created by the node system like noises etc.
 * @param {string} code - The material function itself.
 */

VG.Nodes.MaterialRenderer.prototype.build_path=function( { globalCode, code, type = 0 } = {} )
{
    if ( this.shader.fSource ) this.shader.destroy();
    if ( globalCode === undefined || code === undefined ) return;

    this.shader.vSource = `
        #version 100
        precision highp float;
        attribute vec4 aPosition;
        attribute vec2 aTexCoord;

        varying vec2 vTexCoord;

        void main() {
            vTexCoord = vec2(aTexCoord.x, 1.0-aTexCoord.y);
            gl_Position = aPosition;
        }
    `;

    this.shader.fSource = `
        #version 100
        precision highp float;

        varying vec2 vTexCoord;

        uniform vec3 uOrigin, uLookAt;
        uniform vec2 uCanvasSize;

        uniform int uIter;
        uniform sampler2D uLast;
        uniform float uTime;

        struct Material {
            int type;
            vec3 color;
            vec3 specularColor;
            float specularAmount;
            float metallic;
            float smoothness;
            float reflectance;
            float bump;
            vec3 emission;
            float ior;
        };

        struct Light {
            float id;
            vec3 emission;
        };

        #define PI 3.1415926535897932384626422832795028841971

        #define LIGHT1_POS vec3( 1.5, 1.5, 8 )
        #define LIGHT1_EM vec3( 180, 180, 180 )

        vec2 randv2;

        float random() {
            randv2+=vec2(1.0,0.0);
            // return fract(sin(dot(vTexCoord, vec2(12.9898, 78.233)) + seed++) * 43758.5453);
            return fract(sin(dot(randv2.xy ,vec2(12.9898,78.233))) * 43758.5453);

        }

        vec2 rand2(){// implementation derived from one found at: lumina.sourceforge.net/Tutorials/Noise.html
            randv2+=vec2(1.0,1.0);
            return vec2(fract(sin(dot(randv2.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(randv2.xy ,vec2(4.898,7.23))) * 23421.631));
        }

        vec3 opU( vec3 d1, vec3 d2 )
        {
            return (d1.x<d2.x) ? d1 : d2;
        }

        vec3 opTwist( vec3 p, float twist )
        {
            float c = cos(twist*p.z);
            float s = sin(twist*p.z);
            mat2  m = mat2(c,-s,s,c);
            vec3  q = vec3(m*p.xy,p.z);
            return q;
        }

        float opS( float d1, float d2 )
        {
            return max(-d2,d1);
        }
    `;

    this.shader.fSource += globalCode;
    this.shader.fSource += code;

    this.shader.fSource += `

/*
   tp=p;
    gResult1=opU( gResult1, vec3( length( max( abs( tp) - vec3( 399.741, 399.741, 399.741 ), 0.0 ) ) - 0.259, 2, 0 ) );
   tp=p;
    tp.y = tp.y + -19.0000;
    gResult1.x=opS( gResult1.x, length( max( abs( tp) - vec3( 84.000, 3.000, 3.000 ), 0.0 ) ) - 16.000);
*/

        vec3 map( vec3 p )
        {
            vec3 res=vec3( 1000000, -2, -1 );
            ${ type === 0 ? "res=opU( res, vec3( p.z, 0, 0 ) );" :
                type === 1 ? "res=opU( res, vec3( length( p ) - 1.0, 0, 0 ) );" :
                type === 2 ? `vec3 tp=p;tp.zxy=opTwist( tp.zxy, 2.531 );
                res=opU( res, vec3( length( max( abs(tp) - vec3( 0.213 * 3.0, 0.978 * 3.0, 0.213 * 3.0 ), 0.0 ) ) - 0.10, 0, 0 ) );`
                : //`res=opU( res, vec3( length( max( abs(p) - vec3( 40, 40, 40 ), 0.0 ) ) - 0.259, 0, 0 ) );
                   //vec3 tp = p; tp.z -= 4.9;
                   //res.x=opS( res.x, length( max( abs(tp) - vec3( 1, 0.5, 5 ), 0.0 ) ) - 0.900);
                //`
                "res=opU( res, vec3( p.y + 1.5, 0, 0 ) );"
            }
            ${ code.indexOf( "_displacement" ) !== -1 ? "res.x -= material_1_displacement( p );" : "" }

            // res=opU( res, vec3( length( p ) - 1.0, 0, 0 ) );
            res=opU( res, vec3( length( p - LIGHT1_POS ) - 1.0, 2, 2 ) ); // Light #1

            return res;
        }

        // --- Cast a ray into the scene

        vec3 castRay( in vec3 ro, in vec3 rd, in float tmin, in float tmax )
        {
            float t=tmin;
            float m=-1.0, id=-1.0;

            for( int i=0; i<100; i++ )
            {
                // float precis = 0.002;
                float precis = 0.0005*t;

                vec3 res = map( ro+rd*t );
                if( t<precis || t>tmax ) break;
                t += res.x * 0.4;
                m = res.y;
                id = res.z;
            }

            if( t>tmax ) { m=-1.0; id=-1.0; }
            return vec3( t, m, id );
        }
    `;

    this.shader.fSource += `

        struct Ray {
            vec3 origin;
            vec3 dir;
        };

        vec3 calcNormal( in vec3 pos )
        {
            vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
            return normalize( e.xyy*map( pos + e.xyy ).x +
                            e.yyx*map( pos + e.yyx ).x +
                            e.yxy*map( pos + e.yxy ).x +
                            e.xxx*map( pos + e.xxx ).x );
        }


        vec3 jitter(vec3 d, float phi, float sina, float cosa) {
            vec3 w = normalize(d), u = normalize(cross(w.yzx, w)), v = cross(w, u);
            return (u*cos(phi) + v*sin(phi)) * sina + w * cosa;
        }

        float ggx(vec3 N, vec3 V, vec3 L, float roughness, float F0)
        {
            vec3 H = normalize(V + L);

            float dotLH = max(dot(L, H), 0.0);
            float dotNH = max(dot(N, H), 0.0);
            float dotNL = max(dot(N, L), 0.0);
            float dotNV = max(dot(N, V), 0.0);

            float alpha = roughness * roughness + 0.0001;

            // GGX normal distribution
            float alphaSqr = alpha * alpha;
            float denom = dotNH * dotNH * (alphaSqr - 1.0) + 1.0;
            float D = alphaSqr / (denom * denom);

            // Fresnel term approximation
            float F_a = 1.0;
            float F_b = pow(1.0 - dotLH, 5.0);
            float F = mix(F_b, F_a, F0);

            // GGX self shadowing term
            float k = (alpha + 2.0 * roughness + 1.0) / 8.0;
            float G = dotNL / (mix(dotNL, 1.0, k) * mix(dotNV, 1.0, k));

            // '* dotNV' - Is canceled due to normalization
            // '/ dotLN' - Is canceled due to lambert
            // '/ dotNV' - Is canceled due to G
            return max(0.0, min(10.0, D * F * G / 4.0));
        }

        vec3 angleToDir(vec3 n, float theta, float phi)
        {
            float sinPhi = sin(phi);
            float cosPhi = cos(phi);
            vec3 w = normalize(n);
            vec3 u = normalize(cross(w.yzx, w));
            vec3 v = cross(w, u);
            return (u * cos(theta) + v * sin(theta)) * sinPhi + w * cosPhi;
        }

        vec3 tracerDirectIllumination1( in vec3 hitOrigin, in vec3 hitNormal, in vec3 rayDir, in Material material  )
        {
            vec3 brdf = vec3( 0 );

            Light light;
            light.id = 2.0;
            light.emission = LIGHT1_EM;

            vec3 l0 = LIGHT1_POS - hitOrigin;
            // vec3 l = normalize( l0 );

            //vec3 l0 = lightSample - hitOrigin;
            // float cos_a_max = 0.0;//sqrt(1. - clamp(light.bbox_area / dot(l0, l0), 0., 1.));
            //float cosa = mix(cos_a_max, 1., random());
            //vec3 l = jitter(l0, 2.*PI*random(), sqrt(1. - cosa*cosa), cosa);

            float cos_a_max = sqrt(1. - clamp(0.5 * 0.5 / dot(l0, l0), 0., 1.));
            float cosa = mix(cos_a_max, 1., random());
            vec3 l = jitter(l0, 2.*PI*random(), sqrt(1. - cosa*cosa), cosa);

            vec3 lightHit = castRay( hitOrigin, l, 0.001, 20.0 );

            if ( lightHit.z == light.id )
            {
                float roughness = 1.0 - material.smoothness * material.smoothness;
                float metallic = material.metallic;

                float omega = 2. * PI * (1. - cos_a_max);
                brdf += ((light.emission * clamp(ggx( hitNormal, rayDir, l, roughness, metallic),0.,1.) * omega) / PI);
            }

            return brdf;
        }

        vec3 tracerDirectIllumination2( in vec3 hitOrigin, in vec3 hitNormal, in vec3 rayDir, in Material material  )
        {
            vec3 e = vec3( 0 );

            Light light;
            light.id = 2.0;
            light.emission = LIGHT1_EM;

            vec3 l0 = LIGHT1_POS - hitOrigin;
            // vec3 l = normalize( l0 );

            // vec3 l0 = lightSample - hitOrigin;
            // float cos_a_max = 1.0;//sqrt(1. - clamp(light.bbox_area / dot(l0, l0), 0., 1.));
            // float cosa = mix(cos_a_max, 1., random());
            // vec3 l = jitter(l0, 2.*PI*random(), sqrt(1. - cosa*cosa), cosa);

            float cos_a_max = sqrt(1. - clamp(0.5 * 0.5 / dot(l0, l0), 0., 1.));
            float cosa = mix(cos_a_max, 1., random());
            vec3 l = jitter(l0, 2.*PI*random(), sqrt(1. - cosa*cosa), cosa);

            // vec3 lightHit = hitScene2( hitOrigin, l, light

            vec3 lightHit = castRay( hitOrigin, l, 0.001, 10.0 );

            // vec3 lightHit = shadow( hitOrigin, l, uTMin, uTMax, light.id );
            if ( lightHit.z == light.id )
            {
                float omega = 2. * PI * (1. - cos_a_max);
                vec3 n = normalize(hitOrigin - LIGHT1_POS);
                e += ((light.emission * clamp(dot(l, n),0.,1.) * omega) / PI);
            }

            return e;
        }

        vec4 getColor( in Ray ray )
        {
            vec4 tcol = vec4(0,0,0,0);
            vec4 fcol = vec4(1.0);

            Material material;
            vec3 normal;

            // for (int depth = 0; depth < 2; depth++)
            {
                // Material material;
                // vec3 normal;

                vec3 hit = castRay( ray.origin, ray.dir, 0.001, 10.0 );

                if ( hit.y >= 0.0 )
                {
                    vec3 hitOrigin = ray.origin + ray.dir * hit.x;

                    normal = calcNormal( hitOrigin );

                    if ( hit.y < 2.0 ) {
                        material_1( hitOrigin, material, normal );
                    }
                    else if ( hit.y == 2.0 )
                    {
                        material.type = 2;
                        material.emission = LIGHT1_EM;
                    }

                    //hitOrigin = ray.origin + (ray.dir - material.bump) * hit.x;

                    if ( material.type == 0 )
                    {
                        // PBR

                        float E = 1.;
                        float roughness = 1.0 - material.smoothness * material.smoothness;
                        float alpha = roughness * roughness;
                        float metallic = material.metallic;
                        float reflectance = material.reflectance;
                        float specular = material.specularAmount;
                        float diffuse = 1.0 - specular;
                        vec4 color = vec4( material.color * diffuse + material.specularColor * specular, 1.0 );

                        vec3 brdf = vec3(0);

                        if (random() < reflectance)
                        {
                            vec3 brdf = tracerDirectIllumination1( hitOrigin, normal, ray.dir, material );

                            vec2 rand = rand2();
                            float xsi_1 = rand.x;
                            float xsi_2 = rand.y;
                            float phi = atan((alpha * sqrt(xsi_1)) / sqrt(1.0 - xsi_1));
                            float theta = 2.0 * PI * xsi_2;
                            vec3 direction = angleToDir(normal, theta, phi);

                            ray = Ray( hitOrigin, direction );

                            tcol += fcol * vec4( material.emission, 1.0 ) * E + fcol * color * vec4( brdf, 1.0 );
                            fcol *= color;
                        } else
                        {
                            float r2 = random();
                            vec3 d = jitter(normal, 2.*PI*random(), sqrt(r2), sqrt(1. - r2));

                            vec3 e = tracerDirectIllumination2( hitOrigin, normal, ray.dir, material );

                            float E = 1.;

                            ray = Ray( hitOrigin, d );

                            tcol += fcol * vec4( material.emission, 1.0 ) * E + fcol * color * vec4( e, 1.0 );
                            fcol *= color;
                        }
                    } else
                    if ( material.type == 1 )
                    {
                        // --- Dielectric - material.ior is the index of refraction

                        vec3 nl = dot(normal,ray.dir) < 0.0 ? normal : normal * -1.0;
                        float specular = material.specularAmount;
                        float diffuse = 1.0 - specular;
                        vec4 color = vec4( material.color * diffuse + material.specularColor * specular, 1.0 );
                        fcol *= color;

                        // Ideal dielectric REFRACTION
                        Ray reflRay = Ray( hitOrigin, ray.dir - normal * 2.0 * dot(normal,ray.dir));
                        bool into = dot(normal,nl) > 0.0;                // Ray from outside going in?

                        float nc = 1.0;   // IOR of air
                        float nt = material.ior; // IOR of solid
                        float nnt = into ? nc / nt : nt / nc;
                        float ddn = dot(ray.dir , nl);
                        float cos2t = 1.0 - nnt * nnt * (1.0 - ddn * ddn);

                        if (cos2t < 0.0)    // Total internal reflection
                        {
                            tcol += fcol * vec4( material.emission, 1.0);
                            ray = reflRay;
                        } else {
                            vec3 tdir = normalize(ray.dir * nnt - normal * ((into ? 1.0 : -1.0) * (ddn * nnt + sqrt(cos2t))));

                            float a = nt - nc;
                            float b = nt + nc;
                            float R0 = a * a / (b * b);
                            float c = 1.0 - (into ? -ddn : dot(tdir,normal));
                            float Re = R0 + (1.0 - R0) * c * c * c * c * c;
                            float Tr = 1.0 - Re;
                            float P = .25 + .5 * Re;
                            float RP = Re / P;
                            float TP = Tr / (1.0 - P);

                            if( random() < P )
                            {
                                // vec3 brdf = tracerDirectIllumination1( hitOrigin, normal, ray.dir, material );

                                ray = reflRay;
                                fcol = fcol * RP;
                                tcol += fcol * vec4( material.emission, 1.0 );// + fcol * vec4( brdf, 1.0 );

                            } else {

                                // vec3 e = tracerDirectIllumination2( hitOrigin, normal, ray.dir, material );

                                ray = Ray( hitOrigin, normalize( tdir ) );
                                fcol = fcol * TP;
                                tcol += fcol * vec4( material.emission, 1.0 );// + fcol * vec4( e, 1.0 );
                            }
                            // ray.origin += ray.dir * 0.0008;
                        }

                    } else
                    if ( material.type == 2 )
                    {
                        // --- Light
                        return vec4( material.emission, 1.0 );
                    }
                } else {
                    // vec4 backColor = vec4( 0 );
                    vec4 topColor = vec4( 0.1229, 0.3628, 0.7820, 1.0000 );
                    vec4 bottomColor = vec4( 1.0000, 1.0000, 1.0000, 1.0000 );
                    float t = 0.5 * ( ray.dir.y + 1.0 );
                    // vec4 backColor = vec4( 0.322, 0.322, 0.322, 0.0 );//( vec4( 1.0 )  - vec4( t )  ) * bottomColor + vec4( t )  * topColor;
                    vec4 backColor = vec4( 0.5, 0.5, 0.5, 1.0 );//( vec4( 1.0 )  - vec4( t )  ) * bottomColor + vec4( t )  * topColor;
                    // color = vec4( backColor.x, backColor.y, backColor.z, 1.0 ) ;

                    return tcol + fcol * backColor;
                }
            }

            {
                // Material material;
                // vec3 normal;

                vec3 hit = castRay( ray.origin, ray.dir, 0.001, 10.0 );

                if ( hit.y >= 0.0 )
                {
                    vec3 hitOrigin = ray.origin + ray.dir * hit.x;

                    normal = calcNormal( hitOrigin );

                    if ( hit.y < 2.0 ) {
                        material_1( hitOrigin, material, normal );
                    }
                    else if ( hit.y == 2.0 )
                    {
                        material.type = 2;
                        material.emission = LIGHT1_EM;
                    }

                    //hitOrigin = ray.origin + (ray.dir - material.bump) * hit.x;

                    if ( material.type == 0 )
                    {
                        // PBR

                        float E = 1.;
                        float roughness = 1.0 - material.smoothness * material.smoothness;
                        float alpha = roughness * roughness;
                        float metallic = material.metallic;
                        float reflectance = material.reflectance;
                        float specular = material.specularAmount;
                        float diffuse = 1.0 - specular;
                        vec4 color = vec4( material.color * diffuse + material.specularColor * specular, 1.0 );

                        vec3 brdf = vec3(0.0);

                        if (random() < reflectance)
                        {
                            vec3 brdf = tracerDirectIllumination1( hitOrigin, normal, ray.dir, material );

                            vec2 rand = rand2();
                            float xsi_1 = rand.x;
                            float xsi_2 = rand.y;
                            float phi = atan((alpha * sqrt(xsi_1)) / sqrt(1.0 - xsi_1));
                            float theta = 2.0 * PI * xsi_2;
                            vec3 direction = angleToDir(normal, theta, phi);

                            ray = Ray( hitOrigin, direction );

                            tcol += fcol * vec4( material.emission, 1.0 ) * E + fcol * color * vec4( brdf, 1.0 );
                            fcol *= color;
                        } else
                        {
                            float r2 = random();
                            vec3 d = jitter(normal, 2.*PI*random(), sqrt(r2), sqrt(1. - r2));

                            vec3 e = tracerDirectIllumination2( hitOrigin, normal, ray.dir, material );

                            float E = 1.;

                            ray = Ray( hitOrigin, d );

                            tcol += fcol * vec4( material.emission, 1.0 ) * E + fcol * color * vec4( e, 1.0 );
                            fcol *= color;
                        }
                    } else
                    if ( material.type == 1 )
                    {
                        // --- Dielectric - material.ior is the index of refraction

                        vec3 nl = dot(normal,ray.dir) < 0.0 ? normal : normal * -1.0;
                        float specular = material.specularAmount;
                        float diffuse = 1.0 - specular;
                        vec4 color = vec4( material.color * diffuse + material.specularColor * specular, 1.0 );
                        fcol *= color;

                        // Ideal dielectric REFRACTION
                        Ray reflRay = Ray( hitOrigin, ray.dir - normal * 2.0 * dot(normal,ray.dir));
                        bool into = dot(normal,nl) > 0.0;                // Ray from outside going in?

                        float nc = 1.0;   // IOR of air
                        float nt = material.ior; // IOR of solid
                        float nnt = into ? nc / nt : nt / nc;
                        float ddn = dot(ray.dir , nl);
                        float cos2t = 1.0 - nnt * nnt * (1.0 - ddn * ddn);

                        if (cos2t < 0.0)    // Total internal reflection
                        {
                            tcol += fcol * vec4( material.emission, 1.0);
                            ray = reflRay;
                        } else {
                            vec3 tdir = normalize(ray.dir * nnt - normal * ((into ? 1.0 : -1.0) * (ddn * nnt + sqrt(cos2t))));

                            float a = nt - nc;
                            float b = nt + nc;
                            float R0 = a * a / (b * b);
                            float c = 1.0 - (into ? -ddn : dot(tdir,normal));
                            float Re = R0 + (1.0 - R0) * c * c * c * c * c;
                            float Tr = 1.0 - Re;
                            float P = .25 + .5 * Re;
                            float RP = Re / P;
                            float TP = Tr / (1.0 - P);

                            if( random() < P )
                            {
                                // vec3 brdf = tracerDirectIllumination1( hitOrigin, normal, ray.dir, material );

                                ray = reflRay;
                                fcol = fcol * RP;
                                tcol += fcol * vec4( material.emission, 1.0 );// + fcol * vec4( brdf, 1.0 );

                            } else {

                                // vec3 e = tracerDirectIllumination2( hitOrigin, normal, ray.dir, material );

                                ray = Ray( hitOrigin, normalize( tdir ) );
                                fcol = fcol * TP;
                                tcol += fcol * vec4( material.emission, 1.0 );// + fcol * vec4( e, 1.0 );
                            }
                            // ray.origin += ray.dir * 0.0008;
                        }

                    } else
                    if ( material.type == 2 )
                    {
                        // --- Light
                        return vec4( material.emission, 1.0 );
                    }
                } else {
                    // vec4 backColor = vec4( 0 );
                    vec4 topColor = vec4( 0.1229, 0.3628, 0.7820, 1.0000 );
                    vec4 bottomColor = vec4( 1.0000, 1.0000, 1.0000, 1.0000 );
                    float t = 0.5 * ( ray.dir.y + 1.0 );
                    // vec4 backColor = vec4( 0.322, 0.322, 0.322, 0.0 );//( vec4( 1.0 )  - vec4( t )  ) * bottomColor + vec4( t )  * topColor;
                    vec4 backColor = vec4( 0.5, 0.5, 0.5, 1.0 );//( vec4( 1.0 )  - vec4( t )  ) * bottomColor + vec4( t )  * topColor;
                    // color = vec4( backColor.x, backColor.y, backColor.z, 1.0 ) ;

                    return tcol + fcol * backColor;
                }
            }

            return tcol;
        }

        #define SAMPLES 1

        vec3 Tonemap_ACES(const vec3 x) {
            // Narkowicz 2015, "ACES Filmic Tone Mapping Curve"
            const float a = 2.51;
            const float b = 0.03;
            const float c = 2.43;
            const float d = 0.59;
            const float e = 0.14;
            return (x * (a * x + b)) / (x * (c * x + d) + e);
        }

        void main()
        {
            float ratio = uCanvasSize.x / uCanvasSize.y;
            vec2 pixelSize = vec2(1.0) / uCanvasSize.xy;

            randv2=fract(cos((vTexCoord.xy+vTexCoord.yx*vec2(1000.0,1000.0))+vec2(uTime)*10.0));

            // --- Camera

            const float fov = 80.0;
            float halfWidth = tan(radians(fov) * 0.5);
            float halfHeight = halfWidth / ratio;

            vec3 upVector = vec3(0.0, 1.0, 0.0);

            vec3 w = normalize(uOrigin - uLookAt);
            vec3 u = cross(upVector, w);
            vec3 v = cross(w, u);

            vec3 lowerLeft = uOrigin-halfWidth * u - halfHeight * v - w;
            vec3 horizontal = u * halfWidth * 2.0;
            vec3 vertical = v * halfHeight * 2.0;

            // --- lights
/*
            lights[0].pos = vec3( 1, 2, 2 );
            lights[0].color = vec3( 1 );

            lights[1].pos = vec3( -80, 1, 20 );
            lights[1].color = vec3( 0.5 );
*/
            // ---

            vec4 color = vec4(0);

            for (int s = 0; s < SAMPLES; s++)
            {
                vec3 dir = lowerLeft - uOrigin;
                vec2 rand = rand2();
                // vec2 rand = vec2( 0.5 );

                dir += horizontal * (pixelSize.x * rand.x + vTexCoord.x);
                dir += vertical * (pixelSize.y * rand.y + 1.0 - vTexCoord.y);

                color += getColor( Ray( uOrigin, normalize(dir) ) );
            }

            color /= float( SAMPLES );
            color = vec4( clamp( pow( color.xyz, vec3(0.4545) ), 0.0, 1.0 ), color.a );
            // color = vec4( pow( color.xyz, vec3(0.4545) ), color.a );
            // color = vec4( clamp( Tonemap_ACES( color.xyz ), 0.0, 1.0 ), color.a );

            if ( uIter > 0 ) {
                vec4 lastColor = texture2D( uLast, vTexCoord, 0.0 );

                float weight = float(uIter+1);
                gl_FragColor = mix(lastColor, color, 1.0 / weight );
            } else gl_FragColor = color;
        }
    `;

    // console.log( this.shader.fSource );

    try {
        this.shader.create();
    } catch( err )
    {
        // console.log( this.shader.fSource );
        return;
    }

    this.iter = 0;
};

/**
 * Builds a simple and fast preview shader.
 * @param {string} globalCode - The global code needed to render the material. These are functions created by the node system like noises etc.
 * @param {string} code - The material function itself.
 */

VG.Nodes.MaterialRenderer.prototype.build=function( { globalCode, code, type = 0 } = {} )
{
    if ( this.shader.fSource ) this.shader.destroy();
    if ( globalCode === undefined || code === undefined ) return;

    this.shader.vSource = `
        #version 100
        precision highp float;
        attribute vec4 aPosition;
        attribute vec2 aTexCoord;

        varying vec2 vTexCoord;

        void main() {
            vTexCoord = vec2(aTexCoord.x, 1.0-aTexCoord.y);
            gl_Position = aPosition;
        }
    `;

    this.shader.fSource = `
        #version 100
        precision highp float;

        varying vec2 vTexCoord;

        uniform vec3 uOrigin, uLookAt;
        uniform vec2 uCanvasSize;

        uniform int uIter;
        uniform sampler2D uLast;
        uniform float uTime;

        struct Material {
            int type;
            vec3 color;
            vec3 specularColor;
            float specularAmount;
            float metallic;
            float smoothness;
            float reflectance;
            float bump;
            vec3 emission;
            float ior;
        };

        #define PI 3.1415926535897932384626422832795028841971

        #define LIGHT1_POS vec3( 1.5, 1.5, 8 )
        #define LIGHT1_EM vec3( 180, 180, 180 )

        vec2 randv2;

        float random() {
            randv2+=vec2(1.0,0.0);
            // return fract(sin(dot(vTexCoord, vec2(12.9898, 78.233)) + seed++) * 43758.5453);
            return fract(sin(dot(randv2.xy ,vec2(12.9898,78.233))) * 43758.5453);

        }

        vec2 rand2(){// implementation derived from one found at: lumina.sourceforge.net/Tutorials/Noise.html
            randv2+=vec2(1.0,1.0);
            return vec2(fract(sin(dot(randv2.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(randv2.xy ,vec2(4.898,7.23))) * 23421.631));
        }

        vec3 opU( vec3 d1, vec3 d2 )
        {
            return (d1.x<d2.x) ? d1 : d2;
        }

        vec3 opTwist( vec3 p, float twist )
        {
            float c = cos(twist*p.z);
            float s = sin(twist*p.z);
            mat2  m = mat2(c,-s,s,c);
            vec3  q = vec3(m*p.xy,p.z);
            return q;
        }

        float opS( float d1, float d2 )
        {
            return max(-d2,d1);
        }
/*
   tp=p;
    gResult1=opU( gResult1, vec3( length( max( abs( tp) - vec3( 399.741, 399.741, 399.741 ), 0.0 ) ) - 0.259, 2, 0 ) );
   tp=p;
    tp.y = tp.y + -19.0000;
    gResult1.x=opS( gResult1.x, length( max( abs( tp) - vec3( 84.000, 3.000, 3.000 ), 0.0 ) ) - 16.000);
*/

        vec3 map( vec3 p )
        {
            vec3 res=vec3( 1000000, -2, -1 );
            ${ type === 0 ? "res=opU( res, vec3( p.z, 0, 0 ) );" :
                type === 1 ? "res=opU( res, vec3( length( p ) - 1.0, 0, 0 ) );" :
                type === 2 ? `vec3 tp=p;tp.zxy=opTwist( tp.zxy, 2.531 );
                res=opU( res, vec3( length( max( abs(tp) - vec3( 0.213 * 3.0, 0.978 * 3.0, 0.213 * 3.0 ), 0.0 ) ) - 0.10, 0, 0 ) );`
                : //`res=opU( res, vec3( length( max( abs(p) - vec3( 40, 40, 40 ), 0.0 ) ) - 0.259, 0, 0 ) );
                   //vec3 tp = p; tp.z -= 4.9;
                   //res.x=opS( res.x, length( max( abs(tp) - vec3( 1, 0.5, 5 ), 0.0 ) ) - 0.900);
                //`
                "res=opU( res, vec3( p.y + 1.5, 0, 0 ) );"
            }
            // res=opU( res, vec3( length( p ) - 1.0, 0, 0 ) );
            res=opU( res, vec3( length( p - LIGHT1_POS ) - 1.0, 2, 2 ) ); // Light #1

            return res;
        }

        // --- Cast a ray into the scene

        vec3 castRay( in vec3 ro, in vec3 rd, in float tmin, in float tmax )
        {
            float t=tmin;
            float m=-1.0, id=-1.0;

            for( int i=0; i<100; i++ )
            {
                // float precis = 0.002;
                float precis = 0.0005*t;

                vec3 res = map( ro+rd*t );
                if( t<precis || t>tmax ) break;
                t += res.x;
                m = res.y;
                id = res.z;
            }

            if( t>tmax ) { m=-1.0; id=-1.0; }
            return vec3( t, m, id );
        }
    `;

    this.shader.fSource += globalCode;
    this.shader.fSource += code;
    this.shader.fSource += `

        struct Ray {
            vec3 origin;
            vec3 dir;
        };

        vec3 calcNormal( in vec3 pos )
        {
            vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
            return normalize( e.xyy*map( pos + e.xyy ).x +
                            e.yyx*map( pos + e.yyx ).x +
                            e.yxy*map( pos + e.yxy ).x +
                            e.xxx*map( pos + e.xxx ).x );
        }

        vec4 getColor( in Ray ray )
        {
            vec4 color = vec4(0);

            Material material;
            vec3 normal;

            vec3 hit = castRay( ray.origin, ray.dir, 0.001, 10.0 );

            if ( hit.y >= 0.0 )
            {
                vec3 hitOrigin = ray.origin + ray.dir * hit.x;

                material_1( hitOrigin, material, normal );
                color = vec4( material.color, 1.0 );
            } else {
                color = vec4( 0.5, 0.5, 0.5, 1.0 );
            }

            return color;
        }

        #define SAMPLES 4

        vec3 Tonemap_ACES(const vec3 x) {
            // Narkowicz 2015, "ACES Filmic Tone Mapping Curve"
            const float a = 2.51;
            const float b = 0.03;
            const float c = 2.43;
            const float d = 0.59;
            const float e = 0.14;
            return (x * (a * x + b)) / (x * (c * x + d) + e);
        }

        void main()
        {
            float ratio = uCanvasSize.x / uCanvasSize.y;
            vec2 pixelSize = vec2(1.0) / uCanvasSize.xy;

            randv2=fract(cos((vTexCoord.xy+vTexCoord.yx*vec2(1000.0,1000.0))+vec2(uTime)*10.0));

            // --- Camera

            const float fov = 80.0;
            float halfWidth = tan(radians(fov) * 0.5);
            float halfHeight = halfWidth / ratio;

            vec3 upVector = vec3(0.0, 1.0, 0.0);

            vec3 w = normalize(uOrigin - uLookAt);
            vec3 u = cross(upVector, w);
            vec3 v = cross(w, u);

            vec3 lowerLeft = uOrigin-halfWidth * u - halfHeight * v - w;
            vec3 horizontal = u * halfWidth * 2.0;
            vec3 vertical = v * halfHeight * 2.0;

            // ---

            vec4 color = vec4(0);

            for (int s = 0; s < SAMPLES; s++)
            {
                vec3 dir = lowerLeft - uOrigin;
                vec2 rand = rand2();
                // vec2 rand = vec2( 0.5 );

                dir += horizontal * (pixelSize.x * rand.x + vTexCoord.x);
                dir += vertical * (pixelSize.y * rand.y + 1.0 - vTexCoord.y);

                color += getColor( Ray( uOrigin, normalize(dir) ) );
            }

            color /= float( SAMPLES );
            color = vec4( clamp( pow( color.xyz, vec3(0.4545) ), 0.0, 1.0 ), color.a );
            // color = vec4( pow( color.xyz, vec3(0.4545) ), color.a );
            // color = vec4( clamp( Tonemap_ACES( color.xyz ), 0.0, 1.0 ), color.a );

            if ( uIter > 0 ) {
                vec4 lastColor = texture2D( uLast, vTexCoord, 0.0 );

                float weight = float(uIter+1);
                gl_FragColor = mix(lastColor, color, 1.0 / weight );
            } else gl_FragColor = color;
        }
    `;

    // console.log( this.shader.fSource );

    try {
        this.shader.create();
    } catch( err )
    {
        // console.log( this.shader.fSource );
        return;
    }

    this.iter = 0;
};

/**
 * Returns the duration of the last render pass in milliseconds. Returns undefined if the render is not yet finished.
 * @returns {number} The duration of the last render in ms or undefined.
 */

VG.Nodes.MaterialRenderer.prototype.getTiming=function()
{
    if ( !this.query ) return null;
    if ( VG.webgl2 ) {
        let available = VG.WebGL.gl.getQueryParameter( this.query, VG.WebGL.gl.QUERY_RESULT_AVAILABLE);
        let disjoint = VG.WebGL.gl.getParameter( VG.WebGL.queryExt.GPU_DISJOINT_EXT);

        if (available && !disjoint) {
            // See how much time the rendering of the object took in nanoseconds.
            let timeElapsed = VG.WebGL.gl.getQueryParameter( this.query, VG.WebGL.gl.QUERY_RESULT);
            return timeElapsed / 1000000;
        }
    } else
    {
        // ...at some point in the future, after returning control to the browser and being called again:
        var available = this.queryExt.getQueryObjectEXT( this.query, this.queryExt.QUERY_RESULT_AVAILABLE_EXT);
        var disjoint = VG.WebGL.gl.getParameter(this.queryExt.GPU_DISJOINT_EXT);

        if (available && !disjoint) {
            // See how much time the rendering of the object took in nanoseconds.
            let timeElapsed = this.queryExt.getQueryObjectEXT(this.query, this.queryExt.QUERY_RESULT_EXT);
            return timeElapsed / 1000000;
        }
    }
};

/**
 * Renders one iteration.
 */

VG.Nodes.MaterialRenderer.prototype.render=function( rect, { noZoom = false } = {} )
{
    // --- Run it

    let b = this.buffer;
    let shader = this.shader;
    let rt = this.rt, rt1 = this.rt1;

    let width = rect.width, height = rect.height;

    if ( width !== rt.width || height !== rt.height ) {
        rt.resetSize( width, height );
        rt1.resetSize( width, height );
    }

    if ( !this.iter ) this.startTime=Date.now();

    rt.bind();
    rt.setViewport( VG.Core.Rect( 0, 0, width, height ) );
    rt.clear( undefined, true );

    this.createFrame( 0, 0, width, height, this.buffer );

    shader.bind();
    b.bind();

    let stride = b.getStride();
    b.vertexAttrib(shader.getAttrib("aPosition"), 2, false, stride * 4, 0);
    b.vertexAttrib(shader.getAttrib("aTexCoord"), 2, false, stride * 4, stride * 2);

    // this.camera.fov = 80.0/180 * Math.PI;
    this.camera.aspect = width / height;
    this.camera.setLookAt(new VG.Math.Vector3(0, 0, 0), new VG.Math.Vector3(0, 1, 0), new VG.Math.Vector3(0, 0, 5), true);
    if ( !noZoom )
        this.camera.setBoundingBox( new VG.Math.Vector3(-1.32, -1.32, -1.32), new VG.Math.Vector3(1.32, 1.32, 1.32) );

    shader.setFloat( "uOrigin", [this.camera.eye.x,this.camera.eye.y,this.camera.eye.z] );
    shader.setFloat( "uLookAt", [this.camera.center.x,this.camera.center.y,this.camera.center.z] );

    shader.setFloat( "uCanvasSize", [ width, height ] );
    shader.setFloat( "uTime", ( Date.now() - this.startTime ) / 1000.0 );
    shader.setInt( "uIter", this.iter );

    shader.setTexture( this.uLast, rt1, 0 );

    if ( VG.webgl2 )
    {
        if ( !this.query ) this.query = VG.WebGL.gl.createQuery();
        VG.WebGL.gl.beginQuery( VG.WebGL.queryExt.TIME_ELAPSED_EXT, this.query );
        b.drawBuffer( VG.Renderer.Primitive.TriangleStrip, 0, 4 );
        VG.WebGL.gl.endQuery( VG.WebGL.queryExt.TIME_ELAPSED_EXT );
    } else {
        if ( !this.query ) this.query = this.queryExt.createQueryEXT();
        this.queryExt.beginQueryEXT( this.queryExt.TIME_ELAPSED_EXT, this.query );
        b.drawBuffer( VG.Renderer.Primitive.TriangleStrip, 0, 4 );
        this.queryExt.endQueryEXT( this.queryExt.TIME_ELAPSED_EXT );
    }

    rt.unbind();

    this.copyRenderTarget( rt, rt1 );

    this._mainRT.setViewport(VG.context.workspace.rect);
    this.iter++;

    return rt1;
};

