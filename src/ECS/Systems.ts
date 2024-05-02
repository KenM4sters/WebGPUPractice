import { CameraComponent } from "./Components";
import Entity from "./Entity";
 
export abstract class System 
{
    constructor() 
    {

    }

    public abstract Submit(e : Entity) : void;

    public abstract Run(pass : GPURenderPassEncoder) : void;

    public readonly mEntities : Entity[] = [];
};


export class SpriteRenderer extends System 
{
    constructor() 
    {
        super();
    }

    public Submit(e: Entity): void {
        let isSprite : boolean = false;

        for(const c of e.mComponents) 
        {
            if(c instanceof CameraComponent) isSprite = true;
            else continue;
        }

        isSprite ? this.mEntities.push(e) 
            : console.warn("Entity submitted to SpriteRenderer did not contain any Camera Component - Discarding.");
    }

    public Run(pass : GPURenderPassEncoder): void {
        pass.setBindGroup(0, this.mRenderPackage.BindGroup);

        for(const e of this.mEntities) 
        {            
            pass.setPipeline(this.mRenderPackage.Pipeline);
            pass.setVertexBuffer(0, this.mRenderPackage.VertexBuffer);
            this.mDevice.mGPU.queue.writeBuffer(this.mRenderPackage.UBO.Model, 0, new Float32Array(this.mMatrix));
            this.mDevice.mGPU.queue.writeBuffer(this.mRenderPackage.UBO.View, 0, new Float32Array(this.mCamera.GetViewMatrix()));
            this.mDevice.mGPU.queue.writeBuffer(this.mRenderPackage.UBO.Projection, 0, new Float32Array(this.mCamera.GetProjectionMatrix()));  
            pass.draw(this.mRenderPackage.Geometry.GetPayload().Vertices.byteLength / this.mRenderPackage.Geometry.GetPayload().BufferLayout.GetStride());
        }
    }
};