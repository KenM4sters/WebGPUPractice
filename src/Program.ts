import Device from "./Device";
import Entity from "./Entity";
import Input from "./Input";
import RenderSystem from "./RenderSystem";
import Renderer from "./Renderer";

var lastFrame : number = performance.now();



export default class Program
{
    constructor() 
    {
        Input.ListenToEvents();
    }
    
    async QueryForDevice() : Promise<void>
    {
        const adapter : GPUAdapter | null = await navigator.gpu.requestAdapter();
        if(!adapter) throw new Error("Failed to get GPU adapter!");
        const gpu : GPUDevice | null = await adapter.requestDevice();
        if(!gpu) throw new Error("Failed to get GPU device!");
    
        this.Init(gpu);
    }

    private Init(gpu : GPUDevice) : void 
    {
        this.mDevice = new Device(gpu);   
        this.mRenderer = new Renderer(this.mDevice);

        const canvas = document.querySelector("canvas") as HTMLCanvasElement;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    public Draw() : void 
    {
        const currentFrame = performance.now();
        const ts = (currentFrame - lastFrame) / 1000; // Convert to milliseconds.
        lastFrame = currentFrame;
        
        this.mRenderer.Draw(this.mRenderSystems, ts);

        window.requestAnimationFrame(() => this.Draw());
    }

    private mDevice !: Device;
    private mRenderer !: Renderer;
    private readonly mEntities : Entity[] = [];
    private readonly mRenderSystems : RenderSystem[] = [];
};