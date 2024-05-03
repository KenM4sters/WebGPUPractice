import { SceneComponent } from "../ECS/Components";

export default class Level extends SceneComponent
{
    constructor(device : GPUDevice) 
    {
        super();

        this.Prepare(device);
        this.LoadAndGenerateAssets(device);
    } 

    public Prepare(device : GPUDevice): void 
    {
        
    }

    public LoadAndGenerateAssets(device : GPUDevice): void 
    {
        
    }
}