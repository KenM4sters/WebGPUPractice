import RenderWizard from "../Renderer/RenderWizard";
import { Types } from "../Types";
import { Camera, Material, Sprite, SquareGeometry } from "./Components";
import ECSWizard from "./ECSWizard";
import { RenderSystem } from "./Systems";

export class SimpleSystem extends RenderSystem 
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
            if(cSprite && cSprite instanceof Sprite) this.mEntities.push(e);
            else continue;
        }                 
    }

    public UpdateBuffers() : void 
    {
        const camera = this.mEntities[0].GetComponent(`Camera`) as Camera | undefined;
        if(!camera) throw new Error("Entity sumbitted to SimpleSystem does not contain a Camera Component");

        this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.CameraUBO), 0, new Float32Array(camera.mProjectionMatrix));   
        this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.CameraUBO), 16*4, new Float32Array(camera.mViewMatrix));
        this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.CameraUBO), (16*4*2), new Float32Array(camera.mPosition));  

        for(const e of this.mEntities) 
        {
            const sprite = e.GetComponent(`${e.mLabel + `_Sprite`}`) as Sprite | undefined;
            if(!sprite) {console.warn("Entity sumbitted to SimpleSystem does not contain a Sprite Component"); continue; }
            
            const material = e.GetComponent(`${e.mLabel + `_Material`}`) as Material | undefined;
            if(!material) {console.warn("Entity sumbitted to SimpleSystem does not contain a Material Component"); continue; }
            
            switch(e.mLabel) 
            {
                case "Player": 
                    this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.PlayerMaterialUBO), 0, new Float32Array(material.mAlbedo as number[]));   
                    this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.PlayerTransformUBO), 0, sprite.mFloatArray);
                    break;
                case "Background":                 
                    this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.BackgroundMaterialUBO), 0, new Float32Array(material.mAlbedo as number[]));   
                    this.mDevice.queue.writeBuffer(RenderWizard.GetUBO(Types.UBOs.BackgroundTransformUBO), 0, sprite.mFloatArray);
                    break;
            }
        }
    }

    public Run(pass : GPURenderPassEncoder): void {
        pass.setPipeline(RenderWizard.GetPipeline(Types.Pipelines.SimpleSquareRenderPipeline));
        pass.setBindGroup(0, RenderWizard.GetBindGroup(Types.BindGroups.CameraGroup));
        
        for(const e of this.mEntities) 
        {
            switch(e.mLabel) 
            {
                case "Player": 
                    pass.setBindGroup(1, RenderWizard.GetBindGroup(Types.BindGroups.PlayerMaterialBindGroup));
                    pass.setBindGroup(2, RenderWizard.GetBindGroup(Types.BindGroups.PlayerTransformBindGroup));
                    break;
                case "Background": 
                    pass.setBindGroup(1, RenderWizard.GetBindGroup(Types.BindGroups.BackgroundMaterialBindGroup));
                    pass.setBindGroup(2, RenderWizard.GetBindGroup(Types.BindGroups.BackgroundTransformBindGroup));
                    break;
            }

            const geometry = e.GetComponent(`${e.mLabel + `_Geometry`}`) as SquareGeometry | undefined;
            if(!geometry) {console.warn("Entity sumbitted to SimpleSystem does not contain a Geometry Component"); continue; }  

            pass.setVertexBuffer(0, geometry.mGPUBuffer);
            pass.draw(geometry.mData.Vertices.byteLength / geometry.mData.BufferLayout.GetStride(), geometry.mInstanceCount);      
                  
        };
    }
};