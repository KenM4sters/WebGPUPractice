import { Types } from "../Types";

export default class RenderWizard 
{
    constructor() {};

    // Submit.
    //
    public static SubmitUBO(u : GPUBuffer, assetIndex : Types.UBOs)                                : void { this.mUBOs[assetIndex] = u; }

    public static SubmitBindGroup(b : GPUBindGroup, assetIndex : Types.BindGroups)                 : void { this.mBindGroups[assetIndex] = b; }

    public static SubmitBindGroupLayout(bl : GPUBindGroupLayout, assetIndex : Types.BindGroups)    : void { this.mBindGroupLayouts[assetIndex] = bl; }

    public static SubmitShader(s : GPUShaderModule, assetIndex : Types.Shaders)                    : void { this.mShaders[assetIndex] = s;}

    public static SubmitPipeline(p : GPURenderPipeline, assetIndex : Types.Pipelines)              : void { this.mPipelines[assetIndex] = p;}

    

    // Get Single.
    //
    public static GetBindGroup(assetIndex : Types.BindGroups)  : GPUBindGroup { return this.mBindGroups[assetIndex]; }
    
    public static GetShader(assetIndex : Types.Shaders)        : GPUShaderModule { return this.mShaders[assetIndex]; }
    
    public static GetPipeline(assetIndex : Types.Pipelines)    : GPURenderPipeline { return this.mPipelines[assetIndex]; }
    
    public static GetUBO(assetIndex : Types.UBOs)              : GPUBuffer { return this.mUBOs[assetIndex]; }
    


    // Members.
    //
    private static mPipelines : GPURenderPipeline[] = [];

    private static mBindGroups : GPUBindGroup[] = [];

    private static mBindGroupLayouts : GPUBindGroupLayout[] = [];

    private static mUBOs : GPUBuffer[] = [];

    private static mShaders : GPUShaderModule[] = [];
}