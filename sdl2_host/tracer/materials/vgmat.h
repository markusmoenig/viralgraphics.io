#ifndef __VGMAT_H
#define __VGMAT_H

#include "../materials/material.h"
#include "../brdfs/vgbrdf.h"
#include "../brdfs/vgmirror.h"
#include "../brdfs/vgglass.h"
#include "../brdfs/vgphong.h"

namespace embree
{
    // VGMaterial is a material class that allows us to specify our custom OBJ-based properties
    // The deriving classes of this are specialized in specific material classes (transculent, 
    // texture, etc.)
    class VGMaterial : public Material
    {
    private:
        Color mDiffuse;             // Diffuse color
        Color mAmbient;             // Ambient color
        Color mSpecular;            // Specular color
        float mShininess;           // Shininess (specularity)
        int mIlluminationMode;      // Illumination mode (unused atm)
                
    public:
        // Constructor of VGMaterial
        //
        // Gets data from options and assigns them into attributes those are:
        // DIFFUSE_COLOR for mDiffuse
        // AMBIENT_COLOR for mAmbient
        // SPECULAR_COLOR for mSpecular
        // SHININESS for mShininess
        // ILLUMINATION_MODE for mIlluminationMode
        //
        // Params:
        //      options - Option set for given material instatiation
        VGMaterial(const Parms &options)
        {
            mDiffuse = options.getColor("DIFFUSE_COLOR", one);
            mAmbient = options.getColor("AMBIENT_COLOR", zero);
            mSpecular = options.getColor("SPECULAR_COLOR", zero);
            mShininess = options.getFloat("SHININESS", 1.0f);
            mIlluminationMode = options.getInt("ILLUMINATION_MODE", 0);
        }
        
        // Shade material
        //
        // This functions builds a BRDF for material, it should always instatiate one of the 
        // VGBRDF or its deriving classes.
        //
        // Parameters:
        //      r - Input ray
        //      m - Participating media for volume before the object
        //      dg - Geometry of hitpoint
        //      brdfs - Composite BRDF (in case of multi-materials)
        void shade( const Ray& r,
                    const Medium& m,
                    const DifferentialGeometry& dg,
                    CompositedBRDF& brdfs) const
        {
            switch(mIlluminationMode)
            {
            //case 2:
            //    brdfs.add(new VGBRDF_Phong(mDiffuse, mAmbient, mSpecular, mShininess, mIlluminationMode));
            //    break;
                
            case 3:
                brdfs.add(new VGBRDF_Mirror(mDiffuse, mAmbient, mSpecular, mShininess, mIlluminationMode));
                break;
                
            case 4:
            case 7:
                brdfs.add(new VGBRDF_Glass(mDiffuse, mAmbient, mSpecular, mShininess, mIlluminationMode));
                break;
                
            default:
                brdfs.add(new VGBRDF(mDiffuse, mAmbient, mSpecular, mShininess, mIlluminationMode));
                break;
            }
        }
        
        virtual Color getIntensity() const { return mDiffuse; }
        
        virtual bool isEmissive() const { return (mIlluminationMode == 0 ? true : false); }
    };
}

#endif