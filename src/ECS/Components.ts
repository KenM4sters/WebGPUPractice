import * as glm from "gl-matrix";
import { BufferAttribute, BufferLayout } from "../Core/Buffer";
import { Types } from "../Types";
import { Primitives } from "../Core/Primitives";

export abstract class Component 
{
    constructor(public readonly mLabel : string) {}
};

export class CameraComponent extends Component
{
    constructor(label : string, projMat : glm.mat4, viewMat : glm.mat4, pos : glm.vec3) 
    {
        super(label);

        this.mProjectionMatrix = projMat;
        this.mViewMatrix = viewMat;
        this.mPosition = pos;
    }

    public readonly mProjectionMatrix : glm.mat4 = glm.mat4.create();
    public readonly mViewMatrix : glm.mat4 = glm.mat4.create();
    public readonly mPosition : glm.vec3 = glm.vec3.create();
};


export class MaterialComponent extends Component 
{
    constructor(label : string, shaderIndex : Types.ShaderAssets, albedo : glm.vec3 | GPUTexture = glm.vec3.fromValues(1.0, 0.0, 0.0)) 
    {
        super(label);

        this.mShaderAssetIndex = shaderIndex;
        this.mAlbedo = albedo;  
    }

    public mAlbedo : glm.vec3 | GPUTexture;
    public mShaderAssetIndex : Types.ShaderAssets;

}


export class SquareGeometryComponent extends Component 
{
    constructor(label : string, device : GPUDevice, instanceCount : number = 1) 
    {
        super(label);

        this.mInstanceCount = instanceCount;

        const vertices : Float32Array = Primitives.SQUARE_VERTICES;
        const bufferLayout = new BufferLayout([
            new BufferAttribute("SquarePositionAttrib", 0, "float32x3")
        ]);

        this.mData = 
        {
            Vertices: vertices,
            BufferLayout: bufferLayout
        };
        this.mGPUBuffer = device.createBuffer({
            label: `${this.mLabel + `_Buffer`}`,
            size: this.mData.Vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });        
    }

    public readonly mData : Types.IPrimitivePayload;
    public readonly mGPUBuffer : GPUBuffer;
    public readonly mInstanceCount : number;
}



export class TransformComponent extends Component 
{
    constructor(label : string, transformMats : glm.mat4[], floatArray ?: Float32Array) 
    {
        super(label);

        this.mModelMatrices = transformMats;
        if(floatArray) this.mFloatArray = floatArray;
        else {
            this.mFloatArray = new Float32Array(this.mModelMatrices.length * 16);
            let offset = 0;
            for(const mat of this.mModelMatrices) 
            {
                this.mFloatArray.set(mat, offset);
                offset += 16;
            }
        }

    }
    public mModelMatrices : glm.mat4[];
    public mFloatArray : Float32Array;
}


export class SpriteComponent extends Component 
{
    constructor(label : string, position : glm.vec3[], size : glm.vec3[]) 
    {
        super(label);
        this.mPosition = position;
        this.mSize = size;
    }

    public readonly mPosition : glm.vec3[] = [];
    public readonly mSize : glm.vec3[] = [];
}

export class PhysicsComponent extends Component 
{
    constructor(label : string, mass : number[] = [1.0], 
        velocity : glm.vec3[] = [glm.vec3.fromValues(0.0, 0.0, 0.0)], 
        acceleration : glm.vec3[] = [glm.vec3.fromValues(0.0, 0.0, 0.0)]) 
    {
        super(label);
        this.mMass = mass;
        this.mVelocity = velocity;
        this.mAcceleration = acceleration;
    }

    public readonly mMass : number[];
    public readonly mVelocity : glm.vec3[];
    public readonly mAcceleration : glm.vec3[];
}


export abstract class SceneComponent 
{
    constructor() 
    {   

    }   
    
    public abstract Prepare(device : GPUDevice) : void;
    public abstract LoadAndGenerateAssets(device : GPUDevice) : void;
};