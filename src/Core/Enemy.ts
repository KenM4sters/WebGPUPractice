import * as glm from "gl-matrix"
import Entity from "../ECS/Entity";
import { Types } from "../Types";
import { Utils } from "../Utils";
import ECSWizard from "../ECS/ECSWizard";
import RenderWizard from "../Renderer/RenderWizard";
import { InstancedSprite, Material, SceneComponent, SquareGeometry } from "../ECS/Components";
import EnemyShaderSrc from "../../Shaders/Enemy.wgsl?raw";

export default class Enemy extends SceneComponent
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

        const colliders : Types.ICollisionBody[] = [];

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
            glm.vec3.fromValues(30.0, 30, 1.0),

            glm.vec3.fromValues(30.0, 30, 1.0),
            glm.vec3.fromValues(30.0, 30, 1.0),
            glm.vec3.fromValues(30.0, 30, 1.0),
            glm.vec3.fromValues(30.0, 30, 1.0),

            glm.vec3.fromValues(30.0, 30, 1.0),
            glm.vec3.fromValues(30.0, 30, 1.0),
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

            // Collider
            const c : Types.ICollisionBody = 
            {
                Position: {x: positions[i][0], y: positions[i][1]},
                Size: {x: sizes[i][0], y: sizes[i][1]},
                InstanceIndex: i
            }

            colliders.push(c);
        }
 
        let EnemyColor = glm.vec3.fromValues(0.4, 0.8, 0.4);

        const cSpriteConfig : Types.InstancedSpriteConfig = 
        {
            Label: "Enemy_Sprite",
            Position: positions,
            Size: sizes,
            Collider: colliders,
            Physics: undefined,
            Transforms: 
            {
                Model: matArray,
                FloatArray: floatArray
            }
        };

        // 2. The scene submits a camera component before a Enemy is instantiated, so we can just query
        // the asset manager for the camera component.
        //
        let enemyGeometry = new SquareGeometry("Enemy_Geometry", device, this.mInstanceCount);
        let enemyMat = new Material("Enemy_Material", Types.Shaders.EnemyShader, EnemyColor);
        let enemySprite = new InstancedSprite(cSpriteConfig);

        ECSWizard.SubmitSquareGeometry(enemyGeometry, Types.SquareGeometries.EnemyGeometry);
        ECSWizard.SubmitMaterial(enemyMat, Types.Materials.EnemyMaterial);
        ECSWizard.SubmitInstancedSprite(enemySprite, Types.InstancedSprites.EnemyInstancedSprite);

        // 3. Create the Enemy entity and submit it to the Asset Manager.
        //
        const EnemyEntity = new Entity([
            Types.Cameras.Camera,
            Types.SquareGeometries.EnemyGeometry,
            Types.Materials.EnemyMaterial,
            Types.InstancedSprites.EnemyInstancedSprite
        ], "Enemy");

        ECSWizard.SubmitEntity(EnemyEntity, Types.Entities.Enemy);
    }

    

    public LoadAndGenerateAssets(device : GPUDevice): void 
    {
        //----------------------------------------------------------------
        // Components.
        //----------------------------------------------------------------

        const cEnemyEntity = ECSWizard.GetEntity(Types.Entities.Enemy) as Entity;
        const cEnemyGeometry = cEnemyEntity.GetComponent("Enemy_Geometry") as SquareGeometry;

        //-----------------------------------------------------------------
        // Vertex Buffers.
        //-----------------------------------------------------------------

        device.queue.writeBuffer(cEnemyGeometry.mGPUBuffer, 0, cEnemyGeometry.mData.Vertices);


        //-----------------------------------------------------------------
        // Shader Modules.
        //-----------------------------------------------------------------

        const cEnemyShaderModule = device.createShaderModule({
            label: "Enemy_Shader_Module",
            code: EnemyShaderSrc
        });

        RenderWizard.SubmitShader(cEnemyShaderModule, Types.Shaders.EnemyShader);
    
        //-----------------------------------------------------------------
        // Uniform Buffer Objects.
        //-----------------------------------------------------------------

        // (Camera already handled by the Scene).
    
        // Enemy
        //
        const cEnemyMaterialUBO = device.createBuffer({
            label: "Enemy_Material_UBO",
            size: (4*3),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const cEnemyInstanceTransformUBO = device.createBuffer({
            label: "Enemy_Instance_Transform_UBO",
            size: (4*16 * this.mInstanceCount),  // 1 matrix = 16 4-byte floats, and we need as many matrices as we have instances.
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        RenderWizard.SubmitUBO(cEnemyMaterialUBO, Types.UBOs.EnemyMaterialUBO);
        RenderWizard.SubmitUBO(cEnemyInstanceTransformUBO, Types.UBOs.EnemyInstanceTransformUBO);

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

        const cEnemyMaterialBindGroup = device.createBindGroup({
            label: "Enemy_Material_Bind_Group",
            layout: cBasicMaterialBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cEnemyMaterialUBO}
                }
            ]
        });

        const cEnemyInstanceTransformBindGroup = device.createBindGroup({
            label: "Enemy_Instance_Transform_Bind_Group",
            layout: cTransformBindGroupLayout,
            entries: 
            [
                {
                    binding: 0,
                    resource: {buffer: cEnemyInstanceTransformUBO}
                }
            ]
        });

        RenderWizard.SubmitBindGroup(cEnemyMaterialBindGroup, Types.BindGroups.EnemyMaterialBindGroup);
        RenderWizard.SubmitBindGroup(cEnemyInstanceTransformBindGroup, Types.BindGroups.EnemyInstanceTransformBindGroup);


        //----------------------------------------------------------------
        // Render Pipelines.
        //----------------------------------------------------------------

        const cEnemyPipelineLayout = device.createPipelineLayout({
            label: "Enemy_Pipeline_Layout",
            bindGroupLayouts: 
            [
                cCameraBindGroupLayout,         // @Group(0)
                cBasicMaterialBindGroupLayout,  // @Group(1)
                cTransformBindGroupLayout       // @Group(2)
            ],
        });

        const cEnemyRenderPipeline = device.createRenderPipeline({
            label: "Enemy_Pipeline",
            layout: cEnemyPipelineLayout,
            vertex: 
            {
                module: cEnemyShaderModule,
                entryPoint: "mainVert",
                buffers: [
                    cEnemyGeometry.mData.BufferLayout.GetNativeLayout()
                ]
            },
            fragment: 
            {
                module: cEnemyShaderModule,
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
                topology: "triangle-list",
                cullMode: "back"
            }
        });

        RenderWizard.SubmitPipeline(cEnemyRenderPipeline, Types.Pipelines.EnemyRenderPipeline);

    }   

    public readonly mInstanceCount : number;
}