/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv>
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

VG.Utils.typedArrayToEMS=function( jsArray ) 
{
    var numBytes= jsArray.length * jsArray.BYTES_PER_ELEMENT;
        
    // malloc enough space for the data
    var ptr= Module._malloc(numBytes);

    // get a bytes-wise view on the newly allocated buffer
    var heapBytes= new Uint8Array(Module.HEAPU8.buffer, ptr, numBytes);
        
    // copy data into heapBytes
    heapBytes.set(new Uint8Array(jsArray.buffer));
        
    return { offset : heapBytes.byteOffset, length : jsArray.length };
    // call the c function which should modify the vals
    // my_emscripten_func(heapBytes.byteOffset, jsArray.length);
        
    // print out the results of the c function
    // var heapFloats= new Float32Array(heapBytes.buffer, heapBytes.byteOffset, floatData.length);
    // for (i= 0; i < heapFloats.length; i++) {
        // console.log(i + ": " + heapFloats[i]);
    // }
        
    // free the heap buffer
    // Module._free(heapBytes.byteOffset);    
}

VG.Utils.loadAppImage=function( imageName ) 
{
    VG.sendBackendRequest( "/images/" + VG.AppSettings.name + "/" + imageName, {}, function( response ) {

        var data=JSON.parse( response );

        var image=new VG.Core.Image();
        image.name=data.name;

        VG.decompressImageData( data.content, image );
        VG.Core.imagePool.addImage( image );    
        VG.update();

    }.bind( this ), "GET" );
}

VG.Utils.bytesToSize = function(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

VG.Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

VG.Utils.getImageByName=function( name )
{
    for( var i=0; i < VG.context.imagePool.images.length; ++i ) {
        if ( VG.context.imagePool.images[i].name === name )
            return VG.context.imagePool.images[i];
    }

    var prefixName=VG.UI.stylePool.current.skin.prefix + name;
    for( var i=0; i < VG.context.imagePool.images.length; ++i ) {
        if ( VG.context.imagePool.images[i].name === prefixName )
            return VG.context.imagePool.images[i];
    }

    if ( VG.UI.stylePool.current.skin.fallbackPrefix ) {
        prefixName=VG.UI.stylePool.current.skin.fallbackPrefix + name;
        for( var i=0; i < VG.context.imagePool.images.length; ++i ) {
            if ( VG.context.imagePool.images[i].name == prefixName )
                return VG.context.imagePool.images[i];
        }
    }

    return null;
};

VG.Utils.getSVGByName=function( name )
{
    if ( !VG.Core.SVG ) return null;

    for( var i=0; i < VG.context.svgPool.svgs.length; ++i ) {
        if ( VG.context.svgPool.svgs[i].name === name )
            return VG.context.svgPool.svgs[i];
    }

    var prefixName=VG.UI.stylePool.current.skin.prefix + name;
    for( var i=0; i < VG.context.svgPool.svgs.length; ++i ) {
        if ( VG.context.svgPool.svgs[i].name === prefixName )
            return VG.context.svgPool.svgs[i];
    }

    if ( VG.UI.stylePool.current.skin.fallbackPrefix ) {
        prefixName=VG.UI.stylePool.current.skin.fallbackPrefix + name;
        for( var i=0; i < VG.context.svgPool.svgs.length; ++i ) {
            if ( VG.context.svgPool.svgs[i].name == prefixName )
                return VG.context.svgPool.svgs[i];
        }
    }

    return null;
};

VG.Utils.getSVGGroupByName=function( name, group )
{
    var svg=VG.Utils.getSVGByName( name );

    if ( svg ) return svg.getGroupByName( group );
    return null;
};

VG.Utils.getTextByName=function( name, split )
{
    if ( VG.App && VG.App.texts && VG.App.texts[name] )
    {
        var text=VG.Utils.decompressFromBase64( VG.App.texts[name] );
        if ( !split ) return text;
        else return text.split( ":::" );
    }

    return null;
};

VG.Utils.addDefaultFileMenu=function( menubar )
{
    var fileMenu=menubar.addMenu( "File" );
    VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.New );
    fileMenu.addSeparator();
    VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.Open );

    if ( VG.getHostProperty( VG.HostProperty.Platform ) === VG.HostProperty.PlatformWeb )
    {
        VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.Open_Local );
    }

    fileMenu.addSeparator();
    VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.Save );
    VG.context.workspace.addMenuItemRole( fileMenu, VG.UI.ActionItemRole.SaveAs );

    return fileMenu;
};

VG.Utils.addDefaultEditMenu=function( menubar )
{
    var editMenu=menubar.addMenu( "Edit" );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Undo );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Redo );
    editMenu.addSeparator();
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Cut );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Copy );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Paste );
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.Delete );
    editMenu.addSeparator();
    VG.context.workspace.addMenuItemRole( editMenu, VG.UI.ActionItemRole.SelectAll );

    return editMenu;
};

VG.Utils.addDefaultDownloadMenu=function( menubar )
{
    var downloadMenu=menubar.addMenu( "Download" );

    var menuItem=new VG.UI.MenuItem( "Mac OS X Desktop Version", null, function() {
        VG.log( "https://visualgraphics.tv/app/download/" + VG.context.workspace.appId + "/mac" );
        VG.gotoWebLink( "https://visualgraphics.tv/app/download/" + VG.context.workspace.appId + "/mac" );
    }.bind( this ) );
    menuItem.statusTip="Download the native Mac OS X Version of this Application.";


    downloadMenu.addMenuItem( menuItem );
    menuItem=new VG.UI.MenuItem( "Windows: Coming Soon", null, null ); menuItem.disabled=true;
    downloadMenu.addMenuItem( menuItem );
    menuItem=new VG.UI.MenuItem( "Linux : Coming Soon", null, null ); menuItem.disabled=true;
    downloadMenu.addMenuItem( menuItem );

    return downloadMenu;
};

VG.Utils.addDefaultQuickDownloadMenu=function()
{
    var downloadItem=VG.context.workspace.addQuickMenuItem( "DOWNLOADS" );

    var macItem=downloadItem.addItem( "MAC OS X DESKTOP VERSION", function() {
        VG.log( "https://visualgraphics.tv/app/download/" + VG.context.workspace.appId + "/mac" );
        VG.gotoUrl( "https://visualgraphics.tv/app/download/" + VG.context.workspace.appId + "/mac" );
    }.bind( this ) );
    macItem.statusTip="Download the native Mac OS X Version of this Application.";

    var win64Item=downloadItem.addItem( "WINDOWS DESKTOP VERSION", function() {
        VG.log( "https://visualgraphics.tv/app/download/" + VG.context.workspace.appId + "/win64" );
        VG.gotoUrl( "https://visualgraphics.tv/app/download/" + VG.context.workspace.appId + "/win64" );
    }.bind( this ) );
    win64Item.statusTip="Download the native Windows 64-Bit Desktop Version of this Application.";

    var linuxItem=downloadItem.addItem( "LINUX VERSION COMING SOON", function() {
        VG.log( "https://visualgraphics.tv/app/download/" + VG.context.workspace.appId + "/unix" );
        VG.gotoUrl( "https://visualgraphics.tv/app/download/" + VG.context.workspace.appId + "/unix" );
    }.bind( this ) );
    linuxItem.statusTip="Download the native Linux Desktop Version of this Application.";
    linuxItem.disabled=true;
};

VG.Utils.addDefaultViewMenu=function( menubar )
{
    var viewMenu=menubar.addMenu( "View" );

    for( var i=0; i < VG.UI.stylePool.styles.length; ++i ) 
    {
        var style=VG.UI.stylePool.styles[i];

        for( var s=0; s < style.skins.length; ++s ) 
        {
            var skin=style.skins[s];

            var menuItem=new VG.UI.MenuItem( style.name + " - " + skin.name, null, function() {

                VG.context.workspace.switchToStyle( this.style, this.skin );
            } );
            menuItem.statusTip="Activates this User Interface Style / Skin.";

            menuItem.style=style;
            menuItem.skin=skin;

            if ( style === VG.UI.stylePool.current && skin === VG.UI.stylePool.current.skin )
                menuItem.checked=menuItem.checkable=true;

            for ( var ex=0; ex < viewMenu.items.length; ++ex )
                menuItem.addExclusions( viewMenu.items[ex] );

            viewMenu.addMenuItem( menuItem );
        }
    }

    return viewMenu;
};

VG.Utils.addDefaultQuickViewMenu=function()
{
    var viewItem=VG.context.workspace.addQuickMenuItem( "SKINS" );    

    var style=VG.UI.stylePool.current;

    for( var s=0; s < style.skins.length; ++s ) 
    {
        var skin=style.skins[s];

        var skinItem=viewItem.addItem( skin.name.toUpperCase(), function() {
            VG.context.workspace.switchToStyle( this.style, this.skin );
            VG.log( "switched to", this.style.name );
        } );

        if ( style === VG.UI.stylePool.current && skin === VG.UI.stylePool.current.skin )
            skinItem.checked=skinItem.checkable=true;

        skinItem.style=style;
        skinItem.skin=skin;
        skinItem.statusTip="Activates this User Interface Style / Skin.";
    }

    return viewItem;
};

VG.Utils.dumpObject=function( object )
{
    VG.log( JSON.stringify( object, null, 4) );
};

VG.Utils.scheduleRedrawInMs=function( ms )
{
    VG.context.workspace.redrawList.push( Date.now() + ms );
};

VG.Utils.ensureRedrawWithinMs=function( ms )
{
    var redrawList=VG.context.workspace.redrawList;
    var time=Date.now();

    for( var i=0; i < redrawList.length; ++i ) 
    {            
        if ( ( redrawList[i] + 1000.0/60.0 ) >= time && redrawList[i] < ( time + ms ) )
            return;
    }
    redrawList.push( time + ms - 1000.0/60.0 );    
};

VG.Utils.fileNameFromPath=function( path, noSuffix )
{
    var rc=path.replace(/^.*(\\|\/|\:)/, '' );

    if ( noSuffix && rc.indexOf( '.' ) !== -1 )
        rc=rc.split( '.' )[0];

    return rc;
};

VG.Utils.stripFileNameFromPath=function(path) {
  var dirPart;
  path.replace(/^(.*(\\|\/|\:))?([^/]*)$/, function(_, dir, file) {
    dirPart = dir;
  });
  return dirPart;
}

VG.Utils.createMaterial=function( className )
{
    var graph=VG.Nodes.Graph();
    var materialNode=graph.createNode( className );
    return materialNode.getTerminal( "out" );
};

VG.Utils.materialOutputFromGraph=function( graphData )
{
    var graph=VG.Nodes.Graph();
    var terminal=graph.load( graphData );

    var mtl;

    if ( terminal ) {
        var vector=new VG.Math.Vector3();
        mtl=terminal.onCall( vector );
        delete vector;
    }    

    graph.clear();
    delete graph;

    return mtl;
};

VG.Utils.addSingleShotCallback=function( func )
{
    VG.context.workspace.singleShotCallbacks.push( func );
};

VG.Utils.renderTargetToImage=function( renderTarget, image, wait )
{
    var width = renderTarget.getWidth();
    var height = renderTarget.getHeight();

    var frameW = renderTarget.getRealWidth();
    var frameH = renderTarget.getRealHeight();

    if ( !image ) 
        image = new VG.Core.Image( width, height );

    renderTarget.bind();
    renderTarget.fillPixelBuffer( { x : 0, y : 0, width : frameW, height : frameH }, image.data );
    renderTarget.unbind();

    if ( wait )
        renderTarget.checkStatusComplete();

    return image;
}

VG.Utils.textureToImage=function( texture, image )
{
    /** Creates an VG.Core.Image for a given texture or rendertarget.
      * @param {VG.Texture|VG.RenderTarget} The texture or rendertarget to copy.
      * @param {VG.Core.Image} Optional, if you want to use an existing VG.Core.Image as the target, you can pass it here, otherwise a new one will be created.
      * @returns {VG.Core.Image}
      */

    var renderTarget=new VG.RenderTarget();

	var frameW = texture.getRealWidth();
	var frameH = texture.getRealHeight();

	renderTarget.resetSize(frameW, frameH);
	renderTarget.setViewportEx(0, 0, frameW, frameH);
    renderTarget.imageWidth=texture.getWidth();
    renderTarget.imageHeight=texture.getHeight();

    VG.context.workspace.canvas.flush();

    renderTarget.bind();
    renderTarget.clear( true );
    
    VG.Renderer().drawQuad(texture, frameW, frameH, 0, 0, 1.0, VG.Core.Size(frameW, frameH));

	// read to image.
	var width = renderTarget.getWidth();
	var height = renderTarget.getHeight();

    var dataSize=width * height * 4;
    var data=new Uint8Array( dataSize );
    renderTarget.fillPixelBuffer( undefined, data );

    if (!image)
        image = VG.Core.Image(width, height);

    if ( renderTarget.checkStatusComplete() ) {

	   var ip = 0;
	   for (var y = height-1; y >= 0; y--)
	   {
            for (var x = 0; x < width; x++)
            {
                image.setPixelRGBA(x, y, data[ip++], data[ip++], data[ip++], data[ip++] );
            }
		}
	}

    delete data;
    data=null;

	//
    renderTarget.unbind();	
	renderTarget.dispose();

    return image;
};

// --- Great and fast Polygon Triangulation, https://github.com/mapbox/earcut

VG.Utils.earcut=function(data, holeIndices, dim) {

/*
Copyright (c) 2015, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
*/

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var sum = 0,
        i, j, last;

    // calculate original winding order of a polygon ring
    for (i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }

    // link points into circular doubly-linked list in the specified winding order
    if (clockwise === (sum > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, last);
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(data, start, end) {
    if (!end) end = start;

    var node = start,
        again;
    do {
        again = false;

        if (!node.steiner && (equals(data, node.i, node.next.i) || orient(data, node.prev.i, node.i, node.next.i) === 0)) {

            // remove node
            node.prev.next = node.next;
            node.next.prev = node.prev;

            if (node.prevZ) node.prevZ.nextZ = node.nextZ;
            if (node.nextZ) node.nextZ.prevZ = node.prevZ;

            node = end = node.prev;

            if (node === node.next) return null;
            again = true;

        } else {
            node = node.next;
        }
    } while (again || node !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(data, ear, triangles, dim, minX, minY, size, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && minX !== undefined) indexCurve(data, ear, minX, minY, size);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (isEar(data, ear, minX, minY, size)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            // remove ear node
            next.prev = prev;
            prev.next = next;

            if (ear.prevZ) ear.prevZ.nextZ = ear.nextZ;
            if (ear.nextZ) ear.nextZ.prevZ = ear.prevZ;

            // skipping the next vertice leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(data, filterPoints(data, ear), triangles, dim, minX, minY, size, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(data, ear, triangles, dim);
                earcutLinked(data, ear, triangles, dim, minX, minY, size, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(data, ear, triangles, dim, minX, minY, size);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(data, ear, minX, minY, size) {

    var a = ear.prev.i,
        b = ear.i,
        c = ear.next.i,

        ax = data[a], ay = data[a + 1],
        bx = data[b], by = data[b + 1],
        cx = data[c], cy = data[c + 1],

        abd = ax * by - ay * bx,
        acd = ax * cy - ay * cx,
        cbd = cx * by - cy * bx,
        A = abd - acd - cbd;

    if (A <= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear;
    // the code below is a bit verbose and repetitive but this is done for performance

    var cay = cy - ay,
        acx = ax - cx,
        aby = ay - by,
        bax = bx - ax,
        i, px, py, s, t, k, node;

    // if we use z-order curve hashing, iterate through the curve
    if (minX !== undefined) {

        // triangle bbox; min & max are calculated like this for speed
        var minTX = ax < bx ? (ax < cx ? ax : cx) : (bx < cx ? bx : cx),
            minTY = ay < by ? (ay < cy ? ay : cy) : (by < cy ? by : cy),
            maxTX = ax > bx ? (ax > cx ? ax : cx) : (bx > cx ? bx : cx),
            maxTY = ay > by ? (ay > cy ? ay : cy) : (by > cy ? by : cy),

            // z-order range for the current triangle bbox;
            minZ = zOrder(minTX, minTY, minX, minY, size),
            maxZ = zOrder(maxTX, maxTY, minX, minY, size);

        // first look for points inside the triangle in increasing z-order
        node = ear.nextZ;

        while (node && node.z <= maxZ) {
            i = node.i;
            node = node.nextZ;
            if (i === a || i === c) continue;

            px = data[i];
            py = data[i + 1];

            s = cay * px + acx * py - acd;
            if (s >= 0) {
                t = aby * px + bax * py + abd;
                if (t >= 0) {
                    k = A - s - t;
                    if ((k >= 0) && ((s && t) || (s && k) || (t && k))) return false;
                }
            }
        }

        // then look for points in decreasing z-order
        node = ear.prevZ;

        while (node && node.z >= minZ) {
            i = node.i;
            node = node.prevZ;
            if (i === a || i === c) continue;

            px = data[i];
            py = data[i + 1];

            s = cay * px + acx * py - acd;
            if (s >= 0) {
                t = aby * px + bax * py + abd;
                if (t >= 0) {
                    k = A - s - t;
                    if ((k >= 0) && ((s && t) || (s && k) || (t && k))) return false;
                }
            }
        }

    // if we don't use z-order curve hash, simply iterate through all other points
    } else {
        node = ear.next.next;

        while (node !== ear.prev) {
            i = node.i;
            node = node.next;

            px = data[i];
            py = data[i + 1];

            s = cay * px + acx * py - acd;
            if (s >= 0) {
                t = aby * px + bax * py + abd;
                if (t >= 0) {
                    k = A - s - t;
                    if ((k >= 0) && ((s && t) || (s && k) || (t && k))) return false;
                }
            }
        }
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(data, start, triangles, dim) {
    var node = start;
    do {
        var a = node.prev,
            b = node.next.next;

        // a self-intersection where edge (v[i-1],v[i]) intersects (v[i+1],v[i+2])
        if (a.i !== b.i && intersects(data, a.i, node.i, node.next.i, b.i) &&
                locallyInside(data, a, b) && locallyInside(data, b, a)) {

            triangles.push(a.i / dim);
            triangles.push(node.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            a.next = b;
            b.prev = a;

            var az = node.prevZ,
                bz = node.nextZ && node.nextZ.nextZ;

            if (az) az.nextZ = bz;
            if (bz) bz.prevZ = az;

            node = start = b;
        }
        node = node.next;
    } while (node !== start);

    return node;
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(data, start, triangles, dim, minX, minY, size) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(data, a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(data, a, a.next);
                c = filterPoints(data, c, c.next);

                // run earcut on each half
                earcutLinked(data, a, triangles, dim, minX, minY, size);
                earcutLinked(data, c, triangles, dim, minX, minY, size);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        list = filterPoints(data, list);
        if (list) queue.push(getLeftmost(data, list));
    }

    queue.sort(function (a, b) {
        return data[a.i] - data[b.i];
    });

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(data, queue[i], outerNode);
        outerNode = filterPoints(data, outerNode, outerNode.next);
    }

    return outerNode;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(data, holeNode, outerNode) {
    outerNode = findHoleBridge(data, holeNode, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, holeNode);
        filterPoints(data, b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(data, holeNode, outerNode) {
    var node = outerNode,
        i = holeNode.i,
        px = data[i],
        py = data[i + 1],
        qMax = -Infinity,
        mNode, a, b;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        a = node.i;
        b = node.next.i;

        if (py <= data[a + 1] && py >= data[b + 1]) {
            var qx = data[a] + (py - data[a + 1]) * (data[b] - data[a]) / (data[b + 1] - data[a + 1]);
            if (qx <= px && qx > qMax) {
                qMax = qx;
                mNode = data[a] < data[b] ? node : node.next;
            }
        }
        node = node.next;
    } while (node !== outerNode);

    if (!mNode) return null;

    // look for points strictly inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var bx = data[mNode.i],
        by = data[mNode.i + 1],
        pbd = px * by - py * bx,
        pcd = px * py - py * qMax,
        cpy = py - py,
        pcx = px - qMax,
        pby = py - by,
        bpx = bx - px,
        A = pbd - pcd - (qMax * by - py * bx),
        sign = A <= 0 ? -1 : 1,
        stop = mNode,
        tanMin = Infinity,
        mx, my, amx, s, t, tan;

    node = mNode.next;

    while (node !== stop) {

        mx = data[node.i];
        my = data[node.i + 1];
        amx = px - mx;

        if (amx >= 0 && mx >= bx) {
            s = (cpy * mx + pcx * my - pcd) * sign;
            if (s >= 0) {
                t = (pby * mx + bpx * my + pbd) * sign;

                if (t >= 0 && A * sign - s - t >= 0) {
                    tan = Math.abs(py - my) / amx; // tangential
                    if (tan < tanMin && locallyInside(data, node, holeNode)) {
                        mNode = node;
                        tanMin = tan;
                    }
                }
            }
        }

        node = node.next;
    }

    return mNode;
}

// interlink polygon nodes in z-order
function indexCurve(data, start, minX, minY, size) {
    var node = start;

    do {
        if (node.z === null) node.z = zOrder(data[node.i], data[node.i + 1], minX, minY, size);
        node.prevZ = node.prev;
        node.nextZ = node.next;
        node = node.next;
    } while (node !== start);

    node.prevZ.nextZ = null;
    node.prevZ = null;

    sortLinked(node);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }

            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize === 0) {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                } else if (qSize === 0 || !q) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else if (p.z <= q.z) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and size of the data bounding box
function zOrder(x, y, minX, minY, size) {
    // coords are transformed into (0..1000) integer range
    x = 1000 * (x - minX) / size;
    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = 1000 * (y - minY) / size;
    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(data, start) {
    var node = start,
        leftmost = start;
    do {
        if (data[node.i] < data[leftmost.i]) leftmost = node;
        node = node.next;
    } while (node !== start);

    return leftmost;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(data, a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i &&
           !intersectsPolygon(data, a, a.i, b.i) &&
           locallyInside(data, a, b) && locallyInside(data, b, a) &&
           middleInside(data, a, a.i, b.i);
}

// winding order of triangle formed by 3 given points
function orient(data, p, q, r) {
    var o = (data[q + 1] - data[p + 1]) * (data[r] - data[q]) - (data[q] - data[p]) * (data[r + 1] - data[q + 1]);
    return o > 0 ? 1 :
           o < 0 ? -1 : 0;
}

// check if two points are equal
function equals(data, p1, p2) {
    return data[p1] === data[p2] && data[p1 + 1] === data[p2 + 1];
}

// check if two segments intersect
function intersects(data, p1, q1, p2, q2) {
    return orient(data, p1, q1, p2) !== orient(data, p1, q1, q2) &&
           orient(data, p2, q2, p1) !== orient(data, p2, q2, q1);
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(data, start, a, b) {
    var node = start;
    do {
        var p1 = node.i,
            p2 = node.next.i;

        if (p1 !== a && p2 !== a && p1 !== b && p2 !== b && intersects(data, p1, p2, a, b)) return true;

        node = node.next;
    } while (node !== start);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(data, a, b) {
    return orient(data, a.prev.i, a.i, a.next.i) === -1 ?
        orient(data, a.i, b.i, a.next.i) !== -1 && orient(data, a.i, a.prev.i, b.i) !== -1 :
        orient(data, a.i, b.i, a.prev.i) === -1 || orient(data, a.i, a.next.i, b.i) === -1;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(data, start, a, b) {
    var node = start,
        inside = false,
        px = (data[a] + data[b]) / 2,
        py = (data[a + 1] + data[b + 1]) / 2;
    do {
        var p1 = node.i,
            p2 = node.next.i;

        if (((data[p1 + 1] > py) !== (data[p2 + 1] > py)) &&
            (px < (data[p2] - data[p1]) * (py - data[p1 + 1]) / (data[p2 + 1] - data[p1 + 1]) + data[p1]))
                inside = !inside;

        node = node.next;
    } while (node !== start);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i),
        b2 = new Node(b.i),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, last) {
    var node = new Node(i);

    if (!last) {
        node.prev = node;
        node.next = node;

    } else {
        node.next = last.next;
        node.prev = last;
        last.next.prev = node;
        last.next = node;
    }
    return node;
}

function Node(i) {
    // vertex coordinates
    this.i = i;

    // previous and next vertice nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}


    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = filterPoints(data, linkedList(data, 0, outerLen, dim, true)),
        triangles = [];

    if (!outerNode) return triangles;

    var minX, minY, maxX, maxY, x, y, size;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and size are later used to transform coords into integers for z-order calculation
        size = Math.max(maxX - minX, maxY - minY);
    }

    earcutLinked(data, outerNode, triangles, dim, minX, minY, size);

    return triangles;
}