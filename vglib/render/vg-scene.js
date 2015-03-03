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

VG.Render.SceneNode = function()
{
    /** Scene Node, for standalone usage or with a scene manager.
     *  When used with a pipeline override onDraw(pipeline, context, delta) to make it renderable 
     *  @param {VG.Render.SceneNode} p - The parent, can be null */

    /** Parent scene node  
     *  @member {VG.Render.SceneNode} */
    this._parent = null;

    /** Local position 
     *  @member {VG.Math.Vector3} */
    this._position = new VG.Math.Vector3(0.0, 0.0, 0.0);

    /** Local rotation 
     *  @member {VG.Math.Quat} */
    this._rotation = new VG.Math.Quat();

    /** Local scale 
     *  @member {VG.Math.Vector3} */
    this._scale = new VG.Math.Vector3(1.0, 1.0, 1.0);

    /** Local Bounds 
     *  @member {VG.Math.Aabb} */
    this.bounds = new VG.Math.Aabb();


    /** By the default bounds update / transforms are disable 
     *  @member {Bool} */
    this.hasBounds = false;


    /** Children scene nodes 
     *  @member {Array} */
    this.children = [];


    //private cache
    this.__cacheM1 = new VG.Math.Matrix4();
    this.__cacheM2 = new VG.Math.Matrix4();

    this.__cacheQ1 = new VG.Math.Quat();

    this.__cacheAabb = new VG.Math.Aabb();
}

Object.defineProperty(VG.Render.SceneNode.prototype, "position",
{
    get: function()
    {
        return this._position;    
    },
    set: function(v)
    {
        this._position.copy(v);
    }
});

Object.defineProperty(VG.Render.SceneNode.prototype, "scale",
{
    get: function()
    {
        return this._scale;
    },
    set: function(v)
    {
        this._scale.copy(v);
    }
});

Object.defineProperty(VG.Render.SceneNode.prototype, "parent",
{
    get: function()
    {
        return this._parent;    
    },
    set: function(p)
    {
        if (this._parent == p) return;

        if (p)
        {
            p.children.push(this);
        }

        if (this._parent)
        {
            for (var i = 0; i < this._parent.children.length; i++)
            {
                if (this._parent.children[i] == this)
                {
                    this._parent.children.splice(i, 1);
                    break;
                }
            }
        }

        this._parent = p;
    }
});

Object.defineProperty(VG.Render.SceneNode.prototype, "rotation",
{
    get: function()
    {
        return this._rotation;
    },
    set: function(q)
    {
        this._rotation.copy(q);
    }
});

VG.Render.SceneNode.prototype.resetLocalTransform = function()
{
    /** Resets position, scale and rotation to identity */

    this.position.set(0, 0, 0);
    this.scale.set(1, 1, 1);
    this.rotation.setIdentity();
}

VG.Render.SceneNode.prototype.getBounds = function()
{
    /** Returns world-space bounds 
     *  @return {VG.Math.Aabb} */

    var aabb = this.__cacheAabb;

    if (this.hasBounds)
    {
        aabb.copy(this.bounds);
        aabb.transform(this.getTransform());
    }

    return aabb;
}

VG.Render.SceneNode.prototype.getTransform = function()
{
    /** Returns the world transform of this node 
     *  @return {VG.Math.Matrix4} */

    var m = this.__cacheM1;

    m.setIdentity();
    m.setQuatRotation(this._rotation);
    m.scale(this._scale.x, this._scale.y, this._scale.z); 
    m.translate(this._position.x, this._position.y, this._position.z);

    if (this.parent)
    {
        var t = this.__cacheM2; 
        
        t.set(this.parent.getTransform());

        t.mul(m);

        return t;
    }

    return m;
}

VG.Render.SceneNode.prototype.setRotation = function(yaw, pitch, roll)
{
    /** Utility wrapper to set the rotation from Euler angles in degrees 
     *  @param {Number} yaw - Angle in degrees
     *  @param {Number} pitch - Angle in degrees
     *  @param {Number} roll - Angle in degrees */

    this._rotation.setEuler(VG.Math.rad(yaw), VG.Math.rad(pitch), VG.Math.rad(roll));
}

VG.Render.SceneNode.prototype.incRotation = function(yaw, pitch, roll)
{
    /** Increments the rotation 
     *  @param {Number} yaw - Delta angle in degrees
     *  @param {Number} pitch - Delta angle in degrees
     *  @param {Number} roll - Delta angle in degrees */

    var q = this.__cacheQ1;

    q.setEuler(VG.Math.rad(yaw), VG.Math.rad(pitch), VG.Math.rad(roll));

    this._rotation.mulInv(q);
    //this._rotation.normalize();
}









VG.Render.SceneManager = function()
{
    /** Manages scene nodes with culling and ordering techniques,
     *  this class extends the SceneNode class, therefore same parent/child
     *  works with this */

    VG.Render.SceneNode.call(this);
}

VG.Render.SceneManager.prototype = Object.create(VG.Render.SceneNode.prototype);

VG.Render.SceneManager.prototype.findAllVisible = function(context, onlyDrawable)
{
    /** Finds all nodes that are visible by the given context 
     *  @param {VG.Render.Context} context - The render context 
     *  @param {BOol} onlyDrawable - If true only consideres nodes with onDraw callback defined */

    var visible = [];

    var CullChildren = function(node)
    {

        for (var i = 0; i < node.children.length; i++)
        {
            var child = node.children[i];

            CullChildren(child);

            if (onlyDrawable && !child.onDraw) continue;

            //TODO test bounds against a frustum
            visible.push(child);
        }
    }

    CullChildren(this);

    return visible;
}



