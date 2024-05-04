import Entity from "./Entity";
 
export abstract class System 
{
    constructor(device : GPUDevice) 
    {
        this.mDevice = device;
    }

    public abstract Run(pass : GPURenderPassEncoder) : void;

    public abstract CollectEntites() : void;

    public abstract UpdateBuffers() : void;

    public readonly mEntities : Entity[] = [];
    public readonly mDevice : GPUDevice;
};