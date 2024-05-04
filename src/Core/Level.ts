import * as glm from "gl-matrix"
import AssetManager from "../AssetManager";
import { MaterialComponent, SceneComponent, SpriteComponent, SquareGeometryComponent, TransformComponent } from "../ECS/Components";
import Entity from "../ECS/Entity";
import { Types } from "../Types";

import levelShaderSrc from "../../Shaders/Level.wgsl?raw";
import { Utils } from "../Utils";

export default class Level extends SceneComponent
{
    constructor(device : GPUDevice) 
    {
        super();

        this.mInstanceCount = 7;

        this.Prepare(device);
        this.LoadAndGenerateAssets(device);
    } 

    public Prepare(device : GPUDevice): void 
    {
        // 1. We need a float32Array containing all the different floats that make up each transform matrix.
        //
        const floatArray : Float32Array = new Float32Array(16*this.mInstanceCount);
        const matArray : glm.mat4[] = [];
        const w = Utils.Sizes.mCanvasWidth;
        const h = Utils.Sizes.mCanvasHeight;
        const half_w = w/2.0;
        const half_h = h/2.0; 

        const positions : glm.vec3[] = 
        [
            glm.vec3.fromValues(half_w, half_h + 100.0, 0.0),

            glm.vec3.fromValues(half_w + 300.0, half_h + 300.0, 0.0),
            glm.vec3.fromValues(half_w - 300.0, half_h + 300.0, 0.0),
            glm.vec3.fromValues(half_w + 300.0, half_h - 300.0, 0.0),
            glm.vec3.fromValues(half_w - 300.0, half_h - 300.0, 0.0),

            glm.vec3.fromValues(half_w - 500.0, half_h, 0.0),
            glm.vec3.fromValues(half_w + 500.0, half_h, 0.0),
        ];

        const sizes : glm.vec3[] = 
        [
            glm.vec3.fromValues(100.0, 10, 1.0),

            glm.vec3.fromValues(100.0, 10, 1.0),
            glm.vec3.fromValues(100.0, 10, 1.0),
            glm.vec3.fromValues(100.0, 10, 1.0),
            glm.vec3.fromValues(100.0, 10, 1.0),

            glm.vec3.fromValues(100.0, 10, 1.0),
            glm.vec3.fromValues(100.0, 10, 1.0),
        ];

        let offset = 0;
        for(let i = 0; i < this.mInstanceCount; i++) 
        {
            let m = glm.mat4.create();

            // If you compute the translation after the scale, remember that the translation
            // values will get scaled themselves by the scale transform. 
            glm.mat4.translate(m, m, positions[i]);
            glm.mat4.scale(m, m, sizes[i]);
            matArray.push(m);
            floatArray.set(m, offset);
            offset += 16; // Remember to increment the offset by the size of a mat4x4<f32>.
        }
        
        let levelColor = glm.vec3.fromValues(0.5, 0.0, 1.0);

        // 2. The scene submits a camera component before a level is instantiated, so we can just query
        // the asset manager for the camera component.
        //
        let levelGeometry = new SquareGeometryComponent("Level_Geometry_Component", device, this.mInstanceCount);
        let levelMat = new MaterialComponent("Level_Material_Component", Types.ShaderAssets.LevelShader, levelColor);
        let levelTransform = new TransformComponent("Level_Transform_Component", matArray, floatArray);
        let levelSprite = new SpriteComponent("Level_Sprite_Component", positions, sizes);

        AssetManager.SubmitComponent(levelGeometry, Types.ComponentAssets.LevelGeometryComponent);
        AssetManager.SubmitComponent(levelMat, Types.ComponentAssets.LevelMaterialComponent);
        AssetManager.SubmitComponent(levelTransform, Types.ComponentAssets.LevelTransformComponent);
        AssetManager.SubmitComponent(levelSprite, Types.ComponentAssets.LevelSpriteComponenet);

        // 3. Create the level entity and submit it to the Asset Manager.
        //
        const levelEntity = new Entity([
            Types.ComponentAssets.CameraComponent,
            Types.ComponentAssets.LevelGeometryComponent,
            Types.ComponentAssets.LevelMaterialComponent,
            Types.ComponentAssets.LevelTransformComponent,
            Types.ComponentAssets.LevelSpriteComponenet
        ], "Level");

        AssetManager.SubmitEntity(levelEntity, Types.EntityAssets.Level);
    }

    

    public LoadAndGenerateAssets(device : GPUDevice): void 
    {
        //----------------------------------------------------------------
        // Components.
        //----------------------------------------------------------------

        const cLevelEntity = AssetManager.GetEntity(Types.EntityAssets.Level) as Entity;
        const cLevelGeometry = cLevelEntity.GetComponent("Level_Geometry_Component") as SquareGeometryComponent;

        //-----------------------------------------------------------------
        // Vertex Buffers.
        //-----------------------------------------------------------------

        device.queue.writeBuffer(cLevelGeometry.mGPUBuffer, 0, cLevelGeometry.mData.Vertices);


        //-----------------------------------------------------------------
        // Shader Modules.
        //-----------------------------------------------------------------

        const cLevelShaderModule = device.createShaderModule({
            label: "Level_Shader_Module",
            code: levelShaderSrc
        });

        AssetManager.SubmitShader(cLevelShaderModule, Types.ShaderAssets.LevelShader);
    
        //-----------------------------------------------------------------
        // Uniform Buffer Objects.
        //-----------------------------------------------------------------

        // (Camera already handled by the Scene).
    
        // Level
        //
        const cLevelMaterialUBO = device.createBuffer({
            label: "Level_Material_UBO",
            size: (4*3),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const cLevelInstanceTransformUBO = device.createBuffer({
            label: "Level_Instance_Transform_UBO",
            size: (4*16 * this.mInstanceCount),  // 1 matrix = 16 4-byte floats, and we need as many matrices as we have instances.
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        AssetManager.SubmitUBO(cLevelMaterialUBO, Types.UBOAssets.LevelMaterialUBO);
        AssetManager.SubmitUBO(cLevelInstanceTransformUBO, Types.UBOAssets.LevelInstanceTransformUBO);

        //-----------------------------------------------------------------
        // Bind Group Layouts.
        //-----------------------------------------------------------------

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

        const cLevelMaterialBindGroup = device.createBindGroup({
            label: "Level_Material_Bind_Group",
            layout: cBasicMaterialBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cLevelMaterialUBO}
                }
            ]
        });

        const cLevelInstanceTransformBindGroup = device.createBindGroup({
            label: "Level_Instance_Transform_Bind_Group",
            layout: cTransformBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cLevelInstanceTransformUBO}
                }
            ]
        });

        AssetManager.SubmitBindGroup(cLevelMaterialBindGroup, Types.BindGroupAssets.LevelMaterialBindGroup);
        AssetManager.SubmitBindGroup(cLevelInstanceTransformBindGroup, Types.BindGroupAssets.LevelInstanceTransformBindGroup);


        //----------------------------------------------------------------
        // Render Pipelines.
        //----------------------------------------------------------------

        const cLevelPipelineLayout = device.createPipelineLayout({
            label: "Level_Pipeline_Layout",
            bindGroupLayouts: 
            [
                cCameraBindGroupLayout,         // @Group(0)
                cBasicMaterialBindGroupLayout,  // @Group(1)
                cTransformBindGroupLayout       // @Group(2)
            ],
        });

        const cLevelRenderPipeline = device.createRenderPipeline({
            label: "Level_Pipeline",
            layout: cLevelPipelineLayout,
            vertex: 
            {
                module: cLevelShaderModule,
                entryPoint: "mainVert",
                buffers: [
                    cLevelGeometry.mData.BufferLayout.GetNativeLayout()
                ]
            },
            fragment: 
            {
                module: cLevelShaderModule,
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
                depthCompare: "less",
                format: "depth24plus"
            },
            primitive: 
            {
                topology: "triangle-strip",
                cullMode: "back"
            }
        });

        AssetManager.SubmitPipeline(cLevelRenderPipeline, Types.PipelineAssets.LevelRenderPipeline);

    }   

    public readonly mInstanceCount : number;
}