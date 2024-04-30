import Input from "./Input";
import Renderer from "./Renderer";
import { IAppPayload, IRenderLayer } from "./Types";

var lastFrame : number = performance.now();

export default class App implements IRenderLayer
{
    constructor() 
    {
        this.InitAppPayload();
        this.mInput = new Input();
        this.mInput.ListenToEvents();
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

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            return {Device : device, Canvas : canvas};
        }


        this.mPayload = await InitWebGPU();
        this.mRenderer = new Renderer(this.mPayload);

    }    

    public Draw(): void {
        const currentFrame : number = performance.now();
        const ts : number = (currentFrame - lastFrame) * 0.001;
        lastFrame = currentFrame;
        
        this.mRenderer?.Draw(ts);        
        window.requestAnimationFrame(() => this.Draw());
    }

    public Respond(): void {
        
    }

    public Resize(): void {
        
    }

    private mPayload !: IAppPayload;
    private mRenderer !: Renderer;
    private mInput : Input;
}