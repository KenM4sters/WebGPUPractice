import Device from "../Device";
import BatchSystem from "../ECS/BatchSystem";
import { SpriteRenderer } from "../ECS/SpriteSystem";
import { Types } from "../Types";
import { Utils } from "../Utils";



export default class Renderer implements Types.IApplicationLayer 
{
    constructor(d: Device) {

        this.mDevice = d;
        
        this.mSpriteSystem = new SpriteRenderer(this.mDevice.mGPU);
        this.mBatchSystem = new BatchSystem(this.mDevice.mGPU);

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
    }

    public Draw(): void {

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

        // Update Buffers for each Render System.
        this.mSpriteSystem.UpdateState();
        this.mBatchSystem.UpdateState();

        // Begin render pass
        const encoder = this.mDevice.mGPU.createCommandEncoder();
        const pass = encoder.beginRenderPass(this.mRenderPass.Desc);

        // Run each Render System.
        this.mSpriteSystem.Run(pass);
        this.mBatchSystem.Run(pass);

        // End render pass
        pass.end();

        // Submit the command encoder
        this.mDevice.mGPU.queue.submit([encoder.finish()]);
    }

    public ListenToUserInput(): void { }

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
    private mSpriteSystem : SpriteRenderer;
    private mBatchSystem : BatchSystem;
    private mRenderPass !: Types.IRenderPass;
}
