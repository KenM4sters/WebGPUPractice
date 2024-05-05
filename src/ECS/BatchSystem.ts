import AssetManager from "../AssetManager";
import { Types } from "../Types";
import { CameraComponent, InstancedSpriteComponent, MaterialComponent, SpriteComponent, SquareGeometryComponent } from "./Components";
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

        for(const e of AssetManager.GetAllEntities()) 
        {
            const cSprite = e.GetComponent(`${e.mLabel + `_Sprite_Component`}`);
            if(cSprite && cSprite instanceof InstancedSpriteComponent ) this.mEntities.push(e);
            else continue;

        }
    }

    public UpdateBuffers() : void 
    {
        
        const camera = this.mEntities[0].GetComponent(`Camera_Component`) as CameraComponent | undefined;
        if(!camera) throw new Error("Entity sumbitted to BatchSystem does not contain a Camera Component");

        this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.CameraUBO), 0, new Float32Array(camera.mProjectionMatrix));   
        this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.CameraUBO), 16*4, new Float32Array(camera.mViewMatrix));
        this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.CameraUBO), (16*4*2), new Float32Array(camera.mPosition));  

        for(const e of this.mEntities) 
        {
            const cSprite = e.GetComponent(`${e.mLabel + `_Sprite_Component`}`) as SpriteComponent | undefined;
            if(!cSprite) {console.warn("Entity sumbitted to BatchSystem does not contain a Sprite Component"); continue; }
            
            const material = e.GetComponent(`${e.mLabel + `_Material_Component`}`) as MaterialComponent | undefined;
            if(!material) {console.warn("Entity sumbitted to BatchSystem does not contain a Material Component"); continue; }
            
            switch(e.mLabel) 
            {
                case "Level": 
                    this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.LevelMaterialUBO), 0, new Float32Array(material.mAlbedo as number[]));   
                    this.mDevice.queue.writeBuffer(AssetManager.GetUBO(
                        Types.UBOAssets.LevelInstanceTransformUBO), 
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
        pass.setPipeline(AssetManager.GetPipeline(Types.PipelineAssets.LevelRenderPipeline));
        pass.setBindGroup(0, AssetManager.GetBindGroup(Types.BindGroupAssets.CameraGroup));
        
        for(const e of this.mEntities) 
        {
            switch(e.mLabel) 
            {
                case "Level": 
                    pass.setBindGroup(1, AssetManager.GetBindGroup(Types.BindGroupAssets.LevelMaterialBindGroup));
                    pass.setBindGroup(2, AssetManager.GetBindGroup(Types.BindGroupAssets.LevelInstanceTransformBindGroup));
                    break;
            }
            
            const geometry = e.GetComponent(`${e.mLabel + `_Geometry_Component`}`) as SquareGeometryComponent | undefined;
            if(!geometry) {console.warn("Entity sumbitted to BatchSystem does not contain a Geometry Component"); continue; }  

            pass.setVertexBuffer(0, geometry.mGPUBuffer);
            pass.draw(geometry.mData.Vertices.byteLength / geometry.mData.BufferLayout.GetStride(), geometry.mInstanceCount);            
        };
    }
}