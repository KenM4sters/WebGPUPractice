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

export class SpriteComponent extends Component 
{
    constructor(c : Types.SpriteConfig) 
    {
        super(c.Label);

        this.mPosition = c.Position;
        this.mSize = c.Size;
        this.mPhysics = c.Physics;
        this.mModelMatrix = c.Transforms.ModelMatrix;
        this.mCells = c.Cells;
        this.mFloatArray = c.Transforms.FloatArray;
    }

    public mPosition : glm.vec3;
    public mSize : glm.vec3;
    public mCells : number[]; 

    public mPhysics : Types.PhysicsConfig | undefined;

    public mModelMatrix : glm.mat4;
    public mFloatArray : Float32Array;
}


export class InstancedSpriteComponent extends Component 
{
    constructor(c : Types.InstancedSpriteConfig) 
    {
        super(c.Label);

        this.mPosition = c.Position;
        this.mSize = c.Size;

        this.mPhysics = c.Physics;
        
        this.mModelMatrices = c.Transforms.ModelMatrices;
        if(c.Transforms.FloatArray) this.mFloatArray = c.Transforms.FloatArray;
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

    public mPosition : glm.vec3[] = [];
    public mSize : glm.vec3[] = [];
    public mQuadrants : number[] = []; 

    public mPhysics : Types.InstancedPhysicsConfig | undefined;

    public mModelMatrices : glm.mat4[] = [];
    public mFloatArray : Float32Array;
}


export abstract class SceneComponent 
{
    constructor() 
    {   

    }   
    
    public abstract Prepare(device : GPUDevice) : void;
    public abstract LoadAndGenerateAssets(device : GPUDevice) : void;
};