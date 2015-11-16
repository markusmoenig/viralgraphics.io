/*
 * Copyright (c) 2014, 2015 Markus Moenig <markusm@visualgraphics.tv> and Contributors
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

VG.Import = {};
VG.Import.loadObj = function(text, auxFiles, scale) {
    /**
     * @param auxFiles
     */
    /**
     * Parse Wavefront .obj according to:
     *      http://en.wikipedia.org/wiki/Wavefront_.obj_file
     *      http://www.martinreddy.net/gfx/3d/OBJ.spec
     *      http://www.fileformat.info/format/wavefrontobj/egff.htm
     * About .obj file:
     *      Vertex data:
     *          v,
     *          vt,
     *          vn,
     *          vp [ignored]
     *      Free-form curve/surface attributes:
     *          deg, bmat, step, cstyle [ignored]
     *      Elements:
     *          p, [ignored]
     *          l, [ignored]
     *          f, polygon includes: tri, quads, 5+ sides poly
     *          curv [ignored]
     *          curv2 [ignored]
     *          surf [ignored]
     *      Free-form curve/surface body elements:
     *          parm, trim, hole, scrv, sp, end [ignored]
     *      Connectivity between free-form surface:
     *          con [ignored]
     *      Grouping:
     *          g (group) support single level group
     *          s [ignored]
     *          mg -> merging, require adjacency detection, expensive conputation [ignored]
     *          o -> optional, not processed by wavefront, specify object name.
     *
     *      Display/render attributes:
     *          mtllib,
     *          usemtl
     *          bevel, c_interp, d_interp, lod, [ignored]
     *          shadow_obj, trace_obj, ctech, stech [ignored]
     *
     * This return a single parent mesh, with possible child meshes.
     * The structure of output mesh:
     *      root-mesh
     *          per-material-mesh
     *          ....
     *          group-mesh
     *              per-material-mesh
     *              ....
     *          group-mesh
     *          ....
     * @param text input .obj file as string
     * @returns {VG.Render.Mesh} root mesh
     */
    if (!text) {
        VG.log("Input not valid .obj file contents.");
        return;
    }
    var rootMesh = new VG.Render.Mesh();
    var activeGroup = rootMesh;
    var activeMesh = rootMesh;
    var mesh = {v:[], vt:[], vn:[], f:[]};
    var lines = text.split("\n").map(function(o){
        return o.trim();
    }).filter(function(o){
        return o !== '' && o[0] !== '#'; // remove empty line & comment
    });
    var materials = {};
    var activeMaterial = undefined;
    for (var i = 0; i < lines.length; i++) {
        // remove endline comment
        var comment = lines[i].indexOf('#');
        if (comment != -1) {
            lines[i] = lines[i].substring(0, comment).trim();
        }
        var parts = lines[i].trim().split(" ").filter(function (o) {
            return o.trim() !== ''; // collapse multi-spaces
        });
        var command = parts[0];

        if (command === 'v') {
            /**
             * List of geometric vertices, with (x,y,z[,w]) coordinates, w is optional and defaults to 1.0.
             * v 0.123 0.234 0.345 1.0
             */
            if (parts.length < 4) {
                throw "invalid vertex position.";
            } else if (parts.length === 4) {
                mesh.v.push({x: parts[1], y: parts[2], z: parts[3], w: '1.0'});
            } else {
                mesh.v.push({x: parts[1], y: parts[2], z: parts[3], w: parts[4]})
            }
        } else if (command === 'vt') {
            /**
             * List of texture coordinates, in (u, v [,w]) coordinates, these will vary between 0 and 1, w is optional and defaults to 0.
             * vt 0.500 1 0
             */
            if (parts.length < 3) {
                throw "invalid vertex uv.";
            } else if (parts.length === 3) {
                mesh.vt.push({u: parts[1], v: parts[2], w: '0'});
            } else {
                mesh.vt.push({u: parts[1], v: parts[2], w: parts[3]});
            }
        } else if (command === 'vn') {
            /**
             * # List of vertex normals in (x,y,z) form; normals might not be unit vectors.
             * vn 0.707 0.000 0.707
             */
            if (parts.length < 4) {
                throw "invalid vertex normal.";
            } else {
                mesh.vn.push({x: parts[1], y: parts[2], z: parts[3]});
            }
        } else if (command === 'vp') {
            // ignore
        } else if (command === 'f') {
            /**
             * # Polygonal face element in form:
             * f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 ....
             * f 1 2 3
             * f 3/1 4/2 5/3
             * f 6/4/1 3/5/3 7/6/5
             */
            var poly = [];
            for (var j = 1; j <parts.length; j++ ) {
                var attrs = parts[j].split('/');
                var v = {};
                v.v = attrs[0];
                if (attrs.length > 1 && attrs[1].length>0) {
                    v.vt = attrs[1];
                }
                if (attrs.length > 2 && attrs[2].length>0) {
                    v.vn = attrs[2];
                }
                poly.push(v);
            }
            if (poly.length < 3) {
                throw "expected face to have 3 or more vertices, got " + poly.length;
            }
            mesh.f.push(poly);
        } else if (command === 'mtllib') {
            if(auxFiles !== undefined) {
                parts.slice(1).forEach(function (o) {
                    var mtrls = VG.Import.loadMtl(auxFiles[parts[1]]);
                    if(mtrls) {
                        for (var name in mtrls) {
                            // first come that's served. the latter one will be ignored.
                            if (!materials[name]) {
                                materials[name] = mtrls[name];
                            }
                        }
                    }
                });
            }
        } else if (command === 'usemtl') {
            activeMaterial = materials[parts[1]];
            // done with current mesh
            activeMesh._trianglesFromIndexedFaces(mesh, scale);
            mesh.f = [];
            //create new
            activeMesh = new VG.Render.Mesh();
            activeMesh.material = activeMaterial; // if activeMaterial is null, then let it null
            activeMesh.parent = activeGroup;
        } else if (command === 'g'){
            // we are done with the previous group
            activeMesh._trianglesFromIndexedFaces(mesh, scale);
            mesh.f = [];
            activeGroup = new VG.Render.Mesh();
            parts.shift();
            activeGroup.groupName = parts.join(' ');
            activeGroup.parent = rootMesh;
            activeMesh = activeGroup;
            activeMesh.material = activeMaterial;
        } else if (command === 'o') {
            activeMesh.name = parts[1];
        }
    }
    activeMesh._trianglesFromIndexedFaces(mesh, scale);
    return rootMesh;
};

VG.Import.loadMtl = function(text)
{
    /**
     * Parse MTL according to:
     * http://paulbourke.net/dataformats/mtl/
     *
     * supports:
     *  -. material name statemenet
     *      newmtl
     *  -. material color & illumination
     *      Ka r g b
     *      Kd
     *      Ks
     *      Tf
     *      d (dissolve)
     *          d factor
     *          d -halo factor [NOT supported]
     *      illum
     *      Ns
     *      sharpness
     *      Ni
     *  -. texture map
     *      map_Ka [-blendu, -blenv, -cc, -clamp, -o, -s, -t, -mm, -texres]
     *      map_Kd
     *      map_Ks
     *      map_Ns
     *      map_d
     *      disp
     *      decal
     *      bump
     *  -. reflection map
     *      refl
     */

    if(text === undefined){
        return;
    }
    var parseTextureArgs = function (parts, index, map) {
        var onOff = ['-blendu', '-blendv', '-cc', '-clamp'];
        var uvw = ['-o', '-s', '-t'];
        if (onOff.indexOf(parts[index]) !== -1) {
            if(parts[index+1] === 'on') {
                map[parts[index]] = true;
            } else {
                map[parts[index]] = false;
            }
            return index + 2;
        } else if (uvw.indexOf(parts[index]) !== -1){
            map[parts[index]] = [
                parseFloat(parts[index+1]),
                parseFloat(parts[index+2]),
                parseFloat(parts[index+3])
            ];
            return index + 4;
        } else if (parts[index] === '-mm') {
            map[parts[index]] = [
                parseFloat(parts[index+1]),
                parseFloat(parts[index+2])
            ];
            return index + 3;
        } else if (parts[index] === '-texres') {
            map[parts[index]] = parseFloat(parts[index+1])
            return index + 2;
        } else {
            // unknown command
            return parts.length;
        }
    };
    var lines = text.split("\n").map(function(o){
        return o.trim();
    }).filter(function(o){
        return o !== '' && o[0] !== '#'; // remove empty line & comment
    });
    var colors = ['Ka', 'Kd', 'Ks', 'Tf'];
    var floats = ['Ns', 'sharpness', 'Ni', 'd'];
    var textures = ['map_Ka', 'map_Kd', 'map_Ks', 'map_Ns', 'map_d',
        'disp', 'decal', 'bump'];
    var materials = {};
    var material;
    for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].trim().split(" ").filter(function (o) {
            return o.trim() !== ''; // collapse multi-spaces
        });
        var command = parts[0];
        if (command === 'newmtl'){
            material = {
                name: parts[1]
            };
            materials[material.name] = material;
        } else if (colors.indexOf(command) !== -1){
            if (parts.length < 2) {
                throw 'expected parts.length >= 2';
            }
            var r = parseFloat(parts[1]);
            var g = parts.length > 2 ? parseFloat(parts[2]) : r;
            var b = parts.length > 3 ? parseFloat(parts[3]) : g;
            material[command] = [r, g, b];
        } else if (floats.indexOf(command) !== -1) {
            if (parts.length < 2){
                throw 'expected parts.length == 2';
            }
            material[command] = parseFloat(parts[1]);
        } else if (command === 'illum' ){
            if (parts.length < 2){
                throw 'expected parts.length == 2';
            }
            material[command] = parseInt(parts[1]);
        } else if (command === 'd') {
            // todo not supported yet
        } else if(textures.indexOf(command) !== -1) {
            material[command] = {
                filename: parts[parts.length -1]
            };
            var index = parseTextureArgs(parts, 1, material[command]);
            while(index < parts.length - 1){
                index = parseTextureArgs(parts, index, material[command]);
            }
        } else if (command === 'refl') {
            material[command] = material[command] || {};
            var tipe = parts[2];
            // refl[tipe] = {filename: ...}
            material[command][tipe] = {
                filename: parts[parts.length -1]
            };
            var index = parseTextureArgs(parts, 3, material[command][tipe]);
            while(index < parts.length - 1){
                index = parseTextureArgs(parts, index, material[command][tipe]);
            }
        }
    }
    for(var name in materials){
        materials[name] = new VG.Render.MtlMaterial(materials[name]);
    }
    return materials;
};

