/*
 * (C) Copyright 2014, 2015 Luis Jimenez <kuko@kvbits.com>.
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

VG.Render.Pipeline = function()
{
    /** Render pipeline 
     *  @constructor */

    /** Defualt material 
     *  @member {VG.Render.Material} */
    this.defaultMaterial = new VG.Render.SimpleMaterial();
}

VG.Render.Pipeline.prototype.drawMesh = function(context, mesh)
{
    /** Draws a mesh with the given context 
     *  @param {VG.Render.Context} context - The context 
     *  @param {VG.Render.Mesh} mesh - The mesh to render */

    var material = mesh.material || this.defaultMaterial;

    //render the model
    material.bind();

    var shader = material.shader;

    //TODO handle multi-material


    //TODO param id cache
    shader.setMatrix("viewM", context.camera.getTransform().invert().elements);
    shader.setMatrix("projM", context.camera.projM.elements); 
    shader.setMatrix("modelM", mesh.getTransform().elements);

    //hardcoded to draw all elements at once
    VG.Renderer().drawMesh(mesh, -1, shader);
}

VG.Render.Pipeline.prototype.drawScene = function(context, scene, delta)
{
    /** Draws an scene manager with the given context
     *  @param {VG.Render.Context} context - The context 
     *  @param {VG.Render.SceneManager} scene - The scene to render 
     *  @param {Number} delta - The delta time */

    //2d dimmensions
    var w = context.size2D.width;
    var h = context.size2D.height;

    var renderables = scene.findAllVisible(context, true);

    for (var i = 0; i < renderables.length; i++)
    {
        renderables[i].onDraw(this, context, delta);
    }

    
    if (context.trace)
    {
        if (!context.traceContext)
        {
            context.traceContext = new VG.Render.TraceContext();
        }

        var traceCtx = context.traceContext;

        var scaledW = Math.max(Math.round(w * traceCtx.scaleRatio), 2);
        var scaledH = Math.max(Math.round(h * traceCtx.scaleRatio), 2);

        //update the output size if needed
        if (traceCtx.output.width != scaledW || traceCtx.output.height != scaledH)
        {
            traceCtx.output.clear();

            traceCtx.output.height = scaledH;
            traceCtx.output.width = scaledW;
            traceCtx.output.alloc();

            traceCtx.output.needsUpdate = true;
            traceCtx.resetAccumulation = true;
        }
        
        if (VG.Render.trace)
        {
            //this call the native implementation
            VG.Render.trace(traceCtx, context.camera, scene);
        }
        else
        {
            //if trace is not defined means it's not available in this platform, call network trace instead
            VG.Render.networkTrace(traceCtx, context.camera, scene);
        }

        var alpha = VG.Math.clamp(traceCtx.iterations / (traceCtx.maxIterations / 10), 0.0, 1.0);

        //render the texturw where the trace gets updated to
        VG.Renderer().drawQuad(traceCtx.texture, w, h, 0, 0, alpha, context.size2D);
    }
}



VG.Render.Context = function()
{
    /** Render context class 
     *  @constructor */


    /** Camera to get view and projection matrices 
     *  @member {VG.Render.Camera} */
    this.camera = new VG.Render.Camera();


    /** Determines if tracing should be used 
     *  @member {Bool}[false] trace */
    this.trace = false;


    /** Trace context, automatically set by the pipeline drawScene
     *  @member {VG.Render.TraceContext}[null] */
    this.traceContext = null;


    /** 2D Dimmensions for post fx / overlay
     *  @member {VG.Core.Size} */
    this.size2D = VG.Core.Size();

}



