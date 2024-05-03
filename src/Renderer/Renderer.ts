import Device from "../Device";
import { SpriteRenderer } from "../ECS/Systems";
import { Types } from "../Types";
import { Utils } from "../Utils";

export default class Renderer implements Types.IApplicationLayer {
    constructor(d: Device) {
        this.mDevice = d;
        this.mSpriteSystem = new SpriteRenderer(this.mDevice.mGPU);

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
        });

        let depthTexture: GPUTexture;
        let depthTextureView: GPUTextureView;

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [Utils.Sizes.mCanvasWidth, Utils.Sizes.mCanvasHeight],
            dimension: "2d",
            format: "depth24plus-stencil8",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        };

        depthTexture = this.mDevice.mGPU.createTexture(depthTextureDesc);
        depthTextureView = depthTexture.createView();
    }

    public Draw(): void {
        // Set Target Texture for the render pass.
        const texView = this.mContext.getCurrentTexture().createView();

        // Begin render pass
        const encoder = this.mDevice.mGPU.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: texView,
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: { r: 1.0, g: 0.5, b: 0.0, a: 1.0 },
                },
            ],
        });

        this.mSpriteSystem.Run(pass);

        // End render pass
        pass.end();

        // Submit the command encoder
        this.mDevice.mGPU.queue.submit([encoder.finish()]);
    }

    public ListenToUserInput(): void { }

    public OnCanvasResize(w: number, h: number): void {
        let depthTexture: GPUTexture;
        let depthTextureView: GPUTextureView;

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [Utils.Sizes.mCanvasWidth, Utils.Sizes.mCanvasHeight],
            dimension: "2d",
            format: "depth24plus-stencil8",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        };

        depthTexture = this.mDevice.mGPU.createTexture(depthTextureDesc);
        depthTextureView = depthTexture.createView();
    }

    private mContext: GPUCanvasContext;
    private mDevice: Device;
    private mSpriteSystem: SpriteRenderer;
}
