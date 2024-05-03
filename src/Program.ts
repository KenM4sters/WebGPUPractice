import Device from "./Device";
import Renderer from "./Renderer/Renderer";
import { Utils } from "./Utils";
import Scene from "./Core/Scene";
import { Types } from "./Types";
import Input from "./Core/Input";

export default class Program implements Types.IApplicationLayer
{
    constructor() {}
    
    public async QueryForDevice() : Promise<void>
    {
        const adapter : GPUAdapter | null = await navigator.gpu.requestAdapter();
        if(!adapter) throw new Error("Failed to get GPU adapter!");
        const gpu : GPUDevice | null = await adapter.requestDevice();
        if(!gpu) throw new Error("Failed to get GPU device!");
        
        // If no errors have been thrown, then the program will initialize itself.
        this.Init(gpu);
    }
    
    public Run() : void 
    {        

        Utils.Time.Run(); // Updates current time and time between frames (delta time).

        this.mRenderer.Draw(); // Initiates a render pass and runs each render system.

        this.ListenToUserInput(); // Calls each ListenToUserInput() method on each application layer.

        window.requestAnimationFrame(() => this.Run()); // Game Loop.
    }

    public ListenToUserInput()
    {
        this.mRenderer.ListenToUserInput();
        this.mScene.ListenToUserInput();
    }

    // Callback function for window resize event.
    // The width and height are the dimensions of the canvas after its been resized in response 
    // to the window resize event.
    public OnCanvasResize = (w : number, h : number) =>  
    {
        this.mScene.OnCanvasResize(w, h);
        this.mRenderer.OnCanvasResize(w, h);
    }

    private Init(gpu : GPUDevice) : void 
    {
        Input.ListenToEvents();
        Utils.Sizes.ListenToResize(this.OnCanvasResize);
        Utils.Time.Begin();
        
        this.mDevice = new Device(gpu);   
        this.mScene = new Scene(this.mDevice.mGPU);
        this.mRenderer = new Renderer(this.mDevice);
        
    }

    private mDevice !: Device;
    private mRenderer !: Renderer;
    private mScene !: Scene;
};