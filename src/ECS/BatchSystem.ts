import RenderWizard from "../Renderer/RenderWizard";
import { Types } from "../Types";
import { Camera, InstancedSprite, Material, Sprite, SquareGeometry } from "./Components";
import ECSWizard from "./ECSWizard";
import { RenderSystem } from "./Systems";

export default class BatchSystem extends RenderSystem 
{
    constructor(device : GPUDevice) 
    {
        super(device);
        this.CollectEntites();
    }

    public CollectEntites(): void 
    {        

        for(const e of ECSWizard.GetAllEntities()) 
        {
            const cSprite = e.GetComponent(`${e.mLabel + `_Sprite`}`);
            if(cSprite && cSprite instanceof InstancedSprite ) this.mEntities.push(e);
            else continue;

        }
    }

    public UpdateBuffers() : void 
    {
        
        const camera = this.mEntities[0].GetComponent(`_Camera`) as Camera | undefined;
        if(!camera) throw new Error("Entity sumbitted to BatchSystem does not contain a Camera ");

        this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.CameraUBO), 0, new Float32Array(camera.mProjectionMatrix));   
        this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.CameraUBO), 16*4, new Float32Array(camera.mViewMatrix));
        this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.CameraUBO), (16*4*2), new Float32Array(camera.mPosition));  

        for(const e of this.mEntities) 
        {
            const cSprite = e.GetComponent(`${e.mLabel + `_Sprite`}`) as InstancedSprite | undefined;
            if(!cSprite) {console.warn("Entity sumbitted to BatchSystem does not contain an Instanced Sprite "); continue; }
            
            const material = e.GetComponent(`${e.mLabel + `_Material`}`) as Material | undefined;
            if(!material) {console.warn("Entity sumbitted to BatchSystem does not contain a Material "); continue; }
            
            switch(e.mLabel) 
            {
                case "Enemy": 
                    this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.EnemyMaterialUBO), 0, new Float32Array(material.mAlbedo as number[]));   
                    this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(
                        Types.UBOs.EnemyInstanceTransformUBO), 
                        0, 
                        cSprite.mFloatArray.buffer, 
                        cSprite.mFloatArray.byteOffset, 
                        cSprite.mFloatArray.byteLength
                    );                    
                    break;
            }
        }
    }

    public Run(pass: GPURenderPassEncoder): void 
    {
        pass.setPipeline(RenderWizard.GetPipeline(Types.Pipelines.EnemyRenderPipeline));
        pass.setBindGroup(0, RenderWizard.GetBindGroup(Types.BindGroups.CameraGroup));
        
        for(const e of this.mEntities) 
        {
            switch(e.mLabel) 
            {
                case "Enemy": 
                    pass.setBindGroup(1, RenderWizard.GetBindGroup(Types.BindGroups.EnemyMaterialBindGroup));
                    pass.setBindGroup(2, RenderWizard.GetBindGroup(Types.BindGroups.EnemyInstanceTransformBindGroup));
                    break;
            }
            
            const geometry = e.GetComponent(`${e.mLabel + `_Geometry`}`) as SquareGeometry | undefined;
            if(!geometry) {console.warn("Entity sumbitted to BatchSystem does not contain a Geometry "); continue; }  

            pass.setVertexBuffer(0, geometry.mGPUBuffer);
            pass.draw(geometry.mData.Vertices.byteLength / geometry.mData.BufferLayout.GetStride(), geometry.mInstanceCount);            
        };
    }
}