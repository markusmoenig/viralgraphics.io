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

VG.Render.Camera = function(fov, aspect, nearZ, farZ)
{
    /** Camera as an scene node 
     *  @constructor 
     *  @param {Number}[60] fov - The field of view
     *  @param {Number}[1] aspect - Aspect ratio
     *  @param {Number}[0.1] nearZ - Near plane
     *  @param {Number}[100] farZ - Far plane */
 
    VG.Render.SceneNode.call(this);


    if (fov === undefined) fov = 60.0;
    if (aspect === undefined) aspect = 1.0;
    if (nearZ === undefined) nearZ = 0.1;
    if (farZ === undefined) farZ = 100.0;

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

    this.updateProjection();
}

VG.Render.Camera.prototype = Object.create(VG.Render.SceneNode.prototype);

VG.Render.Camera.prototype.updateProjection = function()
{
    /** Updates the projection matrix, must be called if any member changes */

    this.projM.setPerspective(this.fov, this.aspect, this.nearZ, this.farZ);
}








VG.Render.OrbitCamera = function()
{
    /** Orbit camera 
     *  @constructor */

    VG.Render.SceneNode.call(this);


    /** The camera, if the camera will be re-parented, if null the opposite
     *  @member {VG.Render.Camera} */
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
    this.zoomLimit = { min: 1.0, max: 10.0 };
 
    this._zoomTarget = 0.0; 

    /** The zoom against the focus point 0.0 to 1.0
     *  @member {Number} */
    this.zoom = 0.5;

    this.applyHardZoom();
}

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


VG.Render.OrbitCamera.prototype.incZoom = function(d)
{
    /** Increments the zoom 
     *  @param {Number} d - The delta zoom value */ 
    this.zoom = this.zoom + d;
}

VG.Render.OrbitCamera.prototype.applyHardZoom = function()
{
    /** If smooth zoom is enabled this will overwrite the smoothing and set it right away */ 
    this.attachPoint.position.z = this._zoomTarget;
}

VG.Render.OrbitCamera.prototype.tick = function(delta)
{
    /** Tick function, must be called every render frame */

    if (this.smooth)
    {
        this.attachPoint.position.z = VG.Math.lerp(this.attachPoint.position.z, this._zoomTarget, this.smoothZoomStiffness * delta);

        this.rotation.slerp(this._qYawT, this.stiffness * delta);
        this.boom.rotation.slerp(this._qPitchT, this.stiffness * delta);
    }
}

VG.Render.OrbitCamera.prototype.incRotation = function(dX, dY)
{
    /** Rotates the orbit against the x and y axis relative to the focus point (this node position) 
     *  @member {Number} dX - The delta x / yaw in degrees
     *  @member {Number} dY - The delta y / pitch in degrees */

    var qYaw = this.smooth ? this._qYawT : this.rotation;
    var qPitch = this.smooth ? this._qPitchT : this.boom.rotation;

    var q = this.__cacheQ1;
    q.setEuler(VG.Math.rad(dX), 0, 0);
    qYaw.mulInv(q);


    q.setEuler(0.0, VG.Math.rad(dY), 0);
    qPitch.mulInv(q);
}
