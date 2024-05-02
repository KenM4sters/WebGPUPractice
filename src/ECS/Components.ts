import * as glm from "gl-matrix";
import { BufferAttribute, BufferLayout } from "../Core/Buffer";
import { Types } from "../Types";
import { Primitives } from "../Core/Primitives";

export abstract class Component 
{
    constructor() {}
};

export class CameraComponent extends Component
{
    constructor(projMat : glm.mat4, viewMat : glm.mat4, pos : glm.vec3) 
    {
        super();

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
    constructor(shader : GPUShaderModule,  albedo : glm.vec3 | GPUTexture = glm.vec3.fromValues(1.0, 0.0, 0.0)) 
    {
        super();

        this.mShaderModule = shader;
        this.mAlbedo = albedo;  
    }

    public mAlbedo : glm.vec3 | GPUTexture;
    public readonly mShaderModule : GPUShaderModule;
}


export class SquareGeometryComponent extends Component 
{
    constructor() 
    {
        super();

        const vertices : typeof Primitives.SQUARE_VERTICES = Primitives.SQUARE_VERTICES;
        const bufferLayout = new BufferLayout([
            new BufferAttribute("SquarePositionAttrib", 0, "float32x3")
        ]);

        this.mData = 
        {
            Vertices: vertices,
            BufferLayout: bufferLayout
        };
    }

    public readonly mData : Types.IPrimitivePayload;
}



export class TransformComponent extends Component 
{
    constructor(position : glm.vec3 = glm.vec3.create()) 
    {
        super();
        this.mPosition = position;
    }

    public mPosition : glm.vec3;
    public mRotation : glm.quat = glm.quat.create();
    public mScale : glm.vec3 = glm.vec3.fromValues(1.0, 1.0, 1.0);
    public mModelMatrix : glm.mat4 = glm.mat4.create();
}