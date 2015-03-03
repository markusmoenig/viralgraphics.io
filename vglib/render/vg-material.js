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

VG.Render.Material = function()
{
    /** Material interface, derived classes must create a shader and 
     *  optionally override the bind method
     *  @constructor */

    /** The shader object 
     *  @member {VG.Shader} */
    this.shader = null;
}

VG.Render.Material.prototype.isValid = function()
{
    /** Checks if the material has a valid shader, otherwise returns false 
     *  @return {Bool} */
    return (this.shader);
}

VG.Render.Material.prototype.bind = function()
{
    /** Binds the shader, override for more complex binding */

    if (this.shader) this.shader.bind();
}








VG.Render.SimpleMaterial = function()
{
    /** Barebone mostly used as fail-over */
    VG.Render.Material.call(this);

    var vSrc = [
        '#version 100',
        'attribute vec4 position;',
        'attribute vec3 normal;',
        'attribute vec2 vUV;',

        'uniform mat4 viewM;',
        'uniform mat4 projM;',
        'uniform mat4 modelM;',

        'varying vec3 vN;',

        'void main() {',

        '   mat4 vmM = viewM * modelM;',

        '   vN = (vmM * vec4(normal, 0.0)).xyz;',

        '   vec4 pos = vmM * position;',

        '   gl_Position = projM * pos;',
        '}',
    ].join("\n");

    var fSrc = [
        '#version 100',
        'precision mediump float;',

        'varying vec3 vN;',

        'void main() {',
        '   vec3 L = normalize(vec3(-0.5, 0.5, 0.5));',
        '   vec3 N = normalize(vN);',

        '   vec3 color = vec3(0.2, 0.2, 0.3) + vec3(0.5, 0.5, 1.0) * clamp(dot(L, N), 0.0, 1.0);',

        '   gl_FragColor = vec4(color, 1.0);',
        '}'
    ].join("\n");

    this.shader = new VG.Shader(vSrc, fSrc);
    this.shader.depthTest = true;
    this.shader.depthWrite = true;
    this.shader.culling = false;

    this.shader.create();
}

VG.Render.SimpleMaterial.prototype = Object.create(VG.Render.Material.prototype);
