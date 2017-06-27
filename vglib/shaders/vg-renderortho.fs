#version 100
precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uColorMap, uMap;
uniform vec2 uMapRatio, uSize;

uniform bool uLight1Enabled, uLight2Enabled, uLight3Enabled;
uniform float uLight1Ambient, uLight2Ambient, uLight3Ambient;
uniform vec3 uLight1Pos, uLight2Pos, uLight3Pos;
uniform vec3 uLight1Color, uLight2Color, uLight3Color;

vec2 sceneToMap( in vec3 pos )
{
    vec2 mapPos=vec2( (pos.x / uSize.x) * uMapRatio.x, (pos.z / uSize.y) * uMapRatio.y);
    return mapPos;
}

float map( in vec3 pos )
{
    float h = pos.y - texture2D( uMap, sceneToMap( pos ) ).a;
    return h;
}

float softshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax )
{
    float res = 1.0;
    float t = mint;
    for( int i=0; i<16; i++ )
    {
        vec3 pos=ro + rd * t;
        float h = map( pos );

        res = min( res, 8.0*h/t );
        t += clamp( h, 0.02, 0.10 );
        // t+=0.02;
        // t+=0.002;
        if( h<0.001 || t>tmax ) break;
    }
    return clamp( res, 0.0, 1.0 );

}
/*
float softshadow( in vec3 ro, in vec3 rd, in float distance, float k )
{
    float res = 1.0, delta=distance / 150.0;
    float t=delta;

    for( int j=0; j< 150; j++ )
    {
        //float h = map(ro + rd*t);

        vec3 pos=ro + rd * t;
        vec2 scenePos=vec2( pos.x / uSize.x, pos.z / uSize.y );

        float h = texture2D( uMap, vec2( scenePos.x * uMapRatio.x, scenePos.y*uMapRatio.y ) ).a;

        if( pos.y - h < 0.01 )
            return 0.0;

        res = min( res, k*h/t );
        t += delta;//h;
    }
    return res;
}*/

vec3 calcNormal( in vec3 pos )
{
    // --- Compute the heightmap normal

    vec2 offsets[4];
    float u = 1.0 / uSize.x;
    float v = 1.0 / uSize.y;

    // vec2 uv = sceneToMap( pos );

    vec2 uv=vec2( pos.x / uSize.x, pos.z / uSize.y );


    offsets[0] = uv + vec2(-u, 0);
    offsets[1] = uv + vec2( u, 0);
    offsets[2] = uv + vec2( 0, -v);
    offsets[3] = uv + vec2( 0, v);

    float hts[4];
    for(int i = 0; i < 4; i++)
    {
        hts[i] = texture2D( uMap, vec2( offsets[i].x * uMapRatio.x, offsets[i].y*uMapRatio.y ) ).a;
    }

    vec2 _step = vec2(1.0, 0.0);

    vec3 va = normalize( vec3(_step.xy, hts[1]-hts[0]) );
    vec3 vb = normalize( vec3(_step.yx, hts[3]-hts[2]) );

    vec3 normal = cross(va,vb).rbg;

    return normal;
}

struct Light {
    bool enabled;
    vec3 pos;
    vec3 color;
    float ambient;
};
Light lights[3];

float G1V ( float dotNV, float k ) {
    return 1.0 / (dotNV*(1.0 - k) + k);
}

vec3 computePBRLighting ( in Light light, in vec3 position, in vec3 N, in vec3 V, in vec3 albedo, in float roughness, in vec3 F0 ) {

    float alpha = roughness*roughness;
    vec3 L = normalize(light.pos.xyz - position);
    vec3 H = normalize (V + L);

    float dotNL = clamp (dot (N, L), 0.0, 1.0);
    float dotNV = clamp (dot (N, V), 0.0, 1.0);
    float dotNH = clamp (dot (N, H), 0.0, 1.0);
    float dotLH = clamp (dot (L, H), 0.0, 1.0);

    float D, vis;
    vec3 F;

    // NDF : GGX
    float alphaSqr = alpha*alpha;
    float pi = 3.1415926535;
    float denom = dotNH * dotNH *(alphaSqr - 1.0) + 1.0;
    D = alphaSqr / (pi * denom * denom);

    // Fresnel (Schlick)
    float dotLH5 = pow (1.0 - dotLH, 5.0);
    F = F0 + (1.0 - F0)*(dotLH5);

    // Visibility term (G) : Smith with Schlick's approximation
    float k = alpha / 2.0;
    vis = G1V (dotNL, k) * G1V (dotNV, k);

    vec3 specular = /*dotNL **/ D * F * vis;

    vec3 ambient = vec3( light.ambient );

    float invPi = 0.31830988618;
    vec3 diffuse = (albedo * invPi);


    return ambient + (diffuse + specular) * light.color.xyz * dotNL;
}

vec3 addPBR( in vec3 position, in vec3 N, in vec3 V, in vec3 baseColor, in float metalMask, in float smoothness, in float reflectance) {
    vec3 color = vec3(0.0);

    float roughness = 1.0 - smoothness*smoothness;
    vec3 F0 = 0.16*reflectance*reflectance * (1.0-metalMask) + baseColor*metalMask;
    vec3 albedo = baseColor;

    float s = 0.0;


    for ( int i = 0; i < 3; ++i )
    {
        if ( lights[i].enabled == false ) continue;

        vec3 col = computePBRLighting ( lights[i], position, N, V, albedo, roughness, F0);
        color += col;
        s += softshadow( position, normalize(lights[i].pos.xyz - position), 1.0, 100.0 );//0.02, 2.5 );
    }

    return color*s;
}

vec4 render_pbr( in vec3 ro, in vec3 rd, in vec3 pos, in vec4 color, in vec4 material )
{
    lights[0] = Light( uLight1Enabled, uLight1Pos, uLight1Color, uLight1Ambient );
    lights[1] = Light( uLight2Enabled, uLight2Pos, uLight2Color, uLight2Ambient );
    lights[2] = Light( uLight3Enabled, uLight3Pos, uLight3Color, uLight3Ambient );

    vec3 col=color.xyz;

    col = addPBR( pos, calcNormal( pos ), -rd, col, material.x, material.y, material.z );

    // --- Gamma Correction
    col = pow( col, vec3(0.4545) );

    return vec4( col, color.a );
}

void main()
{
    vec4 color=vec4( 0, 0, 0, 1);

    vec3 ro, rd;
    float dist;

    ro=vec3( uSize.x * vTexCoord.x, 1.0, uSize.y * vTexCoord.y );
    rd=vec3( uSize.x * vTexCoord.x, 0, uSize.y * vTexCoord.y ) - ro;
    normalize( rd );

    dist=1.0 - texture2D( uMap, vec2( vTexCoord.x * uMapRatio.x, vTexCoord.y*uMapRatio.y ) ).a;

    // ---

    vec3 pos=ro + rd * dist;
    vec2 mapPos=sceneToMap( pos );

    color = texture2D( uColorMap, mapPos );

    vec4 material = texture2D( uMap, mapPos );

    // material.x/=material.a;
    // material.y/=material.a;
    // material.z/=material.a;

    if ( color.a != 0.0 )
        color = render_pbr( ro, rd, pos, color, material );

    // color.r/=color.a;
    // color.g/=color.a;
    // color.b/=color.a;

    gl_FragColor = color;
}