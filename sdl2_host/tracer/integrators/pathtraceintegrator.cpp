// ======================================================================== //
// Copyright 2009-2013 Intel Corporation                                    //
//                                                                          //
// Licensed under the Apache License, Version 2.0 (the "License");          //
// you may not use this file except in compliance with the License.         //
// You may obtain a copy of the License at                                  //
//                                                                          //
//     http://www.apache.org/licenses/LICENSE-2.0                           //
//                                                                          //
// Unless required by applicable law or agreed to in writing, software      //
// distributed under the License is distributed on an "AS IS" BASIS,        //
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. //
// See the License for the specific language governing permissions and      //
// limitations under the License.                                           //
// ======================================================================== //

#include "integrators/pathtraceintegrator.h"

namespace embree
{
  PathTraceIntegrator::PathTraceIntegrator(const Parms& parms)
    : lightSampleID(-1), firstScatterSampleID(-1), firstScatterTypeSampleID(-1), sampleLightForGlossy(false)
  {
    maxDepth        = parms.getInt  ("maxDepth"       ,10    );
    minContribution = parms.getFloat("minContribution",0.01f );
    epsilon         = parms.getFloat("epsilon"        ,32.0f)*float(ulp);
    backplate       = parms.getImage("backplate");
    sampleLightForGlossy = parms.getInt  ("sampleLightForGlossy",0);
  }
  
  void PathTraceIntegrator::requestSamples(Ref<SamplerFactory>& samplerFactory, const Ref<BackendScene>& scene)
  {
    precomputedLightSampleID.resize(scene->allLights.size());

    lightSampleID = samplerFactory->request2D();
    for (size_t i=0; i<scene->allLights.size(); i++) {
      precomputedLightSampleID[i] = -1;
      if (scene->allLights[i]->precompute())
        precomputedLightSampleID[i] = samplerFactory->requestLightSample(lightSampleID, scene->allLights[i]);
    }
    firstScatterSampleID = samplerFactory->request2D((int)maxDepth);
    firstScatterTypeSampleID = samplerFactory->request1D((int)maxDepth);
  }

    Color PathTraceIntegrator::Li(LightPath& lightPath, const Ref<BackendScene>& scene, IntegratorState& state)
    {
        // Cut path off when it reaches the max depth
        if (lightPath.depth >= maxDepth)
            return zero;

        // Cast ray into scene
        DifferentialGeometry dg;
        rtcIntersect(scene->scene,(RTCRay&)lightPath.lastRay);
        scene->postIntersect(lightPath.lastRay,dg);
        state.numRays++;
    
        // Return black color when nothing was hit
        if (!lightPath.lastRay)
        {
            return zero;
        }
        
        // Color accumulator
        Color L = Color(zero);
        // Radiance outgoing direction
        const Vector3f wo = -lightPath.lastRay.dir;
        
        // Grab BRDF of the hit point
        CompositedBRDF brdfs;
        if (dg.material) 
        {
            dg.material->shade(lightPath.lastRay, lightPath.lastMedium, dg, brdfs);
        }
        
        // Depending on whether it is diffuse component, do sampling
        
        if (brdfs.get(0)->isDiffuse())
        {  
            Color intensity;
            Vector3f ls = scene->getLightPoint(intensity);
            float distance = length(ls - dg.P) - 1.0f;
            Vector3f wi = normalize(ls - dg.P);
            
            if (brdfs.get(0)->isEmissive())
            {
                if (lightPath.ignoreVisibleLights == false)
                {
                    L += Color(one) * intensity;
                }
            }
            else
            {
                // Evaluate BRDF
                Color brdf = brdfs.eval(wo, dg, wi, ALL);
                
                // Cast shadow ray
                Ray shadowRay(dg.P, wi, dg.error*epsilon, distance-dg.error*epsilon, lightPath.lastRay.time,dg.shadowMask);
                rtcOccluded(scene->scene,(RTCRay&)shadowRay);
                state.numRays++;
                if (!shadowRay)
                {
                    L += brdf * intensity;
                }
            
                // Integration part (cosine-weighted distribution - importance sampling)
                if (lightPath.depth < maxDepth)
                {
                    // Get BRDF sample
                    Sample3f wi;
                    BRDFType giBRDFTypes = (BRDFType)(ALL);
                    BRDFType directLightingBRDFTypes = (BRDFType)(ALL); 
                    Vec2f s = state.sample->getVec2f(firstScatterSampleID + lightPath.depth);
                    Color c = brdfs.get(0)->sample(wo, dg, wi, s);
                    
                    // Generate next path step direction
                    // Diffuse only now, importance sampling for diffuse surfaces
                    Vector3f d = cosineSampleHemisphere(s.x, s.y, -dg.Ng);
                    Ray r = Ray(dg.P, d, dg.error*epsilon, inf, lightPath.lastRay.time);
                    
                    // Continue the path!
                    if (c != Color(zero))
                    {
                        LightPath scatteredPath = lightPath.extended(r, Medium::Vacuum(), c, false);
                        scatteredPath.ignoreVisibleLights = true;
                        L += c * Li(scatteredPath, scene, state);
                    }
                }
            }
        }
        // Specular BRDFs
        else
        {
            // Integration part (perfect reflection or refraction - importance sampling)
            if (lightPath.depth < maxDepth)
            {
                // Get BRDF sample
                Sample3f wi;
                BRDFType giBRDFTypes = (BRDFType)(ALL);
                BRDFType directLightingBRDFTypes = (BRDFType)(ALL); 
                Vec2f s = state.sample->getVec2f(firstScatterSampleID + lightPath.depth);
                Color c = brdfs.get(0)->sample(wo, dg, wi, s);
                                
                // Generate next path step direction
                // Diffuse only now, importance sampling for diffuse surfaces
                Ray r = Ray(dg.P + wi * 0.01f, wi, dg.error*epsilon, inf, lightPath.lastRay.time);
                
                // Continue the path!
                if (c != Color(zero))
                {
                    LightPath scatteredPath = lightPath.extended(r, Medium::Vacuum(), c, false);
                    scatteredPath.ignoreVisibleLights = false;
                    L += c * Li(scatteredPath, scene, state);
                }
            }
        }
        
        return L;
    }

  Color PathTraceIntegrator::Li(Ray& ray, const Ref<BackendScene>& scene, IntegratorState& state) {
    LightPath path(ray); return Li(path,scene,state);
  }
}

