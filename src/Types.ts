import { BufferLayout } from "./Core/Buffer";

export namespace Types 
{            
    //----------------------------------------------------------------
    // Interfaces.
    //----------------------------------------------------------------  

    export interface Ref<T>
    {
        val : T;
    };
    
    export interface IApplicationLayer 
    {
        OnCanvasResize(w : number, h : number) : void;
        ListenToUserInput() : void;
    };

    export interface IRenderPass 
    {
        Desc : GPURenderPassDescriptor;
    }
    
    export interface IPrimitivePayload 
    {
        Vertices : Float32Array;
        BufferLayout : BufferLayout;
    };
    
    export interface IMeshUniforms 
    {
        ViewMatrix : GPUBuffer,
        ProjectionMatrix : GPUBuffer,
        Albedo : GPUBuffer
    };


    //----------------------------------------------------------------
    // Enumerations.
    //----------------------------------------------------------------
    
    export enum EDataType 
    {
        FLOAT, INT
    };

    export enum EntityAssets
    {
        Player = 0,
        Platform = 1,
        Level = 2,
    };

    export enum ComponentAssets
    {
        CameraComponent = 0,

        PlayerMaterialComponent = 1,
        PlayerTransformComponent = 2,
        PlayerGeometryComponent = 3,

        PlatformMaterialComponent = 4,
        PlatformInstanceTransformComponent = 5,
        PlatformGeometryComponent = 6,

        LevelMaterialComponent = 7,
        LevelInstanceTransformComponent = 8,
        LevelGeometryComponent = 9,
    };

    export enum BindGroupAssets 
    {
        CameraGroup = 0,

        PlayerMaterialBindGroup = 1,
        PlayerTransformBindGroup = 2,

        PlatformMaterialBindGroup = 3,
        PlatformTransformBindGroup = 4,

        LevelMaterialBindGroup = 5,
        LevelInstanceTransformBindGroup = 6,
    };

    export enum BindGroupLayoutAssets 
    {
        CameraGroupLayout = 0,

        BasicMaterialBindGroupLayout = 1,
        BasicTransformBindGroupLayout = 2,
    };

    export enum ShaderAssets 
    {
        BasicShader = 0,
        LevelShader = 1,
    };

    export enum UBOAssets 
    {
        CameraUBO = 0,

        PlayerMaterialUBO = 1,
        PlayerTransformUBO = 2,

        PlatformMaterialUBO = 3,
        PlatformTransformUBO = 4,

        LevelMaterialUBO = 5,
        LevelInstanceTransformUBO = 6,
    };

    export enum TextureAssets 
    {
        BrickTexture = 0,
        MetalTexture = 1,
        MarbleTexture = 2
    };

    export enum PipelineAssets 
    {
        SimpleSquareRenderPipeline = 0,
        LevelRenderPipeline = 1,
    };

};