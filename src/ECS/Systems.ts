import Entity from "./Entity";
 
export abstract class RenderSystem 
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

export abstract class SupportSystem
{
    constructor() 
    {
    }

    public abstract Run() : void;

    public abstract CollectEntites() : void;

    public readonly mEntities : Entity[] = [];

}