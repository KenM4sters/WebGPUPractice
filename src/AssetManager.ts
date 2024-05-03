import Entity from "./ECS/Entity";
import { Types } from "./Types";

export default class AssetManager 
{
    private constructor() {}

    // Submit asset to the appropriate container.
    public static SubmitShader(s : GPUShaderModule, assetIndex : Types.ShaderAssets)            : void { this.mShaders[assetIndex] = s;}
    public static SubmitPipeline(p : GPURenderPipeline, assetIndex : Types.PipelineAssets)      : void { this.mPipelines[assetIndex] = p; }
    public static SubmitUBO(b : GPUBuffer, assetIndex : Types.UBOAssets)                        : void { this.mUBOs[assetIndex] = b; }
    public static SubmitTexture(t : GPUTexture, assetIndex : Types.TextureAssets)               : void { this.mTextures[assetIndex] = t; }
    public static SubmitBindGroup(b : GPUBindGroup, assetIndex : Types.BindGroupAssets)         : void { this.mBindGroups[assetIndex] = b; }
    public static SubmitEntity(e : Entity, assetIndex : Types.EntityAssets)                     : void { this.mEntities[assetIndex] = e; }

    // Get by index.
    public static GetShader(assetIndex : Types.ShaderAssets)        : GPUShaderModule { return this.mShaders[assetIndex]; }
    public static GetPipeline(assetIndex : Types.PipelineAssets)    : GPURenderPipeline { return this.mPipelines[assetIndex]; }
    public static GetUBO(assetIndex : Types.UBOAssets)              : GPUBuffer { return this.mUBOs[assetIndex]; }
    public static GetTexture(assetIndex : Types.TextureAssets)      : GPUTexture { return this.mTextures[assetIndex]; }
    public static GetBindGroup(assetIndex : Types.BindGroupAssets)  : GPUBindGroup { return this.mBindGroups[assetIndex]; }
    public static GetEntity(assetIndex : Types.EntityAssets)        : Entity { return this.mEntities[assetIndex]; }

    // Get all.
    public static GetAllEntities() : Entity[] { return this.mEntities; }



    // Private containers.

    private static mPipelines : GPURenderPipeline[] = [];

    private static mBindGroups : GPUBindGroup[] = [];

    private static mUBOs : GPUBuffer[] = [];

    private static mShaders : GPUShaderModule[] = [];

    private static mTextures : GPUTexture[] = [];

    private static mEntities : Entity[] = [];

};