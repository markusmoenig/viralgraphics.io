/*
 * Copyright (c) 2015 Markus Moenig <markusm@visualgraphics.tv>
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

#ifndef __VG_BRDF_H__
#define __VG_BRDF_H__

#include "brdf.h"

namespace embree
{
    // VG based BRDF, implements energy-conserving, physically plausible BRDF
    // Default one is Phong-Lambert (Specular and diffuse) BRDF
    class VGBRDF : public BRDF
    {
    protected:
        Color mDiffuse;
        Color mAmbient;
        Color mSpecular;
        float mShininess;
        int mIlluminationMode;
        
    public:
        // Constructs VG BRDF
        //
        // VG BRDF currently behaves as any type of BRDF, even though as it is Blinn-Phong only
        // further it should be extended with classes deriving from this one
        VGBRDF(Color diffuse,
               Color ambient,
               Color specular,
               float shininess,
               int mode) : BRDF(ALL)
        {
            mDiffuse = diffuse;
            mAmbient = ambient;
            mSpecular = specular;
            mShininess = shininess;
            mIlluminationMode = mode;
        }
        
        // Blank virtual destructor
        virtual ~VGBRDF()
        {
        }
        
        // Evaluates BRDF into color.
        //
        // Evaluates single sample of BRDF (bidirectional reflectance distribution function) for
        // given point (dg) for incoming radiance from solid angle wi into solid angle wo.
        //
        // Params:
        //      wo - Outgoing radiance direction
        //      dg - Point where the BRDF is computed
        //      wi - Incoming radiance direction
        // Returns:
        //      Color for given sample
        virtual Color eval(const Vector3f& wo,
                           const DifferentialGeometry& dg,
                           const Vector3f& wi) const
        {
            if (mIlluminationMode == 0)
            {
                return Color(one);
            }
            
            // Reflection vector for phong model
            Vector3f r = reflect(-wo, dg.Ng);
            
            // Phong model is defined as (N.R)^n - a scalar dot product between normal and reflection 
            // vector
            // Its weight is (n+2)/(2*pi) - to keep Phong model normalized
            // Note that color must be gamma-corrected
            Color specular =  (mShininess + 2.0f) / (2.0f * 3.141592654f) * mSpecular * 
                powf(clamp(max(dot(-wi, r), 0.0f)), mShininess);    
            
            // Lamberts model is (N.L)
            // Its weight is 1/pi
            // Note that color must be gamma-corrected
            Color diffuse = mDiffuse * max(dot(-wi, dg.Ng), 0.0f) / 3.141592654f;
                        
            // Result of BRDF is sum of diffuse and specular BRDFs
            // Note. to keep energy conserving, diffuse + specular <= 1! Think about this when 
            // defining the materials!
            return diffuse;
        }

        // Evaluate BRDF into color and auto-generate sample (output it)
        //
        // Evaluates single sample of BRDF (bidirectional reflectance distribution function) for
        // given point (dg). Incoming solid angle wi is auto-generated based on input sample 
        // parameters (location + normal), this sample is output. Radiance is evaluated into 
        // solid angle wo.
        //
        // Sample is generated into hemisphere above the given point (therefore 2 dimensional
        // sample location has to be provided, along with normal (read from dg)).
        //
        // Params:
        //      wo - Outgoing radiance direction
        //      dg - Point where the BRDF is computed
        //      wi - Incoming radiance direction (auto-generated this function)
        //      s - Sample location (for auto-generation)
        // Returns:
        //      Color for given sample
        //      wi - Generated incoming radiance direction
        virtual Color sample(const Vector3f& wo,
                             const DifferentialGeometry& dg,
                             Sample3f& wi,
                             const Vec2f& s) const
        {
            Vector3f tmp = cosineSampleHemisphere(s.x,s.y,dg.Ng);
            wi = tmp;
            //return Color(tmp.x * 0.5f + 0.5f, tmp.y * 0.5f + 0.5f, tmp.z * 0.5f + 0.5f);
            return mDiffuse * max(dot(wi, dg.Ng), 0.0f);
        }

        // Evaulate probability density function for given sampling direction
        // Params:
        //      wo - Outgoing radiance direction
        //      dg - Point where the BRDF is computed
        //      wi - Incoming radiance direction
        virtual float pdf(const Vector3f& wo,
                          const DifferentialGeometry& dg,
                          const Vector3f& wi) const 
        {
            return cosineSampleHemispherePDF(wi, dg.Ng);
        }
        
        virtual bool isEmissive() const
        {
            if (mIlluminationMode == 0)
            {
                return true;
            }
            
            return false;
        }
        
        // Whether the component is diffuse or not
        virtual bool isDiffuse() const
        {
            return true;
        }
    };
}

#endif