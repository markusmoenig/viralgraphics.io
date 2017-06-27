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

/**
 * Contains everything font related.
 * @namespace
 */

VG.Font = {};

/**
 * The global font manager which will be installed in VG.fontManager. </br>
 * This class is scheduled for a major rewrite as fonts are currently based on the discontinued typeface library.
 * @constructor
 */

VG.Font.Manager=function()
{
    this.triFonts=[];
    this.addFonts();
};

/**
 * Parses all fonts installed typeface and make them available to Visual Graphics.
 */

VG.Font.Manager.prototype.addFonts=function()
{
    for (var font in _typeface_js.faces ) {
        //console.log( font,  _typeface_js.faces[font] );

        if ( this.getFont( font ) === null )
        {
            var fontFace=null;
            //console.log( "adding", font,  _typeface_js.faces[font] );

            if ( _typeface_js.faces[font].normal )
            {
                if ( _typeface_js.faces[font].normal.normal )
                    fontFace=_typeface_js.faces[font].normal.normal;
                else
                if ( _typeface_js.faces[font].normal.italic )
                    fontFace=_typeface_js.faces[font].normal.italic;
            }
            else
            if ( _typeface_js.faces[font].bold )
            {
                if ( _typeface_js.faces[font].bold.normal )
                    fontFace=_typeface_js.faces[font].bold.normal;
                else
                if ( _typeface_js.faces[font].bold.italic )
                    fontFace=_typeface_js.faces[font].bold.italic;
            }

            var triFont=VG.Font.Triangulator.createFont( fontFace, { curveDiv: 3 } );
            triFont.name=font;

            this.triFonts.push( triFont );
        }
    }
};

/**
 * Returns the font of the given name.
 * @returns {VG.Font.Font} The found font or undefined.
 */

VG.Font.Manager.prototype.getFont=function( name )
{
    for (var i=0; i < this.triFonts.length; ++i )
    {
        var triFont=this.triFonts[i];

        if ( String( triFont.name ).toUpperCase() === String( name ).toUpperCase() )
            return triFont;
    }
    return null;
};

/**
 * The main Visual Graphics font object for a given font.
 * @param {string} name - The font to use.
 * @param {number} size - The initial pixel size to use for this font.
 * @param {number} curveDiv - Optional, the curve subdivion value to use for this font during triangulation. Visual Graphics uses a value of 3 by default.
 * @constructor
 */

VG.Font.Font=function( name, size, curveDiv )
{
    if ( !(this instanceof VG.Font.Font) ) return new VG.Font.Font( name, size, curveDiv );

    if ( size === undefined && name.triFont )
    {
        // --- Copy

        this.name=name.name;
        this.size=name.size;
        this.triFont=name.triFont;
        this.scale=name.scale;
    } else
    if ( !curveDiv )
    {
        // --- Use existing font
        this.name=name;
        this.size=size;
        this.triFont=VG.fontManager.getFont( name );
        this.scale=this.size * this.triFont.pixelScale;
    } else
    {
        // --- Create Font fresh with a custom curveDiv
        this.name=name;
        this.size=size;
        this.triFont=VG.fontManager.getFont( name );
        this.triFont=VG.Font.Triangulator.createFont( this.triFont.face, { curveDiv: curveDiv } );
        this.scale=this.size * this.triFont.pixelScale;
    }
};

VG.Font.Font.prototype.toString=function()
{
    return this.name;
};

VG.Font.Font.prototype.setFont=function( name )
{
    if ( this.name !== name ) {
        this.triFont=VG.fontManager.getFont( name );
        this.name=name;
    }
};

/**
 * Changes the font size for this font.
 * @param {number} size - The pixel size to use for this font.
 */

VG.Font.Font.prototype.setSize=function( size )
{
    this.size=size;
    this.scale=this.size * this.triFont.pixelScale;
};


VG.Font.Triangulator = {};

VG.Font.Triangulator.createFont=function(font, options)
{
    /** Takes a fontface.js face/font and creates a triangle version of it
     *
     * Options:
     *    curveDiv - Divisor varible for the bezier curves (defult: 2)
     *
     * returns an structure similar to typeface.js's face*/

    if (!options) options = {};

    var out = { glyphs: {}, tris: [] };
    var curveDiv = options.curveDiv ? options.curveDiv : 2;

    out.face = font;

    var totalSize = 0;

    var v = out.tris;

    var text = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
               "~!@#$%^&*()_+{}:\"<>?|[];',./\\-=%";

    for (var i=0; i < text.length; ++i )
    {
        var chr=text[i];

        if (!font.glyphs[chr]) continue;

        var g =
        {
            offset: out.tris.length,
            size: 0,
            width: font.glyphs[chr].ha / font.resolution,
            baseLine: 0
        };


        g.size = this.processGlyph(font, chr, curveDiv, out.tris);

        out.glyphs[chr] = g;
        totalSize += g.size;

        for (var j = g.offset; j < (g.offset + g.size); j += 3)
        {
            var y1 = v[j].y;
            var y2 = v[j + 1].y;
            var y3 = v[j + 2].y;

            g.baseLine = Math.max(g.baseLine, y1);
            g.baseLine = Math.max(g.baseLine, y2);
            g.baseLine = Math.max(g.baseLine, y3);
        }
    }

    out.height = font.lineHeight / font.resolution;
    out.ascender = font.ascender / font.resolution;
    out.descender = font.descender / font.resolution;
    out.pixelScale = (out.height + out.descender) / out.height;

    if (totalSize != out.tris.length) throw "total size doesn't match the float array length";

    v = null;

    return out;
};

VG.Font.Triangulator.getGlyph=function( font, chr )
{
    var g = font.glyphs[chr];

    if (!g)
    {
        return this.getGlyph(font, " ");
    }

    return g;
};

VG.Font.Triangulator.clockwise=function(vs)
{
    /** Checks if the polygon/shape is clockwise or not */

    var area = 0.0;

    for (var i = 0; i < vs.length - 1; i++)
    {
        var sX = vs[i].x - vs[0].x;
        var sY = vs[i].y - vs[0].y;
        var eX = vs[i + 1].x - vs[0].x;
        var eY = vs[i + 1].y - vs[0].y;

        area += (sX * -eY) - (eX * -sY);
    }

    return  area < 0.0;
};

VG.Font.Triangulator.processGlyph=function(face, char, seg, triOut)
{
    /** Utility function that wraps several other functions
     *
     * Returns the number of generated triangles */

    var polygons = this.generatePolygons(face, char, seg);

    if (polygons.length === 0) return 0;

    return this.triangulatePolygons(polygons, triOut);
};

VG.Font.Triangulator.triangulatePolygons=function(polygons, triOut)
{
    /** Triagulates the given array of polygons, if found holes then merges them
     *  into simple polygons */
    var count = 0;

    var merged = []; //other clockwise polygons that aren't holes


    for (var i = 0; i < polygons.length; i++)
    {
        var p = polygons[i];

        if (this.clockwise(polygons[i]))
        {
            merged.push(p);
        }
        else
        {
            var iL = merged.length - 1;

            if (iL == -1)
            {
                polygons.push(p);
                continue;
            }



            try
            {
                merged[iL] = this.mergePolygons(merged[iL], p);
                merged[iL].push({});
            }
            catch (e)
            {
                //console.info("Unable to merge holes", char);
                return 0;
            }
        }
    }


    try
    {

        for (i = 0; i < merged.length; i++)
        {
            count += this.performEarClipping(merged[i], triOut);
        }
    }
    catch (e)
    {
        count = 0;
        console.info("Unable to triangulate", char);
    }

    return count;
};

VG.Font.Triangulator.mergePolygons=function(outer, inner)
{
    /** Merges outer and inner polygons */
    var p = outer;

    var EPSILON = 0.00001;

    var nOuter = (outer.length - 1);
    var nInner = (inner.length - 1);

    var xM = inner[0].x;
    var iM = 0;

    for (var i = 1; i < nInner; i++)
    {
        var x = inner[i].x;

        if (x > xM)
        {
            xM = x;
            iM = i;
        }
    }

    var vM = inner[iM];

    var cM = Number.MAX_VALUE;
    var zr = 0;

    var intr = { x: cM, y: vM.y };

    var v0m = -1;
    var v1m = -1;
    var edm = -1;

    var i0 = 0;
    var i1 = 0;

    var s = cM, t = cM;

    function Sub(v1, v2)
    {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    }

    function Dot(v1, v2)
    {
        return (v1.x * v2.x) + (v1.y * v2.y);
    }

    function PerpDot(a, b)
    {
        return (a.y * b.x) - (a.x * b.y);
    }

    for (i0 = nOuter - 1, i1 = 0; i1 < nOuter; i0 = i1++)
    {
        var vD0 = Sub(outer[i0], vM);

        if (vD0.y > zr)
        {
            continue;
        }

        var vD1 = Sub(outer[i1], vM);

        if (vD1.y < zr)
        {
            continue;
        }

        var cEndM = -1;

        if (vD0.y < zr)
        {
            if (vD1.y > zr)
            {
                s = vD0.y / (vD0.y - vD1.y);
                t = vD0.x + s * (vD1.x - vD0.x);
            }
            else
            {
                t = vD1.x;
                cEndM = i1;
            }
        }
        else
        {
            if (vD1.y > zr)
            {
                t = vD0.x;
                cEndM = i0;
            }
            else
            {
                if (vD0.x < vD1.x)
                {
                    t = vD0.x;
                    cEndM = i0;
                }
                else
                {
                    t = vD1.x;
                    cEndM = i1;
                }
            }
        }


        if (zr <= t && t < intr.x)
        {
            intr.x = t;
            v0m = i0;
            v1m = i1;

            if (cEndM == -1)
            {
                edm = -1;
            }
            else
            {
                edm = cEndM;
            }

        }
        else
        if (t == intr.x)
        {
            if (edm == -1 || cEndM == -1)
            {
                throw "Unexpected values";
            }

            var vS = outer[i1];

            var iO = (edm == v0m ? v1m : v0m);

            vD0 = Sub(outer[i0], vS);
            vD1 = Sub(outer[iO], vS);

            var pD = PerpDot(vD0, vD1);

            if (pD > zr)
            {
                v0m = i0;
                v1m = i1;
                edm = cEndM;
            }
        }
    }

    intr.x += vM.x;

    var iMCos = null;

    if (edm == -1)
    {
        if (v0m < 0 || v1m < 0)
        {
            throw "Invalid nesting";

            //v0m = 0;
            //v1m = 0;
        }

        var sT = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
        var iP = 0;

        if (outer[v0m].x > outer[v1m].x)
        {
            sT[0] = outer[v0m];
            sT[1] = { x: intr.x, y: intr.y };
            sT[2] = { x: vM.x, y: vM.y };

            iP = v0m;
        }
        else
        {
            sT[0] = outer[v1m];
            sT[1] = { x: vM.x, y: vM.y };
            sT[2] = { x: intr.x, y: intr.y };

            iP = v1m;
        }

        var vD = Sub(sT, vM);
        var mxSqrLen = Dot(vD, vD);
        var mxCos = vD.x * vD.x / mxSqrLen;

        iMCos = iP;

        for (i = 0; i < nOuter; i++)
        {
            if (i == iP)
            {
                continue;
            }

            var curr = i;
            var prev = (i + nOuter - 1) % nOuter;
            var next = (i + 1) % nOuter;

            if (VG.Math.testLine(outer[curr], outer[prev], outer[next]) <= 0 &&
                VG.Math.testTri(outer[curr], sT[0], sT[1], sT[2]) <= 0)
            {
                vD = Sub(outer[curr], vM);
                var sqrL = Dot(vD, vD);
                var cs = vD.x * vD.x / sqrL;

                if (cs > mxCos)
                {
                    mxSqrLen = sqrLen;
                    mxCos = cs;
                    iMCos = i;
                }
                else
                if (cs == mxCos && sqrLen < mxSqrLen)
                {
                    mxSqrLen = sqrL;
                    iMCos = i;
                }

                throw 0;
            }
        }

    }
    else
    {
        iMCos = edm;
    }

    var outSiz = nOuter + nInner + 2;

    var out = [];//new Array(nOuter + nInner + 2);

    var iC = 0;
    for (i = 0; i <= iMCos; i++, iC++)
    {
        out[iC] = outer[i];
    }

    for (i = 0; i < nInner; i++, iC++)
    {
        j = (iM + i) % nInner;
        out[iC] = inner[j];
    }

    var iIdx = iM;

    out[iC++] = inner[iM];
    out[iC++] = outer[iMCos];

    for (i = iMCos + 1; i < nOuter; i++, iC++)
    {
        out[iC] = outer[i];
    }

    return out;
},


VG.Font.Triangulator.generatePolygons=function(face, char, seg)
{
    /** Generate polygons from a face and character,
     * Optionally takes a segmentation variable.
     *
     * returns an array of polygons (including holes) */

    if (!seg) seg = 2;

    var polygons = [];

    var vs = [];

    glyph = face.glyphs[char];

    var i = 0;
    var i2 = 0;
    var scale = 1.0 / face.resolution;


    if (!glyph) glyph = face.glyphs['?'];

    if (!glyph.o)
    {
        return polygons;
    }

    var outline = glyph.cached_o ? glyph.cached_o : glyph.cached_o = glyph.o.split(' ');

    var bezierCubic = VG.Math.bezierCubic;
    var bezier = VG.Math.bezier;

    function vX(x)
    {
        return x * scale;
    }

    function vY(y)
    {
        return -(y * scale) + (face.resolution * scale);
    }

    while (i < outline.length)
    {
        var action = outline[i++];

        switch (action)
        {
        case 'm':

            vs = [];

            polygons.push(vs);

            vs.push(new VG.Math.Vector3(vX(outline[i++]), vY(outline[i++]), 0.0));

            break;

        case 'l':
            vs.push(new VG.Math.Vector3(vX(outline[i++]), vY(outline[i++]), 0.0));

            break;

        case 'q':
            //bezier curve
            px  = vX(outline[i++]);
            py  = vY(outline[i++]);
            px1 = vX(outline[i++]);
            py1 = vY(outline[i++]);

            px0 = vs[vs.length - 1].x;
            py0 = vs[vs.length - 1].y;

            for (j = 1, seg = seg; j <= seg; j++)
            {
                t = j / seg;
                tx = bezier(t, px0, px1, px);
                ty = bezier(t, py0, py1, py);

                vs.push(new VG.Math.Vector3(tx, ty, 0.0));
            }

            break;

        case 'b':
            //cubic bezier
            px  = vX(outline[i++]);
            py  = vY(outline[i++]);
            px1 = vX(outline[i++]);
            py1 = vY(outline[i++]);
            px2 = vX(outline[i++]);
            py2 = vY(outline[i++]);

            px0 = vs[vs.length - 1].x;
            py0 = vs[vs.length - 1].y;

            for (j = 1, seg = seg; j <= seg; j++)
            {
                t = j / seg;
                tx = bezierCubic(t, px0, px1, px2, px);
                ty = bezierCubic(t, py0, py1, py2, py);

                vs.push(new VG.Math.Vector3(tx, ty, 0.0));
            }
            break;
        }

    }

    return polygons;
},

VG.Font.Triangulator.performEarClipping=function(polygon, out)
{
    /** Triangulates a polygon with a ear clipping algorithm */
    var outCount = 0;

    var vs = polygon;

    var EPSILON = 0.00001;

    var iRL = -1;
    var iEF = -1;
    var iEL = -1;
    var iCF = -1;
    var iCL = -1;
    var iRF = -1;

    var nVerts = polygon.length - 1;
    var v = new Array(nVerts);

    var nVertsM1 = nVerts - 1;

    function CheckConvex(i)
    {
        var vtx = v[i];

        var curr = vtx.index;

        var prev = v[vtx.vPrev].index;
        var next = v[vtx.vNext].index;

        vtx.convex = VG.Math.testLine(vs[curr], vs[prev], vs[next]) > 0;

        return vtx.convex;
    }

    function AddAfterR(i)
    {
        if (iRF == -1)
        {
            iRF = i;
        }
        else
        {
            v[iRL].sNext = i;
            v[i].sPrev = iRL;
        }

        iRL = i;
    }

    function AddAfterE(i)
    {
        var f = v[iEF];
        var cEN = f.eNext;

        var vtx = v[i];
        vtx.ePrev = iEF;
        vtx.eNext = cEN;
        f.eNext = i;
        v[cEN].ePrev = i;
    }

    function AddBefE(i)
    {
        var f = v[iEF];
        var cEP = f.ePrev;

        var vtx = v[i];
        vtx.ePrev = cEP;
        vtx.eNext = iEF;

        f.ePrev = i;

        v[cEP].eNext = i;
    }

    function AddAfterC(i)
    {
        if (iCF == -1)
        {
            iCF = i;
        }
        else
        {
            v[iCL].sNext = i;
            v[i].sPrev = iCL;
        }

        iCL = i;
    }

    function AddEndE(i)
    {
        if (iEF == -1)
        {
            iEF = i;
            iEL = i;
        }

        v[iEL].eNext = i;
        v[i].ePrev = iEL;

        iEL = i;
    }

    function VCmp(v1, v2)
    {
        if (Math.abs(v1.x - v2.x) > EPSILON) return false;
        if (Math.abs(v1.y - v2.y) > EPSILON) return false;

        return true;
    }


    function CheckEar(i)
    {
        var vtx = v[i];

        if (iRF == -1)
        {
            vtx.ear = true;
            return true;
        }

        var prev = v[vtx.vPrev].index;
        var curr = vtx.index;
        var next = v[vtx.vNext].index;

        vtx.ear = true;

        for (var j = iRF; j != -1; j = v[j].sNext)
        {
            if (j == vtx.vPrev || j == i || j == vtx.vNext) continue;

            var ts = v[j].index;

            if (VCmp(vs[ts], vs[prev]) || VCmp(vs[ts], vs[curr]) || VCmp(vs[ts], vs[next]))
            {
                continue;
            }

            if (VG.Math.testTri(vs[ts], vs[prev], vs[curr], vs[next]) <= 0)
            {
                vtx.ear = false;
                break;
            }

        }

        return vtx.ear;
    }

    function WipeR(i)
    {
        if (!(iRF != -1 && iRL != -1)) throw "Reflex not defined";

        if (i == iRF)
        {
            iRF = v[i].sNext;

            if (iRF != -1)
            {
                v[iRF].sPrev = -1;
            }

            v[i].sNext = -1;
        }
        else
        if (i == iRL)
        {
            iRL = v[i].sPrev;

            if (iRL != -1)
            {
                v[iRL].sNext = -1;
            }

            v[i].sPrev = -1;
        }
        else
        {
            var cSP = v[i].sPrev;
            var cSN = v[i].sNext;

            v[cSP].sNext = cSN;
            v[cSN].sPrev = cSP;

            v[i].sNext = -1;
            v[i].sPrev = -1;
        }
    }

    function WipeE(i)
    {
        var cEP = v[i].ePrev;
        var cEN = v[i].eNext;

        v[cEP].eNext = cEN;
        v[cEN].ePrev = cEP;

        return cEN;
    }

    function WipeV(i)
    {
        var cVP = v[i].vPrev;
        var cVN = v[i].vNext;

        v[cVP].vNext = cVN;
        v[cVN].vPrev = cVP;
    }

    for (i = 0; i <= nVertsM1; i++)
    {
        var vtx = v[i] = {
            convex: false,
            ear: false,
            ePrev: -1,
            eNext: -1,
            sPrev: -1,
            sNext: -1
        };

        vtx.index = i;
        vtx.vPrev = i > 0 ? i - 1 : nVertsM1;
        vtx.vNext = i < nVertsM1 ? i + 1 : 0;
    }

    for (i = 0; i <= nVertsM1; i++)
    {
        if (CheckConvex(i))
        {
            AddAfterC(i);
        }
        else
        {
            AddAfterR(i);
        }
    }

    function PushTri(iA, iB, iC)
    {
        out.push(vs[iA]);
        out.push(vs[iC]);
        out.push(vs[iB]);

        outCount += 3;
    }

    if (iRF == -1)
    {
        for (i = 1; i < nVertsM1; i++)
        {
            PushTri(0, i, i + 1);
        }

        return outCount;
    }

    for (i = iCF; i != -1; i = v[i].sNext)
    {
        if (CheckEar(i))
        {
            AddEndE(i);
        }
    }

    if (iEF == -1 || iEL == -1) throw "Invalid polygon";

    v[iEF].ePrev = iEL;
    v[iEL].eNext = iEF;

    var clipEar = true;

    var step = 0;

    while (clipEar)
    {
        var iVP = v[iEF].vPrev;
        var iVN = v[iEF].vNext;

        PushTri(v[iVP].index, v[iEF].index, v[iVN].index);

        WipeV(iEF);

        if (--nVerts == 3)
        {
            iEF = WipeE(iEF);
            iVP = v[iEF].vPrev;
            iVN = v[iEF].vNext;

            PushTri(v[iVP].index, v[iEF].index, v[iVN].index);

            clipEar = false;
            continue;
        }

        var vtxPrev = v[iVP];

        if (vtxPrev.ear)
        {
            if (!CheckEar(iVP))
            {
                WipeE(iVP);
            }
        }
        else
        {
            wReflex = !vtxPrev.convex;

            if (CheckConvex(iVP))
            {
                if (wReflex)
                {
                    WipeR(iVP);
                }

                if (CheckEar(iVP))
                {
                    AddBefE(iVP);
                }
            }

        }

        var vtxNext = v[iVN];

        if (vtxNext.ear)
        {
            if (!CheckEar(iVN))
            {
                WipeE(iVN);
            }
        }
        else
        {
            wReflex = !vtxNext.convex;


            if (CheckConvex(iVN))
            {
                if (wReflex)
                {
                    WipeR(iVN);
                }

                if (CheckEar(iVN))
                {
                    AddAfterE(iVN);
                }
            }

        }


        iEF = WipeE(iEF);
    }

    return outCount;
};

VG.Font.Triangulator.create3DText=function(font, text, S, T, bS, bT)
{
    /** Creates an array of vertices from the given text for 3D Rendering
     *  @param {VG.Font} font - The font for glyph look up
     *  @param {string} text - The text to make into 3D text
     *  @param {number} [4] S - The 2d bazier segments
     *  @param {number} [0.1] T - The thickness
     *  @param {number} [0] bS - The bevel segments
     *  @param {number} [0.01] bT - The bevel thickness
     *  @returns Object containing vertex position and normal arrays */

    if (!font || !font.face) throw "font is null or invalid";

    var tA = { v: [], n: [] };

    var xOffset = 0.0;

    for (var i = 0; i < text.length; i++)
    {
        var chr = text[i];

        var g = font.glyphs[chr];

        if (!g) continue;

        var ha = g.ha / font.resolution;

        var t = this.create3DGlyph(font, chr, S, T, bS, bT);

        for (var j = 0; j < t.v.length; j++)
        {
            var v = t.v[j];
            var n = t.n[j];

            tA.v.push(new VG.Math.Vector3(v.x + xOffset, v.y, v.z));
            tA.n.push(n);
        }


        xOffset += g.width;
    }

    return tA;
};

VG.Font.Triangulator.create3DGlyph=function(font, chr, S, T, bS, bT)
{
    /** Creates a 3D representation of the glyph
     *  @param {VG.Font} font - The font for glyph look up
     *  @param {char} chr - The glyph
     *  @param {number} [4] S - The 2d bazier segments
     *  @param {number} [0.1] T - The thickness
     *  @param {number} [0] bS - The bevel segments
     *  @param {number} [0.01] bT - The bevel thickness
     *  @returns Object containing vertex position and normal arrays.*/

    if (!font || !font.face) throw "font is null or invalid";

    if (S === undefined) S = 4;
    if (T === undefined) T = 0.1;
    if (bS === undefined) bS = 0;
    if (bT === undefined) bT = 0.01;

    var noBevel = (bS <= 0);

    //center plus sides in multiplies of 2
    bS = 1 + (2 * bS);

    font = font.face;

    var t = { v: [], n: [] };

    //Simply copies the front lid and flips the triangles into clockwise
    function CreateBackLid(tSize)
    {
        for (var j = 0; j < tSize; j += 3)
        {
            var v1 = t.v[j + 0];
            var v2 = t.v[j + 1];
            var v3 = t.v[j + 2];

            t.v.push({x: v1.x, y: v1.y, z: v1.z - T});
            t.v.push({x: v3.x, y: v3.y, z: v3.z - T});
            t.v.push({x: v2.x, y: v2.y, z: v2.z - T});

            var n = {x: 0.0, y: 0.0, z: -1.0};

            t.n.push(n);
            t.n.push(n);
            t.n.push(n);
        }

        return tSize;
    }


    var n0 = new VG.Math.Vector3();
    var n1 = new VG.Math.Vector3();
    var n2 = new VG.Math.Vector3();
    var n3 = new VG.Math.Vector3();

    var n0N = new VG.Math.Vector3();
    var n1N = new VG.Math.Vector3();
    var n2N = new VG.Math.Vector3();
    var n3N = new VG.Math.Vector3();

    function FlipV(iv)
    {
        var v = iv.clone();

        v.z = -iv.z - T;

        return v;
    }

    function CreateContour(polygons, disp)
    {
        if (disp === undefined) disp = 0;

        var size = 0;

        for (p = 0; p < polygons.length; p++)
        {
            var poly = polygons[p];

            for (var j = 0; j < poly.length; j++)
            {
                //previous from p1
                var v0F = poly[j - 1 < 0 ? poly.length - 1 : j - 1];
                var v0B = new VG.Math.Vector3(v0F.x, v0F.y, v0F.z - T + disp);

                //current point and previous from p2
                var v1F = poly[j];
                var v1B = new VG.Math.Vector3(v1F.x, v1F.y, v1F.z - T + disp);

                //next from p1
                var v2F = poly[j + 1 >= poly.length ? 0 : j + 1];
                var v2B = new VG.Math.Vector3(v2F.x, v2F.y, v2F.z - T + disp);

                //next from p2
                var v3F = poly[j + 2 >= poly.length ? (j + 1 < poly.length ? 0 : 1) : j + 2];
                var v3B = new VG.Math.Vector3(v3F.x, v3F.y, v3F.z - T + disp);

                t.v.push(v1F);
                t.v.push(v2F);
                t.v.push(v1B);

                t.v.push(v2F);
                t.v.push(v2B);
                t.v.push(v1B);


                n0.computeNormal(v0F, v1F, v1B);
                n0.normalize();
                n0.negate();


                n1.computeNormal(v1F, v2F, v1B);
                n1.normalize();
                n1.negate();


                n2.computeNormal(v2F, v2B, v1B);
                n2.normalize();
                n2.negate();


                n3.computeNormal(v2F, v3F, v2B);
                n3.normalize();
                n3.negate();



                var nAvg1 = n0.clone().add(n1);
                nAvg1.normalize();


                var nAvg2 = n2.clone().add(n3);
                nAvg2.normalize();



                t.n.push(nAvg1);
                t.n.push(nAvg2);
                t.n.push(nAvg1);

                t.n.push(nAvg2);
                t.n.push(nAvg2);
                t.n.push(nAvg1);

                size += 6;
            }
        }

        return size;
    }

    function TriangulateBevel(bevels)
    {
        for (var i = 0; i < bevels.length - 1; i++)
        {
            var bP = bevels[i - 1 < 0 ? i : i - 1];

            //current bevel
            var bC = bevels[i];

            //next bevel
            var bN = bevels[i + 1];
            var b2 = bevels[i + 2 >= bevels.length ? i : i + 2];

            for (var k = 0; k < bP.length; k++)
            {
                var polyP = bP[k];
                var polyC = bC[k];
                var polyN = bN[k];
                var poly2 = b2[k];

                for (var j = 0; j < polyC.length; j++)
                {
                    var i0 = j - 1 < 0 ? polyC.length - 1 : j - 1;
                    var i1 = j;
                    var i2 = j + 1 >= polyC.length ? 0 : j + 1;
                    var i3 = j + 2 >= polyC.length ? (j + 1 < polyC.length ? 0 : 1) : j + 2;

                    //previous from p1
                    var v0P = polyP[i0];
                    var v0C = polyC[i0];
                    var v0N = polyN[i0];
                    var v02 = poly2[i0];

                    //current point and previous from p2
                    var v1P = polyP[i1];
                    var v1C = polyC[i1];
                    var v1N = polyN[i1];
                    var v12 = poly2[i1];

                    //next from p1
                    var v2P = polyP[i2];
                    var v2C = polyC[i2];
                    var v2N = polyN[i2];
                    var v22 = poly2[i2];

                    //next from p2
                    var v3P = polyP[i3];
                    var v3C = polyC[i3];
                    var v3N = polyN[i3];
                    var v32 = poly2[i3];

                    t.v.push(v1C);
                    t.v.push(v1N);
                    t.v.push(v2C);

                    t.v.push(v2C);
                    t.v.push(v1N);
                    t.v.push(v2N);

                    //back
                    t.v.push(FlipV(v1C));
                    t.v.push(FlipV(v2C));
                    t.v.push(FlipV(v1N));

                    t.v.push(FlipV(v2C));
                    t.v.push(FlipV(v2N));
                    t.v.push(FlipV(v1N));

                    function ComputeNormals(flip)
                    {
                        if (flip)
                        {
                            v0C = FlipV(v0C);
                            v1C = FlipV(v1C);
                            v2C = FlipV(v2C);
                            v3C = FlipV(v3C);

                            v0P = FlipV(v0P);
                            v1P = FlipV(v1P);
                            v2P = FlipV(v2P);
                            v3P = FlipV(v3P);

                            v0N = FlipV(v0N);
                            v1N = FlipV(v1N);
                            v2N = FlipV(v2N);
                            v3N = FlipV(v3N);

                            v02 = FlipV(v02);
                            v12 = FlipV(v12);
                            v22 = FlipV(v22);
                            v32 = FlipV(v32);
                        }

                        n0.computeNormal(v0C, v0N, v1C);
                        n0.normalize();
                        if (!flip) n0.negate();

                        n1.computeNormal(v1C, v1N, v2C);
                        n1.normalize();
                        if (!flip) n1.negate();

                        n2.computeNormal(v2C, v1N, v2N);
                        n2.normalize();
                        if (!flip) n2.negate();

                        n3.computeNormal(v2C, v2N, v3C);
                        n3.normalize();
                        if (!flip) n3.negate();



                        n0N.computeNormal(v0N, v02, v1N);
                        n0N.normalize();
                        if (!flip) n0N.negate();

                        n1N.computeNormal(v1N, v12, v2N);
                        n1N.normalize();
                        if (!flip) n1N.negate();

                        n2N.computeNormal(v2N, v12, v22);
                        n2N.normalize();
                        if (!flip) n2N.negate();

                        n3N.computeNormal(v2N, v22, v3N);
                        n3N.normalize();
                        if (!flip) n3N.negate();
                    }

                    ComputeNormals();

                    if (i + 2 >= bevels.length)
                    {
                        n0N.set(0, 0.05, 0.95);
                        n1N.set(0, 0.05, 0.95);
                        n2N.set(0, 0.05, 0.95);
                        n3N.set(0, 0.05, 0.95);
                    }


                    var nAvg1 = n0.clone().add(n1);
                    nAvg1.normalize();

                    var nAvg2 = n2.clone().add(n3);
                    nAvg2.normalize();

                    var nAvg1N = n0N.clone().add(n1N);
                    nAvg1N.normalize();

                    var nAvg2N = n2N.clone().add(n3N);
                    nAvg2N.normalize();

                    t.n.push(nAvg1);
                    t.n.push(nAvg1N);
                    t.n.push(nAvg2);

                    t.n.push(nAvg2);
                    t.n.push(nAvg1N);
                    t.n.push(nAvg2N);




                    //apend the back face
                    ComputeNormals(true);

                    if (i + 2 >= bevels.length)
                    {
                        n0N.set(0, 0.05, -0.95);
                        n1N.set(0, 0.05, -0.95);
                        n2N.set(0, 0.05, -0.95);
                        n3N.set(0, 0.05, -0.95);
                    }


                    nAvg1 = n0.clone().add(n1);
                    nAvg1.normalize();

                    nAvg2 = n2.clone().add(n3);
                    nAvg2.normalize();

                    nAvg1N = n0N.clone().add(n1N);
                    nAvg1N.normalize();

                    nAvg2N = n2N.clone().add(n3N);
                    nAvg2N.normalize();

                    t.n.push(nAvg1);
                    t.n.push(nAvg2);
                    t.n.push(nAvg1N);

                    t.n.push(nAvg2);
                    t.n.push(nAvg2N);
                    t.n.push(nAvg1N);

                }
            }
        }

    }

    var poly;
    var ha = font.glyphs[chr].ha / font.resolution;

    //create the shapes/polygons
    var polygons = this.generatePolygons(font, chr, S);

    var tSize = this.triangulatePolygons(polygons, t.v);

    for (j = 0; j < t.v.length; j++)
    {
        t.n[j] = {x: 0.0, y: 0.0, z: 1.0};
    }


    tSize += CreateBackLid(tSize);


    //remove the last vector in each polygon
    for (p = 0; p < polygons.length; p++)
    {
        poly = polygons[p];

        poly.splice(poly.length - 1, 1);
    }

    //if no bevel segments then just stick the lids toguether
    if (noBevel)
    {
        tSize += CreateContour(polygons);

    }
    else
    {

        var bevels = [];

        //the bevel segments
        for (var bi = 0; bi < bS; bi++)
        {

            //z displacement acording with the bevel thickness
            var zDisp = bT / (bi + 1);

            var bTi = bi / bS - 1;

            var bPolygons = [];


            for (p = 0; p < polygons.length; p++)
            {
                poly = polygons[p];


                var isHole = !this.clockwise(poly);

                var bevel = [];

                for (j = 0; j < poly.length; j++)
                {
                    var pp = poly[j - 1 < 0 ? poly.length - 1 : j - 1];
                    var cp = poly[j];
                    var np = poly[j + 1 >= poly.length ? 0 : j + 1];

                    var b2 = !isHole ? this.computeBevel(cp, pp, np) : this.computeBevel(cp, np, pp);

                    var b3 = new VG.Math.Vector3(b2.x, b2.y, 0.0);

                    b3 = cp.clone().sub(b3);
                    b3.normalize();

                    var cD = bT + -(bT) * (Math.sin(bTi * Math.PI / 2));

                    b3.mul(isHole ? -cD : cD);

                    b3 = cp.clone().add(b3);

                    b3.z = -zDisp;

                    bevel.push(b3);
                }

                bPolygons.push(bevel);
            }

            bevels.push(bPolygons);
        }

        bevels.push(polygons);

        tSize += TriangulateBevel(bevels);

        tSize += CreateContour(bevels[0], bT * 2);

    }

    return t;
};


VG.Font.Triangulator.computeBevel=function(p, pp, pn)
{
    /** Computes the bevel for the given point in a shape, previous and next
     *  points are required.
     *
     *  @param {VG.Math.Vector2} p - The point of interest
     *  @param {VG.Math.Vector2} pp - The previous point relative to p
     *  @param {VG.Math.Vector2} pn - The next point relative to n i
     *  @returns {VG.Math.Vector2} The bevel point */

    var EPSILON = 0.0000000001;

    var shrink = 1.0;
    var vx = 0.0;
    var vy = 0.0;

    var vpx = p.x - pp.x;
    var vpy = p.y - pp.y;
    var vnx = pn.x - p.x;
    var vny = pn.y - p.y;

    var vpLenSqr = vpx * vpx + vpy * vpy;
    var c0 = vpx * vny - vpy * vnx;

    var con=!(Math.abs(c0));
    if (con > EPSILON)
    {
        var dirEq = false;

        if (vpx > EPSILON)
        {
           if (vnx > EPSILON) dirEq = true;
        }
        else
        {
            if (vpx < -EPSILON)
            {
                if (vnx < -EPSILON) dirEq = true;
            }
            else
            {
                if (Math.sign(vpy) == Math.sign(vny)) dirEq = true;
            }
        }

        if (dirEq)
        {
            vx = -vpy;
            vy = vpx;
            shrink = Math.sqrt(vpLenSqr);
        }
        else
        {
            vx = vpx;
            vy = vpy;
            shrink = Math.sqrt(vpLenSqr / 2);
        }

    } else {
        var vpLen = Math.sqrt(vpLenSqr);
        var vnLen = Math.sqrt(vnx * vnx + vny * vny);

        var ppsx = pp.x - vpy / vpLen;
        var ppsy = pp.y + vpx / vpLen;

        var pnsx = pn.x - vny / vnLen;
        var pnsy = pn.y + vnx / vnLen;

        var sf = ((pnsx - ppsx) * vny - (pnsy - ppsy) * vnx) / (vpx * vny - vpy * vnx);



        vx = ppsx + vpx * sf - p.x;
        vy = ppsy + vpy * sf - p.y;

        var vtLenSqr = vx * vx + vy * vy;

        if (vtLenSqr <= 2)
        {
            return new VG.Math.Vector2(vx, vy);
        }
        else
        {
            shrink = Math.sqrt(vtLenSqr / 2);
        }
    }

    return new VG.Math.Vector2(vx / shrink, vy / shrink);
};




VG.Font.Triangulator.extrude=function(shape)
{
    /** Extrudes the shape contour, returns a new shape */

};

VG.fontManager=new VG.Font.Manager();
