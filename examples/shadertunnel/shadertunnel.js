ShaderTunnel = function ()
{
    /**
     * This will show tunnel effects pre with shader.
     */
    VG.UI.RenderWidget.call(this);
    this.create({nx: 250, ny: 250});

    var that = this;
    this.render = function(delta) {
        //that.viewPort.aspect = that.rect.width / that.rect.height;
        //that.viewPort.updateProjection();
        //that.pipeline.drawScene(that.context, that.scene, delta);
        that.draw(delta);
    };

};

ShaderTunnel.prototype = Object.create(VG.UI.RenderWidget.prototype);

ShaderTunnel.prototype.create = function (opt) {
    /**
     * create vertex buffer and compile shader
     * @type {{nx: number, ny: number}}
     */
    this.def = {
        nx: 250, ny: 250
    };
    opt = opt ? opt : {};
    this.opt = {
        nx: opt.nx === undefined ? this.def.nx : opt.nx,
        ny: opt.ny === undefined ? this.def.ny : opt.ny
    };
    this.vb = new VG.GPUBuffer(VG.Type.Float, this.opt.nx * (2 * this.opt.ny) * 2 * 2, false, false);
    this.vb.create();
    var db = this.vb.getDataBuffer();

    var index = 0;
    for(var i = 0; i < this.opt.nx; i++){
        var cx = i/this.opt.nx;
        var nx = ((i+1)%this.opt.nx)/this.opt.nx;
        for(var j = 0; j < this.opt.ny; j++) {
            var cy = j / this.opt.ny;
            var ny = ((j + 1)%this.opt.ny)/ this.opt.ny;
            db.set(index, cx); index++;
            db.set(index, cy); index++;
            db.set(index, cx); index++;
            db.set(index, ny); index++;
            db.set(index, cx); index++;
            db.set(index, cy); index++;
            db.set(index, nx); index++;
            db.set(index, cy); index++;
        }
    }
    this.vb.update(0, db.getSize(), true);

    var source = {
        vertex: [
            '#version 100',
            'attribute vec2 aPos;',
            'uniform float uTime;',
            'uniform mat4 uMvp;',
            'varying vec4 vColor;',
            'const float PI = 3.1415926;',
            'vec4 rainbow(in float t0){',
            '   const vec4 red = vec4(1.0, 0.0, 0.0, 1.0);',
            '   const vec4 green = vec4(0.0, 1.0, 0.0, 1.0);',
            '   float t = fract(t0);',
            '   if(t < 0.5){',
            '       return mix(red, green, t*2.0);',
            '   } else {',
            '       return mix(green, red, (t-0.5)*2.0);',
            '   }',
            '}',
            'float smooth1(in float t0){',
            '   float t = fract(t0);',
            '   if(t < 0.5){',
            '       return t * 2.0;',
            '   }else{',
            '       return 2.0 - t * 2.0;',
            '   }',
            '}',
            'void main() {',
            '   float t = uTime * 0.1;',
            '   vColor = rainbow(t * 5.0 + aPos.y * 4.0);',
            '   float R = 0.5;',
            '   float d = 0.001;',
            '   float theta = (aPos.y - 0.5) * 2.0;',
            '   theta = pow(theta, 3.0) * PI;', // must be odd number
            '   float psi = aPos.x * 2.0 * PI;',
            '   float r = -R * cos(theta) + R + d;',
            '   float h = R * sin(theta);',
            '   vec3 pos = vec3(r * cos(psi), h, r * sin(psi));',
            '   gl_Position = uMvp * vec4(pos.x, pos.y, pos.z, 1.0);',
            '}'
        ].join('\n'),
        fragment: [
            '#version 100',
            "precision mediump float;",
            "varying vec4 vColor;",
            "void main() {",
            "gl_FragColor = vColor;",
            "}"
        ].join('\n')
    };

    this.shader = new VG.Shader(source.vertex, source.fragment);
    this.shader.depthTest = true;
    this.shader.depthWrite = true;
    this.shader.create();
};

ShaderTunnel.prototype.draw = function (dt) {
    /**
     * draw buffer.
     */
    if(this.t == undefined) {
        this.t = 0.0;
    } else {
        this.t += dt;
    }
    var R = 0.5, d = 0.001;
    var r = R + d/2;
    var theta = this.t * 25.0;
    theta /= 360;
    theta = (theta - Math.floor(theta)) - 0.5;
    theta *= 2.0;
    theta = theta * theta * theta;
    theta *= 180;
    var m = new VG.Math.Matrix4();
    m.setPerspective(60, this.rect.width/ this.rect.height, 0.001, 2.0);
    m.rotate(this.t * 10, 0, 0, 1);
    m.translate(r, 0, 0);
    m.rotate(theta, 0, 1, 0);
    m.translate(-r, 0, 0);
    m.rotate(-90, 1, 0, 0);
    this.shader.bind();
    this.shader.setFloat('uTime', this.t);
    this.shader.setMatrix('uMvp', m.elements);
    var stride = this.vb.getStride();
    this.vb.bind();
    this.vb.vertexAttrib(this.shader.getAttrib('aPos'), 2, false, stride * 2, 0);

    var db = this.vb.getDataBuffer();    
    this.vb.drawBuffer(VG.Renderer.Primitive.Lines, 0, db.getSize()/2);
};

function vgMain(workspace)
{
    var widget = new ShaderTunnel();
    workspace.layout = VG.UI.Layout(widget);
}