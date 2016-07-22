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

VG.Core.SVG=function( name, data, options, dontAddToPool )
{
    if ( !(this instanceof VG.Core.SVG) ) return new VG.Core.SVG( name, data, options );

    var strict = true;
    parser = VG.sax.parser( strict );

    this.name=name;
    this.data=data;

    groups=[];

    var currentGroup=null, groupDepth=0;

    function createGroup( node )
    {
        var group={ name : 'Unnamed', pathNodes : [], polygonNodes : [], rectNodes : [], ellipseNodes : [] };
        if ( node.attributes.id )
            group.name=node.attributes.id;
        currentGroup=group;
        groups.push( group );
    };

    parser.onopentag = function (node) {
        //console.log( 'onopentag', node, groupDepth );

        if ( node.name === "g" ) 
        {
            if ( groupDepth === 0 )
            {
                createGroup( node );
            }
            ++groupDepth;
        } else
        if ( node.name === "path" )
        {
            if ( !currentGroup ) createGroup( node );

            currentGroup.pathNodes.push( node );
            currentGroup.hasContent=true;
        } else
        if ( node.name === "polygon" )
        {
            if ( !currentGroup ) createGroup( node );

            currentGroup.polygonNodes.push( node );
            currentGroup.hasContent=true;            
        } else
        if ( node.name === "rect" && currentGroup && currentGroup.hasContent )
        {
            if ( !currentGroup ) createGroup( node );            
            currentGroup.rectNodes.push( node );
        }  else
        if ( node.name === "rect" )
        {
            if ( !currentGroup ) createGroup( node );

            currentGroup.rectNodes.push( node );
        } else    
        if ( node.name === "ellipse" )
        {
            if ( !currentGroup ) createGroup( node );
            
            currentGroup.ellipseNodes.push( node );
        }         
    };

    parser.onclosetag = function (name) {
        //console.log( 'onclosetag', name );

        if ( name === "g" ) --groupDepth;
    };

    parser.write( data ).close();

    this.curveDiv=options && options.curveDiv ? options.curveDiv : 20;
    var createPolygons=true;
    if ( options && options.noPolygons ) 
        createPolygons=false;

    if ( groups.length )
        this.groups=groups;

    this.tris=[];

    if ( createPolygons ) 
    {
        for ( var i=0; i < this.groups.length; ++i ) 
            this.createPolygonsForGroup( this.groups[i] );

        if ( !dontAddToPool )
            VG.context.svgPool.addSVG( this );        
    }
};

VG.Core.SVG.prototype.getGroupByName=function( name )
{
    if ( !name || ( name && !name.length ) )
    {
        if ( this.groups.length ) return this.groups[0];
        else return undefined;
    }

    for ( var i=0; i < this.groups.length; ++ i)
    {
        if ( this.groups[i].name === name ) 
            return this.groups[i];
    }

    return undefined;
};

VG.Core.SVG.prototype.getGroupByIndex=function( index )
{
    if ( index < this.groups.length ) return this.groups[index];
    return undefined;
};

VG.Core.SVG.prototype.createPolygonsForGroup=function( group )
{
    group.polygons=[];
    group.triOffset=this.tris.length;

    for ( var i=0; i < group.pathNodes.length; ++i )
    {
        var path=group.pathNodes[i];
        var polys=[];

        this.createPolygonsForPath( path.attributes.d, polys );
        for ( var k=0; k < polys.length; ++k) group.polygons.push( polys[k] );

        // ---

        this.triangulatePolygons( group, polys );
    }

    for ( var i=0; i < group.polygonNodes.length; ++i )
    {
        var poly=group.polygonNodes[i];
        var polys=[];

        this.createPolygonsForPoly( poly.attributes.points, polys );
        for ( var k=0; k < polys.length; ++k) group.polygons.push( polys[k] );

        this.triangulatePolygons( group, polys );        
    }  

    for ( var i=0; i < group.rectNodes.length; ++i )
    {
        var rect=group.rectNodes[i];
        var polys=[];

        this.createPolygonsForRect( Number(rect.attributes.x), Number(rect.attributes.y), Number(rect.attributes.width), 
            Number(rect.attributes.height), polys );

        this.triangulatePolygons( group, polys );        
        for ( var k=0; k < polys.length; ++k) group.polygons.push( polys[k] );            
    }    

    for ( var i=0; i < group.ellipseNodes.length; ++i )
    {
        var rect=group.ellipseNodes[i];
        var polys=[];

        this.createPolygonsForEllipse( Number(rect.attributes.cx), Number(rect.attributes.cy), Number(rect.attributes.rx), 
            Number(rect.attributes.ry), polys );

        this.triangulatePolygons( group, polys );        
        for ( var k=0; k < polys.length; ++k) group.polygons.push( polys[k] );            
    }    

    this.createBoundingBoxForGroup( group );
    //this.normalizeGroupPolygons( group );

    group.triSize=this.tris.length - group.triOffset - 1;
};

VG.Core.SVG.prototype.triangulatePolygons=function( group, polygons )
{
    var i=0;

    var contourOrientation=false;

    if ( polygons.length )
        contourOrientation=this.clockwise( polygons[0] )

    while ( i < polygons.length )
    {
        var polygon=polygons[i];

        if ( polygon.length && this.clockwise( polygon ) === contourOrientation )
        {
            var holes=[];
            var contour=[];

            for ( var o=0; o < polygon.length; ++o )
            {
                contour.push( polygon[o].x, polygon[o].y );
            }

            var contourOffset=contour.length;

            for ( var j=i+1; j < polygons.length; ++j )
            {
                if ( polygons[j].length && this.clockwise( polygons[j] ) === !contourOrientation )
                {
                    holes.push( contour.length / 2 );

                    for ( var o=0; o < polygons[j].length; ++o )
                    {
                        var hpoly=polygons[j];
                        contour.push( hpoly[o].x, hpoly[o].y );
                    }
                } else break;
            }

            var indices=VG.Utils.earcut( contour, holes );

            for ( var t=0; t < indices.length; ++t )
            {
                var index=indices[t] * 2;
                this.tris.push( contour[index], contour[index + 1] );
            }
        }
        ++i;
    }    
};

VG.Core.SVG.prototype.normalizeGroupPolygons=function( group )
{
    for ( var i=0; i < group.polygons.length; ++i )
    {
        var poly=group.polygons[i];

        for ( var pi=0; pi < poly.length; ++pi )
        {
            var p=poly[pi];

            p.x-=group.bbox.minX;
            p.y-=group.bbox.minY;

            p.x/=1.0 / group.bbox.width;
            p.y/=1.0 / group.bbox.height;
        }
    }
};

VG.Core.SVG.prototype.createBoundingBoxForGroup=function( group )
{
    var bbox={ maxX : -100000, minX : 100000, maxY : -100000, minY : 100000 };

    for ( var i=0; i < group.polygons.length; ++i )
    {
        var poly=group.polygons[i];

        for ( var pi=0; pi < poly.length; ++pi )
        {
            var p=poly[pi]; 

            if ( p.x > bbox.maxX ) bbox.maxX=p.x;
            if ( p.y > bbox.maxY ) bbox.maxY=p.y;

            if ( p.x < bbox.minX ) bbox.minX=p.x;
            if ( p.y < bbox.minY ) bbox.minY=p.y;  
        }
    }

    group.width=bbox.maxX - bbox.minX;
    group.height=bbox.maxY - bbox.minY;

    group.bbox=bbox;
};

VG.Core.SVG.prototype.createPolygonsForRect=function( x, y, width, height, polygons )
{
    var poly=[];

    poly.push( { x : x, y : y } );
    poly.push( { x : x, y : y+height } );
    poly.push( { x : x + width, y : y+height } );
    poly.push( { x : x + width, y : y } );
    poly.push( { x : x, y : y } );

    polygons.push( poly );
};

VG.Core.SVG.prototype.createPolygonsForEllipse=function( cx, cy, rx, ry, polygons )
{
    var poly=[];

    var step=2 * Math.PI / 60; // 60 Segments
    for ( var theta=0; theta <= 2 * Math.PI; theta+=step )
    {
        var x=cx + Math.cos( theta ) * rx;
        var y=cy + Math.sin( theta ) * ry;

        poly.push( { x : x, y : y } );
    }

    polygons.push( poly );
};

VG.Core.SVG.prototype.createPolygonsForPoly=function( polyText, polygons )
{
    var pairs=polyText.split( " " );
    var poly=[];

    for( var i=0; i < pairs.length; ++i )
    {
        var pair=pairs[i];

        if ( pair.length && pair.indexOf( ',') !== -1 )
        {
            var points=pair.split( ',' );

            var p={ x : Number(points[0]), y : Number(points[1]) };
            poly.push( p );
        }
    }

    if ( poly.length ) polygons.push( poly );
};

VG.Core.SVG.prototype.createPolygonsForPath=function( path, polygons )
{
    var cmdArray=VG.Core.SVG.path_parser( path );

    var points=[]
    var p={};

    var lCubicControlPoint={ x: -100000, y: -100000 };
    var lQuadraticControlPoint={ x: -100000, y: -100000 };

    for ( var i=0; i < cmdArray.length; ++i )
    {
        var cmd=cmdArray[i];

        switch( cmd[0] )
        {
            case 'Z' :
            case 'z' :            
            {
                if ( polygons.indexOf( points ) === -1 && points.length )
                    polygons.push( points );

                points=[];
            };
            break;

            case 'M' :
            {
                p.x=cmd[1]; p.y=cmd[2];

                points.push( { x : p.x, y : p.y } );
            };
            break;

            case 'm' :
            {
                p.x+=cmd[1]; p.y+=cmd[2];

                points.push( { x : p.x, y : p.y } );                   
            };
            break;

            case 'L' :            
            {
                points.push( { x : cmd[1], y : cmd[2] } );
                p.x=cmd[1]; p.y=cmd[2];
            };
            break;

            case 'l' :
            {
                points.push( { x : cmd[1] + p.x, y : cmd[2] + p.y } );
                p.x+=cmd[1]; p.y+=cmd[2];                
            };
            break;      

            case 'H' :
            {
                points.push( { x : cmd[1], y : p.y } );
                p.x=cmd[1];
            };
            break;  

            case 'h' :
            {
                points.push( { x : cmd[1] + p.x, y : p.y } );
                p.x+=cmd[1];
            };
            break;

            case 'V' :
            {
                points.push( { x : p.x, y : cmd[1] } );
                p.y=cmd[1];
            };
            break;   

            case 'v' :
            {
                points.push( { x :  p.x, y : cmd[1] + p.y } );
                p.y+=cmd[1];
            };
            break;          

            case 'C' :
            {
                var cx1=cmd[1];
                var cy1=cmd[2];
                var cx2=cmd[3];
                var cy2=cmd[4];
                var dx=cmd[5];
                var dy=cmd[6];

                lCubicControlPoint.x=cx2;
                lCubicControlPoint.y=cy2;
       
                var seg=this.curveDiv;

                for (var j = 1, seg = seg; j <= seg; j++)
                {
                    var t = j / seg;
                    var tx = VG.Math.bezierCubic(t, p.x, cx1, cx2, dx );
                    var ty = VG.Math.bezierCubic(t, p.y, cy1, cy2, dy );

                    points.push( { x : tx, y : ty } );
                }

                p.x=dx; p.y=dy;
            };
            break; 

            case 'c' :
            {  
                var cx1=cmd[1] + p.x;
                var cy1=cmd[2] + p.y;
                var cx2=cmd[3] + p.x;
                var cy2=cmd[4] + p.y;
                var dx=cmd[5] + p.x;
                var dy=cmd[6] + p.y;

                lCubicControlPoint.x=cx2;
                lCubicControlPoint.y=cy2;                
    
                var seg=this.curveDiv;

                for (var j = 1, seg = seg; j <= seg; j++)
                {
                    var t = j / seg;
                    var tx = VG.Math.bezierCubic(t, p.x, cx1, cx2, dx );
                    var ty = VG.Math.bezierCubic(t, p.y, cy1, cy2, dy );

                    points.push( { x : tx, y : ty } );
                }
                p.x=dx; p.y=dy;

            };
            break;

            case 'S' :
            {
                var cx1=2 * p.x - lCubicControlPoint.x;
                var cy1=2 * p.y - lCubicControlPoint.y;
                var cx2=cmd[1];
                var cy2=cmd[2];
                var dx=cmd[3];
                var dy=cmd[4];        
       
                var seg=this.curveDiv;

                for (var j = 1, seg = seg; j <= seg; j++)
                {
                    var t = j / seg;
                    var tx = VG.Math.bezierCubic(t, p.x, cx1, cx2, dx );
                    var ty = VG.Math.bezierCubic(t, p.y, cy1, cy2, dy );

                    points.push( { x : tx, y : ty } );
                }

                p.x=dx; p.y=dy;
            };
            break; 

            case 's' :
            {  
                var cx1=2 * p.x - lCubicControlPoint.x;
                var cy1=2 * p.y - lCubicControlPoint.y;
                var cx2=cmd[1] + p.x;
                var cy2=cmd[2] + p.y;
                var dx=cmd[3] + p.x;
                var dy=cmd[4] + p.y;
    
                var seg=this.curveDiv;

                for (var j = 1, seg = seg; j <= seg; j++)
                {
                    var t = j / seg;
                    var tx = VG.Math.bezierCubic(t, p.x, cx1, cx2, dx );
                    var ty = VG.Math.bezierCubic(t, p.y, cy1, cy2, dy );

                    points.push( { x : tx, y : ty } );
                }
                p.x=dx; p.y=dy;

            };
            break;

            case 'Q' :
            {
                var cx1=cmd[1];
                var cy1=cmd[2];
                var dx=cmd[3];
                var dy=cmd[4];

                lQuadraticControlPoint.x=cx1;
                lQuadraticControlPoint.y=cy2;
       
                var seg=this.curveDiv;

                for (var j = 1, seg = seg; j <= seg; j++)
                {
                    var t = j / seg;
                    var tx = VG.Math.bezier(t, p.x, cx1, dx );
                    var ty = VG.Math.bezier(t, p.y, cy1, dy );

                    points.push( { x : tx, y : ty } );
                }

                p.x=dx; p.y=dy;
            };
            break; 

            case 'q' :
            {  
                var cx1=cmd[1] + p.x;
                var cy1=cmd[2] + p.y;
                var dx=cmd[3] + p.x;
                var dy=cmd[4] + p.y;

                lQuadraticControlPoint.x=cx2;
                lQuadraticControlPoint.y=cy2;                
    
                var seg=this.curveDiv;

                for (var j = 1, seg = seg; j <= seg; j++)
                {
                    var t = j / seg;
                    var tx = VG.Math.bezier(t, p.x, cx1, dx );
                    var ty = VG.Math.bezier(t, p.y, cy1, dy );

                    points.push( { x : tx, y : ty } );
                }
                p.x=dx; p.y=dy;

            };
            break; 

            case 'T' :
            {
                var cx1=lQuadraticControlPoint.x;
                var cy1=lQuadraticControlPoint.y;                
                var dx=cmd[1];
                var dy=cmd[2];
       
                var seg=this.curveDiv;

                for (var j = 1, seg = seg; j <= seg; j++)
                {
                    var t = j / seg;
                    var tx = VG.Math.bezier(t, p.x, cx1, dx );
                    var ty = VG.Math.bezier(t, p.y, cy1, dy );

                    points.push( { x : tx, y : ty } );
                }

                p.x=dx; p.y=dy;
            };
            break; 

            case 't' :
            {  
                var cx1=lQuadraticControlPoint.x;
                var cy1=lQuadraticControlPoint.y;                       
                var dx=cmd[1] + p.x;
                var dy=cmd[2] + p.y;            
    
                if ( cx1 === -100000 ) cx1=p.x;
                if ( cy1 === -100000 ) cy1=p.y;

                var seg=this.curveDiv;

                for (var j = 1, seg = seg; j <= seg; j++)
                {
                    var t = j / seg;
                    var tx = VG.Math.bezier(t, p.x, cx1, dx );
                    var ty = VG.Math.bezier(t, p.y, cy1, dy );

                    points.push( { x : tx, y : ty } );
                }
                p.x=dx; p.y=dy;

            };
            break;  

            default:
                VG.log( cmd[0] )
            break;  
        };
    }

    if ( polygons.indexOf( points ) === -1 && points.length )
        polygons.push( points );
};


VG.Core.SVG.prototype.clockwise=function(vs)
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

// --------------------------------------------- VG.Core.SVGPool

VG.Core.SVGPool=function()
{  
    if ( !(this instanceof VG.Core.SVGPool) ) return new VG.Core.SVGPool();

    /** Creates an VG.Core.SVGPool class. The default SVG pool of every VG application is located at VG.context.svgPool. It is filled automatically
     * on application startup with all application images as well as with vector graphics used by the Style. You can retrieve svg's from the default pool
     * using VG.Utils.getSVGByName() which in turn calls VG.context.svgPool.getSVGByName().
     */

    this.svgs=[];
}

// --- addSVG

VG.Core.SVGPool.prototype.addSVG=function( svg )
{
    /** Adds an svg file to the pool.
     * param {VG.Core.SVG} svg - The svg to add.
     */

    this.svgs.push( svg );
};

// --- getSVGByName

VG.Core.SVGPool.prototype.getSVGByName=function( name )
{
    /** Returns an SVG from the pool based on its name.
     * @returns {VG.Core.SVG} or null if no svg with the given name was found.
     */

    for( var i=0; i < this.svgs.length; ++i ) {
        if ( this.svgs[i].name == name )
            return this.svgs[i];
    }

    name=VG.UI.stylePool.current.skin.prefix + name;

    for( var i=0; i < this.svgs.length; ++i ) {
        if ( this.svgs[i].name == name )
            return this.svgs[i];
    }
    return null;
};

VG.context.svgPool=VG.Core.SVGPool();

// --- The below taken from https://github.com/jkroso/parse-svg-path/blob/master/index.js

/*
The MIT License

Copyright (c) 2013 Jake Rosoman <jkroso@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

VG.Core.SVG.path_parser_length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0}

/**
 * segment pattern
 * @type {RegExp}
 */

VG.Core.SVG.path_parser_segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig

/**
 * parse an svg path data string. Generates an Array
 * of commands where each command is an Array of the
 * form `[command, arg1, arg2, ...]`
 *
 * @param {String} path
 * @return {Array}
 */

VG.Core.SVG.path_parser=function( path ) 
{
    var data = []
    path.replace(VG.Core.SVG.path_parser_segment, function(_, command, args){
        var type = command.toLowerCase()
        args = VG.Core.SVG.path_parser_parseValues(args)

        // overloaded moveTo
        if (type == 'm' && args.length > 2) {
            data.push([command].concat(args.splice(0, 2)))
            type = 'l'
            command = command == 'm' ? 'l' : 'L'
        }

        while (true) {
            if (args.length == VG.Core.SVG.path_parser_length[type]) {
                args.unshift(command)
                return data.push(args)
            }
            if (args.length < VG.Core.SVG.path_parser_length[type]) return data;//throw new Error('malformed path data')
            data.push([command].concat(args.splice(0, VG.Core.SVG.path_parser_length[type])))
        }
    })
    return data
}

VG.Core.SVG.path_parser_parseValues=function(args){
    args = args.match(/-?[.0-9]+(?:e[-+]?\d+)?/ig)
    return args ? args.map(Number) : []
}

// ----