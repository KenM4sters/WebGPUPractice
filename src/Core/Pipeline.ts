import { Mesh } from "./Mesh";
import meshShaderSrc from "../Shaders/Square.wgsl?raw";
import { IMeshUniforms } from "./Types";

export default class PipeLine 
{
    constructor(device : GPUDevice, mesh : Mesh) 
    {

        const shaderModuleA = device.createShaderModule({
            label: "MeshShader",
            code: meshShaderSrc
        });


        this.mBindGroupLayout = device.createBindGroupLayout({
            entries: 
            [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
            ]
        });

        this.mPipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: 
            [
                this.mBindGroupLayout,
            ]
        });

        this.mPipeline = device.createRenderPipeline({
            label: "MeshPipeline",
            layout: this.mPipelineLayout,
            vertex: 
            {
                module: shaderModuleA,
                entryPoint: "mainVertex",
                buffers: 
                [
                    mesh.mPrimitive.GetPayload().BufferLayout.GetNativeLayout()
                ]
            },
            fragment: 
            {
                module: shaderModuleA,
                entryPoint: "mainVertex",
                targets: 
                [
                    {
                        format: navigator.gpu.getPreferredCanvasFormat()
                    }
                ]
            }
        });

        const albedo = device.createBuffer({
            label: "MeshAlbedo",
            size: 3*4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        const viewMatrix = device.createBuffer({
            label: "MeshViewMatrix",
            size: 16*4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        const projectionMatrix = device.createBuffer({
            label: "MeshProjectionMatrix",
            size: 16*4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.mUBO = 
        {
            Uniforms: 
            {
                Albedo: albedo,
                ViewMatrix: viewMatrix,
                ProjectionMatrix: projectionMatrix
            }   
        };
        

        this.mBindGroup = device.createBindGroup({
            label: "MeshBindGroup",
            layout: this.mBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: this.mUBO.Uniforms.Albedo}
                },
                {
                    binding: 1,
                    resource: {buffer: this.mUBO.Uniforms.ViewMatrix}
                },
                {
                    binding: 2,
                    resource: {buffer: this.mUBO.Uniforms.ProjectionMatrix}
                },
            ]
        });

    }

    public readonly mPipelineLayout : GPUPipelineLayout;
    public readonly mPipeline : GPURenderPipeline;
    public readonly mBindGroupLayout : GPUBindGroupLayout;
    public readonly mBindGroup : GPUBindGroup;
    public readonly mUBO : 
    {
        Uniforms : IMeshUniforms;
    }
}