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

/** Render pipeline
 *  @constructor */

VG.Render.Pipeline = function()
{
    /** Default material
     *  @member {VG.Render.Material} */
    this.defaultMaterial = new VG.Render.SimpleMaterial();
};

/** Draws a mesh with the given context
 *  @param {VG.Render.Context} context - The context
 *  @param {VG.Render.Mesh} mesh - The mesh to render */

VG.Render.Pipeline.prototype.drawMesh = function(context, mesh)
{
    var material = mesh.material || this.defaultMaterial;
    material.bind(context);

	var mvM = new VG.Math.Matrix4(context.camera.getTransform());
	mvM.invert();
	mvM.multiply(mesh.getTransform());
    material.setModelViewMatrix(mvM.elements);
    material.setProjectionMatrix(context.camera.projM.elements);

    VG.Renderer().drawMesh(mesh, -1, material.shader);
};

/**
 * Update the env map for every object in scene that have
 * material MtlMaterial and opt.illum 3, 4, 5, 6, 7.
 */

VG.Render.Pipeline.prototype.updateEnvMapping = function(context, scene)
{
    var renderables = scene.findAllVisible(context, true);
    var faces = ['cube_top', 'cube_bottom', 'cube_front',
        'cube_back', 'cube_left', 'cube_right'];
    var far = 100;
    var up = [
        new VG.Math.Vector3(0, 1, 0),
        new VG.Math.Vector3(0, 1, 0),
        new VG.Math.Vector3(0, 0, 1),
        new VG.Math.Vector3(0, 0, 1),
        new VG.Math.Vector3(0, 1, 0),
        new VG.Math.Vector3(0, 1, 0)
    ];
    var savedCamera = context.camera;
    var camera = new VG.Render.Camera(45, 1, 0.01, 100);
    var dim = 256;
    var clearColor = new VG.Core.Color(1, 0 ,0);
    var mesh, mat, opt, j;

    for(var i = 0; i < renderables.length; i++) {
        mesh = renderables[i];
        mat = mesh.material;
        if ((mat.className === 'MtlMaterial') && (mat.opt.illum >= 3 && mat.opt.illum <= 7)) {
            opt = mat.opt;
            opt.refl = opt.refl || {};
            var isStatic = false;
            for (j = 0; j < faces.length; j++) {
                if (opt.refl[faces[j]] && opt.refl[faces[j]]) {
                    isStatic = true;
                    break;
                }
            }
            if (!isStatic) {// update only for dynamic env map
                opt.targetIllum = opt.illum;
                opt.illum = 2;
                opt.toUpdateEnvMapping = true;
            }
        }
    }
    for(i = 0; i < renderables.length; i++){
        mesh = renderables[i];
        mat = mesh.material;
        opt = mat && mat.opt;
        if(opt && opt.toUpdateEnvMapping){
            opt.toUpdateEnvMapping = undefined;
            camera.position = mesh.position;
            var savedParent = mesh.parent;
            mesh.parent = undefined;
            var center = camera.position;
            var dir = [
                new VG.Math.Vector3(far, 0, 0).add(center),
                new VG.Math.Vector3(-far, 0, 0).add(center),
                new VG.Math.Vector3(0, far, 0).add(center),
                new VG.Math.Vector3(0, -far, 0).add(center),
                new VG.Math.Vector3(0, 0, far).add(center),
                new VG.Math.Vector3(0, 0, -far).add(center)
            ];
            var images = [];
            for(j = 0; j < 6; j++){
                camera.setLookAt(dir[j], up[j]);
                context.camera = camera;
                var buffer = new VG.RenderTarget(dim, dim, false);
                buffer.create();
                buffer.bind();
                buffer.clear(clearColor, true);
                this.drawScene(context, scene, 0);
                //var image = buffer.toImage();
                //var image = VG.Utils.textureToImage(buffer);
                var image = VG.Utils.renderTargetToImage(buffer);
                buffer.unbind();
                images.push(image);
            }
            mesh.parent = savedParent;
            var cubeTexture = new VG.Texture(images, true);
            cubeTexture.flipY = false;
            cubeTexture.create();
            opt.refl.texture = cubeTexture;
            mat.textureNeedsUpdate = false;
            opt.illum = opt.targetIllum;
            mat.needsUpdate = true;
            opt.targetIllum = undefined;
        }
    }
    context.camera = savedCamera;
};

/**
 * Test hit for all visible meshes scene
 * @param context {VG.Render.Context} WebGL context
 * @param {VG.Render.SceneManager} scene - The scene to render
 * @param x {Number} x of test pixel
 * @param y {Number} y of test pixel
 * @return {VG.Render.Mesh} mesh hit at point (x, y) , or null if none hit
 */

VG.Render.Pipeline.prototype.hitTestScene = function(context, scene, x, y)
{
    var renderables = scene.findAllVisible(context, true);
    return this.hitTestMeshes(context, renderables, x, y);
};

/**
 * Test hit among meshes at pixel x, y
 * @param context {VG.Render.Context} WebGL context
 * @param meshes {Array[]} Array of hit-able mesh
 * @param x {Number} x of test pixel
 * @param y {Number} y of test pixel
 * @return {VG.Render.Mesh} mesh hit at point (x, y) , or null if none hit
 */

VG.Render.Pipeline.prototype.hitTestMeshes = function(context, meshes, x, y)
{
    var vSrc = [
        '#version 100',
        'attribute vec4 position;',
        'attribute vec3 normal;',

        'uniform mat4 viewM;',
        'uniform mat4 projM;',
        'uniform mat4 modelM;',

        'void main() {',
        '   mat4 vmM = viewM * modelM;',
        '   vec4 pos = vmM * position;',
        '   gl_Position = projM * pos;',
        '}'
    ].join("\n");

    var fSrc = [
        '#version 100',
        'precision mediump float;',
        'uniform vec3 pickColor;',

        'void main() {',
        '   gl_FragColor = vec4(pickColor, 1.0);',
        '}'
    ].join("\n");

    var width = VG.Renderer().w;
    var height = VG.Renderer().h;
    var origX=x;
    var origY=y;
    x = Math.round( x * width / context.size2D.width );
    y = Math.round( y * height / context.size2D.height );

    if (x < 0 || y < 0 || x >= width || y >= height) {
        return null;
    }

    var clearColor = new VG.Core.Color("#ffffff");

    /**
     * Setup render target.
     * Render target is not anti-aliased, event though the canvas is anti-aliased.
     * This is good, then we can use color as id for each mesh.
     * @type {VG.RenderTarget}
     */
    var buffer = new VG.RenderTarget(width, height, false);
    buffer.create();
    buffer.bind();
    buffer.clear(clearColor, true);

    var shader = new VG.Shader(vSrc, fSrc);
    shader.depthTest = true;
    shader.depthWrite = true;
    shader.create();
    shader.bind();

    shader.setMatrix("viewM", context.camera.getTransform().invert().elements);
    shader.setMatrix("projM", context.camera.projM.elements);
    /**
     * bits used for each color to represent mesh id
     * @type {number}
     */
    var bit = 1;
    while ((meshes.length >= (1 << (bit*3))) && (bit < 8)) {
        bit ++;
    }
    function idToColor(id) {
        /**
         * Convert mesh id to color used to render the mesh
         * @param id {Int} mesh id
         * @return {Array[Float]} color ready to use for shader vec3
         */
        var epsilon = 0.5/256;
        var color = [id % (1<<bit), (id >> bit) % (1<<bit), id >> (2*bit)];
        for(var i = 0; i < color.length; i++) {
            color[i] /= (1<<bit);
            color[i] += epsilon;
        }
        return color;
    }
    function colorToId(color) {
        /**
         * Convert pixel color to mesh id
         * @param color {Array} Array contains [r, g, b]
         * @return {Number} id of the mesh
         */
        for(var i = 0; i < color.length; i++) {
            color[i] >>= (8-bit);
        }
        return (((color[2] << bit) + color[1]) << bit) + color[0];
    }
    for(var i=0; i<meshes.length; i++) {
        shader.setMatrix("modelM", meshes[i].getTransform().elements);
        shader.setFloat('pickColor', idToColor(i));
        VG.Renderer().drawMesh(meshes[i], -1, shader);
        //VG.log(idToColor(i));
    }
    var selectedId = -1;
    // ignore hit test if draw on render target does not complete
    if (buffer.checkStatusComplete()) {

        var dataSize=4;
        var data=new Uint8Array( dataSize );
        buffer.fillPixelBuffer( { x : x, y : y, width : 1, height : 1 }, data );
        selectedId = colorToId([data[0],data[1],data[2]] );

        data=null;

        //var image = VG.Utils.textureToImage(buffer);
        //var cimage = VG.compressImage(image);
        //VG.SaveFileDialog(VG.UI.FileDialog.Image, "image.png", cimage);
    }
    buffer.unbind();
    VG.Renderer().removeResource(buffer);
    if (selectedId >= meshes.length || selectedId < 0) {
        return null;
    }
    return meshes[selectedId];
};

/** Draws an scene manager with the given context
 *  @param {VG.Render.Context} context - The context
 *  @param {VG.Render.SceneManager} scene - The scene to render
 *  @param {Number} delta - The delta time */

VG.Render.Pipeline.prototype.drawScene = function(context, scene, delta)
{
    var renderables = scene.findAllVisible(context, true);
    for (var i = 0; i < renderables.length; i++)
        renderables[i].onDraw(this, context, delta);
};

/** Render context
 *  @constructor */

VG.Render.Context = function()
{
    /** Camera to get view and projection matrices
     *  @member {VG.Render.Camera} */
    this.camera = new VG.Render.Camera();

	/** lights
	* @member {Array[VG.Render.Light]} lights
	*/
	// this.lights = [];
    // this.emissiveObjects = [];

    /** Determines if tracing should be used
     *  @member {Bool}[false] trace */
    this.trace = false;


    /** Trace context, automatically set by the pipeline drawScene
     *  @member {VG.Render.TraceContext}[null] */
    this.traceContext = null;


    /** 2D Dimmensions for post fx / overlay
     *  @member {VG.Core.Size} */
    this.size2D = VG.Core.Size();
};
