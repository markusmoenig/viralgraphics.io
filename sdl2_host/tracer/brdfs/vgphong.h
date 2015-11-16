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

#ifndef __VG_BRDF_H____PHONG__
#define __VG_BRDF_H____PHONG__

namespace embree
{
    // VG based BRDF, mirror material
    class VGBRDF_Phong : public VGBRDF
    {
    public:
        VGBRDF_Phong(Color diffuse,
               Color ambient,
               Color specular,
               float shininess,
               int mode) : VGBRDF(diffuse, ambient, specular, shininess, mode)
        {
            mDiffuse = diffuse;
            mAmbient = ambient;
            mSpecular = specular;
            mShininess = shininess;
            mIlluminationMode = mode;
        }
        
        virtual ~VGBRDF_Phong()
        {
        }
        
        virtual Color eval(const Vector3f& wo,
                           const DifferentialGeometry& dg,
                           const Vector3f& wi) const
        {
            // Reflection vector for phong model
            Vector3f r = reflect(-wo, dg.Ng);
            
            if (dot(r, -wi) < 0)
            {
                return Color(zero);
            }
            
            // Phong model is defined as (N.R)^n - a scalar dot product between normal and reflection 
            // vector
            // Its weight is (n+2)/(2*pi) - to keep Phong model normalized
            // Note that color must be gamma-corrected
            Color specular =  (mShininess + 2.0f) / (2.0f * 3.141592654f) * mSpecular * 
                powf(clamp(max(dot(-wi, r), 0.0f)), mShininess);    
                
            return specular;
        }

        virtual Color sample(const Vector3f& wo,
                             const DifferentialGeometry& dg,
                             Sample3f& wi,
                             const Vec2f& s) const
        {
            Vector3f r = reflect(-wo, dg.Ng);
            float angle = 3.141592654f / 2.0f - atan(mShininess);
            Vector3f tmp = uniformSampleCone(s.x, s.y, angle, r);
            //Vector3f tmp = cosineSampleHemisphere(s.x,s.y,dg.Ng);
            /*Vector3f tmp = normalize(Vector3f(rand() % 200000 - 100000, rand() % 200000 - 100000, rand() % 200000 - 100000));
            if (dot(tmp, dg.Ng) < 0)
            {
                tmp = -tmp;
            }*/
            wi = tmp;
            //return Color(tmp.x * 0.5f + 0.5f, tmp.y * 0.5f + 0.5f, tmp.z * 0.5f + 0.5f);
            return Color(powf(max(dot(wi, r), 0.0f), mShininess));
        }

        virtual float pdf(const Vector3f& wo,
                          const DifferentialGeometry& dg,
                          const Vector3f& wi) const 
        {
            return 0.0f;
        }
        
        virtual bool isDiffuse() const
        {
            return true;
        }
    };
}

#endif
