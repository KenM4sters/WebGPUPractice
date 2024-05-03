import * as glm from "gl-matrix"
import AssetManager from "../AssetManager";
import { InstanceTransformComponent, MaterialComponent, SceneComponent, SquareGeometryComponent } from "../ECS/Components";
import Entity from "../ECS/Entity";
import { Types } from "../Types";

import levelShaderSrc from "../../Shaders/Level.wgsl?raw";

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

        // Instance Transform Array
        //
        const instanceTransformComponent : Float32Array = new Float32Array(16*this.mInstanceCount);

        const translationArray : glm.vec3[] = 
        [
            glm.vec3.fromValues(0.0, -6.0, 0.0),
            glm.vec3.fromValues(-1.5, -2.0, 0.0),
            glm.vec3.fromValues(-1.0, 4.0, 0.0),
            glm.vec3.fromValues(-2.0, 8.0, 0.0),
            glm.vec3.fromValues(1.5, -2.0, 0.0),
            glm.vec3.fromValues(1.0, 4.0, 0.0),
            glm.vec3.fromValues(2.0, 8.0, 0.0),
        ];

        const scaleArray : glm.vec3[] = 
        [
            glm.vec3.fromValues(3.0, 0.4, 0.0),
            glm.vec3.fromValues(3.0, 0.4, 1.0),
            glm.vec3.fromValues(3.0, 0.4, 1.0),
            glm.vec3.fromValues(3.0, 0.4, 1.0),
            glm.vec3.fromValues(3.0, 0.4, 1.0),
            glm.vec3.fromValues(3.0, 0.4, 1.0),
            glm.vec3.fromValues(3.0, 0.4, 1.0),
        ];

        let offset = 0;
        for(let i = 0; i < this.mInstanceCount; i++) 
        {
            let identity = glm.mat4.create();
            glm.mat4.scale(identity, identity, scaleArray[i]);
            glm.mat4.translate(identity, identity, translationArray[i]);

            instanceTransformComponent.set(identity, offset);
            offset += 16;
        }        

        // The scene submits a camera component before a level is instantiated, so we can just query
        // the asset manager for the camera component.

        let levelMat = new MaterialComponent("Level_Material_Component", Types.ShaderAssets.LevelShader);

        levelMat.mAlbedo = glm.vec3.fromValues(0.5, 0.0, 1.0);

        AssetManager.SubmitComponent(
            levelMat,
            Types.ComponentAssets.LevelMaterialComponent
        );
        AssetManager.SubmitComponent(
            new InstanceTransformComponent("Level_Instance_Transform_Component", instanceTransformComponent),
            Types.ComponentAssets.LevelInstanceTransformComponent
        );
        AssetManager.SubmitComponent(
            new SquareGeometryComponent("Level_Geometry_Component", device, this.mInstanceCount),
            Types.ComponentAssets.LevelGeometryComponent
        );

        const levelEntity = new Entity([
            Types.ComponentAssets.CameraComponent,
            Types.ComponentAssets.LevelMaterialComponent,
            Types.ComponentAssets.LevelInstanceTransformComponent,
            Types.ComponentAssets.LevelGeometryComponent
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