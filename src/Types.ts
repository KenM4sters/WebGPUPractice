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
    }

    export enum BindGroupAssets 
    {
        CameraGroup = 0,
        BasicMaterialGroup = 1,
        TransformGroup = 2
    };

    export enum ShaderAssets 
    {
        BasicMaterial = 0,
    };

    export enum UBOAssets 
    {
        CameraUBO = 0,
        BasicMaterialUBO = 1,
        TransformUBO = 2
    };

    export enum TextureAssets 
    {
        BrickTexture = 0,
        MetalTexture = 1,
        MarbleTexture = 2
    };

    export enum PipelineAssets 
    {
        BasicSpritePipeline = 0,
    };

};