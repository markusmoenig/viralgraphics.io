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

#ifndef VG_TRACER_CPP
#define VG_TRACER_CPP

#include <unistd.h>

#include "vg-objects.cpp"
#include "mersenne.cpp"

#include <emscripten/bind.h>
#include <emscripten/threading.h>
#include <emscripten.h>

#include <thread>

using namespace emscripten;

// ------------------------------------------------------- VGTracerSettings

class VGTracerSettings
{
public:

    VGTracerSettings()
    { 
        directLighting=true;
        indirectLighting=true;
        russianRoulette=false;
    }

    int                                width, height;
    int                                realWidth, realHeight;
    double                             imageAspectRatio;

    int                                maxDepth;
    double                             fov;
    double                             scale;

    VGVector3                          cameraOrigin;
    VGMatrix4                          cameraTransform;

    bool                               directLighting;
    bool                               indirectLighting;
    bool                               russianRoulette;
};

struct VGTracerInit {
    int                                width;
    int                                height;
    int                                realWidth;
    int                                realHeight;

    int                                maxDepth;
    double                             fov;

    double                             cameraX, cameraY, cameraZ;
    double                             trans0, trans1, trans2, trans3;
    double                             trans4, trans5, trans6, trans7;
    double                             trans8, trans9, trans10, trans11;
};

// ------------------------------------------------------- VGTracer

class VGTracer;

void threadTrace( VGTracer * );

class VGTracer 
{
public:
    VGTracer() : data( NULL ), imageData( NULL ), passes( 0 ), cores( 1 ), hasThreading( false )
    { 
#ifdef __EMSCRIPTEN_PTHREADS__
        cores=emscripten_num_logical_cores();
        hasThreading=emscripten_has_threading_support();        
#endif
        //printf( "cores %d\n", cores );
    }

    ~VGTracer()
    {
        delete random;
        if ( data ) delete[] data;
        if ( imageData ) delete[] imageData;
    }

    void addMeshObject( const VGTracerMeshObject& object ) 
    {
        objects.push_back( &object );
    }

    void addSphereObject( const VGTracerSphereObject& object ) 
    {
        spheres.push_back( &object );
    }    

    void addLightObject( const VGTracerMeshObject& light ) 
    {
        lights.push_back( &light );
    }

    unsigned int init( VGTracerInit initData )
    {
        //printf( "%d, %d\n", initData.realWidth, initData.realHeight );

        settings.width=initData.width;
        settings.height=initData.height;
        settings.realWidth=initData.realWidth;
        settings.realHeight=initData.realHeight;        
        settings.maxDepth=initData.maxDepth;
        settings.fov=initData.fov;

        settings.imageAspectRatio=(double) settings.width / (double) settings.height;
        settings.scale=tan( settings.fov * 0.5 * M_PI / 180.0 );

        settings.cameraOrigin[VX]=initData.cameraX;
        settings.cameraOrigin[VY]=initData.cameraY;
        settings.cameraOrigin[VZ]=initData.cameraZ;

        settings.cameraTransform[0]=VGVector4( initData.trans0, initData.trans1, initData.trans2, initData.trans3 );
        settings.cameraTransform[1]=VGVector4( initData.trans4, initData.trans5, initData.trans6, initData.trans7 );
        settings.cameraTransform[2]=VGVector4( initData.trans8, initData.trans9, initData.trans10, initData.trans11 );
        settings.cameraTransform[3]=VGVector4( 0, 0, 0, 1 );

        x=0; y=settings.height-1;

        xSample=random->Random();
        ySample=random->Random();

        data=(double *) calloc( settings.width * settings.height * 4, sizeof(double) );
        imageData=(unsigned char *) calloc( settings.realWidth * settings.realHeight * 4, sizeof(unsigned char) );

        return (unsigned int) imageData;
    }

    void start( void )
    {
        if ( hasThreading )
        {
            for ( int i=0; i < cores; ++i )
            {
                threads.push_back( new std::thread( threadTrace, this ) );
            }
        }
        stopped=false;
    }

    void stop( void )
    {
        stopped=true;

        if ( hasThreading ) {

            usleep( 30 );

            for ( std::thread *thread : threads )
            {
                if ( thread->joinable() )
                {
                    //thread->join();
                    usleep( 30 );
                }
                //delete thread;
            }

            usleep( 30 );
        } 
    }    

    int numberOfCores( void ) { return cores; }

    int trace( void )
    {
        if ( hasThreading ) 
        {
            return passes;
        }

        VGTracerRay ray( settings.cameraOrigin );

        double startTime=EM_ASM_DOUBLE( { return Date.now(); }, 0 );

        for ( ; y >=0; --y )
        {
            double ry = (2 * (y + ySample) / settings.height - 1) * settings.scale; 
            for ( x=0; x < settings.width; ++x ) 
            {
                double rx = (2 * (x + xSample) / settings.width - 1) * settings.imageAspectRatio * settings.scale;

                VGVector3 dir( rx, ry, -1 );
                VGVector3 transDir=settings.cameraTransform * dir;

                transDir.normalize();
                ray.setDir( transDir );

                VGColor color=pathtrace( ray, 0, false );
                color.clamp();

                unsigned int dataOffset=settings.width * (settings.height-y-1) * 4 + x * 4;
                unsigned int imageOffset=settings.realWidth * (settings.height-y-1) * 4 + x * 4;

                data[dataOffset]+=color[RED];
                data[dataOffset+1]+=color[GREEN];
                data[dataOffset+2]+=color[BLUE];
                data[dataOffset+3]+=1;

                double passes=data[dataOffset+3];

                imageData[imageOffset]=pow( data[dataOffset] / passes, 1/2.2 ) * 255.99;
                imageData[imageOffset+1]=pow( data[dataOffset+1] / passes, 1/2.2 ) * 255.99;
                imageData[imageOffset+2]=pow( data[dataOffset+2] / passes, 1/2.2 ) * 255.99;
                imageData[imageOffset+3]=255;
            }

            double currTime=EM_ASM_DOUBLE( { return Date.now(); }, 0 );

            if ( currTime - startTime > 20 ) {
                y--;
                break;
            }
        }

        if ( y == -1 ) 
        {
            y=settings.height-1;
            passes++;

            xSample=random->Random();
            ySample=random->Random();
        }

        return passes;
    }

    VGColor pathtrace( const VGTracerRay& ray, int depth, bool indirect )
    {
        // printf( "origin %f %f %f\n", ray.origin.n[0], ray.origin.n[1], ray.origin.n[2] );
        // printf( "dir %f %f %f\n", ray.dir.n[0], ray.dir.n[1], ray.dir.n[2] );

        VGTracerHit hit;
        VGColor pointColor;

        bool rc=intersect( hit, ray );
        if (!rc) return pointColor;

        // If direct lighting is on, this ray was an indirect illumination sample, and
        // we hit a light source, we should return nothing (don't want to oversample direct illum.)
        if (indirect && settings.directLighting && hit.material->type == VGTracerMaterial::Emissive )
            return VGColor();

        // Init color to emissive value
        pointColor=hit.material->kE;

        // if ( hit.material->type == VGTracerMaterial::Emissive )
            // return pointColor;

        // Russian Roulette
        double survival = 1.0;
        if (depth > settings.maxDepth && settings.russianRoulette)
        {
            VGColor weight/* = rgb(.5,.5,.5)*/;
            if ( hit.material->type == VGTracerMaterial::Diffuse ) weight = hit.material->kD;
            if ( hit.material->type == VGTracerMaterial::Glossy ) weight = hit.material->kD + hit.material->kS;
            if ( hit.material->type == VGTracerMaterial::Mirror ) weight = VGColor(1,1,1);
           // if (refl.type == Dielectric) weight = refl.kT;
           if (russianRoulette(weight, survival))
                return pointColor;
        }
        // If no Russian Roulette, just kill the path
        else if (depth > settings.maxDepth)
            return pointColor;

        if ( hit.material->type == VGTracerMaterial::Diffuse )
        {
            // --- Diffuse

            if ( settings.directLighting )
            {
                pointColor+=directIllumination( hit, ray );
            }

            if (settings.indirectLighting)
                pointColor += survival * diffuseInterreflect(hit, ray, depth);
        }

        if ( hit.material->type == VGTracerMaterial::Glossy )
        {
            // --- Glossy

            if ( settings.directLighting )
            {
                pointColor+=directIllumination( hit, ray );
            }

            if (settings.indirectLighting)
            {
                double rrMult;
                if (glossyRussianRoulette( hit.material->kS, hit.material->kD, rrMult))
                    pointColor += survival * (1.0/(1-1.0/rrMult)) * diffuseInterreflect(hit, ray, depth);
                else
                    pointColor += survival * rrMult * specularInterreflect(hit, ray, depth);                
            }
        }    

        // MIRROR OBJECTS
        if ( hit.material->type == VGTracerMaterial::Mirror  )
        {
            // Sample perfect mirror reflection
            pointColor += survival * mirrorReflect(hit, ray, depth);
        }

        // DIELECTRIC OBJECTS
        if ( hit.material->type == VGTracerMaterial::Dielectric  )
        {
            VGTracerRay refrRay;
            double schlick;
            bool refracted = dielectricCalc(hit, ray, refrRay, schlick);

            // If total internal reflection, just send reflected ray
            if (!refracted)
                pointColor += survival * mirrorReflect( hit, ray, depth );
            else
            {
                //pointColor += survival*(1-schlick)*dielectricTransmit(refrRay,intersection,depth);

                // OPTION1: Decide which ray to send based on some probability.
                VGColor fakeColor(.5,.5,.5);
                double rrMult;
                if (russianRoulette(fakeColor, rrMult))
                    pointColor += survival*(1.0/(1-1.0/rrMult))*(1-schlick)*dielectricTransmit( hit, refrRay, depth );
                else 
                    pointColor += survival*rrMult*schlick*mirrorReflect( hit, ray, depth );

                //// OPTION2: Always send both rays
                //pointColor += survival*(1-schlick)*dielectricTransmit(refrRay,intersection,depth);
                //pointColor += survival*schlick*mirrorReflect(ray,intersection,depth);

                //// OPTION3: Russian roulette on schlick value to send reflected ray, transmitted ray, or both
                //rgb reflWeight(schlick,schlick,schlick);
                //rgb transWeight(1-schlick,1-schlick,1-schlick);
                //double rrMult;
                //if (!russianRoulette(reflWeight, rrMult))
                //  pointColor += survival*rrMult*schlick*mirrorReflect(ray,intersection,depth);
                //if (!russianRoulette(transWeight, rrMult))
                //  pointColor += survival*rrMult*(1-schlick)*dielectricTransmit(refrRay,intersection,depth);
            }
        }

        return pointColor;
    }

    VGColor lightIntensity( VGTracerHit& hit, VGTracerHit& lightHit )
    {
        VGVector3 incidence( lightHit.origin );
        incidence-=hit.origin;

        double inlen = incidence.length();
        double cosThetaIn = MAX((hit.normal * incidence) / inlen, 0);
        double cosThetaOut = MAX((-incidence * lightHit.normal) / inlen, 0);
        double geoFactor = cosThetaIn*cosThetaOut / incidence.length2();

        VGColor intensity = geoFactor * lightHit.object->bbArea() * lightHit.material->kE;
        return intensity * 2;
    }

    VGColor directIllumination( VGTracerHit& hit, const VGTracerRay& ray )
    {
        VGColor color;

        for( const VGTracerMeshObject* lightObject : lights ) 
        {
            VGVector3 bbSample( lightObject->generateBBSample( random ) );

            bbSample-=hit.origin;
            bbSample.normalize();

            VGTracerRay lightRay( hit.origin, bbSample );
            VGTracerHit lightHit;

            bool rc=intersect( lightHit, lightRay );
            if ( !rc || lightHit.object != lightObject ) continue;

            VGColor intensity=lightIntensity( hit, lightHit );

            if ( hit.material->type == VGTracerMaterial::Diffuse )
            {
                // --- Diffuse
                color+=(hit.material->kD / M_PI) * intensity;
            } else
            if ( hit.material->type == VGTracerMaterial::Glossy )
            {
                // --- Glossy
                VGVector3 r = reflect( bbSample, hit.normal );
                r.normalize();

                VGVector3 v = -ray.dir;
                v.normalize();

                color += (hit.material->kS*(hit.material->pExp+1)/(2*M_PI)) * pow(r*v, hit.material->pExp) * intensity;
            }
        }

        return color;
    };

    VGColor diffuseInterreflect( VGTracerHit& hit, const VGTracerRay& ray, int depth )
    {
        VGVector3 rayDir=sampleUpperHemisphere( hit.normal, 1 );
        VGTracerRay indirectRay( hit.origin, rayDir );


        VGColor diffColor=pathtrace( indirectRay, depth+1, true );
        VGColor color=diffColor * hit.material->kD;

        return color;
    };


    VGColor specularInterreflect( VGTracerHit& hit, const VGTracerRay& ray, int depth )
    {
        VGVector3 perfectReflDir=reflect( ray.dir, hit.normal );
        perfectReflDir.normalize();     

        VGVector3 rayDir = sampleUpperHemisphere(perfectReflDir, hit.material->pExp );
        VGTracerRay indirectRay( hit.origin, rayDir );

        VGColor specColor=pathtrace( indirectRay, depth+1, true );

        return hit.material->kS * (rayDir * hit.normal) * specColor;
    };    


    VGColor mirrorReflect( VGTracerHit& hit, const VGTracerRay& ray, int depth )
    { 
        VGVector3 perfectReflDir=reflect( ray.dir, hit.normal );
        perfectReflDir.normalize();     

        VGVector3 rayDir = sampleUpperHemisphere(perfectReflDir, hit.material->pExp );
        VGTracerRay indirectRay( hit.origin, perfectReflDir );

        VGColor reflColor=pathtrace( indirectRay, depth+1, false );

        return reflColor;
    };

    bool dielectricCalc( VGTracerHit& hit, const VGTracerRay& ray, VGTracerRay& refRay, double& schlick )
    {
        VGVector3 direction = ray.dir;
        direction.normalize();

        VGVector3 normal = hit.normal;
        bool into;

        double cosAngle = direction * normal.normalize();
        if (cosAngle  > 0) into = false;
        else into = true;

        double index = hit.material->indexOfRefraction;
        double n, nt;
        if (!into )
        {
            n = index;
            nt = 1.0;
        }
        // CASE: From open air into an object.
        else
        {
            n = 1.0;
            nt = index;
        }

        /* Now compute the refraction direction (returns false if total internal reflection). */

        VGVector3 refractDirection;
        bool refracted = refract(hit, ray, n, nt, refractDirection);

        // Calculate Schlick approximation of Fresnel equations
        VGVector3 d = ray.dir; d.normalize();
        VGVector3 rd = refractDirection; if (refracted) rd.normalize();
        schlick = schlickCalc(n, nt, d, rd, hit.normal);

        // Generate refracted ray
        if (refracted) {
            //refrRay = Ray(intersection.point, settings.rayBias, DBL_MAX, refractDirection, ray.getSample(), intersection.primitive);
            refRay.setOrigin( hit.origin );
            refRay.setDir( refractDirection );
        }

        return refracted;
    };

    VGColor dielectricTransmit( VGTracerHit& hit, VGTracerRay& ray, int depth)
    {
        //Reflectance refl = intersection.primitive->getReflectance(intersection.point);
        //rgb mult = (refl.kT == rgb::black ? refl.kR : refl.kT);
        return /*mult **/ pathtrace( ray, depth+1, false );
    }

    bool refract( VGTracerHit& hit, const VGTracerRay& ray, double oldIndex, double newIndex, VGVector3& refractDirection) 
    {
        double n = oldIndex/newIndex;
        VGVector3 direction = ray.dir;
        direction.normalize();
        VGVector3 normal = hit.normal;

        // Checking whether ray is going into the object or going out.
        // Negative dot product means going in, positive means going out (so we need to look at flipped normal)
        double cosAngle = direction * normal.normalize();
        if(cosAngle  > 0) {
            normal = -hit.normal;
        }
    
        double c = direction * normal;
        double cosPhi2 = (1 - ((n * n) * (1 - (c * c))));
    
        // If cos(phi)^2 is less than 0, then no refraction ray exists and all 
        // the energy is reflected (TOTAL INTERNAL REFLECTION).
        if (cosPhi2 < 0) 
            return false;
        else {
            double cosPhi = sqrt(cosPhi2);
            VGVector3 term1 = n * (direction - normal * (c));
            refractDirection = term1 - normal * cosPhi;
            return true;
        }
    }

    double schlickCalc(double n, double nt, VGVector3& rayDir, VGVector3& refrDir, VGVector3& surfNorm)
    {
        double nbig, nsmall;
        nbig = MAX(n,nt); nsmall = MIN(n,nt);
        double R0 = ((nbig-nsmall)/(nbig+nsmall)); R0 = R0*R0;
        bool into = (rayDir * surfNorm) < 0;
        double c = 1 - (into ? (-rayDir * surfNorm) :
                               (refrDir * surfNorm));
        double schlick = R0 + (1-R0)* c * c * c * c * c;
        return schlick;
    }

    // n = phong exponent (n = 1 for lambertian reflectance)
    VGVector3 sampleUpperHemisphere(VGVector3& alignWithZ, double n)
    {
        // Generate random numbers
        double z, phi, theta;
        z = random->Random();
        phi = random->Random() * 2 * M_PI;
        theta = (n == 1 ? acos(sqrt(z)) : acos(pow(z, 1/(n+1))));

        // Create vector aligned with z=(0,0,1)
        double sintheta = sin(theta);
        VGVector3 sample(sintheta*cos(phi), sintheta*sin(phi), z);

        // Rotate sample to be aligned with normal
        VGVector3 t(random->Random(), random->Random(), random->Random());
        VGVector3 u = t ^ alignWithZ; u.normalize();
        VGVector3 v = alignWithZ ^ u;
        VGMatrix3 rot(u, v, alignWithZ);
        rot = rot.transpose();
        return rot * sample;
    }

    VGVector3 reflect( const VGVector3& dir, const VGVector3& normal )
    {
        return dir - (2 * (dir * normal) * normal);
    }

    bool russianRoulette( const VGColor& refl, double& survivorMult )
    {
        double p = MAX(refl[0], MAX(refl[1], refl[2]));
        survivorMult = 1.0/p;
        if (random->Random() > p) return true;
        return false;
    }

    bool glossyRussianRoulette(const VGColor& kS, const VGColor& kD, double& survivorMult)
    {
        double spec = MAX(kS[0], MAX(kS[1], kS[2]));
        double diffuse = MAX(kD[0], MAX(kD[1], kD[2]));
        double p = spec/(spec + diffuse);
        survivorMult = 1.0/p;
    
        if (random->Random() > p)
            return true;
        else 
            return false;
        }


    bool intersect( VGTracerHit& hit, const VGTracerRay& ray )
    {
        bool rc=false;
        for( const VGTracerMeshObject* object : objects ) 
        {
            if ( object->intersect( hit, ray ) ) rc=true;
        }
        for( const VGTracerSphereObject* object : spheres ) 
        {
            if ( object->intersect( hit, ray ) ) rc=true;
        }        
        return rc;
    };

public:

    std::vector<const VGTracerMeshObject*>       objects, lights;
    std::vector<const VGTracerSphereObject*>     spheres;

    std::vector<std::thread *>                   threads;

    CRandomMersenne                             *random;

    VGTracerPixel                                pixel;
    VGTracerSettings                             settings;

    int                                          passes;
    double                                      *data;
    unsigned char                               *imageData;

    int                                          x, y;
    double                                       xSample, ySample;


    int                                          cores;
    bool                                         hasThreading, stopped;

    pthread_mutex_t                              mutex1 = PTHREAD_MUTEX_INITIALIZER;    
};

// ------------------------------------------------------- Thread Based Tracing

void threadTrace( VGTracer *tracer )
{
    VGTracerSettings settings=tracer->settings;

    double *data=tracer->data;
    unsigned char *imageData=tracer->imageData;

    bool finished=false;

    VGTracerRay ray( settings.cameraOrigin );

    double xSample=tracer->random->Random();
    double ySample=tracer->random->Random();

    int x, y=settings.height-1;

    for ( ; y >=0; --y )
    {
        // printf( "%d, %d\n", x, y );

        double ry = (2 * (y + ySample) / settings.height - 1) * settings.scale; 
        for ( x=0; x < settings.width; ++x ) 
        {
            double rx = (2 * (x + xSample) / settings.width - 1) * settings.imageAspectRatio * settings.scale;

            VGVector3 dir( rx, ry, -1 );
            VGVector3 transDir=settings.cameraTransform * dir;

            transDir.normalize();
            ray.setDir( transDir );

            VGColor color=tracer->pathtrace( ray, 0, false );
            color.clamp();

            unsigned int dataOffset=settings.width * (settings.height-y-1) * 4 + x * 4;
            unsigned int imageOffset=settings.realWidth * (settings.height-y-1) * 4 + x * 4;

            data[dataOffset]+=color[RED];
            data[dataOffset+1]+=color[GREEN];
            data[dataOffset+2]+=color[BLUE];
            data[dataOffset+3]+=1;

            double passes=data[dataOffset+3];

            imageData[imageOffset]=pow( data[dataOffset] / passes, 1/2.2 ) * 255.99;
            imageData[imageOffset+1]=pow( data[dataOffset+1] / passes, 1/2.2 ) * 255.99;
            imageData[imageOffset+2]=pow( data[dataOffset+2] / passes, 1/2.2 ) * 255.99;
            imageData[imageOffset+3]=255;
        }

        if ( y == 0 ) {
            y=settings.height;
            tracer->passes++;

            xSample=tracer->random->Random();
            ySample=tracer->random->Random();        
        }

        if ( tracer->stopped ) break;
    }

    // printf("Thread is finished\n");

    //pthread_exit(0);
    //return 0;
}

#endif