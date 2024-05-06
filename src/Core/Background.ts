import * as glm from "gl-matrix";
import simpleSquareShaderSrc from  "../../Shaders/Square.wgsl?raw"
import { Types } from "../Types";
import Entity from "../ECS/Entity";
import { Utils } from "../Utils";
import ECSWizard from "../ECS/ECSWizard";
import RenderWizard from "../Renderer/RenderWizard";
import { Material, SceneComponent, Sprite, SquareGeometry } from "../ECS/Components";

export default class Background extends SceneComponent 
{

    constructor(device : GPUDevice) 
    {
        super();

        this.Prepare(device);
        this.LoadAndGenerateAssets(device);
    }

    public Prepare(device: GPUDevice): void 
    {
        // 1. Basic Background properties.
        //
        let backgroundPosition = glm.vec3.fromValues(0.0, 0.0, -1.0);
        let backgroundSize = glm.vec3.fromValues(Utils.Sizes.mCanvasWidth, Utils.Sizes.mCanvasHeight, 1.0);
        let backgroundColor = glm.vec3.fromValues(0.1, 0.1, 0.2);
        let backgroundMass = 1.0;
        let backgroundVelocity = glm.vec3.fromValues(0.0, 0.0, 0.0);
        let backgroundAccelration = glm.vec3.fromValues(0.0, 0.0, 0.0);
        let backgroundModelMatrix = glm.mat4.create();
        let floatArray = new Float32Array(16);
        floatArray.set(backgroundModelMatrix, 0); 

        const cSpriteConfig : Types.SpriteConfig = 
        {
            Label: "Background_Sprite",
            Position: backgroundPosition,
            Size: backgroundSize,
            Collider: 
            {
                Position: {x: backgroundPosition[0], y: backgroundPosition[1]},
                Size: {x: backgroundSize[0], y: backgroundSize[1]}
            },
            Physics: 
            {
                Mass: backgroundMass,
                Velocity: backgroundVelocity,
                Acceleration : backgroundAccelration
            },
            Transforms: 
            {
                Model: backgroundModelMatrix,
                FloatArray: floatArray
            }
        };

        // 2. Components.
        //
        let BackgroundSimpleSquare = new SquareGeometry("Background_Geometry", device);
        let BackgroundMat = new Material("Background_Material", Types.Shaders.BasicShader, backgroundColor);
        let BackgroundSprite = new Sprite(cSpriteConfig);

        // 3. Submit them to the Asset Manager so they're accessible to each System.
        //
        ECSWizard.SubmitSquareGeometry(BackgroundSimpleSquare, Types.SquareGeometries.BackgroundGeometry);
        ECSWizard.SubmitMaterial(BackgroundMat, Types.Materials.BackgroundMaterial);
        ECSWizard.SubmitSprite(BackgroundSprite, Types.Sprites.BackgroundSprite);

        // 5. Create the Entity from the Enumerations that hold the index at which the componenent
        // lies in the appropraite Asset Manager container when it was submitted.
        //
        let BackgroundEntity = new Entity([
            Types.Cameras.Camera,
            Types.SquareGeometries.BackgroundGeometry, 
            Types.Materials.BackgroundMaterial, 
            Types.Sprites.BackgroundSprite, 
        ], "Background");

        // 6. Finally submit the Entity to the Asset Manager.
        //
        ECSWizard.SubmitEntity(BackgroundEntity, Types.Entities.Background);
    }

    public LoadAndGenerateAssets(device : GPUDevice) : void 
    {
        //----------------------------------------------------------------
        // Components
        //----------------------------------------------------------------

        const cBackgroundEntity = ECSWizard.GetEntity(Types.Entities.Background) as Entity;
        const cBackgroundGeometry = cBackgroundEntity.GetComponent("Background_Geometry") as SquareGeometry;

        //----------------------------------------------------------------
        // Vertex Buffers.
        //----------------------------------------------------------------
        
        device.queue.writeBuffer(cBackgroundGeometry.mGPUBuffer, 0, cBackgroundGeometry.mData.Vertices);

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

        // Background
        //
        const cBackgroundMaterialUBO = device.createBuffer({
            label: "Background_Material_UBO",
            size: (4*3),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const cBackgroundTransformUBO = device.createBuffer({
            label: "Background_Transform_UBO",
            size: (4*16),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        RenderWizard.SubmitUBO(cCameraUBO, Types.UBOs.CameraUBO);

        RenderWizard.SubmitUBO(cBackgroundMaterialUBO, Types.UBOs.BackgroundMaterialUBO);
        RenderWizard.SubmitUBO(cBackgroundTransformUBO, Types.UBOs.BackgroundTransformUBO);

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

        // Background
        // 
        const cBackgroundMaterialBindGroup : GPUBindGroup = device.createBindGroup({
            label: "Background_Material_Bind_Group",
            layout: cBasicMaterialBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cBackgroundMaterialUBO}
                },
            ]
        });

        const cBackgroundTransformBindGroup : GPUBindGroup = device.createBindGroup({
            label: "Background_Transform_Bind_Group",
            layout: cTransformBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cBackgroundTransformUBO}
                },
            ]
        });

        RenderWizard.SubmitBindGroup(cCameraBindGroup, Types.BindGroups.CameraGroup);

        RenderWizard.SubmitBindGroup(cBackgroundMaterialBindGroup, Types.BindGroups.BackgroundMaterialBindGroup);
        RenderWizard.SubmitBindGroup(cBackgroundTransformBindGroup, Types.BindGroups.BackgroundTransformBindGroup);

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

        // Background
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
                    cBackgroundGeometry.mData.BufferLayout.GetNativeLayout()
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