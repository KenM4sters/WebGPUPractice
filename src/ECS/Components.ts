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
    constructor(label : string, device : GPUDevice) 
    {
        super(label);

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
}



export class TransformComponent extends Component 
{
    constructor(label : string, position : glm.vec3 = glm.vec3.create()) 
    {
        super(label);
        this.mPosition = position;
    }

    public mPosition : glm.vec3;
    public mRotation : glm.quat = glm.quat.create();
    public mScale : glm.vec3 = glm.vec3.fromValues(1.0, 1.0, 1.0);
    public mModelMatrix : glm.mat4 = glm.mat4.create();
}