import { BufferLayout } from "./Buffer";

//---------------------------------------------------
// Interfaces
//---------------------------------------------------

export interface Ref<T>
{
    val : T;
};

export interface IAppPayload 
{
    Canvas : HTMLCanvasElement;
    Device : GPUDevice
};

export interface IRenderLayer 
{
    Draw() : void;
    Resize() : void;
    Respond() : void;
};

export interface IPrimitivePayload 
{
    Vertices : Float32Array;
    BufferLayout : BufferLayout;
};

//---------------------------------------------------
// Native Interfaces
//---------------------------------------------------



//---------------------------------------------------
// Enums
//---------------------------------------------------

export enum EDataType 
{
    FLOAT, INT
};
