import { BufferLayout } from "./Core/Buffer";

export namespace Types 
{            
    //----------------------------------------------------------------
    // General Purpose.
    //----------------------------------------------------------------  

    export interface Ref<T>
    {
        val : T;
    }; 

    //----------------------------------------------------------------
    // Renderer.
    //----------------------------------------------------------------  

    
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

    export enum EDataType 
    {
        FLOAT, INT
    };

    //----------------------------------------------------------------
    // Asset Types.
    //----------------------------------------------------------------
    

    export enum EntityAssets
    {
        Player = 0,
        Level = 1,
    };

    export enum ComponentAssets
    {
        CameraComponent = 0,

        PlayerMaterialComponent = 1,
        PlayerTransformComponent = 2,
        PlayerGeometryComponent = 3,
        PlayerSpriteComponent = 4,
        PlayerPhysicsComponent = 5,

        LevelMaterialComponent = 6,
        LevelInstanceTransformComponent = 7,
        LevelGeometryComponent = 8,
        LevelSpriteComponenet = 9,
    };

    export enum BindGroupAssets 
    {
        CameraGroup = 0,

        PlayerMaterialBindGroup = 1,
        PlayerTransformBindGroup = 2,

        LevelMaterialBindGroup = 3,
        LevelInstanceTransformBindGroup = 4,
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

        LevelMaterialUBO = 3,
        LevelInstanceTransformUBO = 4,
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