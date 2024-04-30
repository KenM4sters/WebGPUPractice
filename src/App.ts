import Renderer from "./Renderer";
import { IAppPayload, IRenderLayer } from "./Types";

export default class App implements IRenderLayer
{
    constructor() 
    {
        this.InitAppPayload();
    }

    public GetPayload() : IAppPayload 
    {
        return this.mPayload;
    }

    private async InitAppPayload() 
    {
        async function InitWebGPU() : Promise<IAppPayload> 
        {
            const adapter : GPUAdapter | null = await navigator.gpu.requestAdapter();
            if(!adapter) throw new Error("Failed to get GPU adapter!");
    
            const device : GPUDevice = await adapter.requestDevice();
            const canvas : HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;

            return {Device : device, Canvas : canvas};
        }


        this.mPayload = await InitWebGPU();
        this.mRenderer = new Renderer(this.mPayload);
    }    

    Draw(): void {

        this.mRenderer.Draw();

        window.requestAnimationFrame(this.Draw);
    }

    Respond(): void {
        
    }

    Resize(): void {
        
    }

    private mPayload !: IAppPayload;
    private mRenderer !: Renderer;
}