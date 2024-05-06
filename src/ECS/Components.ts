import * as glm from "gl-matrix";
import { BufferAttribute, BufferLayout } from "../Core/Buffer";
import { Types } from "../Types";
import { Primitives } from "../Core/Primitives";

export abstract class Component 
{
    constructor(public readonly mLabel : string, public readonly entityUUID : number) {}
};

export class Camera extends Component
{
    constructor(c : Types.CameraConfig) 
    {
        super(c.Label, c.EntityUUID);

        this.mProjectionMatrix = c.Projection;
        this.mViewMatrix = c.View;
        this.mPosition = c.Position;
    }

    public readonly mProjectionMatrix : glm.mat4 = glm.mat4.create();
    public readonly mViewMatrix : glm.mat4 = glm.mat4.create();
    public readonly mPosition : glm.vec3 = glm.vec3.create();
};


export class Material extends Component 
{
    constructor(c : Types.MaterialConfig) 
    {
        super(c.Label, c.EntityUUID);

        this.mShaderAssetIndex = c.ShaderIndex;
        this.mAlbedo = c.Albedo;  
    }

    public mAlbedo : glm.vec3 | Types.TextureAssets;
    public mShaderAssetIndex : Types.Shaders;
};


export class SquareGeometry extends Component 
{
    constructor(c : Types.SquareGeometryConfig) 
    {
        super(c.Label, c.EntityUUID);

        this.mInstanceCount = c.InstanceCount;

        const vertices : Float32Array = Primitives.SQUARE_VERTICES;
        const bufferLayout = new BufferLayout([
            new BufferAttribute("SquarePositionAttrib", 0, "float32x3")
        ]);

        this.mData = 
        {
            Vertices: vertices,
            BufferLayout: bufferLayout
        };
        this.mGPUBuffer = c.Device.createBuffer({
            label: `${this.mLabel + `_Buffer`}`,
            size: this.mData.Vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });        
    }

    public readonly mData : Types.IPrimitivePayload;
    public readonly mGPUBuffer : GPUBuffer;
    public readonly mInstanceCount : number;
};

export class Sprite extends Component 
{
    constructor(c : Types.SpriteConfig) 
    {
        super(c.Label, c.EntityUUID);

        this.mPosition = c.Position;
        this.mSize = c.Size;
        this.mCollider = c.Collider;
        this.mPhysics = c.Physics;
        this.mModelMatrix = c.Transforms.Model;
        this.mFloatArray = c.Transforms.FloatArray;
    }

    public mPosition : glm.vec3;
    public mSize : glm.vec3;
    public mCollider : Types.ICollisionBody;
    public mPhysics ?: Types.PhysicsConfig<glm.vec3, number>;
    public mModelMatrix : glm.mat4;
    public mFloatArray : Float32Array;
};


export class InstancedSprite extends Component 
{
    constructor(c : Types.InstancedSpriteConfig) 
    {
        super(c.Label, c.EntityUUID);

        this.mPosition = c.Position;
        this.mSize = c.Size;
        this.mCollider = c.Collider;
        this.mPhysics = c.Physics;
        this.mModelMatrices = c.Transforms.Model;
        if(c.Transforms.FloatArray) this.mFloatArray = c.Transforms.FloatArray;
        else 
        {
            this.mFloatArray = new Float32Array(this.mModelMatrices.length * 16);
            let offset = 0;
            for(const mat of this.mModelMatrices) 
            {
                this.mFloatArray.set(mat, offset);
                offset += 16;
            }
        }
    }

    public mPosition : glm.vec3[];
    public mSize : glm.vec3[];
    public mCollider : Types.ICollisionBody[];
    public mPhysics ?: Types.PhysicsConfig<glm.vec3[], number[]>;
    public mModelMatrices : glm.mat4[] = [];
    public mFloatArray : Float32Array;
};


// Scene
//
export abstract class SceneComponent 
{
    constructor() 
    {   

    }   
    
    public abstract Prepare(device : GPUDevice) : void;
    public abstract LoadAndGenerateAssets(device : GPUDevice) : void;
};