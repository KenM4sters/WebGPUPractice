import Entity from "./ECS/Entity";
import Input from "./Core/Input";
import Device from "./Device";
import Renderer from "./Renderer/Renderer";
import { Utils } from "./Utils";

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

        window.requestAnimationFrame(() => this.Run());
    }

    private Init(gpu : GPUDevice) : void 
    {
        this.mDevice = new Device(gpu);   
        this.mRenderer = new Renderer(this.mDevice);

        Input.ListenToEvents();
        Utils.Time.Begin();
    }



    private mDevice !: Device;
    private mRenderer !: Renderer;
    private readonly mEntities : Entity[] = [];
};