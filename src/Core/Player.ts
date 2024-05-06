import * as glm from "gl-matrix";
import simpleSquareShaderSrc from  "../../Shaders/Square.wgsl?raw"
import { Types } from "../Types";
import Entity from "../ECS/Entity";
import { Utils } from "../Utils";
import ECSWizard from "../ECS/ECSWizard";
import RenderWizard from "../Renderer/RenderWizard";
import { Material, SceneComponent, Sprite, SquareGeometry } from "../ECS/Components";

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
        // 5. Create the Entity from the Enumerations that hold the index at which the componenent
        // lies in the appropraite Asset Manager container when it was submitted.
        //
        
        let playerEntity = new Entity("Player");

        // 1. Basic Player properties.
        //
        let playerPosition = glm.vec3.fromValues((Utils.Sizes.mCanvasWidth/2.0), Utils.Sizes.mCanvasHeight/2.0, 0.0);
        let playerSize = glm.vec3.fromValues(30.0, 30.0, 1.0);
        let playerColor = glm.vec3.fromValues(1.0, 0.7, 0.2);
        let playerMass = 1.0;
        let playerVelocity = glm.vec3.fromValues(0.0, 0.0, 0.0);
        let playerAccelration = glm.vec3.fromValues(0.0, 0.0, 0.0);
        let playerModelMatrix = glm.mat4.create();
        let floatArray = new Float32Array(16);
        floatArray.set(playerModelMatrix, 0); 
        
        const cSpriteConfig : Types.SpriteConfig = 
        {
            Label: "Player_Sprite",
            EntityUUID: playerEntity.mUUID,
            Position: playerPosition,
            Size: playerSize,
            Collider: 
            {
                Position: {x: playerPosition[0], y: playerPosition[1]},
                Size: {x : playerSize[0], y: playerSize[1]},
            },
            Physics: 
            {
                Mass: playerMass,
                Velocity: playerVelocity,
                Acceleration : playerAccelration
            },
            Transforms: 
            {
                Model: playerModelMatrix,
                FloatArray: floatArray
            }
        };

        // 2. Components.
        //
        let playerSimpleSquare = new SquareGeometry("Player_Geometry", device);
        let playerMat = new Material("Player_Material", Types.Shaders.BasicShader, playerColor);
        let playerSprite = new Sprite(cSpriteConfig);

        // 3. Submit them to the Asset Manager so they're accessible to each System.
        //

        playerEntity.AddComponent(playerSimpleSquare);


        // 6. Finally submit the Entity to the Asset Manager.
        //
        ECSWizard.SubmitEntity(playerEntity, Types.Entities.Player);
    }

    public LoadAndGenerateAssets(device : GPUDevice) : void 
    {
        //----------------------------------------------------------------
        // Components
        //----------------------------------------------------------------

        const cPlayerEntity = ECSWizard.GetEntity(Types.Entities.Player) as Entity;
        
        const cPlayerGeometry = cPlayerEntity.GetComponent("Player_Geometry") as SquareGeometry;
        console.log(cPlayerGeometry);
        

        //----------------------------------------------------------------
        // Vertex Buffers.
        //----------------------------------------------------------------
        
        device.queue.writeBuffer(cPlayerGeometry.mGPUBuffer, 0, cPlayerGeometry.mData.Vertices);

        //----------------------------------------------------------------
        // Shader Modules.
        //----------------------------------------------------------------

        const cBasicShaderModule : GPUShaderModule = device.createShaderModule({
            label: "Simple_Square_Shader",
            code: simpleSquareShaderSrc
        });

        RenderWizard.SubmitShader(cBasicShaderModule, Types.Shaders.BasicShader);

        //----------------------------------------------------------------
        // Uniform Buffer Objects.
        //----------------------------------------------------------------

        const cCameraUBO = device.createBuffer({
            label: "Camera_UBO",
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
        
        RenderWizard.SubmitUBO(cCameraUBO, Types.UBOs.CameraUBO);

        RenderWizard.SubmitUBO(cPlayerMaterialUBO, Types.UBOs.PlayerMaterialUBO);
        RenderWizard.SubmitUBO(cPlayerTransformUBO, Types.UBOs.PlayerTransformUBO);

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

        RenderWizard.SubmitBindGroup(cCameraBindGroup, Types.BindGroups.CameraGroup);

        RenderWizard.SubmitBindGroup(cPlayerMaterialBindGroup, Types.BindGroups.PlayerMaterialBindGroup);
        RenderWizard.SubmitBindGroup(cPlayerTransformBindGroup, Types.BindGroups.PlayerTransformBindGroup);

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
                topology: "triangle-list",
                cullMode: "back"
            }
        });

        RenderWizard.SubmitPipeline(cSimpleSquarePipeline, Types.Pipelines.SimpleSquareRenderPipeline);
    }
}