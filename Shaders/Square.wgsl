@vertex
fn mainVert(@location(0) pos: vec3f) -> @builtin(position) vec4f
{
    return vec4f(pos, 1.0);
}

@fragment
fn mainFrag() -> @location(0) vec4f 
{
    return vec4f(0.0, 0.5, 1.0, 1.0);
}