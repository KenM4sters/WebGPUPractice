import * as glm from "gl-matrix";
import { BufferLayout } from "./Core/Buffer";
import { Camera, InstancedSprite, Material, Sprite, SquareGeometry } from "./ECS/Components";

export namespace Types 
{            
    //----------------------------------------------------------------
    // General Purpose.
    //----------------------------------------------------------------  

    export interface Ref<T>
    {
        val : T;
    }; 

    export interface Cell 
    {
        Position : { x : number, y : number};
        Size : { x : number, y : number};
    };

    export interface ComponentConfig 
    {
        EntityUUID : number;
    }

    export interface ICollisionBody extends Cell
    {
        ParentEntity ?: Types.Entities;
        InstanceIndex ?: number;
    };

    export interface CameraConfig extends ComponentConfig
    {
        Label : string;
        Projection : glm.mat4;
        View : glm.mat4;
        Position : glm.vec3
    };

    export interface MaterialConfig extends ComponentConfig 
    {
        Label : string;
        ShaderIndex : Types.Shaders;
        Albedo : glm.vec3 | Types.TextureAssets;
    };

    export interface SquareGeometryConfig extends ComponentConfig 
    {
        Label : string;
        Device : GPUDevice;
        InstanceCount : number;
    }

    export interface PhysicsConfig<T extends glm.vec3 | glm.vec3[], M extends number | number[]> 
    {
        Velocity : T;
        Acceleration : T;
        Mass : M;
    };

    export interface TransformConfig<T extends glm.mat4 | glm.mat4[]> 
    {
        Model : T;
        FloatArray : Float32Array;
    };
    
    export interface SpriteConfig extends ComponentConfig
    {
        Label : string;
        Position : glm.vec3;
        Size: glm.vec3;
        Collider : ICollisionBody;
        Transforms : TransformConfig<glm.mat4>;
        Physics ?: PhysicsConfig<glm.vec3, number>;
    };

    export interface InstancedSpriteConfig extends ComponentConfig
    {
        Label : string;
        Position : glm.vec3[];
        Size: glm.vec3[];
        Collider : ICollisionBody[];
        Transforms : TransformConfig<glm.mat4[]>;
        Physics ?: PhysicsConfig<glm.vec3[], number[]>;
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

    export enum BindGroups 
    {
        CameraGroup = 0,

        PlayerMaterialBindGroup = 1,
        PlayerTransformBindGroup = 2,

        EnemyMaterialBindGroup = 3,
        EnemyInstanceTransformBindGroup = 4,
        
        BackgroundMaterialBindGroup = 5,
        BackgroundTransformBindGroup = 6,
    };

    export enum BindGroupLayouts 
    {
        CameraGroupLayout = 0,

        BasicMaterialBindGroupLayout = 1,
        BasicTransformBindGroupLayout = 2,
    };

    export enum Shaders 
    {
        BasicShader = 0,
        EnemyShader = 1,
    };

    export enum UBOs
    {
        CameraUBO = 0,

        PlayerMaterialUBO = 1,
        PlayerTransformUBO = 2,

        EnemyMaterialUBO = 3,
        EnemyInstanceTransformUBO = 4,

        BackgroundMaterialUBO = 5,
        BackgroundTransformUBO = 6,
    };

    export enum TextureAssets 
    {
        BrickTexture = 0,
        MetalTexture = 1,
        MarbleTexture = 2
    };

    export enum Pipelines 
    {
        SimpleSquareRenderPipeline = 0,
        EnemyRenderPipeline = 1,
    };


    export type Components = 
    Material 
    | Camera 
    | SquareGeometry 
    | Sprite 
    | InstancedSprite;


    export type ComponentName = 
    "Camera"
    | "Materials"
    | "Geometries"
    | "Sprites"

};