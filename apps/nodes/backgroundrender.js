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

function startRender( name )
{
    VG.context.renderOptions[name]=true;
    if ( !VG.context.workspace.renderCallback )
        VG.context.workspace.renderCallback=render;
}

function render( canvas )
{
    if ( VG.context.renderOptions.materialStripPreviews )
    {
        let materials=VG.context.dc.materials;

        for ( let i=0; i < materials.length; ++i )
        {
            let item = materials[i];
            let rect=VG.Core.Rect( 0, 0, item.previewStripWidth, item.previewStripHeight );

            if ( !item.previewStripImage || item.previewStripNeedsUpdate )
            {
                let graph = VG.context.rendererGraph, renderer = VG.context.renderer;

                if ( renderer.item !== item ) {
                    graph.clear();
                    graph.load( item.data );
                    let rc = graph.compileAsMaterial();
                    renderer.build( { globalCode : rc.globalCode, code : rc.code, type : 0 } );
                    renderer.item = item;
                }

                // ---

                if ( !item.previewStripImage ) item.previewStripImage = VG.Core.Image( rect.width, rect.height );
                else item.previewStripImage.resize( rect.width, rect.height );

                let rt = renderer.render( rect, { noZoom : true } );
                let iter = renderer.iter;
                if ( rt ) {

                    let roundRect = function( ctx, x, y, w, h, r )
                    {
                        ctx.beginPath();

                        ctx.lineTo(x + w -r, y);
                        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                        ctx.lineTo(x + w, y + h - r);
                        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                        ctx.lineTo(x + r, y + h);
                        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                        ctx.lineTo(x, y + r);
                        ctx.quadraticCurveTo(x, y, x + r, y);

                        ctx.closePath();

                        ctx.fill();
                        ctx.stroke();
                    };

                    let canvas = VG.context.workspace.canvas;

                    let textureCanvas=document.getElementById( 'textureCanvas' );
                    let ctx=textureCanvas.getContext('2d');

                    ctx.canvas.width=rt.width;
                    ctx.canvas.height=rt.height;

                    ctx.setTransform(1, 0, 0, 1, 0, 0);

                    // --- Draw Background and Text

                    ctx.fillStyle = "#ffffff";
                    ctx.strokeStyle =  "#ffffff";
                    ctx.lineWidth = 0;

                    ctx.font = '12px Open Sans';

                    let textSize = Math.max( ctx.measureText( item.text).width, ctx.measureText( item.category ? item.category : "" ).width, 100 ) + 12;

                    ctx.globalAlpha = 0.2;
                    roundRect( ctx, 4, 4, textSize, rt.height - 8, 2 );

                    let text;
                    if ( !item.type ) text="Inbuilt";
                    else if ( item.type === 1 ) text="My Cloud";
                    else if ( item.type === 2 ) text="Community";
                    else if ( item.type === 3 ) text="Upload";

                    textSize = Math.ceil( ctx.measureText( text ).width );
                    let x = rt.width - 8 - textSize - 4;
                    roundRect( ctx, x, 4, textSize + 8, 12 + 8, 2 );

                    ctx.globalAlpha = 1.0;

                    ctx.translate(rt.width/2,rt.height/2);
                    ctx.scale( 1, -1 );
                    ctx.translate(-rt.width/2,-rt.height/2);

                    let color=VG.UI.stylePool.current.skin.ListWidget.TextColor;

                    ctx.fillStyle = color.toCanvasStyle();
                    ctx.fillText( item.text, 10, 16 );
                    // ctx.strokeText( item.text, 10, 16 );

                    if ( item.category )
                        ctx.fillText( item.category, 10, 30 );

                    ctx.fillText( text, rt.width - 4 - textSize - 4, 30 );

                    // ---

                    let image = VG.Utils.canvasToImage( ctx );

                    rt.bind();
                    rt.setViewportEx( 0, 0, rt.width, rt.height );

                    let renderer = VG.Renderer();
                    renderer.drawQuad( renderer.getTexture( image ), rt.width, rt.height, 0, 0, 1, { width : rt.width, height : rt.height } );

                    rt.unbind();
                    image.dispose();

                    item.previewStripImage = VG.Utils.renderTargetToImage( rt, item.previewStripImage );

                    // if ( iter === 20 )
                    {
                        item.previewStripNeedsUpdate = false;
                        renderer.item = undefined;
                    }
                }

                VG.update();
                return;
            }
        }

        VG.context.renderOptions.materialStripPreviews = false;
    }

    // --- All done

    VG.context.renderOptions.render = false;
    VG.context.workspace.renderCallback = undefined;
}