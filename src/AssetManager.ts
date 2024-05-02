import Entity from "./ECS/Entity";
import { Types } from "./Types";

export default class AssetManager 
{
    private constructor() {}

    // Submit asset to the appropriate container.
    public static SubmitShader(s : GPUShaderModule)                 : void { this.mShaders.push(s);}
    public static SubmitPipeline(p : GPURenderPipeline)             : void { this.mPipelines.push(p); }
    public static SubmitUBO(b : GPUBuffer)                          : void { this.mUBOs.push(b); }
    public static SubmitTexture(t : GPUTexture)                     : void { this.mTextures.push(t); }
    public static SubmitBindGroup(b : GPUBindGroup)                 : void { this.mBindGroups.push(b); }
    public static SubmitEntity(e : Entity)                          : void { this.mEntities.push(e); }

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