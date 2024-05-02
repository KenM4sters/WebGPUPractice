import Device from "./Device";
import Renderer from "./Renderer/Renderer";
import { Utils } from "./Utils";
import Scene from "./Core/Scene";

export default class Program
{
    constructor() {}
    
    public async QueryForDevice() : Promise<void>
    {
        const adapter : GPUAdapter | null = await navigator.gpu.requestAdapter();
        if(!adapter) throw new Error("Failed to get GPU adapter!");
        const gpu : GPUDevice | null = await adapter.requestDevice();
        if(!gpu) throw new Error("Failed to get GPU device!");
    
        this.Init(gpu);
    }
    
    public Run() : void 
    {        
        Utils.Time.Run(); // Updates current time and time between frames (delta time).

        this.mRenderer.Draw();

        this.HandleUserInput();

        window.requestAnimationFrame(() => this.Run());
    }

    public HandleUserInput()
    {
        this.mRenderer.HandleUserInput();
        this.mScene.HandleUserInput();
    }

    private Init(gpu : GPUDevice) : void 
    {
        this.mDevice = new Device(gpu);   
        this.mScene = new Scene(this.mDevice.mGPU);
        this.mRenderer = new Renderer(this.mDevice);

        Utils.Time.Begin();
    }



    private mDevice !: Device;
    private mRenderer !: Renderer;
    private mScene !: Scene;
};