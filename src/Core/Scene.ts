import * as glm from "gl-matrix";
import { Utils } from "../Utils";
import PerspectiveCamera, { CameraDirections } from "./PerspectiveCamera";

import simpleSquareShaderSrc from  "../../Shaders/Square.wgsl?raw"
import { CameraComponent, MaterialComponent, SquareGeometryComponent, TransformComponent } from "../ECS/Components";
import Input from "./Input";
import { Types } from "../Types";
import Entity from "../ECS/Entity";
import AssetManager from "../AssetManager";


export default class Scene 
{
    constructor(device : GPUDevice) 
    {
        this.mCamera = new PerspectiveCamera(glm.vec3.fromValues(0.0, 0.0, 3.0), Utils.Sizes.mCanvasWidth, Utils.Sizes.mCanvasHeight);

        this.LoadAndGenerateAssets(device);

    }

    public HandleUserInput() : void 
    {   
        const cPlayer = AssetManager.GetEntity(Types.EntityAssets.simpleSquare) as Entity;
        let cTransforms = cPlayer.GetComponent("TransformComponent") as TransformComponent;

        if(Input.IsKeyPressed("w")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(0.0*Utils.Time.GetDeltaTime()*5.0, 1.0*Utils.Time.GetDeltaTime()*5.0, 0.0));  
        if(Input.IsKeyPressed("a")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(-1.0*Utils.Time.GetDeltaTime()*5.0, 0.0*Utils.Time.GetDeltaTime()*5.0, 0.0));  
        if(Input.IsKeyPressed("s")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(0.0*Utils.Time.GetDeltaTime()*5.0, -1.0*Utils.Time.GetDeltaTime()*5.0, 0.0));  
        if(Input.IsKeyPressed("d")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(1.0*Utils.Time.GetDeltaTime()*5.0, 0.0*Utils.Time.GetDeltaTime()*5.0, 0.0));
    
        if(Input.IsKeyPressed("ArrowUp")) this.mCamera.ProcessUserInput(CameraDirections.UP);
        if(Input.IsKeyPressed("ArrowLeft")) this.mCamera.ProcessUserInput(CameraDirections.LEFT);
        if(Input.IsKeyPressed("ArrowDown")) this.mCamera.ProcessUserInput(CameraDirections.DOWN);
        if(Input.IsKeyPressed("ArrowRight")) this.mCamera.ProcessUserInput(CameraDirections.RIGHT); 
    }

    private LoadAndGenerateAssets(device : GPUDevice) : void 
    {
        //----------------------------------------------------------------
        // Components
        //----------------------------------------------------------------

        let simpleSquare = new SquareGeometryComponent(device);
        let transform = new TransformComponent();
        let basicMaterial = new MaterialComponent(Types.ShaderAssets.BasicMaterial);
        let camera = new CameraComponent(this.mCamera.GetProjectionMatrix(), this.mCamera.GetViewMatrix(), this.mCamera.position);

        let squareEntity = new Entity([Utils.DeepCopy(simpleSquare), Utils.DeepCopy(transform), Utils.DeepCopy(basicMaterial), Utils.DeepCopy(camera)]);
        AssetManager.SubmitEntity(squareEntity);

        //----------------------------------------------------------------
        // Vertex Buffers.
        //----------------------------------------------------------------

        device.queue.writeBuffer(simpleSquare.mGPUBuffer, 0, simpleSquare.mData.Vertices);

        //----------------------------------------------------------------
        // Shader Modules.
        //----------------------------------------------------------------

        const cSimpleSquareShader : GPUShaderModule = device.createShaderModule({
            label: "Simple Square Shader",
            code: simpleSquareShaderSrc
        });

        AssetManager.SubmitShader(cSimpleSquareShader);

        //----------------------------------------------------------------
        // Uniform Buffer Objects.
        //----------------------------------------------------------------

        const cCameraUBO = device.createBuffer({
            label: "Camera UBO",
            size: (4*16) + (4*16) + (4*3), // 2 4x4 matrices and 1 vec3.
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const cBasicMaterialUBO = device.createBuffer({
            label: "Basic Material UBO",
            size: (4*3),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const cTransformUBO = device.createBuffer({
            label: "Transform UBO",
            size: (4*16),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        AssetManager.SubmitUBO(cCameraUBO);
        AssetManager.SubmitUBO(cBasicMaterialUBO);
        AssetManager.SubmitUBO(cTransformUBO);

        //----------------------------------------------------------------
        // Bind Group Layouts
        //----------------------------------------------------------------

        const cCameraBindGroupLayout : GPUBindGroupLayout = device.createBindGroupLayout({
            label: "Camera Bind Group Layout",
            entries: 
            [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
            ]
        });

        const cBasicMaterialBindGroupLayout : GPUBindGroupLayout = device.createBindGroupLayout({
            label: "Basic Material Bind Group Layout",
            entries: 
            [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
            ]
        });

        const cTransformBindGroupLayout : GPUBindGroupLayout = device.createBindGroupLayout({
            label: "Basic Material Bind Group Layout",
            entries: 
            [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
            ]
        });


        //----------------------------------------------------------------
        // Bind Groups
        //----------------------------------------------------------------
        
        const cCameraBindGroup : GPUBindGroup = device.createBindGroup({
            label: "Camera Bind Group",
            layout: cCameraBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cCameraUBO}
                },
            ]
        });

        const cBasicMaterialBindGroup : GPUBindGroup = device.createBindGroup({
            label: "Basic Material Bind Group",
            layout: cBasicMaterialBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cBasicMaterialUBO}
                },
            ]
        });

        const cTransformBindGroup : GPUBindGroup = device.createBindGroup({
            label: "Transform Bind Group",
            layout: cTransformBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cTransformUBO}
                },
            ]
        });

        AssetManager.SubmitBindGroup(cCameraBindGroup);
        AssetManager.SubmitBindGroup(cBasicMaterialBindGroup);
        AssetManager.SubmitBindGroup(cTransformBindGroup);

        //----------------------------------------------------------------
        // Render Pipelines
        //----------------------------------------------------------------

        const cSimpleSquarePipelineLayout : GPUPipelineLayout = device.createPipelineLayout({
            label: "Simple Square Pipeline Layout",
            bindGroupLayouts: 
            [
                cCameraBindGroupLayout,         // @Group(0)
                cBasicMaterialBindGroupLayout,  // @Group(1)
                cTransformBindGroupLayout       // @Group(2)
            ]
        });

        const cSimpleSquarePipeline : GPURenderPipeline = device.createRenderPipeline({
            label: "Simple Square Render Pipeline",
            layout: cSimpleSquarePipelineLayout,
            vertex: 
            {
                module: cSimpleSquareShader,
                entryPoint: "mainVert",
                buffers: 
                [
                    simpleSquare.mData.BufferLayout.GetNativeLayout()
                ]
            },
            fragment: 
            {
                module: cSimpleSquareShader,
                entryPoint: "mainFrag",
                targets: 
                [
                    {
                        format: navigator.gpu.getPreferredCanvasFormat()
                    }
                ]
            }
        });

        AssetManager.SubmitPipeline(cSimpleSquarePipeline);
    }

    private mCamera : PerspectiveCamera;
};