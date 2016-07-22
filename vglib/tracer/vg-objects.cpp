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

#ifndef VG_TRACEROBJECTS_CPP
#define VG_TRACEROBJECTS_CPP

#include "vg-algebra.cpp"
#include "randomc.h"

#include <emscripten/bind.h>
using namespace emscripten;

// ------------------------------------------------------- VGTracerRay

class VGTracerRay
{
public:
    
    VGTracerRay( const VGVector3& o, const VGVector3& d ) : origin( o ), dir( d )
    {
        // origin.copy( o );
        // dir.copy( d );
    }

    VGTracerRay( const VGVector3& o ) : origin( o )
    {
    }

    VGTracerRay()
    {
    }

    void setOrigin( const VGVector3& o ) 
    {
        origin=o;
    }   

    void setDir( const VGVector3& d ) 
    {
        dir=d;
    }        

    VGVector3 origin;
    VGVector3 dir;
};

// ------------------------------------------------------- VGTracerHit

#define VGTRACER_MAXDIST 1000000000
class VGTracerObject;

class VGTracerHit
{
public:
    
    VGTracerHit()
    {
        object=NULL; material=NULL;
        dist=VGTRACER_MAXDIST;
        materialIsDynamic=false;
    }

    ~VGTracerHit()
    {
        if ( materialIsDynamic && material )
            delete material;
    }

    double                             dist;
    const VGTracerObject              *object;
    const VGTracerMaterial            *material;
    bool                               materialIsDynamic;

    VGVector3                          origin;
    VGVector3                          normal;

    VGColor                            kD, kS, kE;    
};

// ------------------------------------------------------- VGTracerObject

class VGTracerObject {
public:
  VGTracerObject()
    { 
    }

    VGVector3 generateBBSample( CRandomMersenne *random ) const
    {
        VGVector3 sample( min );

        sample[VX]+=max[VX] - min[VX] * random->Random();
        sample[VY]+=max[VY] - min[VY] * random->Random();
        sample[VZ]+=max[VZ] - min[VZ] * random->Random();

        return sample;
    }

    double bbArea( void ) const
    {
        VGVector3 vector=min ^ max;
        return vector.length();
    }    

    bool hitBBox( const VGTracerRay& ray ) const
    {
        // --- aabb check

        double lo = -10000000000;
        double hi = +10000000000;

        double dimLoX=(min[VX] - ray.origin[VX] ) / ray.dir[VX];
        double dimHiX=(max[VX] - ray.origin[VX] ) / ray.dir[VX];

        if ( dimLoX > dimHiX )  {
            double tmp = dimLoX;
            dimLoX = dimHiX;
            dimHiX = tmp;
        }

        if (dimHiX < lo || dimLoX > hi ) return false;

        if (dimLoX > lo) lo = dimLoX;
        if (dimHiX < hi) hi = dimHiX;

        // ---

        double dimLoY=(min[VY] - ray.origin[VY] ) / ray.dir[VY];
        double dimHiY=(max[VY] - ray.origin[VY] ) / ray.dir[VY];        

        if ( dimLoY > dimHiY )  {
            double tmp = dimLoY;
            dimLoY = dimHiY;
            dimHiY = tmp;
        }

        if (dimHiY < lo || dimLoY > hi ) return false;        
  
        if (dimLoY > lo) lo = dimLoY;
        if (dimHiY < hi) hi = dimHiY;

        // ---

        double dimLoZ=(min[VZ] - ray.origin[VZ] ) / ray.dir[VZ];
        double dimHiZ=(max[VZ] - ray.origin[VZ] ) / ray.dir[VZ];  

        if ( dimLoZ > dimHiZ )  {
            double tmp = dimLoZ;
            dimLoZ = dimHiZ;
            dimHiZ = tmp;
        }

        if (dimHiZ < lo || dimLoZ > hi ) return false;     

        if (dimLoZ > lo) lo = dimLoZ;
        if (dimHiZ < hi) hi = dimHiZ;

        // ---

        if ( lo > hi ) return false;

        return true;
    }

    void setMaterial( const VGTracerMaterial *mat )
    {
        material=mat;
    }

    bool intersect( VGTracerHit& hit, const VGTracerRay& ray ) const { return false; };

protected:

  // int getX() const { return x; }
  // void setX(int x_) { x = x_; }

  // static std::string getStringFromInstance(const VGMeshObject& instance) {
    // return instance.y;
  // }

    VGVector3                          min;
    VGVector3                          max;
    const VGTracerMaterial            *material;
};

// ------------------------------------------------------- VGTracerMeshObject

class VGTracerMeshObject : public VGTracerObject 
{
public:
    VGTracerMeshObject( uintptr_t bufAddr, unsigned int length ) : VGTracerObject(), length(length)
    { 
        points=reinterpret_cast<double*>(bufAddr);

        // --- Create BBox

        for ( int i=0; i < length; i+=3 )
        {
            VGVector3 pt( points[i], points[i+1], points[i+2] );

            min.min( pt );
            max.max( pt );
        }

        // ---

        EPSILON = 0.000001;
    }

    bool intersect( VGTracerHit& hit, const VGTracerRay& ray ) const
    {
        if ( !hitBBox( ray ) ) return false;

        for ( int i=0; i < length; i+=3*3 )
        {
            bool success=false;

            VGVector3 pt0( points[i], points[i+1], points[i+2] );
            VGVector3 pt1( points[i+3], points[i+4], points[i+5] );
            VGVector3 pt2( points[i+6], points[i+7], points[i+8] );

            VGVector3 edge1=pt1 - pt0;
            VGVector3 edge2=pt2 - pt0;

            // printf("edge2 %f %f %f\n", edge2.n[0], edge2.n[1], edge2.n[2] );

            VGVector3 pvec=ray.dir ^ edge2;

            double det=edge1 * pvec;

            if (det < EPSILON) continue;

            VGVector3 tvec=ray.origin - pt0;

            double u=tvec * pvec;
            if (u < 0 || u > det) continue;

            VGVector3 qvec=tvec ^ edge1;
    
            double v=ray.dir * qvec; 
            if (v < 0 || u + v > det) continue;
    
            double t=(edge2 * qvec) / det;

            if ( t > -0.005 && t < hit.dist )
            { 
                hit.dist=t;
                hit.object=this;
                hit.material=material;

                hit.origin=ray.origin + ray.dir * t;
                hit.normal=edge1 ^ edge2;
                hit.normal.normalize();
/*
                if ( hit.material->texture )
                {
                    VGTracerImage *image=hit.material->texture;

                    //printf("test\n");

                    double fx=hit.origin[VX] - min[VX];
                    double fy=(max[VY] - min[VY]) - (hit.origin[VY] - min[VY]);

                    int x=(int) (fx+0.5);
                    int y=(int) (fy+0.5);

                    int offset=y * image->modulo + x * 4;
                    double r=((double)image->data[offset]) / 255.0;
                    double g=((double)image->data[offset+1]) / 255.0;
                    double b=((double) image->data[offset+2]) / 255.0;

                    // VGTracerMaterial *newMaterial=new VGTracerMaterial( *material );
                    // newMaterial->kE.set( r, g ,b );

                    // hit.material=newMaterial;
                    // hit.materialIsDynamic=true;

                    // material->kE.set( r, g, b );

                    hit.kD=material->kD;
                    hit.kS=material->kS;
                    hit.kE.set( r, g, b );
                } else
                {
                    hit.kD=material->kD;
                    hit.kS=material->kS;
                    hit.kE=material->kE;
                }*/

                return true;
            }
        }
        return false;
    }

    inline VGTracerMaterial *getMaterial( void ) const
    {
        return material;
    }

    void setMaterial( VGTracerMaterial *mat )
    {
        material=mat;
    }    

private:

    double *points;
    unsigned int length;
    
    double EPSILON;

    VGTracerMaterial *material;
};

// ------------------------------------------------------- VGTracerSphereObject

class VGTracerSphereObject : public VGTracerObject 
{
public:
    VGTracerSphereObject( const VGVector3& origin, double radius ) : origin( origin ), radius( radius )
    { 
    }

    bool intersect( VGTracerHit& hit, const VGTracerRay& ray ) const
    {
        VGVector3 cache=ray.origin - origin;

        double a=ray.dir * ray.dir;
        double b=2 * ray.dir * cache;
        double c=cache * cache - radius * radius;
        double discriminant = b * b - 4 * a * c;

        if ( discriminant > 0 )
        {
            double t = (-b - sqrt(discriminant)) / (2 * a);

            if ( t > -0.005 && t < hit.dist )
            {
                hit.dist=t;
                hit.object=this;
                hit.material=material;

                hit.origin=ray.origin + ray.dir * t;
                hit.normal=hit.origin;
                hit.normal-=origin;
                hit.normal/=radius;

                hit.normal.normalize();
                return true;
            }
        }

        return false;
    }

    inline VGTracerMaterial *getMaterial( void ) const
    {
        return material;
    }

    void setMaterial( VGTracerMaterial *mat )
    {
        material=mat;
    }    

private:

    VGVector3                                    origin;
    double                                       radius;

    VGTracerMaterial                            *material;
};

#endif