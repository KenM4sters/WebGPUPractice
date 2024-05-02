import { BufferLayout } from "./Core/Buffer";

export namespace Types 
{                        
    export interface Ref<T>
    {
        val : T;
    };
    
    export interface IRenderLayer 
    {
        Draw(ts : number) : void;
        Resize() : void;
        Respond() : void;
    };
    
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

    export enum RenderBindGroups 
    {
        CameraGroup = 0,
        MaterialGroup = 1,
        TransformGroup = 2
    }
}