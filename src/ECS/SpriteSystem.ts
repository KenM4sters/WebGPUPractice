import AssetManager from "../AssetManager";
import { Types } from "../Types";
import { CameraComponent, MaterialComponent, SquareGeometryComponent, TransformComponent } from "./Components";
import { System } from "./Systems";

export class SpriteRenderer extends System 
{
    constructor(device : GPUDevice) 
    {
        super(device);
        this.CollectEntites();
    }
    
    public CollectEntites(): void {
        for(const e of AssetManager.GetAllEntities()) 
        {
            if(e.GetComponent(`${e.mLabel + `_Geometry_Component`}`)) this.mEntities.push(e);
            else continue;
        }                
    }

    public UpdateState() : void 
    {
        for(const e of this.mEntities) 
        {
            const camera = e.GetComponent(`${e.mLabel + `_Camera_Component`}`) as CameraComponent | undefined;
            if(!camera) {console.warn("Entity sumbitted to SpriteRenderer does not contain a Camera Component"); continue; }
    
            const transform = e.GetComponent(`${e.mLabel + `_Transform_Component`}`) as TransformComponent | undefined;
            if(!transform) {console.warn("Entity sumbitted to SpriteRenderer does not contain a Transform Component"); continue; }
    
            const material = e.GetComponent(`${e.mLabel + `_Material_Component`}`) as MaterialComponent | undefined;
            if(!material) {console.warn("Entity sumbitted to SpriteRenderer does not contain a Material Component"); continue; }
            
            this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.CameraUBO), 0, new Float32Array(camera.mProjectionMatrix));   
            this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.CameraUBO), 16*4, new Float32Array(camera.mViewMatrix));
            this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.CameraUBO), (16*4*2), new Float32Array(camera.mPosition));   
            this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.BasicMaterialUBO), 0, new Float32Array(material.mAlbedo as number[]));   
            this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.TransformUBO), 0, new Float32Array(transform.mModelMatrix));
        }
    }

    public Run(pass : GPURenderPassEncoder): void {
        pass.setPipeline(AssetManager.GetPipeline(Types.PipelineAssets.BasicSpritePipeline));
        pass.setBindGroup(0, AssetManager.GetBindGroup(Types.BindGroupAssets.CameraGroup));
        pass.setBindGroup(1, AssetManager.GetBindGroup(Types.BindGroupAssets.BasicMaterialGroup));
        pass.setBindGroup(2, AssetManager.GetBindGroup(Types.BindGroupAssets.TransformGroup));
        
        for(const e of this.mEntities) 
        {  
            const geometry = e.GetComponent(`${e.mLabel + `_Geometry_Component`}`) as SquareGeometryComponent | undefined;
            if(!geometry) {console.warn("Entity sumbitted to SpriteRenderer does not contain a Geometry Component"); continue; }                        

            pass.setVertexBuffer(0, geometry.mGPUBuffer);
            pass.draw(geometry.mData.Vertices.byteLength / geometry.mData.BufferLayout.GetStride());            
        };
    }
};