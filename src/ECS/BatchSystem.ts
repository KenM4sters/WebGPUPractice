import AssetManager from "../AssetManager";
import { Types } from "../Types";
import { CameraComponent, MaterialComponent, SquareGeometryComponent, TransformComponent } from "./Components";
import { System } from "./Systems";

export default class BatchSystem extends System 
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
            const cTransformComponent = e.GetComponent(`${e.mLabel + `_Transform_Component`}`) as TransformComponent | undefined;
            if(!cTransformComponent) continue;
            else if(cTransformComponent.mModelMatrices.length <= 1) continue;
            else this.mEntities.push(e);

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
            const transform = e.GetComponent(`${e.mLabel + `_Transform_Component`}`) as TransformComponent | undefined;
            if(!transform) {console.warn("Entity sumbitted to BatchSystem does not contain a Transform Component"); continue; }
            
            const material = e.GetComponent(`${e.mLabel + `_Material_Component`}`) as MaterialComponent | undefined;
            if(!material) {console.warn("Entity sumbitted to BatchSystem does not contain a Material Component"); continue; }
            
            switch(e.mLabel) 
            {
                case "Level": 
                    this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.LevelMaterialUBO), 0, new Float32Array(material.mAlbedo as number[]));   
                    this.mDevice.queue.writeBuffer(AssetManager.GetUBO(
                        Types.UBOAssets.LevelInstanceTransformUBO), 
                        0, 
                        transform.mFloatArray.buffer, 
                        transform.mFloatArray.byteOffset, 
                        transform.mFloatArray.byteLength
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

    public ListenToUserInput(): void 
    {
        
    }
}