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

#include "integrators/whittedintegrator.h"

namespace embree
{
    WhittedIntegrator::WhittedIntegrator(const Parms& parms)
        : lightSampleID(-1), firstScatterSampleID(-1), firstScatterTypeSampleID(-1)
    {
        maxDepth        = parms.getInt  ("maxDepth"       ,10    );
        epsilon         = parms.getFloat("epsilon"        ,32.0f)*float(ulp);
    }
  
  void WhittedIntegrator::requestSamples(Ref<SamplerFactory>& samplerFactory, const Ref<BackendScene>& scene)
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

    Color WhittedIntegrator::Li(LightPath& lightPath, const Ref<BackendScene>& scene, IntegratorState& state)
    {
        // Maximum path depth for whitted integrator
        if (lightPath.depth >= maxDepth)
            return zero;

        // Intersect ray against the scene
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
        Color L = zero;
        // Outgoing radiance direction (into camera, or previous hitpoint)
        const Vector3f wo = -lightPath.lastRay.dir;
        
        // Grab BRDF of the hit point
        CompositedBRDF brdfs;
        if (dg.material) 
        {
            dg.material->shade(lightPath.lastRay, lightPath.lastMedium, dg, brdfs);
        }
        
        // Loop through ALL lights (this is Whitted integrator, that goes over ALL lights)
        for (size_t i=0; i<scene->allLights.size(); i++)
        {
            // For inactive lights, continue
            if ((scene->allLights[i]->illumMask & dg.illumMask) == 0)
                continue;

            // Grab light sample
            LightSample ls;
            ls.L = scene->allLights[i]->sample(dg, ls.wi, ls.tMax, state.sample->getVec2f(lightSampleID));

            // Evaluate BRDF
            Color brdf = brdfs.eval(wo, dg, ls.wi, ALL);
            
            // Cast shadow ray
            Ray shadowRay(dg.P, ls.wi, dg.error*epsilon, ls.tMax-dg.error*epsilon, lightPath.lastRay.time,dg.shadowMask);
            rtcOccluded(scene->scene,(RTCRay&)shadowRay);
            state.numRays++;
            if (shadowRay) 
                return zero;
            
            // Accumulate light
            L += ls.L * brdf;
        }
        
        return L;
    }

  Color WhittedIntegrator::Li(Ray& ray, const Ref<BackendScene>& scene, IntegratorState& state) {
    LightPath path(ray); return Li(path,scene,state);
  }
}

