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

var VG;
(function (VG) {
    "use strict";
    var WebGL,
        GPUBuffer,
        Shader,
        Texture,
        RenderTarget,
        gl,
        _state = VG._state = {
            WebGL: {
                enabled: {},
                activeTexture: 0,
                texture: {},
                vertexAttrib: {},
                stencilMode: null
            },
            GPUBuffer: {
                bindBuffer: {}
            },
            Shader: {},
            Texture: {},
            FrameBuffer: {}
        };

    /**
     * Initialize VG.
     * This method should be called before call to any GL related classes, i.e:
     * Shader, GPUBuffer, Texture, Rendertarget
     *
     * <pre>
     * Common usage:
     * VG.Init();
     * ...
     * // here create buffer, see: VG.GPUBuffer
     * ...
     * // here create shader, see: VG.Shader
     * ...
     * // rede to draw
     * </pre>
     * @return {null}
     */

    VG.init = function () {
        WebGL.init();
    };

    /**
     *
     * @constructor
     */

    VG.WebGL = WebGL = function () {
    };

    /**
     * @returns
     * @private
     */

    VG.WebGL.init = function () {
        WebGL.canvas = document.getElementById('webgl');
        gl = VG.gl = WebGL.gl = WebGLUtils.setupWebGL(WebGL.canvas);
        WebGL.samples = WebGL.gl.getParameter(WebGL.gl.SAMPLES);
        var maxTextureImageUnits = 8;
        for (var i = 0; i < maxTextureImageUnits; i += 1) {
            _state.WebGL.texture[i] = {};
        }
        VG.WebGL.magFilter = gl.LINEAR;
        VG.WebGL.minFilter = gl.LINEAR;

        if ( !VG.webgl2 ) {
            // --- WebGL 1 extensions
            this.supportsFloatTextures = gl.getExtension("OES_texture_float");
            this.supportsFloatLinear = gl.getExtension("OES_texture_float_linear");
            this.queryExt = VG.WebGL.gl.getExtension('EXT_disjoint_timer_query');
        } else {
            // --- WebGL 2 extensions
            this.queryExt = VG.WebGL.gl.getExtension('EXT_disjoint_timer_query_webgl2');
            this.supportsFloatTextures = gl.getExtension("EXT_color_buffer_float");
        }
    };

    /**
     * Convert VG.Renderer.Primitive type to GL types
     * @param primitiveType
     * @returns {number}
     * @private
     */

    VG.WebGL.primitiveTypeToGL = function (primitiveType) {
        if (primitiveType === VG.Renderer.Primitive.Lines)
            return gl.LINES;
        if (primitiveType === VG.Renderer.Primitive.LineStrip)
            return gl.LINE_STRIP;
        if (primitiveType === VG.Renderer.Primitive.TriangleStrip)
            return gl.TRIANGLE_STRIP;
        if (primitiveType === VG.Renderer.Primitive.Points)
            return gl.POINTS;
        return gl.TRIANGLES;
    };

    /**
     * GPUBuffer encapsulates OpenGL VBO<br>
     * Usage:<br>
     *     <pre>
     * var g = new GPUBuffer(VG.Type.Float, 3*3).create();
     * ... fill with data ...
     * g.update(); // transfer data and optional alloc
     * ...
     * ... link data to shader pointer ...
     * g.vertexAttrib(...);
     * ...
     * g.bind();
     * g.update();
     * ... drawing ...
     * shader.bind();
     * b.drawBuffer(...);
     * ...
     * g.destroy()
     * g.create()
     * ...
     * g.dispose()
     * </pre>
     * @param {VG.Type} type - Type of buffer, i.e VG.Type.Float
     * @param {number} size - Size of buffer (#type)
     * @param {boolean} [dynamic=false] - Is dynamic buffer
     * @param {boolean} [isIndexBuffer=false] - Index buffer flag
     * @constructor
     */

    VG.GPUBuffer = GPUBuffer = function (type, size, dynamic, isIndexBuffer) {
        this.id = 0;
        this.usage = dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
        this.target = isIndexBuffer ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
        this.type = type;
        if (type === VG.Type.Float)
            this.elemType = gl.FLOAT;
        else if (type === VG.Type.Uint8)
            this.elemType = gl.UNSIGNED_BYTE;
        else if (type === VG.Type.Uint16)
            this.elemType = gl.UNSIGNED_SHORT;
        else if (type === VG.Type.Uint32)
            this.elemType = gl.UNSIGNED_INT;
        else
            throw "Invalid Type:" + type + ".";
        this.dataBuffer = new VG.Core.TypedArray(type, size);
        if (!this.dataBuffer.data)
            throw "Fail to create dataBuffer";
        VG.Renderer().addResource(this);
        this._state = {};
    };

    /**
     * Get the stride in bytes.<br>
     * Stride in #bytes per element.
     * @returns {number} - Buffer stride.
     */

    VG.GPUBuffer.prototype.getStride = function () {
        return this.dataBuffer.data.BYTES_PER_ELEMENT;
    };
    /**
     * Get data buffer, i.e vertex buffer
     * @returns {VG.Core.TypedArray} - Buffer data.
     */

    VG.GPUBuffer.prototype.getDataBuffer = function () {
        return this.dataBuffer;
    };

    /**
     * Allocate buffer ID in GPU. Auto bind.
     * This also transfer data to GPU.
     * @returns {VG.GPUBuffer} - this
     * @private
     */

    VG.GPUBuffer.prototype.create = function () {
        if (this.id !== 0) {
            throw "GPUBuffer.create(), this.id !== 0. Buffer already created.";
        }
        this.id = gl.createBuffer();
        this.bind();
        this.update();
        return this;
    };
    /**
     * Bind buffer.
     * @returns {VG.GPUBuffer} - this
     */

    VG.GPUBuffer.prototype.bind = function () {
        if (_state.GPUBuffer.bindBuffer[this.target] !== this.id) {
            gl.bindBuffer(this.target, this.id);
            _state.GPUBuffer.bindBuffer[this.target] = this.id;
        }
        return this;
    };

    /**
     * Update the buffer from RAM to GPU. <br>
     * The updated data must be inside dataBuffer.data. <br>
     * offset + count <= this.dataBuffer.data.length <br>
     * @param {number} [offset=0] - Offset to update
     * @param {number} [count=data.size] - Count to update
     * @returns {VG.GPUBuffer} - this
     */

    VG.GPUBuffer.prototype.update = function (offset, count) {
        if (this.id === 0)
            throw "GPUBuffer.update(), this.id == 0.";
        this.bind();
        offset = offset === undefined || offset < 0 ? 0 : offset;
        count = count === undefined ? this.dataBuffer.data.length : count;
        if (offset + count > this.dataBuffer.data.length) {
            throw "GPUBuffer.update(), offset + count (" + (offset + count) + ") > data.length (" + this.dataBuffer.data.length + ")";
        }
        if (this._state.bufferData) {
            var data = offset === 0 && count === this.dataBuffer.data.length ?
                this.dataBuffer.data : this.dataBuffer.data.subarray(offset, count);
            gl.bufferSubData(this.target, offset, data);
        }
        else {
            gl.bufferData(this.target, this.dataBuffer.data, this.usage);
            this._state.bufferData = true;
        }
        return this;
    };
    /**
     * Release buffer from GPU.
     * Opposite of create()
     * @private
     */

    VG.GPUBuffer.prototype.destroy = function () {
        if (this.id === 0)
            return;
        gl.deleteBuffer(this.id);
        delete this._state.bufferData;
        this.id = 0;
    };

    /**
     * Invalidate.
     * Opposite of new.
     */
    VG.GPUBuffer.prototype.dispose = function () {
        this.destroy();
        delete this.dataBuffer;
        VG.Renderer().removeResource(this);
    };

    /**
     * Pointer a buffer to a vertex attribute.
     * @param {number} index - Index of attribute, i.e: shader.getAttrib("v_position")
     * @param {number} size - Size of each item
     * @param normalized
     * @param stride
     * @param offset
     * @returns {VG.GPUBuffer} this
     */

    VG.GPUBuffer.prototype.vertexAttrib = function (index, size, normalized, stride, offset) {
        var shader = _state.Shader.bind;
        shader._state.toEnable[index] = true;
        if (index in _state.WebGL.vertexAttrib) {
        }
        else {
            gl.enableVertexAttribArray(index);
            _state.WebGL.vertexAttrib[index] = true;
        }
        gl.vertexAttribPointer(index, size, this.elemType, normalized, stride, offset);
        return this;
    };

    /**
     * Draw VBO (vertex buffer)
     * @param primitiveType {VG.Renderer.Primitive} Type of primitive
     * @param offset {number} Offset
     * @param count {number} Count
     * @returns {VG.GPUBuffer}
     */

    VG.GPUBuffer.prototype.drawBuffer = function (primitiveType, offset, count) {
        var shader = _state.Shader.bind;
        for (var index in _state.WebGL.vertexAttrib) {
            if (!(index in shader._state.toEnable)) {
                gl.disableVertexAttribArray(index);
                delete _state.WebGL.vertexAttrib[index];
            }
        }
        if (this.target === gl.ELEMENT_ARRAY_BUFFER) {
            gl.drawElements(WebGL.primitiveTypeToGL(primitiveType), count, this.elemType, offset);
        } else {
            gl.drawArrays(WebGL.primitiveTypeToGL(primitiveType), offset, count);
        }
        return this;
    };

    /**
     * Construct & compile shader with given source.
     * <pre>
     *     Example:
     *     s = new Shader(vsSource, fsSource);
     *     s.create();
     *     ...
     *     // drawing
     *     s.bind();
     *     gpuBuffer.drawBuffer(...);
     *     ...
     *     // clean up
     *     s.destroy();
     * </pre>
     * @param vSource {string} Vertex source
     * @param fSource {string} Fragment source
     * @constructor
     */

    VG.Shader = Shader = function (vSource, fSource) {
        this.depthWrite = false;
        this.depthTest = false;
        this.blendType = VG.Shader.Blend.None;
        this.blendEquation = VG.Shader.BlendEquation.Add;
        this.culling = false;
        this.id = 0;
        this._state = {
            uniform: {},
            attribute: {},
            value: {},
            toEnable: {}
        };
        this.vSource = vSource;
        this.fSource = fSource;
        VG.Renderer().addResource(this);
    };

    /**
     * Compile this Shader
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.create = function () {
        var vId = gl.createShader(gl.VERTEX_SHADER);
        var fId = gl.createShader(gl.FRAGMENT_SHADER);

        let self  = this;
        function compile(id, source) {
            gl.shaderSource(id, source);
            gl.compileShader(id);
            if (!gl.getShaderParameter(id, gl.COMPILE_STATUS)) {
                if ( self.errorCallback ) self.errorCallback( gl.getShaderInfoLog(id) );
                else console.error(gl.getShaderInfoLog(id));
                return false;
            }
            return true;
        }

        if (!compile(vId, this.vSource) || !compile(fId, this.fSource)) {
            gl.deleteShader(vId);
            gl.deleteShader(fId);
            throw "Shader.compile(), fail in vertex or fragment shader.";
        }
        this.id = gl.createProgram();
        gl.attachShader(this.id, vId);
        gl.attachShader(this.id, fId);
        gl.linkProgram(this.id);
        if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.id);
            this.destroy();
            throw "Shader.compile(), fail to link program: " + error;
        }
        this.vId = vId;
        this.fId = fId;
        return this;
    };

    /**
     * Compile this Shader
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.compile = function () {
        var vId = gl.createShader(gl.VERTEX_SHADER);
        var fId = gl.createShader(gl.FRAGMENT_SHADER);

        let self  = this;
        function compile(id, source) {
            gl.shaderSource(id, source);
            gl.compileShader(id);
            /*
            if (!gl.getShaderParameter(id, gl.COMPILE_STATUS)) {
                if ( self.errorCallback ) self.errorCallback( gl.getShaderInfoLog(id) );
                else console.error(gl.getShaderInfoLog(id));
                return false;
            }*/
            return true;
        }

        if (!compile(vId, this.vSource) || !compile(fId, this.fSource)) {
            gl.deleteShader(vId);
            gl.deleteShader(fId);
            throw "Shader.compile(), fail in vertex or fragment shader.";
        }

        this.vId = vId;
        this.fId = fId;

        this.id = gl.createProgram();
        return this;
    };

    /**
     * Link this Shader
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.link = function () {

        if (!gl.getShaderParameter(this.fId, gl.COMPILE_STATUS)) {
            if ( self.errorCallback ) self.errorCallback( gl.getShaderInfoLog(this.fId) );
            else console.error(gl.getShaderInfoLog(this.fId));
            return false;
        }

        gl.attachShader(this.id, this.vId);
        gl.attachShader(this.id, this.fId);
        gl.linkProgram(this.id);

        if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.id);
            this.destroy();
            throw "Shader.compile(), fail to link program: " + error;
        }

        return this;
    };

    /**
     * Release shader from GPU.
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.destroy = function () {
        if (this.id === 0)
            return this;
        gl.deleteProgram(this.id);
        gl.deleteShader(this.vId);
        gl.deleteShader(this.fId);
        this.id = 0;
        this.vId = 0;
        this.fId = 0;
        this._state.uniform = {};
        this._state.attribute = {};
        this._state.value = {};
        return this;
    };

    /**
     * Invalidate this object
     */

    VG.Shader.prototype.dispose = function () {
        this.destroy();
        VG.Renderer().removeResource(this);
    };
    /**
     * Bind Shader
     * @returns {VG.Shader}
     * todo: add other blend mode
     */

    VG.Shader.prototype.bind = function () {
        if (_state.WebGL.useProgram !== this.id) {
            gl.useProgram(this.id);
            _state.WebGL.useProgram = this.id;
            _state.Shader.bind = this;
        }
        if (this.blendType === VG.Shader.Blend.None) {
            if (_state.WebGL.enabled.blend !== false) {
                gl.disable(gl.BLEND);
                _state.WebGL.enabled.blend = false;
            }
        }
        else {
            if (_state.WebGL.enabled.blend !== true) {
                gl.enable(gl.BLEND);
                _state.WebGL.enabled.blend = true;
            }
            if (_state.WebGL.blendFunc !== this.blendType) {
                switch (this.blendType) {
                    case VG.Shader.Blend.RemoveBack:
                        gl.blendFunc(gl.ONE, gl.ZERO);
                        break;
                    case VG.Shader.Blend.Additive:
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                        break;
                    case VG.Shader.Blend.AdditiveIgnoreAlpha:
                        gl.blendFunc(gl.ONE, gl.ONE);
                        break;
                    case VG.Shader.Blend.Alpha:
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case VG.Shader.Blend.Brush:
                        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case VG.Shader.Blend.OneAlpha: // transparent
                        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case VG.Shader.Blend.ReverseBrush:
                        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
                        break;
                }
                _state.WebGL.blendFunc = this.blendType;
            }
            if (_state.WebGL.blendEquation !== this.blendEquation) {
                switch (this.blendEquation) {
                    case VG.Shader.BlendEquation.Add:
                        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                        break;
                    case VG.Shader.BlendEquation.Subtract:
                        gl.blendEquationSeparate(gl.FUNC_SUBTRACT, gl.FUNC_SUBTRACT);
                        break;
                    case VG.Shader.BlendEquation.ReverseSubtract:
                        gl.blendEquationSeparate(gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_REVERSE_SUBTRACT);
                        break;
                    case VG.Shader.BlendEquation.AddReverseSubtract:
                        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_REVERSE_SUBTRACT);
                        break;
                    case VG.Shader.BlendEquation.Min:
                        gl.blendEquation(VG.WebGL.ext.minmax.MIN_EXT);
                        break;
                    case VG.Shader.BlendEquation.Max:
                        gl.blendEquation(VG.WebGL.ext.minmax.MAX_EXT);
                        break;
                }
                _state.WebGL.blendEquation = this.blendEquation;
            }
        }
        if (_state.WebGL.enabled.depthTest !== this.depthTest) {
            if (this.depthTest)
                gl.enable(gl.DEPTH_TEST);
            else
                gl.disable(gl.DEPTH_TEST);
            _state.WebGL.enabled.depthTest = this.depthTest;
        }
        if (_state.WebGL.depthFunc !== this.depthWrite) {
            if (this.depthWrite)
                gl.depthFunc(gl.LESS);
            else
                gl.depthFunc(gl.NEVER);
            _state.WebGL.depthFunc = this.depthWrite;
        }
        if (_state.WebGL.enabled.cullFace !== this.culling) {
            if (this.culling) {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
            }
            else
                gl.disable(gl.CULL_FACE);
            _state.WebGL.enabled.cullFace = this.culling;
        }
        return this;
    };

    /**
     * Get Uniform location
     * @param name
     * @returns {number}
     */

    VG.Shader.prototype.getUniform = function (name) {
        if (name in this._state.uniform)
            return this._state.uniform[name];
        this._state.uniform[name] = gl.getUniformLocation(this.id, name);
        return this._state.uniform[name];
    };

    /**
     * Get Attribute location.
     * @param name
     * @returns {number}
     */

    VG.Shader.prototype.getAttrib = function (name) {
        if (!(name in this._state.attribute)) {
            this._state.attribute[name] = gl.getAttribLocation(this.id, name);
        }
        if (this._state.attribute[name] === -1) {
            VG.log("shader does not use attribute: " + name);
        }
        return this._state.attribute[name];
    };

    /**
     * Set uniform value
     * @param {number | string} uniform Can be string (name) or number (id).
     * @param {number | Array} value
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.setFloat = function (uniform, value) {
        var name = uniform,
            cache = false;
        if (!(uniform instanceof WebGLUniformLocation)) {
            uniform = this.getUniform(uniform);
            cache = true;
        }
        if (value instanceof Array) {
            if (value.length === 0)
                throw "Shader.setFloat(), value == [].";
            else if (value.length === 1) {
                if (!cache || this._state.value[name] !== value[0]) {
                    gl.uniform1f(uniform, value[0]);
                    this._state.value[name] = value[0];
                }
            }
            else if (value.length === 2) {
                if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, 2)) {
                    gl.uniform2fv(uniform, value);
                    this._state.value[name] = Array.from(value);
                }
            }
            else if (value.length === 3) {
                if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, 3)) {
                    gl.uniform3fv(uniform, value);
                    this._state.value[name] = Array.from(value);
                }
            }
            else {
                if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, 4)) {
                    gl.uniform4fv(uniform, value);
                    this._state.value[name] = Array.from(value);
                }
            }
        }
        else {
            if (!cache || this._state.value[name] !== value) {
                gl.uniform1f(uniform, value);
                this._state.value[name] = value;
            }
        }
        return this;
    };

    /**
     * Set uniform with Float Array.
     * @param {number|string} uniform - uniform name or index
     * @param {[Float]} value - input Float Array
     * @param {number=1} size - size of each element, ie. 3 for vec3
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.setFloatArray = function (uniform, value, size) {
        var name = uniform,
            cache = false;
        if (!(uniform instanceof WebGLUniformLocation)) {
            uniform = this.getUniform(uniform);
            cache = true;
        }
        if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, value.length)) {
            gl['uniform' + (size ? size : 1) + 'fv'](uniform, value);
            if (cache) {
                this._state.value[name] = Array.from(value);
            }
        }
        return this;
    };

    /**
     * Set uniform value
     * @param {number | string} uniform Can be string (name) or number (id).
     * @param {number | Array} value
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.setInt = function (uniform, value) {
        var name = uniform,
            cache = false;
        if (!(uniform instanceof WebGLUniformLocation)) {
            uniform = this.getUniform(uniform);
            cache = true;
        }
        if (value instanceof Array) {
            if (value.length === 0)
                throw "Shader.setInt(), value == [].";
            else if (value.length === 1) {
                if (!cache || this._state.value[name] !== value[0]) {
                    gl.uniform1i(uniform, value[0]);
                    this._state.value[name] = value[0];
                }
            }
            else if (value.length === 2) {
                if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, 2)) {
                    gl.uniform2iv(uniform, value);
                    if (cache) {
                        this._state.value[name] = Array.from(value);
                    }
                }
            }
            else if (value.length === 3) {
                if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, 3)) {
                    gl.uniform3iv(uniform, value);
                    if (cache) {
                        this._state.value[name] = Array.from(value);
                    }
                }
            }
            else {
                if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, 4)) {
                    gl.uniform4iv(uniform, value);
                    if (cache) {
                        this._state.value[name] = Array.from(value);
                    }
                }
            }
        }
        else {
            if (!cache || this._state.value[name] !== value) {
                gl.uniform1i(uniform, value);
                if (cache) {
                    this._state.value[name] = value;
                }
            }
        }
        return this;
    };

    /**
     * Set uniform with Int Array.
     * @param {number|string} uniform - uniform name or index
     * @param {[Int]} value - input Int Array
     * @param {number=1} size - size of each element, ie. 3 for vec3
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.setIntArray = function (uniform, value, size) {
        var name = uniform,
            cache = false;
        if (!(uniform instanceof WebGLUniformLocation)) {
            uniform = this.getUniform(uniform);
            cache = true;
        }
        if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, value.length)) {
            gl['uniform' + (size ? size : 1) + 'iv'](uniform, value);
            if (cache) {
                this._state.value[name] = Array.from(value);
            }
        }
        return this;
    };

    /**
     * Set uniform value
     * @param {number | string} uniform
     * @param {boolean} value
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.setBool = function (uniform, value) {
        var name = uniform,
            cache = false;
        if (!(uniform instanceof WebGLUniformLocation)) {
            uniform = this.getUniform(uniform);
            cache = true;
        }
        value = value ? 1 : 0;
        if (!cache || this._state.value[name] !== value) {
            gl.uniform1i(uniform, value);
            if (cache) {
                this._state.value[name] = value;
            }
        }
        return this;
    };

    /**
     * Set uniform matrix
     * @param {number | string} uniform
     * @param {number[]} value - Matrix
     * @param {boolean} transpose - Transpose mode
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.setMatrix = function (uniform, value, transpose) {
        var name = uniform,
            cache = false;
        if (!(uniform instanceof WebGLUniformLocation)) {
            uniform = this.getUniform(uniform);
            cache = true;
        }
        transpose = !!transpose;
        if (value.length === 0)
            throw "Shader.setMatrix(), value == [].";
        else if (value.length === 4) {
            if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, 4)) {
                gl.uniformMatrix2fv(uniform, transpose, value);
                if (cache) {
                    this._state.value[name] = Array.from(value);
                }
            }
        }
        else if (value.length === 9) {
            if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, 9)) {
                gl.uniformMatrix3fv(uniform, transpose, value);
                if (cache) {
                    this._state.value[name] = Array.from(value);
                }
            }
        }
        else if (value.length === 16) {
            if (!cache || !Shader.arrayValueCheck(this._state.value[name], value, 16)) {
                gl.uniformMatrix4fv(uniform, transpose, value);
                if (cache) {
                    this._state.value[name] = Array.from(value);
                }
            }
        }
        else {
            throw "Shader.setMatrix(), invalid value.length = " + value.length + " .";
        }
        return this;
    };

    /**
     * Set uniform value
     * @param {number | string} uniform Can be string (name) or number (id).
     * @param {VG.Texture2D | VG.TextureCube | VG.RenderTarget} texture - Texture input
     * @param {number} slot - Which slot
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.setTexture = function (uniform, texture, slot) {
        if (!(uniform instanceof WebGLUniformLocation))
            uniform = this.getUniform(uniform);
        if (slot === undefined)
            slot = _state.WebGL.activeTexture;
        if (_state.WebGL.activeTexture !== slot) {
            gl.activeTexture(gl["TEXTURE" + slot]);
            _state.WebGL.activeTexture = slot;
        }
        if (texture instanceof VG.RenderTarget) {
            texture.bindAsTexture();
        } else {
            texture.bind();
        }
        gl.uniform1i(uniform, slot);
        return this;
    };

    /**
     * Set color RGBA.
     * @param {number|string} uniform - uniform index or name
     * @param {VG.Core.Color} value - Color
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.setColor = function (uniform, value) {
        return this.setFloat(uniform, [value.r, value.g, value.b, value.a]);
    };

    /**
     * Set color RGB.
     * @param {number|string} uniform - uniform index or name
     * @param {VG.Core.Color} value - Color
     * @returns {VG.Shader}
     */

    VG.Shader.prototype.setColor3 = function (uniform, value) {
        return this.setFloat(uniform, [value.r, value.g, value.b]);
    };

    /**
     * Special array value check, used internally only.
     * True if b is prefix of a.
     * @param a Checked array
     * @param b Reference array
     * @param length
     * @returns {boolean}
     * @private
     */

    VG.Shader.arrayValueCheck = function (a, b, length) {
        // return false; // disabled, always return false.
        if (!a || !(a instanceof Array) || a.length < length)
            return false;
        for (var i = 0; i < length; i += 1)
            if (a[i] !== b[i])
                return false;
        return true;
    };

    /**
     * Shader Blend mode.
     * @static
     * @readonly
     * @enum {number}
     */

    VG.Shader.Blend = {
        /**
         * No blending.
         */
        None: 0,
        /**
         * Multiply alpha on both source and destination.
         */
        Alpha: 1,
        /**
         * Use alpha on source, one for destination.
         */
        Brush: 2,
        /**
         * Suitable for transparency.
         */
        OneAlpha: 3,
        /**
         * Use alpha on source, zero for destination.
         */
        ReverseBrush: 4,
        /**
         * Simply add source and destination.
         */
        Additive: 5,
        /**
         * Add source and destination but alpha.
         */
        AdditiveIgnoreAlpha: 6,
        /**
         * Ignore back. Back will become dark at places with no source.
         */
        RemoveBack: 7
    };

    /**
     * @static
     * @readonly
     * @enum {number}
     */

    VG.Shader.BlendEquation = {
        Add: 0, Subtract: 1, ReverseSubtract: 2,
        /**
         * Min, requires extension minmax
         */
        Min: 3,
        /**
         * Max, requires extension minmax
         */
        Max: 4,
        AddReverseSubtract: 5
    };


    /**
     * 2D Texture
     * @param images {VG.Core.Image[]} Array of image input
     * @param cube {boolean} Is cube texture
     * @constructor
     */

    VG.Texture = Texture = function (images, cube) {
        /**
         * Texture configuration
         * @type {{mipmaps: boolean, filtering: number, wrapU: number, wrapV: number}}
         * @private
         */
        this._config = {
            mipmaps: false,
            filtering: Texture.Filter.None,
            wrapU: Texture.Wrap.Clamp,
            wrapV: Texture.Wrap.Clamp
        };
        this.id = 0;
        this.images = images;
        var image = images[0];
        this.initialRealWidth = image.getRealWidth();
        this.initialRealHeight = image.getRealHeight();
        this.initialWidth = image.getWidth();
        this.initialHeight = image.getHeight();
        this.target = cube ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D;
        VG.Renderer().addResource(this);
    };

    /**
     * Get the real width of the image (power of two).
     * @returns {number}
     */

    VG.Texture.prototype.getRealWidth = function () {
        return this.initialRealWidth;
    };

    /**
     * Get the real height of the image (power of two).
     * @returns {number}
     */

    VG.Texture.prototype.getRealHeight = function () {
        return this.initialRealHeight;
    };

    /**
     * Get the user specified width of the Image.
     * @returns {number}
     */

    VG.Texture.prototype.getWidth = function () {
        return this.initialWidth;
    };

    /**
     * Get the user specified height of the Image.
     * @returns {number}
     */

    VG.Texture.prototype.getHeight = function () {
        return this.initialHeight;
    };

    /**
     * Bind the texture.
     * @returns {VG.Texture} - this
     */

    VG.Texture.prototype.bind = function () {
        if (this.target === gl.TEXTURE_2D && this.images[0].needsUpdate) {
            this.images[0].needsUpdate = false;
            this.update();
        }
        // if (_state.WebGL.texture[_state.WebGL.activeTexture][this.target] !== this.id) {
        gl.bindTexture(this.target, this.id);
        //     _state.WebGL.texture[_state.WebGL.activeTexture][this.target] = this.id;
        // }
        return this;
    };

    /**
     * Create texture on GPU.
     * @returns {VG.Texture} - this
     * @private
     */

    VG.Texture.prototype.create = function () {
        this.images[0].needsUpdate = false;
        this.id = gl.createTexture(this.target);
        this.bind();
        if (this._config.mipmaps) {
            gl.generateMipmap(this.target);
        }
        var minFilter = this._config.mipmaps ? gl.NEAREST_MIPMAP_NEAREST : VG.WebGL.minFilter;
        var magFilter = VG.WebGL.magFilter;
        var wrapS = this._config.wrapU == Texture.Wrap.Clamp ? gl.CLAMP_TO_EDGE : gl.REPEAT;
        var wrapT = this._config.wrapV == Texture.Wrap.Clamp ? gl.CLAMP_TO_EDGE : gl.REPEAT;
        switch (this._config.filtering) {
            case Texture.Filter.Bilinear:
                minFilter = this._config.mipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR;
                magFilter = gl.LINEAR;
                break;
            case Texture.Filter.Anisotropic:
                // todo: test it
                var ext = gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
                    gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
                gl.texParameterf(this.target, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
                break;
            case Texture.Filter.Trilinear:
                minFilter = this._config.mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
                magFilter = gl.LINEAR;
                break;
        }
        gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, minFilter);
        gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, magFilter);
        gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, wrapT);
        var image = this.images[0];
        this.initialRealWidth = image.getRealWidth();
        this.initialRealHeight = image.getRealHeight();
        this.initialWidth = image.getWidth();
        this.initialHeight = image.getHeight();
        var w = image.getRealWidth();
        var h = image.getRealHeight();
        if (this.target == gl.TEXTURE_CUBE_MAP) {
            var faceOrder = [
                gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
            ];

            if (this.images.length != 6) throw "unexpected number of faces";

            for (var i = 0; i < this.images.length; i++) {
                gl.texImage2D(faceOrder[i], 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.images[i].data);
            }

        } else {

            if ( image.canvas )
                gl.texImage2D( this.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.data );
            else
            if (image.type === VG.Core.TypedArray.Type.Uint8)
                gl.texImage2D(this.target, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
            else if (image.type === VG.Core.TypedArray.Type.Float) {
                if (image.elements === 4)
                    gl.texImage2D(this.target, 0, VG.webgl2 ? gl.RGBA32F : gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, image.data);
                else if (image.elements === 1)
                    gl.texImage2D(this.target, 0, VG.webgl2 ? gl.R32F : gl.ALPHA, w, h, 0, VG.webgl2 ? gl.RED : gl.ALPHA, gl.FLOAT, image.data);
            }
        }
        return this;
    };

    /**
     * Udates the image pixel data from the internal image, cube textures are not supported
     *  @param {number} [x=0] - The X offset
     *  @param {number} [y=0] - The y offset
     *  @param {number} [w=-1] - The width, defaults to full width or -1
     *  @param {number} [h=-1] - The height, default to full height or -1
     * @returns {VG.Texture}
     */

    VG.Texture.prototype.update = function (x, y, w, h) {
        var image = this.images[0];

        var imW = image.realWidth;
        var imH = image.realHeight;
        //if the dimension has changed, recreate the texture from scratch
        if (imW != this.initialRealWidth || imH != this.initialRealHeight) {
            this.destroy();
            this.create();
            return this;
        }

        if (!x)
            x = 0;
        if (!y)
            y = 0;
        if (!w)
            w = imW;
        if (!h)
            h = imH;
        gl.bindTexture(this.target, this.id);

        if (image.type === VG.Core.TypedArray.Type.Uint8)
            gl.texSubImage2D(this.target, 0, x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
        else if (image.type === VG.Core.TypedArray.Type.Float) {
            if (image.elements === 4)
                gl.texSubImage2D(this.target, 0, x, y, w, h, gl.RGBA, gl.FLOAT, image.data);
            else if (image.elements === 1)
                gl.texSubImage2D(this.target, 0, x, y, w, h, gl.ALPHA, gl.FLOAT, image.data);
        }

        return this;
    };

    VG.Texture.prototype.identifyTexture = function () {
        /* Identify if this is a texture class.
         * Used by VG.Renderer() to identify if this class is a VG.Texture as instanceof does not work for this on non-web implementations.
         */
    };

    /**
     * Remove GPU resources.
     * @returns {VG.Texture}
     * @private
     */

    VG.Texture.prototype.destroy = function () {
        if (this.id === 0)
            return this;
        gl.deleteTexture(this.id);
        this.id = 0;
        return this;
    };

    /**
     * Dispose this object.
     * Dispose GPU resource and also link from VG.Renderer().
     */

    VG.Texture.prototype.dispose = function () {
        this.destroy();
        VG.Renderer().removeResource(this);
    };

    /**
     * Wrap mode.
     * @static
     * @enum {number}
     * @readonly
     */

    VG.Texture.Wrap = {
        /**
         * Clamp texture at edge.
         */
        Clamp: 0,
        /**
         * Repeat texture on u and v.
         */
        Repeat: 1
    };

    /**
     * Texture filtering mode.
     * @static
     * @enum {number}
     * @readonly
     */

    VG.Texture.Filter = {
        /**
         * No filtering, default to nearest neighbor.
         */
        None: 0,
        /**
         * Linear filtering, interpolate two nearest neighbor.
         */
        Linear: 1,
        /**
         * Bilinear filtering, Linear + interpolate on distance axis, so it's four neighbor.
         */
        Bilinear: 2,
        /**
         * Correct Bilinear on boundaries where mipmap level change.
         */
        Trilinear: 3,
        /**
         * Correct isotropic filtering when the surface viewed from angled direction.
         * The sampling not necessarrily square.
         */
        Anisotropic: 4
    };

    /**
     * Encapsulates an off-screen VBO.
     *
     * @param width {number} Width of <tt>Rendertarget</tt>.
     * @param height {number} Height of <tt>RT</tt>.
     * @param isMain {boolean} Is this main <tt>RT</tt>.
     * @constructor
     */

    VG.RenderTarget = RenderTarget = function (width, height, isMain) {
        this.id = 0;
        this.renderbufferId = 0;
        this.autoResize = false;
        this.width = 16;
        this.height = 16;
        this.supportsStencil = false;
        this.isMain = false;
        this.textureId = 0;

        if (width) this.width = width;
        if (height) this.height = height;

        this.floatTexture = false;

        this.isMain = (isMain && true) || false;
        if (isMain)
            this.autoResize = true;
        this.scissorRect = VG.Core.Rect();
        VG.Renderer().addResource(this);
    };

    /**
     * Create this <tt>RT</tt> in GPU with its texture and renderbuffer attachment.
     * @returns {VG.RenderTarget}
     */

    VG.RenderTarget.prototype.create = function () {
        if (this.isMain)
            return this;
        if (this.id !== 0) {
            throw "RenderTarget().create(), already created().";
        }
        this.id = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
        this.textureId = gl.createTexture(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        if ( this.floatTexture )
            gl.texImage2D(gl.TEXTURE_2D, 0, VG.webgl2 ? gl.RGBA32F : gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, null);
        else
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        this.renderbufferId = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbufferId);

        //set the depth buffer, standard 16bit for better portability
        if (!this.supportsStencil) {
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        } else {
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.width, this.height);
        }

        //attach the texture
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureId, 0);
        if (!this.supportsStencil) {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbufferId);
        }
        else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.renderbufferId);
        }
        //revert to previous
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, _state.WebGL.texture[_state.WebGL.activeTexture][gl.TEXTURE_2D] || null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return this;
    };

    /**
     * Get the real width of the image (power of two).
     * @returns {number}
     */

    VG.RenderTarget.prototype.getRealWidth = function () {
        return this.width;
    };

    /**
     * Get the real height of the image (power of two).
     * @returns {number}
     */

    VG.RenderTarget.prototype.getRealHeight = function () {
        return this.height;
    };

    /**
     * Get the user specified width of the Image.
     * @returns {number}
     */

    VG.RenderTarget.prototype.getWidth = function () {
        return this.imageWidth ? this.imageWidth : this.width;
    };

    /**
     * Get the user specified height of the Image.
     * @returns {number}
     */

    VG.RenderTarget.prototype.getHeight = function () {
        return this.imageHeight ? this.imageHeight : this.height;
    };

    /**
     * Release the frame buffer from GPU.
     * @returns {VG.RenderTarget}
     */

    VG.RenderTarget.prototype.destroy = function () {
        if (this.id === 0) return;

        gl.deleteFramebuffer(this.id);
        gl.deleteRenderbuffer(this.rbid);
        gl.deleteTexture(this.texid);

        this.id = 0;
        this.renderbufferId = 0;
        this.textureId = 0;
        return this;
    };

    /**
     * Dispose the RT.
     * @returns {VG.RenderTarget} - this
     */

    VG.RenderTarget.prototype.dispose = function () {
        this.destroy();
        VG.Renderer().removeResource(this);
        return this;
    };

    /**
     * Unbinds the frame buffer, in this case the main frame buffer will be
     * used for rendering
     * @returns {VG.RenderTarget} - this;
     */

    VG.RenderTarget.prototype.unbind = function () {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return this;
    };

    /**
     * Binds the frame buffer, unbind must be called after drawing to ensure
     * flush into the main frame buffer
     * @returns {VG.RenderTarget} - this
     */

    VG.RenderTarget.prototype.bind = function () {
        if (this.isMain) {
            //force unbind if any
            this.unbind();
        }
        else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
        }
        return this;
    };

    /**
     * Fills the given typed array with raw pixel data from the render target. The rect parameter can be either null / undefined if the whole rendertarget
     * data should be copied or a VG.Core.Rect structure if only a certain rectangle is required.
     * @param {VG.Core.rect} rect - An VG.Core.Rect object defining the pixel data to acquire or undefined if the whole pixel data should be copied.
     * @param {Uint8Array} typedArray - A typed Uint8Array big enough to hold the pixel data to copy. The whole pixel data of the render target would have the size of getWidth() * getHeight() * 4.
     * @returns {VG.RenderTarget} - this
     */

    VG.RenderTarget.prototype.fillPixelBuffer = function (rect, typedArray) {

        var x = 0, y = 0, width = this.getWidth(), height = this.getHeight();
        if (rect) {
            x = rect.x;
            y = rect.y;
            width = rect.width;
            height = rect.height;
        }

        gl.readPixels(x, this.getRealHeight() - (y + height), width, height, gl.RGBA, gl.UNSIGNED_BYTE, typedArray);
        return this;
    };

    /**
     * Binds this frame buffer as a texture
     * @returns {VG.RenderTarget}
     */

    VG.RenderTarget.prototype.bindAsTexture = function () {
        if (this.isMain) throw "You can't bind a main frame buffer as texture";

        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
        return this;
    };

    /**
     * Resize the frame buffer, it must not be bind-ed as this recreates
     * the internal data.
     * @param {number} width - Width
     * @param {number} height - Height
     * @returns {VG.RenderTarget} - this
     */

    VG.RenderTarget.prototype.resize = function (width, height) {
        this.destroy();

        this.width = width;
        this.height = height;

        this.create();
        return this;
    };

    /**
     * Reset the frame buffer
     * @param {number} width - Width
     * @param {number} height - Height
     * @returns {VG.RenderTarget} - this
     */

    VG.RenderTarget.prototype.resetSize = function (width, height) {
        var recreate = !this.id || this.width != width || this.height != height;
        if (recreate)
            this.resize(width, height);
        else {
            this.bind();
            this.clear();
            this.unbind();
        }
        return this;
    };

    /**
     * Sets the drawing viewport for the next draw call and on
     * @param {VG.Core.Rect} rect - Rectangle to be used.
     * @returns {VG.RenderTarget} - this
     */

    VG.RenderTarget.prototype.setViewport = function (rect) {
        gl.viewport(rect.x, this.height - rect.bottom(), rect.width, rect.height);
        return this;
    };

    /**
     * Sets the drawing viewport for the next draw call and on
     * @param {number} x - The x value
     * @param {number} y - The y value
     * @param {number} width - Width
     * @param {number} height - Height
     * @returns {VG.RenderTarget} - this
     */

    VG.RenderTarget.prototype.setViewportEx = function (x, y, width, height) {
        gl.viewport(x, this.height - (y + height), width, height);
        return this;
    };

    /**
     * Scissor the next draw operation with <tt>rect</tt>.
     * @param rect {VG.Core.Rect} Bounding rectangle.
     * @returns {VG.RenderTarget} - this
     */

    VG.RenderTarget.prototype.setScissor = function (rect) {
        if (rect && rect.width > 0 && rect.height > 0) {
            if (_state.WebGL.enabled[gl.SCISSOR_TEST] !== true) {
                gl.enable(gl.SCISSOR_TEST);
                _state.WebGL.enabled[gl.SCISSOR_TEST] = true;
            }
            this.scissorRect.copy(rect);
            gl.scissor(rect.x, this.height - rect.bottom(), rect.width, rect.height);
        }
        else {
            if (_state.WebGL.enabled[gl.SCISSOR_TEST] !== false) {
                gl.disable(gl.SCISSOR_TEST);
                _state.WebGL.enabled[gl.SCISSOR_TEST] = false;
                this.scissorRect.clear();
            }
        }
        return this;
    };

    /**
     * Clear frame buffer.
     * @param {VG.Core.Color} color - Clear color
     * @param {number} [depth=undefined] - If defined, clear depth buffer with this value.
     * @returns {VG.RenderTarget} - this
     */

    VG.RenderTarget.prototype.clear = function (color, depth) {
        var clearBits = 0;
        if (color) {
            if (color instanceof VG.Core.Color)
                gl.clearColor(color.r, color.g, color.b, color.a);
            clearBits |= gl.COLOR_BUFFER_BIT;
        }
        if (depth !== undefined && depth !== false) {
            if (depth)
                gl.clearDepth(depth);
            clearBits |= gl.DEPTH_BUFFER_BIT;
        }
        if ( clearBits )
            gl.clear(clearBits);
        return this;
    };

    /**
     * Check RT complete status.
     * @returns {boolean}
     */

    VG.RenderTarget.prototype.checkStatusComplete = function () {
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    };

    /**
     * Set stencil for the next draw operation.
     * @param mode {VG.RenderTarget.StencilMode} Stencil mode to activate.
     * @returns {VG.RenderTarget}
     */

    VG.RenderTarget.prototype.setStencilMode = function (mode) {
        if (!this.supportsStencil)
            return this;
        if (mode === _state.WebGL.stencilMode)
            return this;
        if (mode === RenderTarget.StencilMode.None) {
            if (_state.WebGL.enabled[gl.STENCIL_TEST] !== false) {
                gl.disable(gl.STENCIL_TEST);
                _state.WebGL.enabled[gl.STENCIL_TEST] = false;
            }
        }
        else if (mode === RenderTarget.StencilMode.FillKeepOne || mode === RenderTarget.StencilMode.DrawKeepOne || mode === RenderTarget.StencilMode.DrawInverse) {
            if (_state.WebGL.enabled[gl.STENCIL_TEST] !== true) {
                gl.enable(gl.STENCIL_TEST);
                _state.WebGL.enabled[gl.STENCIL_TEST] = true;
            }
            if (mode === RenderTarget.StencilMode.FillKeepOne) {
                gl.stencilFunc(gl.ALWAYS, 1, 0xFF); // Set any stencil to 1
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
                gl.stencilMask(0xFF);
                gl.colorMask(false, false, false, false);
                gl.clear(gl.STENCIL_BUFFER_BIT);
            }
            else if (mode === RenderTarget.StencilMode.DrawKeepOne) {
                gl.colorMask(true, true, true, true);
                gl.stencilFunc(gl.EQUAL, 1, 0xFF); // Pass test if stencil value is 1
                gl.stencilMask(0x00);
            }
            else {
                gl.colorMask(true, true, true, true);
                gl.stencilFunc(gl.EQUAL, 0, 0xFF); // Pass test if stencil value is 0
                gl.stencilMask(0x00);
            }
            _state.WebGL.stencilMode = mode;
        }
        return this;
    };

    /**
     * Stencil mode applicable to RT.
     * @static
     * @enum {number}
     * @readonly
     */

    VG.RenderTarget.StencilMode = {
        /**
         * Disable stencil
         */
        None: 0,
        /**
         * Set any stencil to 1.
         */
        FillKeepOne: 1,
        /**
         * Pass if 1.
         */
        DrawKeepOne: 2,
        /**
         * Pass if 0.
         */
        DrawInverse: 3
    };
})(VG || (VG = {}));
