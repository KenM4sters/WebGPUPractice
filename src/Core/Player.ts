import * as glm from "gl-matrix";
import simpleSquareShaderSrc from  "../../Shaders/Square.wgsl?raw"
import { MaterialComponent, SceneComponent, SpriteComponent, SquareGeometryComponent, TransformComponent } from "../ECS/Components";
import { Types } from "../Types";
import Entity from "../ECS/Entity";
import AssetManager from "../AssetManager";
import { Utils } from "../Utils";

export default class Player extends SceneComponent 
{

    constructor(device : GPUDevice) 
    {
        super();

        this.Prepare(device);
        this.LoadAndGenerateAssets(device);
    }

    public Prepare(device: GPUDevice): void 
    {
        // 1. Initialize any properties required for the components of the Player.
        //
        let playerPosition = glm.vec3.fromValues(Utils.Sizes.mCanvasWidth/2.0, Utils.Sizes.mCanvasHeight/2.0, 0.0);
        let playerSize = glm.vec3.fromValues(30.0, 30.0, 1.0);
        let playerColor = glm.vec3.fromValues(1.0, 0.7, 0.2);

        // 2. Create components.
        //
        let playerTransform = new TransformComponent("Player_Transform_Component");
        let playerMat = new MaterialComponent("Player_Material_Component", Types.ShaderAssets.BasicShader);
        let playerSimpleSquare = new SquareGeometryComponent("Player_Geometry_Component", device);
        let playerSpriteComponent = new SpriteComponent("Player_Sprite_Component", playerPosition, playerSize);


        // 3. Submit them to the Asset Manager so they're accessible to each System.
        //
        AssetManager.SubmitComponent(playerTransform, Types.ComponentAssets.PlayerTransformComponent);
        AssetManager.SubmitComponent(playerMat, Types.ComponentAssets.PlayerMaterialComponent);
        AssetManager.SubmitComponent(playerSimpleSquare, Types.ComponentAssets.PlayerGeometryComponent);
        AssetManager.SubmitComponent(playerSpriteComponent, Types.ComponentAssets.PlayerSpriteComponent);


        // 4. Scale and Translate the Transform Model Matrix to reflect the 
        // The position and size of the player sprite (+ any material preferences).
        //
        playerMat.mAlbedo = playerColor;
        glm.mat4.translate(playerTransform.mModelMatrix, playerTransform.mModelMatrix, playerPosition);
        glm.mat4.scale(playerTransform.mModelMatrix, playerTransform.mModelMatrix, playerSize);


        // 5. Create the Entity from the Enumerations that hold the index at which the componenent
        // lies in the appropraite Asset Manager container when it was submitted.
        //
        let playerEntity = new Entity([
            Types.ComponentAssets.PlayerGeometryComponent, 
            Types.ComponentAssets.PlayerTransformComponent, 
            Types.ComponentAssets.PlayerMaterialComponent, 
            Types.ComponentAssets.CameraComponent
        ], "Player");


        // 6. Finally submit the Entity to the Asset Manager.
        //
        AssetManager.SubmitEntity(playerEntity, Types.EntityAssets.Player);
    }

    public LoadAndGenerateAssets(device : GPUDevice) : void 
    {
        //----------------------------------------------------------------
        // Components
        //----------------------------------------------------------------

        const cPlayerEntity = AssetManager.GetEntity(Types.EntityAssets.Player) as Entity;
        const cPlayerGeometry = cPlayerEntity.GetComponent("Player_Geometry_Component") as SquareGeometryComponent;

        //----------------------------------------------------------------
        // Vertex Buffers.
        //----------------------------------------------------------------
        
        device.queue.writeBuffer(cPlayerGeometry.mGPUBuffer, 0, cPlayerGeometry.mData.Vertices);

        //----------------------------------------------------------------
        // Shader Modules.
        //----------------------------------------------------------------

        const cBasicShaderModule : GPUShaderModule = device.createShaderModule({
            label: "Simple Square Shader",
            code: simpleSquareShaderSrc
        });

        AssetManager.SubmitShader(cBasicShaderModule, Types.ShaderAssets.BasicShader);

        //----------------------------------------------------------------
        // Uniform Buffer Objects.
        //----------------------------------------------------------------

        const cCameraUBO = device.createBuffer({
            label: "Camera UBO",
            size: 144, // 2 4x4 matrices and 1 vec3 + 4 bytes of padding for a struct.
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // Player
        //
        const cPlayerMaterialUBO = device.createBuffer({
            label: "Player_Material_UBO",
            size: (4*3),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const cPlayerTransformUBO = device.createBuffer({
            label: "Player_Transform_UBO",
            size: (4*16),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        AssetManager.SubmitUBO(cCameraUBO, Types.UBOAssets.CameraUBO);

        AssetManager.SubmitUBO(cPlayerMaterialUBO, Types.UBOAssets.PlayerMaterialUBO);
        AssetManager.SubmitUBO(cPlayerTransformUBO, Types.UBOAssets.PlayerTransformUBO);

        //----------------------------------------------------------------
        // Bind Group Layouts
        //----------------------------------------------------------------

        const cCameraBindGroupLayout : GPUBindGroupLayout = device.createBindGroupLayout({
            label: "Camera_Bind_Group_Layout",
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
            label: "Basic_Material_Bind_Group_Layout",
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
            label: "Transform_Bind_Group_Layout",
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
            label: "Camera_Bind_Group",
            layout: cCameraBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cCameraUBO}
                },
            ]
        });

        // Player
        // 
        const cPlayerMaterialBindGroup : GPUBindGroup = device.createBindGroup({
            label: "Player_Material_Bind_Group",
            layout: cBasicMaterialBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cPlayerMaterialUBO}
                },
            ]
        });

        const cPlayerTransformBindGroup : GPUBindGroup = device.createBindGroup({
            label: "Player_Transform_Bind_Group",
            layout: cTransformBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cPlayerTransformUBO}
                },
            ]
        });

        AssetManager.SubmitBindGroup(cCameraBindGroup, Types.BindGroupAssets.CameraGroup);

        AssetManager.SubmitBindGroup(cPlayerMaterialBindGroup, Types.BindGroupAssets.PlayerMaterialBindGroup);
        AssetManager.SubmitBindGroup(cPlayerTransformBindGroup, Types.BindGroupAssets.PlayerTransformBindGroup);

        //----------------------------------------------------------------
        // Render Pipelines
        //----------------------------------------------------------------

        const cSimpleSquarePipelineLayout : GPUPipelineLayout = device.createPipelineLayout({
            label: "Simple_Square_Pipeline_Layout",
            bindGroupLayouts: 
            [
                cCameraBindGroupLayout,         // @Group(0)
                cBasicMaterialBindGroupLayout,  // @Group(1)
                cTransformBindGroupLayout       // @Group(2)
            ]
        });

        // Player
        //
        const cSimpleSquarePipeline : GPURenderPipeline = device.createRenderPipeline({
            label: "Simple_Square_Render_Pipeline",
            layout: cSimpleSquarePipelineLayout,
            vertex: 
            {
                module: cBasicShaderModule,
                entryPoint: "mainVert",
                buffers: 
                [
                    cPlayerGeometry.mData.BufferLayout.GetNativeLayout()
                ]
            },
            fragment: 
            {
                module: cBasicShaderModule,
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

        AssetManager.SubmitPipeline(cSimpleSquarePipeline, Types.PipelineAssets.SimpleSquareRenderPipeline);
    }
}