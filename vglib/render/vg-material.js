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

VG.Render.Material.prototype.dispose = function()
{
	if (this.shader)
	{
		this.shader.dispose();
		this.shader = null;
	}
}

VG.Render.Material.prototype.setModelViewMatrix = function(matrix, transpose)
{
    /** Sets a model-view matrix from a float array, the matrial(i.e. shader) must be binded before.
     *  @param {array} value - A float array (2x2, 3x3 or 4x4) : column major
     *  @param {bool} [false] transpose - If true transposes the matrix
     *  */
	if (this.shader)
		// the uniform {string} may be different according to material implementation.
		this.shader.setMatrix("mvM", matrix, transpose);
}

VG.Render.Material.prototype.setProjectionMatrix = function(matrix, transpose)
{
    /** Sets a projection matrix from a float array, the matrial(i.e. shader) must be binded before.
     *  @param {array} value - A float array (2x2, 3x3 or 4x4) : column major
     *  @param {bool} [false] transpose - If true transposes the matrix
     *  */
	if (this.shader)
		// the uniform {string} may be different according to material implementation.
		this.shader.setMatrix("projM", matrix, transpose);
}

VG.Render.Material.prototype.getAttrib = function(name)
{
    /** Queries the attribute location/index
     *  @param {string} name - The attribute name as set in the source
     *  @returns {number}
     *  */
	var attrib = -1;
	if (this.shader)
		attrib = this.shader.getAttrib(name);
	return attrib;
}

VG.Render.Material.prototype.applySubMaterial = function(subIndex)
{
    /** Applies sub material.
     *  @param {int} subIndex - The sub material(index) for facet
     *  */
}

VG.Render.Material.prototype.applyLights = function(lights)
{
    /** Applies global lights.
     *  @param {Array[VG.Render.Light]} lights
     *  */
}

// barebone material
VG.Render.SimpleMaterial = function()
{
    /** Barebone mostly used as fail-over */
    VG.Render.Material.call(this);

    var vSrc = [
        '#version 100',
        'attribute vec4 position;',
        'attribute vec3 normal;',
        'attribute vec2 uv;',

        'uniform mat4 mvM;',
        'uniform mat4 projM;',

        'varying vec3 vN;',

        'void main() {',
        '   vN = (mvM * vec4(normal, 0.0)).xyz;',
        '   vec4 pos = mvM * position;',
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

    this.shader.create();
}

VG.Render.SimpleMaterial.prototype = Object.create(VG.Render.Material.prototype);

// Normal Material for Phong Shading Model
VG.Render.NormalMaterial = function(defMat, subMats)
{
	/** Normal Material for Phong Shading Model
	* @constructor
	* @param {VG.Render.NormalMaterial.MaterialInfo} defMat - default material
	* @param {Array[VG.Render.NormalMaterial.MaterialInfo]} subMats - sub materials
	*/
	VG.Render.Material.call(this);
	// initialize
	this.onCreate();
	
	// default material info
	if (defMat && defMat instanceof VG.Render.NormalMaterial.MaterialInfo)
		this.defaultMaterial = defMat;
	else
		this.defaultMaterial = new VG.Render.NormalMaterial.MaterialInfo();
	// sub material infos
	if (subMats && subMats instanceof Array)
		this.subMaterials = subMats;
}

VG.Render.MtlMaterial = function(opt){
	/**
	 * Material that conforms to mtl file format
	 * Opt format:
	 * 		command options
	 * 		.... (one or more)
	 * 	example:
	 *	 var reflectMtl = new VG.Render.MtlMaterial({
	 *		Ka: [1, 1, 0],
	 *		Kd: [1, 1, 0],
	 *		Ks: [1, 1, 1],
	 *		Ns: 100,
	 *		refl: {
	 *			cube_top: {filename: 'cube/cube_nx.png'},
	 *			cube_bottom: {filename: 'cube/cube_px.png'},
	 *			cube_front: {filename: 'cube/cube_py.png'},
	 *			cube_back: {filename: 'cube/cube_ny.png'},
     *   	    cube_left: {filename: 'cube/cube_nz.png'},
     *	        cube_right: {filename: 'cube/cube_pz.png'}
	 *       },
     *	   illum: 3
     *	});
	 * See: VG.Util.parseMTL for more about opt format
	 * 		and supported command & options
	 *
	 */
	VG.Render.Material.call(this);
	this.opt = opt;
	this.className = "MtlMaterial";
	this.needsUpdate = true; // force compilation upon first bind
	this.textureNeedsUpdate = true;
};
VG.Render.MtlMaterial.prototype = Object.create(VG.Render.Material.prototype);

VG.Render.MtlMaterial.prototype.createTexture = function(images) {
	/**
	 * @param {Dictionary} images Map from filename to VG.Core.Image()
	 */
	var that = this;
	if(this.retryTimer && this.retryTimer>0){
		this.retryTimer -= 1;
		return;
	}
	this.retryTimer = 10;
	if(!images) {
		images = {};
		VG.context.imagePool.images.forEach(function(o){
			if ( o.isValid() ) images[o.name] = o;
		});
	}
	this.textureNeedsUpdate = false;
	if (!VG.Render.MtlMaterial.notFoundImage) {
		var image = VG.Core.Image(2, 2);
		image.name = 'notFoundImage';
		image.setPixel(0, 0, 1, 1, 1, 1);
		image.setPixel(1, 1, 1, 1, 1, 0.5);
		image.setPixel(0, 1, 0, 0, 0, 0.5);
		image.setPixel(1, 0, 0, 0, 0, 0);
		VG.Render.MtlMaterial.notFoundImage = image;
	}
	['map_Ka', 'map_Kd', 'map_Ks', 'map_Ns', 'map_d',
		'decal', 'disp', 'bump'].forEach(function (o) {
			if(that.opt[o]) {
				var image = images[that.opt[o].filename];
				if(image) {
					that.opt[o].texture = new VG.Texture([
						image
					], false);
					that.opt[o].texture.flipY = false;
					that.opt[o].texture.create();
				} else {
					that.textureNeedsUpdate = true;
				}
			}
		});
	if(this.opt['refl']){
		var fail = false;
		var sides = ['cube_top', 'cube_bottom', 'cube_front', 'cube_back', 'cube_left', 'cube_right'].map(function(o){
			if(that.opt['refl'][o]){
				var image = images[that.opt['refl'][o].filename];
				if (image) {
					return image;
				} else {
					fail = true;
				}
			}
		});
		if(fail){
			this.textureNeedsUpdate = true;
		} else {
			this.opt['refl'].texture = new VG.Texture(sides, true);
			this.opt['refl'].texture.flipY = false;
			this.opt['refl'].texture.create();
		}
	}
};

VG.Render.MtlMaterial.recursiveCreateTexture = function(mesh, images){
	/**
	 * Since the mesh loaded from obj can contains children and grandchildren.
	 * we need to create texture for each.
	 * This static method will walk on the mesh tree to create texture for each material
	 * with the corresponding images.
	 */
	if(mesh.material && mesh.material.createTexture){
		mesh.material.createTexture(images);
	}
	for(var i = 0; i < mesh.children.length; i++){
		VG.Render.MtlMaterial.recursiveCreateTexture(mesh.children[i], images);
	}
};
VG.Render.MtlMaterial.prototype.compile = function(lights){
	/**
	 * Compile this material shader with provided lights configuration.
	 * The compilation will depends on the feature used on the lights.
	 * If it use spot, point, directional or only ambient light,
	 * then only that part compiled in the shader.
	 * This will prevent bloated shader source.
	 * The specific value of each element, e.q. position does not determine
	 * the compilation, but the existence of that value will determine the result shader.
	 * User could change the value of light.position or this.opt.Kd without the need
	 * for recompilation.
	 * Recompilation needed if use change the tipe of light or the number of light.
	 * For example: adding position to light will change from global ambient
	 * to directional light.
	 *
	 * @param {Array} lights
	 *  each light is of format:
	 *      {
     *          color: {
     *              ambient: VG.Core.Color(),
     *              diffuse: VG.Core.Color(),
     *              specular: VG.Core.Color()
     *          },
     *          position: VG.Math.Vector4(), // set w = 0 for directional light
     *          // for directional light, specify the direction of light
     *          attenuation: {
     *              constant: 1.5,
     *              linear: 0.5,
     *              quadratic: 0.2
     *          },
     *          spot: {
     *              cos_of_cutoff: 0.5, // cosine of cutoff angle
     *              exponent: 2.0,
     *              direction: VG.Math.Vector3()
     *          },
     *          strength: 1.0 // used by embree only
     *      }
	 *      spot light require: spot
	 *      point light require: position (w!=0) and attenuation
	 *      directional light require: color, position (w==0)
	 *      ambient require: color.ambient
	 */

	/**
	 * reference: http://paulbourke.net/dataformats/mtl/
	 * Term	Definition
	 *
	 * Fr	Fresnel reflectance
	 * Ft	Fresnel transmittance
	 * Ia	ambient light
	 * I	light intensity
	 * Ir	intensity from reflected direction
	 * 		(reflection map and/or ray tracing)
	 * It	intensity from transmitted direction
	 * Ka	ambient reflectance
	 * Kd	diffuse reflectance
	 * Ks	specular reflectance
	 * Tf	transmission filter
	 *
	 * Vector	Definition
	 *
	 * H	unit vector bisector between L and V
	 * L	unit light vector
	 * N	unit surface normal
	 * V	unit view vector
	 */
	this.flag = {
		use: {}
	}; // reset flag
	var flag = this.flag;
	var use = this.flag.use;
	var opt = this.opt;

	// choose the right illumination here if needed
	flag.illum = opt.illum;
	if (flag.illum === undefined) {
		if (opt.Ks) {
			flag.illum = 2;
		} else if(opt.Kd) {
			flag.illum = 1;
		} else {
			flag.illum = 0;
		}
	}
	var illum = flag.illum;
	// set flags
	if (illum === 0) {
		use.Kd = true;
	} else if (illum <= 9) {
		use.Ka = true;
		use.Kd = true;
		use.normal = true;
		use.pos = true;
		if (illum >= 2) {
			use.Ks = true;
			use.Ns = true;

			use.reflect = illum >= 3;
			use.raytrace = illum >= 3 && illum <= 7;
			use.dissolve = illum == 4 || illum == 6 || illum == 7 || illum == 9;
			use.Fr = illum == 5 || illum == 7;
			use.refract = illum == 6 || illum == 7;
			use.reflect = use.reflect && !!opt.refl;
			use.dissolve = use.dissolve && !!opt.d;
			use.refract = use.refract && use.dissolve && !!opt.refl && !!opt.Ni;
		}
	} else if (flag.illum === 10) {
		// shadow
	}
	// check if texture coord needed
	if ((use.Kd && opt.map_Kd)
		|| (use.Ks && (opt.map_Ks || opt.map_Ns))
		|| (use.Ka && opt.map_Ka)) {
		use.texCoord = true;
		use.texture = true;
	}
	if (use.reflect || use.refract) {
		use.texture = true;
	}
	function If(flag, text) {
		if (flag) return text;
		return "";
	}
	var v = [
		'#version 100',
		'attribute vec4 position;',
		'attribute vec3 normal;',
		If(use.texCoord, 'attribute vec2 texCoord;'),
		'uniform mat4 mvM;',
		'uniform mat4 projM;',
		If(use.reflect, 'uniform mat4 u_view;\nvarying mat3 v_view;'),
		If(use.normal, 'varying vec3 v_normal;'),
		If(use.pos, 'varying vec3 v_pos;'),
		If(use.texCoord, 'varying vec2 v_texCoord;'),
		'void main(){',
		If(use.normal, 'v_normal = (mvM * vec4(normal, 0.0)).xyz;'),
		'vec4 pos = mvM * position;',
		If(use.pos, 'v_pos = pos.xyz/pos.w;'),
		If(use.texCoord, 'v_texCoord = texCoord;'),
		If(use.reflect, 'v_view = mat3(u_view);'),
		'gl_Position = projM * pos;',
		'}'
	].join('\n');

	var f = [
		'#version 100',
		'precision highp float;',
		// starts uniform
		If(use.Ka, 'uniform vec3 Ka;' + If(opt.map_Ka, 'uniform sampler2D map_Ka;')),
		If(use.Kd, 'uniform vec3 Kd;' + If(opt.map_Kd, 'uniform sampler2D map_Kd;')),
		If(use.Ks, 'uniform vec3 Ks;' + If(opt.map_Ks, 'uniform sampler2D map_Ks;')),
		If(use.Ns, 'uniform float Ns;' + If(opt.map_Ns, 'uniform sampler2D map_Ns;')),
		If(use.reflect || use.refract, 'uniform samplerCube map_env;\nvarying mat3 v_view;'),
		If(use.refract, 'uniform float Tf;\n uniform float Ni;'),
		If(use.dissolve, 'uniform float dissolve;'),
		(function(){
			var light, name, out = '';
			for(var i in lights){
				light = lights[i];
				name = "L"+i;
				out += If(use.Ka, 'uniform vec3 '+name+'_col_a;\n');
				if (light.position && (use.Ks || use.Kd)) {
					out += If(use.Kd, 'uniform vec3 ' + name + '_col_d;\n');
					out += If(use.Ks, 'uniform vec3 ' + name + '_col_s;\n');
					out += 'uniform vec4 '+name+'_pos;\n';
					use.att = light.position && light.position.w !== 0;
					if(use.att) {
						out += 'uniform float ' + name + '_att_c;\n';
						out += 'uniform float ' + name + '_att_l;\n';
						out += 'uniform float ' + name + '_att_q;\n';
						if (light.spot) {
							out += 'uniform float ' + name + '_spot_cos;\n';
							out += 'uniform float ' + name + '_spot_exp;\n';
							out += 'uniform float ' + name + '_spot_dir;\n';
						}
					}
				}
			}
			return out;
		})(),
		// starts varying
		If(use.texCoord, 'varying vec2 v_texCoord;'),
		If(use.normal, 'varying vec3 v_normal;'),
		If(use.pos, 'varying vec3 v_pos;'),
		If(use.Fr, [
			'vec3 Fr(float hv, vec3 ks){',
			'return mix(ks, vec3(1.0), pow(1.0-max(0.0, hv), 5.0));',
			'}\n'
		].join('\n')),
		// here starts main
		'void main(){',
		If(use.Ka, 'vec3 KA = Ka' + If(opt.map_Ka, '*texture2D(map_Ka, v_texCoord).rgb') + ';'),
		If(use.Kd, 'vec3 KD = Kd' + If(opt.map_Kd, '*texture2D(map_Kd, v_texCoord).rgb') + ';'),
		If(flag.illum !== 0,[
			// material color + map join
			If(use.Ks, 'vec3 KS = Ks' + If(opt.map_Ks, '*texture2D(map_Ks, v_texCoord).rgb') + ';'),
			If(use.Ns, 'float NS = Ns' + If(opt.map_Ns, '*texture2D(map_Ns, v_texCoord).r') + ';'),
			// variables declarations
			If(use.Ka, 'vec3 ambient = vec3(0.0);'),
			If(use.Kd, 'vec3 diffuse = vec3(0.0);'),
			If(use.Ks, 'vec3 specular = vec3(0.0);'),
			'vec3 color = vec3(0.0);',
			'vec3 all = vec3(0.0);',
			'vec3 refl = vec3(0.0);',
			'vec3 pos_to_light = vec3(0.0);',
			'float dst = 0.0;',
			'float att = 0.0;',
			If(use.normal, 'vec3 normal = normalize(v_normal);'),
			If(use.pos, 'vec3 pos_to_eye = normalize(vec3(0.0)-v_pos);'),
		].join('\n')),
		(function(){
			var light, name, out = '';
			if (flag.illum === 0) {
				return 'gl_FragColor.rgb = KD;';
			}
			// KaIa
			// + Kd { SUM j=1..ls, (N*Lj)Ij }
			// + Ks ({ SUM j=1..ls, ((H*Hj)^Ns)Ij } + Ir)
			for(var i in lights) {
				light = lights[i];
				name = "L" + i;
				use.att = light.position && light.position.w !== 0;
				if (use.att) {
					out += [
						"dst = distance(" + name + "_pos.xyz,v_pos);",
						"att = " + name + "_att_c + " + name + "_att_l * dst + " + name + "_att_q * dst * dst;",
						'att = 1.0/att;\n'
					].join('\n');
					if (light.spot) {
						out += [
							"cos_theta_spot = dot(v_pos - " + name + "_pos, " + name + "_spot_dir);",
							"if (cos_theta_spot>" + name + "_spot_cos) {",
							"att *= pow(cos_theta_spot, " + name + "_spot_exp);",
							'} else {',
							'att = 0.0;',
							'}\n'
						].join('\n');
					}
				}
				out += If(use.Ka, 'ambient += '+name+'_col_a' +If(use.att, ' * att') +';\n');

				if (use.Kd) {
					if (light.position) {
						if (light.position.w === 0) {
							out += 'pos_to_light = ' + name + '_pos.xyz;\n';
						} else {
							out += 'pos_to_light = normalize(' + name + '_pos.xyz - v_pos);\n';
						}
						out += 'diffuse += (' + name + '_col_d * max(0.0, dot(pos_to_light, normal)))' +
							If(use.att, ' * att') + ';\n';
						if (use.Ks) {
							out += 'refl = reflect(vec3(0.0) - pos_to_light, normal);\n';
							out += 'if(dot(pos_to_light, pos_to_eye) > 0.0){\n';
							out += 'specular += (' + name + '_col_s * pow(max(0.0, dot(pos_to_eye, refl)), NS))';
							if (use.Fr) {
								out += '*Fr(dot(normalize(pos_to_eye + pos_to_light), pos_to_eye), KS)';
							} else {
								out += '*KS';
							}
							out += If(use.att, '*att') + ';\n';
							out += '}\n';
						}
					}
				}
			}
			var arr = [];
			if(use.Ka){ arr.push('ambient * KA');}
			if(use.Kd){ arr.push('diffuse * KD');}
			if(use.Ks){ arr.push('specular');}
			if(use.reflect){
				var text = 'KS';
				if (use.Fr) { text = 'Fr(dot(normal, pos_to_eye), KS)';}
				arr.push(text +  '* textureCube(map_env, v_view * reflect(pos_to_eye, normal)).rgb');
			}
			if(use.refract){
				out += [
					'float sinA = sqrt(1.0-dot(pos_to_eye,normal));',
					'float sinB = 1.0/Ni * sinA;',
					'float cosB = sqrt(1.0-sinB*sinB);',
					'vec3 T = normalize(cross(cross(pos_to_eye, normal), normal));',
					'vec3 ray = normalize(cosB * normal + sinB * T);\n'
				].join('\n');
				var text = '';
				if (use.Fr) { text = 'Fr(dot(normal, pos_to_eye), 1.0-KS) * ';}
				arr.push(text + 'Tf * textureCube(map_env, v_view * ray).rgb * (1.0 - KS)');
			}
			if (arr.length > 0) {
				out += 'color = ' + arr.join('+') + ';\n';
			}
			out +='gl_FragColor.rgb = color;\n';
			if (use.dissolve) {
				out += 'gl_FragColor.a = dissolve;';
			}
			return out;
		})(),
		'}\n'
	].join('\n');
	//VG.log(flag.illum);
	//VG.log(v);
	//VG.log(f);
	//console.log(use);
	this.shader = new VG.Shader(v, f);
	this.shader.depthTest = true;
	this.shader.depthWrite = true;
	this.shader.create();
	if (use.dissolve) {
		this.shader.blendType = VG.Shader.Blend.Alpha;
	}
	this.needsUpdate = false;
};
VG.Render.MtlMaterial.prototype.bind = function(context){
	/**
	 * Bind this material shader.
	 * It will bind necessary material value, texture, reflection map and light value.
	 * It will recompile shader if this.needsUpdate is set.
	 * Call this before drawing mesh that assume this material.
	 *
	 * @param {VG.Render.Context} context
	 */
	var use, shader, slot = 0, opt = this.opt,
		lights = context.lights, camera = context.camera;
	if (this.needsUpdate) {
		this.needsUpdate = false;
		this.compile(lights);
	}
	use = this.flag.use;
	if (use.texture && this.textureNeedsUpdate) {
		this.createTexture();
	}
	shader = this.shader;
	shader.bind();
	if(use.Ka && opt.Ka){ shader.setFloat('Ka', opt.Ka);}
	if(use.Kd && opt.Kd){ shader.setFloat('Kd', opt.Kd);}
	if(use.Ks && opt.Ks){ shader.setFloat('Ks', opt.Ks);}
	if(use.Ns && opt.Ns){ shader.setFloat('Ns', opt.Ns);}
	if(use.refract){ shader.setFloat('Tf', 1.0-opt.d); }
	if(use.Ka && opt.map_Ka && opt.map_Ka.texture) { shader.setTexture('map_Ka', opt.map_Ka.texture, slot); slot ++;}
	if(use.Kd && opt.map_Kd && opt.map_Kd.texture) { shader.setTexture('map_Kd', opt.map_Kd.texture, slot); slot ++;}
	if(use.Ks && opt.map_Ks && opt.map_Ks.texture) { shader.setTexture('map_Ks', opt.map_Ks.texture, slot); slot ++;}
	if(use.Ns && opt.map_Ns && opt.map_Ns.texture) { shader.setTexture('map_Ns', opt.map_Ns.texture, slot); slot ++;}
	if(use.d && opt.map_d && opt.map_d.texture) { shader.setTexture('map_d', opt.map_d.texture, slot); slot ++;}
	if((use.reflect || use.refract) && opt.refl.texture){
		shader.setTexture('map_env', opt.refl.texture, slot); slot ++;
		shader.setMatrix('u_view', context.camera.getTransform().invert().elements);
	}
	if(use.dissolve) {
		shader.setFloat('dissolve', opt.d);
	}
	if(use.refract) {
		shader.setFloat('Tf', 1);
		shader.setFloat('Ni', opt.Ni);
	}
	(function(){
		var light, name;
		for(var i in lights){
			light = lights[i];
			name = "L"+i;
			if(use.Ka){shader.setColor3(name+'_col_a', light.color.ambient);}
			if (light.position && (use.Ks || use.Kd)) {
				if(use.Kd){shader.setColor3(name+'_col_d', light.color.diffuse);}
				if(use.Ks){shader.setColor3(name+'_col_s', light.color.specular);}
				use.att = light.position && light.position.w !== 0;
				if(!use.att) {
					var p = new VG.Math.Vector3(light.position.x, light.position.y, light.position.z);
					p.normalize();
					shader.setFloat(name + '_pos', [p.x, p.y, p.z, 0.0]);
				} else {
					var p = camera.getTransform().invert().multiplyPosition(light.position);
					shader.setFloat(name + "_pos", [p.x, p.y, p.z, p.w]);
					shader.setFloat(name + "_att_c", light.attenuation.constant);
					shader.setFloat(name + "_att_l", light.attenuation.linear);
					shader.setFloat(name + "_att_q", light.attenuation.quadratic);
					if (light.spot) {
						shader.setFloat(name + "_spot_cos", light.spot.cos_of_cutoff);
						shader.setFloat(name + "_spot_exp", light.spot.exponent);
						shader.setFloat(name + "_spot_dir", [light.spot.direction.x, light.spot.direction.y, light.spot.direction.z]);
					}
				}
			}
		}
	})();
};






// Normal Material for Phong Shading Model
VG.Render.NormalMaterial = function( data )
{
	/** Normal Material for Phong Shading Model
	* @constructor
	* @param {VG.Render.NormalMaterial.MaterialInfo} defMat - default material
	* @param {Array[VG.Render.NormalMaterial.MaterialInfo]} subMats - sub materials
	*/
	VG.Render.Material.call(this);
	// initialize
	this.onCreate();
	
	this.data=data;
}

VG.Render.NormalMaterial.prototype = Object.create(VG.Render.Material.prototype);

VG.Render.NormalMaterial.prototype.onCreate = function()
{
    /** Identifies normal material in native layer.
     * @member {bool}
     */
    this.identifyNormalMaterial = true;

	/** default material to apply when any facet's sub-material is not set.
	* @member {VG.Render.NormalMaterial.MaterialInfo} defaultMaterial
	*/
	this.defaultMaterial = null;

	/** sub materials to apply for every facet.
	* @member {Array[VG.Render.NormalMaterial.MaterialInfo]}
	*/
	this.subMaterials = [];

	/** Maximum light count : constant
	* @member {int} MaxLightN - constant
	*/
	this.MaxLightN = 32;

	// Shader
    var vSrc = [
        '#version 100',

		// vertex attributes
        'attribute vec4 position;',
        'attribute vec3 normal;',

		// transform
        'uniform mat4 mvM;',
        'uniform mat4 projM;',
		
		// to fragment
        'varying vec3 vP;',
        'varying vec3 vN;',
		
		// function
        'void main() {',
        '	vN = (mvM * vec4(normal, 0.0)).xyz;',
        '	vec4 pos = mvM * position;',
        '	vP = pos.xyz;',
		'	gl_Position = projM * pos;',
        '}',
    ].join("\n");

    var fSrc = [
        '#version 100',
        'precision highp float;',

		// material
		'struct Material {',
		'	vec4 color;',

		'	bool emissive;',
		'	vec4 emissiveColor;',

		'	float glossy;',		

		'	vec4 ambientColor;',
		'	vec4 diffuseColor;',
		'	vec4 specularColor;',
		'	float specularShininess;',
		'};',
		'uniform Material material;',

		// lights
		'#define NLIGHT ' + this.MaxLightN,

		'struct Light {',
		'	vec4 position;', // in ecs : (position of, or direction to) light
		'	vec4 emissiveColor;',

		'	vec4 ambientColor;',
		'	vec4 diffuseColor;',
		'	vec4 specularColor;',

		'	vec3 spotDirection;', // in ecs		
		'	float spotExponent;',
		'	float spotCutOff;', // cos(cutOff)
		'	float attenuation0;',
		'	float attenuation1;',
		'	float attenuation2;',
		'};',
		'uniform Light light[NLIGHT];', // multiple lights
		'uniform int nLight;', // current light count (<= NLIGHT)
		'uniform bool localViewer;', // view direction GL_LIGHT_MODEL_LOCAL_VIEWER, i.e, (0, 0, 1)
		'uniform float globalAmbient;', // global ambient light

		// from vertex shader
        'varying vec3 vP;',
        'varying vec3 vN;',

		// function
        'void main() {',

        '   if ( material.emissive ) {',
        '      gl_FragColor = vec4( material.emissiveColor.rgb, 1);',
        '      return;',
        '   }',

		// accumulated color of all contributions.
        '   vec4 sigma = material.color;', // start with the material emission.

		// global ambient
        //'   sigma += globalAmbient * material.ambientColor;',
        '   sigma *= globalAmbient;',
		// contributions from light sources
        '   for (int i = 0; i < NLIGHT; i++) {',
        '		if (nLight <= i)',
        '			break;',

        '		Light iLight = light[i];',

		'		float atten = 1.0;', // attenuation factor
        '		float spot = 1.0;', // spotlight effect

		'		if (iLight.position.w != 0.0) {', // only when point-light
        //'			if (iLight.attenuation1 != 0.0 || iLight.attenuation2 != 0.0) {',
						// attenuation factor
        //'				float d = distance(iLight.position.xyz, vP);',
        //'				float _atten = iLight.attenuation0 + iLight.attenuation1 * d + iLight.attenuation2 * d * d;',
        //'				if (_atten > 0.0)',
        //'					atten = 1.0 / _atten;',
        //'			}',
        
		'			if (iLight.spotCutOff > 0.0) {',
						// spotlight effect
        '				vec3 v = normalize(vP - iLight.position.xyz);',
        '				vec3 d = normalize(iLight.spotDirection);',
        '				float _spot = max(0.0, dot(v, d));',
        '				if (_spot < iLight.spotCutOff)',
							// outside of spot-cone.
        '					spot = 0.0;',
							// inside of spot-cone
        '				else if (iLight.spotExponent != 0.0)',
        '					spot = pow(_spot, iLight.spotExponent);',
        '				else',
        '					spot = _spot;',
        '			}',
        '		}',
				// ads = ambient + diffuse + specular
        '		vec4 ads = sigma;',//iLight.ambientColor * material.ambientColor;',
        '		vec3 nL = normalize(iLight.position.w==0.0 ? iLight.position.xyz : (iLight.position.xyz - vP));',
        '		vec3 nN = normalize(vN);',
        '		float fln = dot(nL, nN);',
        '		if (0.0 < fln) {',
					// diffuse
//        '			ads += (fln * iLight.diffuseColor * material.diffuseColor);',
        '			sigma += sigma * fln * 5.0;',//(fln * iLight.diffuseColor * material.diffuseColor);',
					// specular
        '			vec3 nR = 2.0*fln*nN - nL;', // reflection of incident light
        '			vec3 nV = localViewer ? vec3(0.0, 0.0, 1.0) : normalize(-vP);', // view direction
        '			float spec = dot(nR, nV);',
		'			if (0.0 < spec) {',
        '				if (material.specularShininess != 0.0)',
        '					spec = pow(spec, material.specularShininess);',
        '				sigma += sigma * (spec * 0.6);',//(spec * iLight.specularColor * material.specularColor);',
		'			}',
		'		}',
				// all contribution
//		'		sigma += atten * spot * ads;',
		'   }',
        '   gl_FragColor = vec4(sigma.rgb, material.ambientColor.a);',
        '}'
    ].join("\n");

    this.shader = new VG.Shader(vSrc, fSrc);
    this.shader.depthTest = true;
    this.shader.depthWrite = true;

    this.shader.create();
}

VG.Render.NormalMaterial.prototype.applyData = function()
{
    /** Applies sub material.
     *  @param {int} subIndex - The sub material(index) for facet, if subIndex < 0, then defaultMaterial.
     *  */

    var data=this.data;
    var shader=this.shader;

	shader.setColor("material.color", data.color );
	shader.setBool("material.emissive", data.emissive );

	if ( data.emissive )
		shader.setColor("material.emissiveColor", data.emissiveColor );

	shader.setFloat("material.glossy", data.glossy );
	shader.setFloat("material.specularShininess", data.shininess );

	/*
	shader.setColor("material.emissionColor", data.emissionColor);
	shader.setColor("material.ambientColor", data.ambientColor);
	shader.setColor("material.diffuseColor", data.diffuseColor);
	shader.setColor("material.specularColor", data.specularColor);
	shader.setFloat("material.specularShininess", data.specularShininess);*/
}

VG.Render.NormalMaterial.prototype.applyLights = function( lights, viewM, emissiveObjects )
{
    /** Applies global lights.
     *  @param {Array[VG.Render.Light]} lights
	 *  @param {VG.Math.Matrix4} viewM - view matrix
     *  */
	var shader = this.shader;
	var applyN = 0;


	var ambient=0.18;// / Math.PI;
	shader.setFloat('globalAmbient', ambient );

	if (lights.length < 1) {
		shader.setInt('nLight', applyN);
		return;
	}

	var mvM = new VG.Math.Matrix4();
	var lightPosition = [0, 0, 0, 0];
	var spotDirection = [0, 0, 0];

	for (var i = 0; i < emissiveObjects.length; i++)
	{
		var object = emissiveObjects[i];

		var iLight = 'light' + '[' + applyN + '].';

		lightPosition[0]=object.position.x;
		lightPosition[1]=object.position.y;
		lightPosition[2]=object.position.z;
		lightPosition[3]=1;

		lightPosition[1]=9;

		mvM.set(viewM);
		mvM.multiply(object.getTransform());

		//lightPosition[1]-=8;
		//lightPosition[2]-=4;
		//lightPosition[2]=object.position.z;

		mvM.transformVectorArray(lightPosition);

		shader.setFloat(iLight + 'position', lightPosition);

		shader.setColor(iLight + 'emissiveColor', object.material.data.emissiveColor);

/*
			shader.setColor(iLight + 'ambientColor', light.ambientColor);
			shader.setColor(iLight + 'diffuseColor', light.diffuseColor);
			shader.setColor(iLight + 'specularColor', light.specularColor);

			mvM.set(viewM);
			mvM.multiply(light.getTransform());

			light.lightPosition.getArray(lightPosition);
			mvM.transformVectorArray(lightPosition);
			shader.setFloat(iLight + 'position', lightPosition);

			light.spotDirection.getArray(spotDirection);
			mvM.transformVectorArray(spotDirection, true);
			shader.setFloat(iLight + 'spotDirection', spotDirection);

			shader.setFloat(iLight + 'spotExponent', light.spotExponent);
			shader.setFloat(iLight + 'spotCutOff', light.spotCutOff);
			shader.setFloat(iLight + 'attenuation0', light.attenuation0);
			shader.setFloat(iLight + 'attenuation1', light.attenuation1);
			shader.setFloat(iLight + 'attenuation2', light.attenuation2);
*/
		applyN++;
	}
/*
	for (var i = 0; i < lights.length; i++)
	{
		var light = lights[i];
		if (1)//light.identifyAmbientLight)
		{
			shader.setColor('globalAmbient', VG.Core.NormalizedColor( 0.18, 0.18, 0.18) );//light.color);
		}
		else if (light.identifyNormalLight && applyN < this.MaxLightN)
		{
			var iLight = 'light' + '[' + applyN + '].';

			shader.setColor(iLight + 'ambientColor', light.ambientColor);
			shader.setColor(iLight + 'diffuseColor', light.diffuseColor);
			shader.setColor(iLight + 'specularColor', light.specularColor);

			mvM.set(viewM);
			mvM.multiply(light.getTransform());

			light.lightPosition.getArray(lightPosition);
			mvM.transformVectorArray(lightPosition);
			shader.setFloat(iLight + 'position', lightPosition);

			light.spotDirection.getArray(spotDirection);
			mvM.transformVectorArray(spotDirection, true);
			shader.setFloat(iLight + 'spotDirection', spotDirection);

			shader.setFloat(iLight + 'spotExponent', light.spotExponent);
			shader.setFloat(iLight + 'spotCutOff', light.spotCutOff);
			shader.setFloat(iLight + 'attenuation0', light.attenuation0);
			shader.setFloat(iLight + 'attenuation1', light.attenuation1);
			shader.setFloat(iLight + 'attenuation2', light.attenuation2);

			applyN++;
		}
	}
*/

	shader.setInt('nLight', applyN);
}

VG.Render.NormalMaterial.prototype.makeLampMaterial = function(lampColor)
{
    /** make the material as lamp.
     *  @param {VG.Core.Color} lampColor - The lamp color
     *  */
	var material = this.defaultMaterial;

	material.emissionColor.set(lampColor);
	material.ambientColor.set(lampColor);
	material.diffuseColor.setValue(0, 0, 0, 1);
	material.specularColor.setValue(0, 0, 0, 1);
	material.specularShininess = 0;

	this.subMaterials = [];
}

VG.Render.NormalMaterial.MaterialInfo = function(parm)
{
	/** Material Parameters for Normal Material
	* @constructor
	* param {Object} parm : {default:[r,g,b,a], diffuse:[r,g,b,a], specular:[r,g,b,a], factor:shininess, ambient:[r,g,b,a], emission:[r,g,b,a]} <br />
	* default is ambient and specular.
	* color-array is size-dynamic.
	*/
	this.onCreate();

	if (!parm)
		return;
/*
	if (parm.default)
	{
		this.diffuseColor.setValueArray(parm.default);
		this.specularColor.setValueArray(parm.default);
	}

	if (parm.factor !== undefined)
		this.specularShininess = parm.factor;

	if (parm.diffuse)
		this.diffuseColor.setValueArray(parm.diffuse);
	if (parm.specular)
		this.specularColor.setValueArray(parm.specular);
	if (parm.ambient)
		this.ambientColor.setValueArray(parm.ambient);
	if (parm.emission)
		this.emissionColor.setValueArray(parm.emission);*/
};

VG.Render.NormalMaterial.MaterialInfo.prototype.onCreate = function()
{
	/** Emission Color
	* @member {VG.Core.Color}
	*/
	this.emissionColor = VG.Core.NormalizedColor(0.0, 0.0, 0.0);

	/** Ambient Color
	* @member {VG.Core.Color}
	*/
	this.ambientColor = VG.Core.NormalizedColor(0.2, 0.2, 0.2);

	/** Diffuse Color
	* @member {VG.Core.Color}
	*/
	this.diffuseColor = VG.Core.NormalizedColor(0.8, 0.8, 0.8);

	/** Specular Color
	* @member {VG.Core.Color}
	*/
	this.specularColor = VG.Core.NormalizedColor(0.0, 0.0, 0.0);

	/** Specular Shininess
	* @member {Number}
	*/
	this.specularShininess = 0.0;
}

VG.Render.MaterialData=function()
{
	this.color=VG.Core.Color();
	this.emissiveColor=VG.Core.Color( 255, 255, 255 );

	this.emissive=false;
	this.glossy=0;
};

VG.Render.MaterialData.prototype.toTracerMaterial=function()
{
	var tracerM={};

	tracerM.color=new VG.Math.Vector4( this.color.r,  this.color.g,  this.color.b,  this.color.a );
	tracerM.emissive=this.emissive;

	if ( this.emissive ) {
		tracerM.emissiveColor=new VG.Math.Vector3( this.emissiveColor.r,  this.emissiveColor.g,  this.emissiveColor.b );
	} else tracerM.emissiveColor=new VG.Math.Vector3( 0, 0, 0, 0 );

	tracerM.shininess=this.shininess;
	tracerM.glossy=this.glossy;
	tracerM.mirror=this.mirror;

	if ( tracerM.glossy ) {
		tracerM.specularColor=new VG.Math.Vector3( 0.99-tracerM.color.x,  0.99-tracerM.color.y,  0.99-tracerM.color.z );
		//tracerM.specularColor=new VG.Math.Vector3( 0, 0, 0 );
	}

	return tracerM;
};