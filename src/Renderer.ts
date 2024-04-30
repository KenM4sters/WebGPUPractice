import { Square } from "./Primitives";
import { IAppPayload, IRenderLayer } from "./Types";
import squareShaderSrc from "../Shaders/Square.wgsl?raw";

export default class Renderer implements IRenderLayer {
  constructor(payload: IAppPayload) {
    // Encoder Setup
    this.mEncoder = payload.Device.createCommandEncoder();
    const context = payload.Canvas.getContext("webgpu");
    if (!context) throw new Error("Failed to get WebGPU context from canvas!");

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device: payload.Device,
      format: canvasFormat,
    });

    const pass = this.mEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 1.0, g: 0.5, b: 0.0, a: 1.0 },
        },
      ],
    });

    // Square

    const square = new Square();

    const vertexBuffer = payload.Device.createBuffer({
      label: "Square Vertices",
      size: square.GetPayload().Vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    
    payload.Device.queue.writeBuffer(
      vertexBuffer,
      0,
      square.GetPayload().Vertices
    );

    const squareShaderModule = payload.Device.createShaderModule({
      label: "Square Shader",
      code: squareShaderSrc,
    });

    const squarePipeline = payload.Device.createRenderPipeline({
      label: "Square Pipeline",
      layout: "auto",
      vertex: {
        module: squareShaderModule,
        entryPoint: "mainVert",
        buffers: [
            square.GetPayload().BufferLayout.GetNativeLayout()
        ],
      },
      fragment: {
        module: squareShaderModule,
        entryPoint: "mainFrag",
        targets: [
          {
            format: canvasFormat,
          },
        ],
      },
    });

    pass.setPipeline(squarePipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(square.GetPayload().Vertices.byteLength / square.GetPayload().BufferLayout.GetStride());

    pass.end();
    payload.Device.queue.submit([this.mEncoder.finish()]);
  }

  Draw(): void {}

  Resize(): void {}

  Respond(): void {}

  private mEncoder: GPUCommandEncoder;
}
