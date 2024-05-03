import AssetManager from "../AssetManager";
import { System } from "./Systems";

export default class BatchSystem extends System 
{
    constructor(device : GPUDevice) 
    {
        super(device);
    }

    public CollectEntites(): void 
    {
        for(const e of AssetManager.GetAllEntities()) 
            {
                if(e.GetComponent(`${e.mLabel + `_Instance_Transform_Component`}`)) this.mEntities.push(e);
                else continue;
            }
    }

    public Run(pass: GPURenderPassEncoder): void 
    {
        
    }
}