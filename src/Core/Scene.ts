import * as glm from "gl-matrix";
import { Utils } from "../Utils";
import PerspectiveCamera, { CameraDirections } from "./PerspectiveCamera";
import simpleSquareShaderSrc from  "../../Shaders/Square.wgsl?raw"
import { CameraComponent, MaterialComponent, SquareGeometryComponent, TransformComponent } from "../ECS/Components";
import Input from "./Input";
import { Types } from "../Types";
import Entity from "../ECS/Entity";
import AssetManager from "../AssetManager";


export default class Scene implements Types.IApplicationLayer
{
    constructor(device : GPUDevice) 
    {
        this.mCamera = new PerspectiveCamera(glm.vec3.fromValues(0.0, 0.0, 10.0), Utils.Sizes.mCanvasWidth, Utils.Sizes.mCanvasHeight);

        this.PrepareScene(device);

        this.LoadAndGenerateAssets(device);
    }

    public ListenToUserInput() : void 
    {   
        const cPlayer = AssetManager.GetEntity(Types.EntityAssets.Player) as Entity;
        let cTransforms = cPlayer.GetComponent(`${cPlayer.mLabel + `_Transform_Component`}`) as TransformComponent;
        
        if(Input.IsKeyPressed("w")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(0.0*Utils.Time.GetDeltaTime()*5.0, 1.0*Utils.Time.GetDeltaTime()*5.0, 0.0));  
        if(Input.IsKeyPressed("a")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(-1.0*Utils.Time.GetDeltaTime()*5.0, 0.0*Utils.Time.GetDeltaTime()*5.0, 0.0));  
        if(Input.IsKeyPressed("s")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(0.0*Utils.Time.GetDeltaTime()*5.0, -1.0*Utils.Time.GetDeltaTime()*5.0, 0.0));  
        if(Input.IsKeyPressed("d")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(1.0*Utils.Time.GetDeltaTime()*5.0, 0.0*Utils.Time.GetDeltaTime()*5.0, 0.0));
    
        if(Input.IsKeyPressed("ArrowUp")) this.mCamera.ProcessUserInput(CameraDirections.UP);
        if(Input.IsKeyPressed("ArrowLeft")) this.mCamera.ProcessUserInput(CameraDirections.LEFT);
        if(Input.IsKeyPressed("ArrowDown")) this.mCamera.ProcessUserInput(CameraDirections.DOWN);
        if(Input.IsKeyPressed("ArrowRight")) this.mCamera.ProcessUserInput(CameraDirections.RIGHT); 
    }

    public OnCanvasResize(w : number, h : number) : void
    {
        this.mCamera.UpdateProjectionMatrix(w, h);
    }

    private PrepareScene(device : GPUDevice) : void 
    {
        // Global
        //
        // let camera = new CameraComponent(this.mCamera.GetProjectionMatrix(), this.mCamera.GetViewMatrix(), this.mCamera.position);
        // let simpleSquare = new SquareGeometryComponent(device);
        
        // Player
        //
        let playerTransform = new TransformComponent("Player_Transform_Component");
        let playerMat = new MaterialComponent("Player_Material_Component", Types.ShaderAssets.BasicMaterial);
        let playerCamera = new CameraComponent("Player_Camera_Component", this.mCamera.GetProjectionMatrix(), this.mCamera.GetViewMatrix(), this.mCamera.position);
        let playerSimpleSquare = new SquareGeometryComponent("Player_Geometry_Component", device);
        
        playerMat.mAlbedo = glm.vec3.fromValues(1.0, 0.2, 0.1);
        
        let playerEntity = new Entity([playerSimpleSquare, playerTransform, playerMat, playerCamera], "Player");
        AssetManager.SubmitEntity(playerEntity);

        // Platform
        //
        let platformTransform = new TransformComponent("Platform_Transform_Component");
        let platformMat = new MaterialComponent("Platform_Material_Component", Types.ShaderAssets.BasicMaterial);
        let platformCamera = new CameraComponent("Platform_Camera_Component", this.mCamera.GetProjectionMatrix(), this.mCamera.GetViewMatrix(), this.mCamera.position);
        let platformSimpleSquare = new SquareGeometryComponent("Platform_Geometry_Component", device);

        glm.mat4.translate(platformTransform.mModelMatrix, platformTransform.mModelMatrix, glm.vec3.fromValues(1.5, 0.0, 0.0));
        platformMat.mAlbedo = glm.vec3.fromValues(0.2, 0.5, 1.0);

        let platformEntity = new Entity([platformSimpleSquare, platformTransform, platformMat, platformCamera], "Platform");
        AssetManager.SubmitEntity(platformEntity);

    }

    private LoadAndGenerateAssets(device : GPUDevice) : void 
    {
        //----------------------------------------------------------------
        // Components
        //----------------------------------------------------------------

        const cPlayerEntity = AssetManager.GetEntity(Types.EntityAssets.Player) as Entity;
        const cPlayerGeometry = cPlayerEntity.GetComponent("Player_Geometry_Component") as SquareGeometryComponent;
        
        // const cPlatformEntity = AssetManager.GetEntity(Types.EntityAssets.Platform) as Entity;
        // const cPlatformGeometry = cPlatformEntity.GetComponent("Platform_Geometry_Component") as SquareGeometryComponent;

        //----------------------------------------------------------------
        // Vertex Buffers.
        //----------------------------------------------------------------
        
        device.queue.writeBuffer(cPlayerGeometry.mGPUBuffer, 0, cPlayerGeometry.mData.Vertices);
        // device.queue.writeBuffer(cPlatformGeometry.mGPUBuffer, 0, cPlatformGeometry.mData.Vertices);

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
            size: 144, // 2 4x4 matrices and 1 vec3 + 4 bytes of padding for a struct.
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
                    visibility: GPUShaderStage.VERTEX,
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
                    cPlayerGeometry.mData.BufferLayout.GetNativeLayout()
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
            },
            depthStencil: 
            {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },

            primitive: {
                topology: "triangle-strip",
                cullMode: "back"
            }
        });

        AssetManager.SubmitPipeline(cSimpleSquarePipeline);
    }

    private mCamera : PerspectiveCamera;
};