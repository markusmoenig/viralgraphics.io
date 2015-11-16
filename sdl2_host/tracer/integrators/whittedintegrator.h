#ifndef __VG_WHITTED_INTEGRATOR_H__
#define __VG_WHITTED_INTEGRATOR_H__

#include "integrators/integrator.h"
#include "renderers/renderer.h"
#include "image/image.h"

namespace embree
{
    class WhittedIntegrator : public Integrator
    {
        // LightPath class
        //
        // Describes light path itself
        class __align(16) LightPath
        {
        public:
            __forceinline LightPath (const Ray& ray, const Medium& medium = Medium::Vacuum(), const int depth = 0,
                const Color& throughput = one, const bool ignoreVisibleLights = false, const bool unbend = true)
                : lastRay(ray), lastMedium(medium), depth(depth), throughput(throughput), ignoreVisibleLights(ignoreVisibleLights), unbend(unbend) {}

            __forceinline LightPath extended(const Ray& nextRay, const Medium& nextMedium, const Color& weight, const bool ignoreVL) const {
            return LightPath(nextRay, nextMedium, depth+1, throughput*weight, ignoreVL, unbend && (nextRay.dir == lastRay.dir));
        }

        public:
            Ray lastRay;
            Medium lastMedium;
            uint32 depth;
            Color throughput;
            bool ignoreVisibleLights;
            bool unbend;
        };

    public:
        // Constructs whitted integrator from params
        WhittedIntegrator(const Parms& parms);

        // Sampler generator
        void requestSamples(Ref<SamplerFactory>& samplerFactory, const Ref<BackendScene>& scene);

        // Quick test whether given light path is occluded)
        bool occluded(LightPath& lightPath, const Ref<BackendScene>& scene);

        // Evaluate light path radiance (e.g. evaluate single sample)
        Color Li(LightPath& lightPath, const Ref<BackendScene>& scene, IntegratorState& state);

        // Evaluate single ray (generates light paths and evaluates light path)
        Color Li(Ray& ray, const Ref<BackendScene>& scene, IntegratorState& state);

    private:
        // Parameters (unused)
        size_t maxDepth;               // Max recursion depth
        float epsilon;                 // Eps for intersections

    private:
        // Random variables
        int lightSampleID;                          // Sampling light (2D)
        int firstScatterSampleID;                   // Sampling BRDF (2D)
        int firstScatterTypeSampleID;               // Sampling BRDF type (1D)
        std::vector<int> precomputedLightSampleID;  // For case of precomputing light samples
    };
}

#endif
