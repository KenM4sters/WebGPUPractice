export default class RenderPipeline 
{
    constructor(uniformBuffers : GPUBuffer[], layout : GPUBindGroupLayout, bindGroup : GPUBindGroup)  
    {
        this.mUBO = uniformBuffers;
        this.mBindGroupLayout = layout;
        this.mBindGroup = bindGroup;

        

    }

    public readonly mLabel : string = "PipelineWithNoName";
    public readonly mLayout : GPUPipelineLayout;
    public readonly mPipeline : GPURenderPipeline;
    public readonly mBindGroup : GPUBindGroup;
    public readonly mBindGroupLayout : GPUBindGroupLayout;
    public readonly mUBO : GPUBuffer[] = [];

};