import * as glm from "gl-matrix";
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

    export interface GridCell 
    {
        Position : { x : number, y : number};
        Size : { x : number, y : number};
    };

    export interface PhysicsConfig 
    {
        Velocity : glm.vec3;
        Acceleration : glm.vec3;
        Mass : number;
    };

    export interface InstancedPhysicsConfig 
    {
        Velocity : glm.vec3[];
        Acceleration : glm.vec3[];
        Mass : number[];
    };

    export interface TransformConfig 
    {
        ModelMatrix : glm.mat4;
        FloatArray : Float32Array;
    };


    export interface InstancedTransformConfig 
    {
        ModelMatrices : glm.mat4[];
        FloatArray : Float32Array;
    };
    
    export interface SpriteConfig 
    {
        Label : string;
        Position : glm.vec3;
        Size : glm.vec3;
        Cells : number[]; 
        Transforms : TransformConfig;
        Physics : PhysicsConfig | undefined;
    };

    export interface InstancedSpriteConfig 
    {
        Label : string;
        Position : glm.vec3[];
        Size : glm.vec3[];
        Cells : number[]; 
        Transforms : InstancedTransformConfig;
        Physics : InstancedPhysicsConfig | undefined;
    };

    //----------------------------------------------------------------
    // Renderer.
    //----------------------------------------------------------------  
    
    export interface IApplicationLayer 
    {
        OnCanvasResize(w : number, h : number) : void;
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
        PlayerGeometryComponent = 2,
        PlayerSpriteComponent = 3,

        LevelMaterialComponent = 4,
        LevelGeometryComponent = 5,
        LevelSpriteComponenet = 6,
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