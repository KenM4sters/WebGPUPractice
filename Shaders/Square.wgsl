@group(0) @binding(0) var<uniform> model: mat4x4<f32>;

@vertex
fn mainVert(@location(0) pos: vec3f) -> @builtin(position) vec4f
{
    var modelPos: vec4f = model * vec4f(pos, 1.0);
    return modelPos;
}

@fragment
fn mainFrag() -> @location(0) vec4f 
{
    return vec4f(0.0, 0.5, 1.0, 1.0);
}