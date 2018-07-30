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
};

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
};

VG.Utils.bytesToSize = function(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes === 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

VG.Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

VG.Utils.getImageByName=function( name )
{
    for( i=0; i < VG.context.imagePool.images.length; ++i ) {
        if ( VG.context.imagePool.images[i].name === name )
            return VG.context.imagePool.images[i];
    }

    var prefixName=VG.UI.stylePool.current.skin.prefix + name;
    for( i=0; i < VG.context.imagePool.images.length; ++i ) {
        if ( VG.context.imagePool.images[i].name === prefixName )
            return VG.context.imagePool.images[i];
    }

    if ( VG.UI.stylePool.current.skin.fallbackPrefix ) {
        prefixName=VG.UI.stylePool.current.skin.fallbackPrefix + name;
        for( i=0; i < VG.context.imagePool.images.length; ++i ) {
            if ( VG.context.imagePool.images[i].name == prefixName )
                return VG.context.imagePool.images[i];
        }
    }

    return null;
};

VG.Utils.getSVGByName=function( name )
{
    if ( !VG.Core.SVG ) return null;

    for( i=0; i < VG.context.svgPool.svgs.length; ++i ) {
        if ( VG.context.svgPool.svgs[i].name === name )
            return VG.context.svgPool.svgs[i];
    }

    var prefixName=VG.UI.stylePool.current.skin.prefix + name;
    for( i=0; i < VG.context.svgPool.svgs.length; ++i ) {
        if ( VG.context.svgPool.svgs[i].name === prefixName )
            return VG.context.svgPool.svgs[i];
    }

    if ( VG.UI.stylePool.current.skin.fallbackPrefix ) {
        prefixName=VG.UI.stylePool.current.skin.fallbackPrefix + name;
        for( i=0; i < VG.context.svgPool.svgs.length; ++i ) {
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
    viewItem.statusTip = "Change the application skin (skins change the colors and style of the user interface).";

    var style=VG.UI.stylePool.current;

    for( var s=0; s < style.skins.length; ++s )
    {
        var skin=style.skins[s];

        var skinItem=viewItem.addItem( skin.name.toUpperCase(), function() {
            VG.context.workspace.switchToStyle( this.style, this.skin );
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

VG.Utils.suffixFromPath=function( path )
{
    var rc=path.replace(/^.*(\\|\/|\:)/, '' );

    if ( rc.indexOf( '.' ) !== -1 )
        rc=rc.split( '.' )[1];
    else rc="";

    return rc.toUpperCase();
};

VG.Utils.stripFileNameFromPath=function(path) {
  var dirPart;
  path.replace(/^(.*(\\|\/|\:))?([^/]*)$/, function(_, dir, file) {
    dirPart = dir;
  });
  return dirPart;
};

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
    }

    graph.clear();

    return mtl;
};

VG.Utils.addSingleShotCallback=function( func )
{
    VG.context.workspace.singleShotCallbacks.push( func );
};

VG.Utils.canvasToImage=function( ctx, image )
{
    var width=ctx.canvas.width, height=ctx.canvas.height;

    if ( !image ) image = new VG.Core.Image( { width : width, height : height, forcePowerOfTwo : false } );

    let imageData = image.data;
    let pixelData = ctx.getImageData( 0, 0, width, height );
    let data = pixelData.data;

    for ( let h=0; h < height; ++h )
    {
        let sourceOffset = h * pixelData.width * 4;
        let destOffset = h * image.modulo;

        for ( let w=0; w < width; ++w ) {
            imageData[destOffset++] = data[sourceOffset++];
            imageData[destOffset++] = data[sourceOffset++];
            imageData[destOffset++] = data[sourceOffset++];
            imageData[destOffset++] = data[sourceOffset++];
        }
    }

    return image;
};

/**
 * Converts the given {VG.Core.Image} to an HTML5 image usable in the 2D Canvas.
 * @param {VG.Core.Image} image - The image to convert
 * @returns An HTML5 image
 */

VG.Utils.imageToHTML5Image=function( image, callback )
{
    let textureCanvas=document.getElementById( 'textureCanvas' );
    let ctx=textureCanvas.getContext('2d');

    ctx.canvas.width=image.width;
    ctx.canvas.height=image.height;

    ctx.putImageData( new ImageData( new Uint8ClampedArray( image.data ), image.width, image.height ), 0, 0);

    let imageEl = new Image();
    if ( callback) imageEl.onload = () => callback( imageEl );
    imageEl.src = textureCanvas.toDataURL();
    return imageEl;
};

/**
 * Converts an {VG.RenderTarget} to an HTML5 image usable in the 2D canvas.
 * @param {VG.RenderTarget} renderTarget - The renderTarget to convert
 * @returns An HTML5 image
 */

VG.Utils.renderTargetToHTML5Image=function( renderTarget, callback )
{
    let image = VG.Utils.renderTargetToImage( renderTarget, undefined, true );
    return VG.Utils.imageToHTML5Image( image, callback );
};

VG.Utils.svgToImage=function( { data, width, height, callback } = {} )
{
    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svg = new Blob( [data], {type: 'image/svg+xml'});
    var url = DOMURL.createObjectURL(svg);

    img.onload = function () {

        let textureCanvas=document.getElementById( 'textureCanvas' );
        let ctx=textureCanvas.getContext('2d');

        ctx.canvas.width=width;
        ctx.canvas.height=height;

        ctx.drawImage( img, 0, 0 );
        DOMURL.revokeObjectURL(url);

        callback( VG.Utils.canvasToImage( ctx ) );
    };

    img.src = url;
};

VG.Utils.renderTargetToImage=function( renderTarget, image, wait )
{
    var width = renderTarget.getWidth();
    var height = renderTarget.getHeight();

    var frameW = renderTarget.getRealWidth();
    var frameH = renderTarget.getRealHeight();

    if ( !image ) {
        if ( !renderTarget.floatTexture ) image = new VG.Core.Image( width, height );
        else image = new VG.Core.Float32Image( width, height );
    }

    renderTarget.bind();
    renderTarget.fillPixelBuffer( { x : 0, y : 0, width : frameW, height : frameH }, image.data );
    renderTarget.unbind();

    if ( wait )
        renderTarget.checkStatusComplete();

    return image;
};

/**
 * Creates a digit token consisting of alphanumeric characters.
 * @returns {string} The created token.
 */

VG.Utils.createToken = function( length = 4 )
{
   let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
   let token = [], rnd = Math.random, r;

   for (let i = 0; i < length; i++) {
        r = 0 | rnd()*chars.length;
        token[i] = chars[r];
   }
   return token.join('');
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
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) return null;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, size, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && size) indexCurve(ear, minX, minY, size);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (size ? isEarHashed(ear, minX, minY, size) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            removeNode(ear);

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
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, size, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(ear, triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, size, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, size);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, size) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, size),
        maxZ = zOrder(maxTX, maxTY, minX, minY, size);

    // first look for points inside the triangle in increasing z-order
    var p = ear.nextZ;

    while (p && p.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.nextZ;
    }

    // then look for points in decreasing z-order
    p = ear.prevZ;

    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return p;
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, size) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, size);
                earcutLinked(c, triangles, dim, minX, minY, size);
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
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, hole);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                if (x === hx) {
                    if (hy === p.y) return p;
                    if (hy === p.next.y) return p.next;
                }
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hx === qx) return m.prev; // hole touches outer segment; pick lower endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m.next;

    while (p !== stop) {
        if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && locallyInside(p, hole)) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    }

    return m;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, size) {
    var p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, size);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
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
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) / size;
    y = 32767 * (y - minY) / size;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
           locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b);
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    if ((equals(p1, q1) && equals(p2, q2)) ||
        (equals(p1, q2) && equals(p2, q1))) return true;
    return area(p1, q1, p2) > 0 !== area(p1, q1, q2) > 0 &&
           area(p2, q2, p1) > 0 !== area(p2, q2, q1) > 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
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
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertice index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

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

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
VG.Utils.earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
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

    earcutLinked(outerNode, triangles, dim, minX, minY, size);

    return triangles;
};