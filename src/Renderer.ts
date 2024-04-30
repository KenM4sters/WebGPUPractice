import * as glm from "gl-matrix"
import { Primitive, Square } from "./Primitives";
import { IAppPayload, IRenderLayer } from "./Types";
import squareShaderSrc from "../Shaders/Square.wgsl?raw";
import PerspectiveCamera from "./PerspectiveCamera";
import Input from "./Input";

export default class Renderer implements IRenderLayer {
  constructor(payload: IAppPayload) {

    this.mPayload = payload;

    // Camera
    this.mCamera = new PerspectiveCamera(glm.vec3.fromValues(0.0, 0.0, -3.0), payload.Canvas.width, payload.Canvas.height);
    // Encoder Setup
    const context = payload.Canvas.getContext("webgpu");
    if (!context) throw new Error("Failed to get WebGPU context from canvas!");
    this.mContext = context;

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    this.mContext.configure({
      device: payload.Device,
      format: canvasFormat,
    });

    let depthTexture : GPUTexture;
    let depthTextureView : GPUTextureView;

    const depthTextureDesc : GPUTextureDescriptor = 
    {
      size: [this.mPayload.Canvas.width, this.mPayload.Canvas.height],
      dimension: "2d",
      format: "depth24plus-stencil8",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
    };

    depthTexture = this.mPayload.Device.createTexture(depthTextureDesc);
    depthTextureView = depthTexture.createView();

    let colorTexture = this.mContext.getCurrentTexture();
    let colorTextureView = colorTexture.createView();

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

    // Uniforms.
    this.mMatrix = glm.mat4.scale(this.mMatrix, this.mMatrix, glm.vec3.fromValues(0.1, 0.1, 1.0));

    let modelUBO = payload.Device.createBuffer({
      label: "SquareMatrix",
      size: 16*4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    payload.Device.queue.writeBuffer(modelUBO, 0, new Float32Array(this.mMatrix));
    
    const squareBindGroup = payload.Device.createBindGroup({
      label: "SquareBindGroup",
      layout: squarePipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: {buffer: modelUBO}
      }]
    });

    this.mRenderPackage = 
    {
      Pipeline: squarePipeline,
      Geometry: square,
      VertexBuffer: vertexBuffer,
      BindGroup: squareBindGroup,
      UBO: modelUBO,
      Depth: {Texture: depthTexture, TextureView: depthTextureView},
      Color: {Texture: colorTexture, TextureView: colorTextureView},
    };
    
  }

  public Draw(ts: number): void {
    // Set up the color attachment
    this.mRenderPackage.Color.Texture = this.mContext.getCurrentTexture();
    this.mRenderPackage.Color.TextureView = this.mRenderPackage.Color.Texture.createView();

    this.EncodeCommands();  

    // Handle user input
    this.HandleUserInput(ts);
  }


  public HandleUserInput(ts : number) : void 
  {
    Input.IsKeyPressed("w") ? glm.mat4.translate(this.mMatrix, this.mMatrix, glm.vec3.fromValues(0.0*ts*5.0, 1.0*ts*5.0, 0.0)) : null;
    Input.IsKeyPressed("a") ? glm.mat4.translate(this.mMatrix, this.mMatrix, glm.vec3.fromValues(-1.0*ts*5.0, 0.0*ts*5.0, 0.0)) : null;
    Input.IsKeyPressed("s") ? glm.mat4.translate(this.mMatrix, this.mMatrix, glm.vec3.fromValues(0.0*ts*5.0, -1.0*ts*5.0, 0.0)) : null;
    Input.IsKeyPressed("d") ? glm.mat4.translate(this.mMatrix, this.mMatrix, glm.vec3.fromValues(1.0*ts*5.0, 0.0*ts*5.0, 0.0)) : null;
  }

  public Resize(): void {}

  public Respond(): void {}

  private EncodeCommands() : void 
  {
    // Begin render pass
    const encoder = this.mPayload.Device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [
            {
                view: this.mRenderPackage.Color.TextureView,
                loadOp: "clear",
                storeOp: "store",
                clearValue: { r: 1.0, g: 0.5, b: 0.0, a: 1.0 },
            },
        ],
    });

    // Set up render pass
    pass.setPipeline(this.mRenderPackage.Pipeline);
    pass.setVertexBuffer(0, this.mRenderPackage.VertexBuffer);
    pass.setBindGroup(0, this.mRenderPackage.BindGroup);
    this.mPayload.Device.queue.writeBuffer(this.mRenderPackage.UBO, 0, new Float32Array(this.mMatrix));
    pass.draw(this.mRenderPackage.Geometry.GetPayload().Vertices.byteLength / this.mRenderPackage.Geometry.GetPayload().BufferLayout.GetStride());

    // End render pass
    pass.end();

    // Submit the command encoder
    this.mPayload.Device.queue.submit([encoder.finish()]);
  }

  private mContext : GPUCanvasContext;
  private mCamera : PerspectiveCamera;
  private mMatrix : glm.mat4 = glm.mat4.create();
  private mPayload : IAppPayload;

  private mRenderPackage : 
  {
    Pipeline : GPURenderPipeline,
    Geometry : Primitive,
    VertexBuffer : GPUBuffer,
    BindGroup : GPUBindGroup,
    UBO : GPUBuffer,
    Depth: {Texture : GPUTexture, TextureView : GPUTextureView},
    Color: {Texture : GPUTexture, TextureView : GPUTextureView},
  };

};
