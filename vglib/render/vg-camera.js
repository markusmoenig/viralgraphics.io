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

/** Camera as an scene node
 * @constructor
 * @param {Number}[60] fov - The field of view
 * @param {Number}[1] aspect - Aspect ratio
 * @param {Number}[0.1] nearZ - Near plane
 * @param {Number}[100] farZ - Far plane
 * @augments VG.Render.SceneNode
 */

VG.Render.Camera = function(fov, aspect, nearZ, farZ)
{
    VG.Render.SceneNode.call(this);
	this.setProjection(fov, aspect, nearZ, farZ);
};

VG.Render.Camera.prototype = Object.create(VG.Render.SceneNode.prototype);

/** Sets camera parameters.
 *  @param {Number}[60] fov - The field of view
 *  @param {Number}[1] aspect - Aspect ratio
 *  @param {Number}[0.1] nearZ - Near plane
 *  @param {Number}[100] farZ - Far plane
 */

VG.Render.Camera.prototype.setProjection = function(fov, aspect, nearZ, farZ)
{
    if (fov === undefined) fov = 60.0;
    if (aspect === undefined) aspect = 1.0;
    if (nearZ === undefined) nearZ = 0.1;
    if (farZ === undefined) farZ = 1000.0;

    /** Field of view angle, default 60 degrees
     *  @member {Number} */
    this.fov = fov;

    /** The near clipping plane
     *  @member {Number} */
    this.nearZ = nearZ;

   /** The far clipping plane
     *  @member {Number} */
    this.farZ = farZ;

   /** Aspect ratio, usually w / h, default 1.0
    *  @member {Number} */
    this.aspect = aspect;


    /** Projection matrix
     *  @member {VG.Math.Matrix4()} */
    this.projM = new VG.Math.Matrix4();

    /** If not null/undefined, then will use lookAt with `this.center` as center */
    this.center = null;
    this.eye = null;
    this.up = new VG.Math.Vector3(0, 1.0, 0);
    this.lockUp = false;

    this.updateProjection();
};

/**
 * Set bounding box
 * @param {VG.Math.Vector3} min - minimum of all coordinates
 * @param {VG.Math.Vector3} max - maximum of all coordinates
 */
VG.Render.Camera.prototype.setBoundingBox = function (min, max) {
    let center = new VG.Math.Vector3().copy(min).add(max).mul(0.5);
    let span = new VG.Math.Vector3().copy(max).sub(min);
    this.center = center;
    let factor = Math.tan(this.fov * Math.PI/180/2)*2;
    let w = span.x/factor;
    let h = span.y/factor;
    let dst = Math.max(w, h * this.aspect);

    // console.log(w, h * this.aspect, dst, factor, span.x);
    let eye = new VG.Math.Vector3().copy(this.eye).sub(center);
    eye.normalize();
    eye.mul(dst).add(center);
    this.eye = eye;
    // this.useBoundingBox = true;
    // this.boundingBox = {
    //     min: min,
    //     max: max,
    //     corners: []
    // };
    // for(let i = 0; i < 2; i ++){
    //     for(let j = 0; j < 2; j++){
    //         for(let k = 0; k < 2; k++){
    //             let c = new VG.Math.Vector3(
    //                 i === 0 ? this.boundingBox.min.x : this.boundingBox.max.x,
    //                 j === 0 ? this.boundingBox.min.y : this.boundingBox.max.y,
    //                 k === 0 ? this.boundingBox.min.z : this.boundingBox.max.z
    //             );
    //             this.boundingBox.corners.push(c);
    //         }
    //     }
    // }
    // this.center =
};

/** Updates the projection matrix, must be called if any member changes */

VG.Render.Camera.prototype.updateProjection = function()
{
    this.projM.setPerspective(this.fov, this.aspect, this.nearZ, this.farZ);
};

/**
 * Activate lookAt and set lookAt parameter.
 * Will deactivate lookAt if center set to null/undefined.
 * @param {VG.Math.Vector3} center - center of view
 * @param {VG.Math.Vector3} up - up of camera, use y-axis if up is null
 * @param {VG.Math.Vector3} eye - eye location, use _position if eye is null
 * @param {Boolean} lockUp - if true, then up direction is locked.
 */

VG.Render.Camera.prototype.setLookAt = function (center, up, eye, lockUp)
{
    if(!center){
        this.center = null;
    } else {
        this.center = center.clone();
        this.up = up ? up.clone() : new VG.Math.Vector3(0, 1, 0);
        this.up.normalize();
        this.eye = eye ? eye.clone() : this.position.clone();
        this.lockUp = lockUp;
    }
};

/**
 * Will choose whether to use SceneNode transform or lookAt transform
 * @return this camera transform.
 */

VG.Render.Camera.prototype.getTransform = function ()
{
    let transform;
    if (this.center) {
        transform = this.getTransformLookAt();
    } else {
        transform = VG.Render.SceneNode.prototype.getTransform.call(this);
    }

    if(this.useBoundingBox){
        let min = {x:1e32, y:1e32};
        let max = {x:-1e32, y:-1e32};
        let center = {x:0, y:0};
        for(let c0 of this.boundingBox.corners){
            let c = transform.multiplyPosition(c0);
            min.x = Math.min(c.x, min.x);
            min.y = Math.min(c.y, min.y);
            max.x = Math.max(c.x, max.x);
            max.y = Math.max(c.y, max.y);
            center.x += c.x;
            center.y += c.y;
        }
        let delta = Math.max(max.x-min.x, max.y-min.y);
        center.x /= this.boundingBox.corners.length;
        center.y /= this.boundingBox.corners.length;
        let out = new VG.Math.Matrix4().setTranslate(-center.x, -center.y, 0);
        out.concat(new VG.Math.Matrix4().setScale(2.0/delta,2.0/delta, 1.0));
        return out.concat(transform);
    } else {
        return transform;
    }
};

/**
 * Returns the world transform of this node
 * @return {VG.Math.Matrix4}
 */

VG.Render.Camera.prototype.getTransformLookAt = function ()
{
    var m = this.__cacheM1;

    function makeLookAt(eye, center, up) {
        /**
         * A new look at matrix
         */
        var z = eye.clone();
        z.sub(center).normalize();
        var x = up.cross(z);
        var y = z.cross(x);
        m.elements[0] = x.x;
        m.elements[1] = x.y;
        m.elements[2] = x.z;
        m.elements[3] = 0;
        m.elements[4] = y.x;
        m.elements[5] = y.y;
        m.elements[6] = y.z;
        m.elements[7] = 0;
        m.elements[8] = z.x;
        m.elements[9] = z.y;
        m.elements[10] = z.z;
        m.elements[11] = 0;
        m.elements[12] = eye.x;
        m.elements[13] = eye.y;
        m.elements[14] = eye.z;
        m.elements[15] = 1;

        return m;
    }

    m = makeLookAt(this.eye, this.center, this.up);

    if (this.parent) {
        var t = this.__cacheM2;
        t.set(this.parent.getTransform());
        t.mul(m);
        return t;
    }
    return m;
};

/**
 * Rotate a vector p, around a vector v originating from o amount of alpha
 * @param {VG.Math.Vector3} p - point to rotate
 * @param {VG.Math.Vector3} o - center of rotation
 * @param {VG.Math.Vector3} v - vector to rotate around
 * @param {Number} alpha - angle to rotate (in radian)
 * @return {VG.Math.Vector3} - the rotated point
 */

VG.Render.Camera.prototype.rotateToAPoint = function(p, o, v, alpha)
{
    var c = Math.cos(alpha);
    var s = Math.sin(alpha);
    var C = 1-c;
    var m = new VG.Math.Matrix4();

    m.elements[0] = v.x* v.x*C + c;
    m.elements[1] = v.y* v.x*C + v.z*s;
    m.elements[2] = v.z* v.x*C - v.y*s;
    m.elements[3] = 0;

    m.elements[4] = v.x* v.y*C - v.z*s;
    m.elements[5] = v.y* v.y*C + c;
    m.elements[6] = v.z* v.y*C + v.x*s;
    m.elements[7] = 0;

    m.elements[8] = v.x* v.z*C + v.y*s;
    m.elements[9] = v.y* v.z*C - v.x*s;
    m.elements[10] = v.z* v.z*C + c;
    m.elements[11] = 0;

    m.elements[12] = 0;
    m.elements[13] = 0;
    m.elements[14] = 0;
    m.elements[15] = 1;

    var P = p.clone();
    P.sub(o);
    var out = o.clone();
    out.add(m.multiplyVector3(P));
    return out;
};

/**
 * Calculate dir{x:VG.Math.Vector3, y:VG.Math.Vector3}
 * @return dir{x:VG.Math.Vector3, y:VG.Math.Vector3}
 * @private
 */

VG.Render.Camera.prototype.calculateDirXY = function()
{
    var dir = {};
    var c_eye = this.center.clone();
    c_eye.sub(this.eye);
    dir.x = this.up.clone();
    dir.y = this.up.cross(c_eye);
    dir.y.normalize();
    return dir;
};

/**
 * Rotate as responds to mouse fractional change dx and dy
 * @param {Number} dx - mouse dx / width
 * @param {Number} dy - mouse dy / height
 */

VG.Render.Camera.prototype.rotate = function(dx, dy)
{
    var dir = this.calculateDirXY();
    var c_up = this.center.clone();
    c_up.add(this.up);
    this.eye = this.rotateToAPoint(this.eye, this.center, dir.x, -dx * Math.PI);
    this.eye = this.rotateToAPoint(this.eye, this.center, dir.y, dy * Math.PI);
    if (!this.lockUp) {
        this.up = this.rotateToAPoint(c_up, this.center, dir.y, dy * Math.PI);
        this.up.sub(this.center);
        this.up.normalize();
    }
};

/**
 * Zoom
 * @param {Number} dx - mouse dx / width
 * @param {Number} dy - mouse dy / height
 */

VG.Render.Camera.prototype.zoom = function(dx, dy)
{
    this.eye.sub(this.center);
    this.eye.mul(dy + 1);
    this.eye.add(this.center);
};

/**
 * Pan
 * @param {Number} dx - mouse dx / width
 * @param {Number} dy - mouse dy / height
 */

VG.Render.Camera.prototype.pan = function(dx, dy)
{
    var dir = this.calculateDirXY();
    var e = this.eye.clone();
    e.sub(this.center);
    var t = Math.tan(this.fov/2 * Math.PI/180);
    var len = 2 * e.length() * t;
    var pc = this.center.clone();
    dir.y.mul(dx * len * this.aspect);
    dir.x.mul(dy * len);
    this.center.add(dir.y);
    this.center.add(dir.x);
    this.eye.add(dir.y);
    this.eye.add(dir.x);
};








/** Orbit camera
 *  @constructor */

VG.Render.OrbitCamera = function()
{

    VG.Render.SceneNode.call(this);


    /** The camera, if the camera will be re-parented, if null the opposite
     *  @member {VG.Render.Camera} VG.Render.OrbitCamera.camera */
    this._camera = null;


    this.boom = new VG.Render.SceneNode();
    this.boom.parent = this;

    this.attachPoint = new VG.Render.SceneNode();
    this.attachPoint.parent = this.boom;

    //rotation targets
    this._qYawT = new VG.Math.Quat();
    this._qPitchT = new VG.Math.Quat();

    /** Smooth enabled, affets zooming and rotating
     *  @member {Bool} */
    this.smooth = true;

    /** Rotation stiffness
     *  @member {Number} */
    this.stiffness = 4.0;

    /** Smooth zoom stiffness
     *  @member {Number} */
    this.smoothZoomStiffness = 0.7;

    /** Zoom limits as an object { min, max }
     *  @member {Object} */
    this.zoomLimit = { min: 1.0, max: 20.0 };

    this._zoomTarget = 0.0;

    /** The zoom against the focus point 0.0 to 1.0
     *  @member {Number} */
    this.zoom = 0.5;

    this.applyHardZoom();
};

VG.Render.OrbitCamera.prototype = Object.create(VG.Render.SceneNode.prototype);

Object.defineProperty(VG.Render.OrbitCamera.prototype, "camera",
{
    get: function()
    {
        return this._camera;
    },
    set: function(camera)
    {
        if (camera)
        {
            camera.resetLocalTransform();
            camera.parent = this.attachPoint;
        }

        this._camera = camera;
    }
});

Object.defineProperty(VG.Render.OrbitCamera.prototype, "zoom",
{
    get: function()
    {
        if (!this.attachPoint) return 0.0;

        return ((this.attachPoint.position.z - this.zoomLimit.min) / (this.zoomLimit.max - this.zoomLimit.min));
    },
    set: function(v)
    {
        v = VG.Math.clamp(v, 0.0, 1.0);

        this._zoomTarget = ((v * (this.zoomLimit.max - this.zoomLimit.min)) + this.zoomLimit.min);

        if (!this.smooth)
        {
            this.attachPoint.position.z = this._zoomTarget;
        }
    }
});

/** Increments the zoom
 * @param {Number} d - The delta zoom value */

VG.Render.OrbitCamera.prototype.incZoom = function(d)
{
    this.zoom = this.zoom + d;
};

/** If smooth zoom is enabled this will overwrite the smoothing and set it right away */

VG.Render.OrbitCamera.prototype.applyHardZoom = function()
{
    this.attachPoint.position.z = this._zoomTarget;
};

/** Tick function, must be called every render frame */

VG.Render.OrbitCamera.prototype.tick = function(delta)
{
    if (this.smooth)
    {
        this.attachPoint.position.z = VG.Math.lerp(this.attachPoint.position.z, this._zoomTarget, this.smoothZoomStiffness * delta);

        this.rotation.slerp(this._qYawT, this.stiffness * delta);
        this.boom.rotation.slerp(this._qPitchT, this.stiffness * delta);
    }
};

/**
 * Rotates the orbit against the x and y axis relative to the focus point (this node position)
 * @param {number} dX - The delta x / yaw in degrees
 * @param {number} dY - The delta y / pitch in degrees
 */

VG.Render.OrbitCamera.prototype.incRotation = function(dX, dY)
{
    var qYaw = this.smooth ? this._qYawT : this.rotation;
    var qPitch = this.smooth ? this._qPitchT : this.boom.rotation;

    var q = this.__cacheQ1;
    q.setEuler(VG.Math.rad(dX), 0, 0);
    qYaw.mulInv(q);


    q.setEuler(0.0, VG.Math.rad(dY), 0);
    qPitch.mulInv(q);
};
