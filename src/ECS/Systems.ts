import AssetManager from "../AssetManager";
import { Types } from "../Types";
import { CameraComponent, SquareGeometryComponent, TransformComponent } from "./Components";
import Entity from "./Entity";
 
export abstract class System 
{
    constructor(device : GPUDevice) 
    {
        this.mDevice = device;
    }

    public abstract Run(pass : GPURenderPassEncoder) : void;

    public abstract CollectEntites() : void;

    public readonly mEntities : Entity[] = [];
    public readonly mDevice : GPUDevice;
};


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
            if(e.GetComponent("SquareGeometryComponent")) this.mEntities.push(e);
            else continue;
        }
    }

    public Run(pass : GPURenderPassEncoder): void {
        pass.setPipeline(AssetManager.GetPipeline(Types.PipelineAssets.BasicSpritePipeline));
        pass.setBindGroup(0, AssetManager.GetBindGroup(Types.BindGroupAssets.CameraGroup));
        pass.setBindGroup(1, AssetManager.GetBindGroup(Types.BindGroupAssets.BasicMaterialGroup));
        pass.setBindGroup(2, AssetManager.GetBindGroup(Types.BindGroupAssets.TransformGroup));

        for(const e of this.mEntities) 
        {  
            const geometry = e.GetComponent("SquareGeometryComponent") as SquareGeometryComponent | undefined;
            if(!geometry) {console.warn("Entity sumbitted to SpriteRenderer does not contain a Geometry Component"); continue; }

            const camera = e.GetComponent("CameraComponent") as CameraComponent | undefined;
            if(!camera) {console.warn("Entity sumbitted to SpriteRenderer does not contain a Camera Component"); continue; }

            const transform = e.GetComponent("TransformComponent") as TransformComponent | undefined;
            if(!transform) {console.warn("Entity sumbitted to SpriteRenderer does not contain a Camera Component"); continue; }

            pass.setVertexBuffer(0, geometry.mGPUBuffer);
            this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.CameraUBO) , 16*4, new Float32Array(transform.mModelMatrix));
            this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.CameraUBO) , 16*4*2, new Float32Array(camera.mViewMatrix));
            this.mDevice.queue.writeBuffer(AssetManager.GetUBO(Types.UBOAssets.CameraUBO) , (16*4) + (16*4*2), new Float32Array(camera.mProjectionMatrix));  
            pass.draw(geometry.mData.Vertices.byteLength / geometry.mData.BufferLayout.GetStride());
        };
    }
};