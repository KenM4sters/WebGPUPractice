import * as glm from "gl-matrix"
import PerspectiveCamera, { CameraDirections } from "../Core/PerspectiveCamera";
import Input from "../Core/Input";
import Device from "../Device";

export default class Renderer {
  constructor(d : Device) {

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
    });

    let depthTexture : GPUTexture;
    let depthTextureView : GPUTextureView;

    const depthTextureDesc : GPUTextureDescriptor = 
    {
      size: [canvas.width, canvas.height],
      dimension: "2d",
      format: "depth24plus-stencil8",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
    };

    depthTexture = this.mDevice.mGPU.createTexture(depthTextureDesc);
    depthTextureView = depthTexture.createView();

    let colorTexture = this.mContext.getCurrentTexture();
    let colorTextureView = colorTexture.createView();


    

    // Square

    const square = new Square();

    const vertexBuffer = this.mDevice.mGPU.createBuffer({
      label: "Square Vertices",
      size: square.GetPayload().Vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    
    this.mDevice.mGPU.queue.writeBuffer(
      vertexBuffer,
      0,
      square.GetPayload().Vertices
    );

    const squareShaderModule = this.mDevice.mGPU.createShaderModule({
      label: "Square Shader",
      code: squareShaderSrc,
    });

    const squarePipeline = this.mDevice.mGPU.createRenderPipeline({
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

    let modelUBO = this.mDevice.mGPU.createBuffer({
      label: "SquareMatrix",
      size: 16*4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    let viewUBO = this.mDevice.mGPU.createBuffer({
      label: "SquareView",
      size: 16*4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    let projectionUBO = this.mDevice.mGPU.createBuffer({
      label: "SquareProjection",
      size: 16*4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.mDevice.mGPU.queue.writeBuffer(modelUBO, 0, new Float32Array(this.mMatrix));
    this.mDevice.mGPU.queue.writeBuffer(viewUBO, 0, new Float32Array(this.mCamera.GetViewMatrix()));
    this.mDevice.mGPU.queue.writeBuffer(projectionUBO, 0, new Float32Array(this.mCamera.GetProjectionMatrix()));  
    
    const squareBindGroup = this.mDevice.mGPU.createBindGroup({
      label: "SquareBindGroup",
      layout: squarePipeline.getBindGroupLayout(0),
      entries: [{
          binding: 0,
          resource: {buffer: modelUBO}
      }, {
          binding: 1,
          resource: {buffer: viewUBO}
      }, {
          binding: 2,
          resource: {buffer: projectionUBO}
      }]
    });

    this.mRenderPackage = 
    {
      Pipeline: squarePipeline,
      Geometry: square,
      VertexBuffer: vertexBuffer,
      BindGroup: squareBindGroup,
      UBO: {Model: modelUBO, View: viewUBO, Projection: projectionUBO},
      Depth: {Texture: depthTexture, TextureView: depthTextureView},
      Color: {Texture: colorTexture, TextureView: colorTextureView},
    };
    
  }

  public Draw(systems : RenderSystem[], ts: number): void {
    // Set up the color attachment
    this.mRenderPackage.Color.Texture = this.mContext.getCurrentTexture();
    this.mRenderPackage.Color.TextureView = this.mRenderPackage.Color.Texture.createView();

    this.EncodeCommands();  

    // Handle user input
    this.HandleUserInput(ts);
  }


  public HandleUserInput(ts : number) : void 
  {
    if(Input.IsKeyPressed("w")) glm.mat4.translate(this.mMatrix, this.mMatrix, glm.vec3.fromValues(0.0*ts*5.0, 1.0*ts*5.0, 0.0));  
    if(Input.IsKeyPressed("a")) glm.mat4.translate(this.mMatrix, this.mMatrix, glm.vec3.fromValues(-1.0*ts*5.0, 0.0*ts*5.0, 0.0));  
    if(Input.IsKeyPressed("s")) glm.mat4.translate(this.mMatrix, this.mMatrix, glm.vec3.fromValues(0.0*ts*5.0, -1.0*ts*5.0, 0.0));  
    if(Input.IsKeyPressed("d")) glm.mat4.translate(this.mMatrix, this.mMatrix, glm.vec3.fromValues(1.0*ts*5.0, 0.0*ts*5.0, 0.0));

    if(Input.IsKeyPressed("ArrowUp")) this.mCamera.ProcessUserInput(CameraDirections.UP, ts);
    if(Input.IsKeyPressed("ArrowLeft")) this.mCamera.ProcessUserInput(CameraDirections.LEFT, ts);
    if(Input.IsKeyPressed("ArrowDown")) this.mCamera.ProcessUserInput(CameraDirections.DOWN, ts);
    if(Input.IsKeyPressed("ArrowRight")) this.mCamera.ProcessUserInput(CameraDirections.RIGHT, ts); 
  }

  public Resize(): void {}

  public Respond(): void {}

  private EncodeCommands() : void 
  {
    // Begin render pass
    const encoder = this.mDevice.mGPU.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: 
        [
            {
                view: this.mRenderPackage.Color.TextureView,
                loadOp: "clear",
                storeOp: "store",
                clearValue: { r: 1.0, g: 0.5, b: 0.0, a: 1.0 }
            },
        ],
    });

    // Set up render pass
    pass.setPipeline(this.mRenderPackage.Pipeline);
    pass.setVertexBuffer(0, this.mRenderPackage.VertexBuffer);
    pass.setBindGroup(0, this.mRenderPackage.BindGroup);
    this.mDevice.mGPU.queue.writeBuffer(this.mRenderPackage.UBO.Model, 0, new Float32Array(this.mMatrix));
    this.mDevice.mGPU.queue.writeBuffer(this.mRenderPackage.UBO.View, 0, new Float32Array(this.mCamera.GetViewMatrix()));
    this.mDevice.mGPU.queue.writeBuffer(this.mRenderPackage.UBO.Projection, 0, new Float32Array(this.mCamera.GetProjectionMatrix()));  
    pass.draw(this.mRenderPackage.Geometry.GetPayload().Vertices.byteLength / this.mRenderPackage.Geometry.GetPayload().BufferLayout.GetStride());

    // this.mthis.mDevice.mGPU.queue.writeBuffer(this.mRenderPackage.UBO.Model, 0, new Float32Array(glm.mat4.create()));
    // this.mthis.mDevice.mGPU.queue.writeBuffer(this.mRenderPackage.UBO.View, 0, new Float32Array(glm.mat4.create()));
    // this.mthis.mDevice.mGPU.queue.writeBuffer(this.mRenderPackage.UBO.Projection, 0, new Float32Array(glm.mat4.create()));  
    // pass.draw(this.mRenderPackage.Geometry.GetPayload().Vertices.byteLength / this.mRenderPackage.Geometry.GetPayload().BufferLayout.GetStride());

    // End render pass
    pass.end();

    // Submit the command encoder
    this.mDevice.mGPU.queue.submit([encoder.finish()]);
  }

  private mContext : GPUCanvasContext;
  private mCamera : PerspectiveCamera;
  private mDevice : Device;

};
