import Device from "../Device";
import BatchSystem from "../ECS/BatchSystem";
import { SimpleSystem } from "../ECS/SimpleSystem";
import { System } from "../ECS/Systems";
import { Types } from "../Types";
import { Utils } from "../Utils";



export default class Renderer implements Types.IApplicationLayer 
{
    constructor(d: Device) {

        this.mDevice = d;

        // Canvas
        const canvas = document.querySelector("canvas") as HTMLCanvasElement;

        // Get the context so that we can query for its color texture and pass our scene texture.
        const context = canvas.getContext("webgpu");
        if (!context) throw new Error("Failed to get WebGPU context from canvas!");
        this.mContext = context;

        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

        this.mContext.configure({
            device: this.mDevice.mGPU,
            format: canvasFormat,
            alphaMode: "premultiplied"
        });

        // Entity Component Systems.
        //
        const cSimpleSystem = new SimpleSystem(this.mDevice.mGPU);
        const cBatchSystem = new BatchSystem(this.mDevice.mGPU);

        this.mSystems.push(cSimpleSystem);
        this.mSystems.push(cBatchSystem);

    }

    public Draw(): void {

        // Set Color and Depth Texture targets for the render pass.
        //
        const depthTextureDesc: GPUTextureDescriptor = {
            size: [Utils.Sizes.mCanvasWidth, Utils.Sizes.mCanvasHeight],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        };

        this.mRenderPass =
        {
            Desc:
            {
                colorAttachments: [
                    {
                        view: this.mContext.getCurrentTexture().createView(), // Assigned later

                        clearValue: [0.1, 0.1, 0.1, 1.0],
                        loadOp: 'clear',
                        storeOp: 'store',
                    },
                ],
                depthStencilAttachment: {
                    view: this.mDevice.mGPU.createTexture(depthTextureDesc).createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                },
            }
        }

        // Update Buffers (In most cases Uniform Buffers) for each Render System.
        //
        for(const sys of this.mSystems) 
        {
            sys.UpdateBuffers();
        }

        // Begin the render pass (no buffers can be modified form this point on in the current pass!).
        //
        const encoder = this.mDevice.mGPU.createCommandEncoder();
        const pass = encoder.beginRenderPass(this.mRenderPass.Desc);

        // Run each Render System.
        //
        for(const sys of this.mSystems) 
        {
            sys.Run(pass);
        }

        // End render pass
        //
        pass.end();

        // Submit the command encoder
        //
        this.mDevice.mGPU.queue.submit([encoder.finish()]);
    }

    public ListenToUserInput(): void 
    { 
        
    }

    public OnCanvasResize(w: number, h: number): void {

        // Render Pass Configuration.
        //
        let depthTextureView: GPUTextureView;
        let colorTextureView: GPUTextureView;

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [Utils.Sizes.mCanvasWidth, Utils.Sizes.mCanvasHeight],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        };

        // Set Target Texture for the render pass.
        colorTextureView = this.mContext.getCurrentTexture().createView();
        depthTextureView = this.mDevice.mGPU.createTexture(depthTextureDesc).createView();

        this.mRenderPass =
        {
            Desc:
            {
                colorAttachments: [
                    {
                        view: colorTextureView, // Assigned later

                        clearValue: [0.1, 0.1, 0.1, 1.0],
                        loadOp: 'clear',
                        storeOp: 'store',
                    },
                ],
                depthStencilAttachment: {
                    view: depthTextureView,

                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                },
            }
        }
    }

    private mContext : GPUCanvasContext;
    private mDevice : Device;
    private mRenderPass !: Types.IRenderPass;
    private readonly mSystems : System[] = [];
}
