import * as glm from "gl-matrix"

export class Material 
{
    constructor(label : string, vert : GPUShaderModule, frag : GPUShaderModule) 
    {
        this.mLabel = label;
        this.mVertexModule = vert;
        this.mFragmentModule = frag;
    }

    public Albedo : glm.vec3 = glm.vec3.fromValues(0.3, 0.8, 1.0);

    public readonly mVertexModule : GPUShaderModule;
    public readonly mFragmentModule : GPUShaderModule;
    public readonly mLabel : string;
}
