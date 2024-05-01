export default class BindGroup 
{
    constructor(bufferDescriptors : GPUBufferDescriptor[]) 
    {
        
    }

    public readonly mLayout : GPUBindGroupLayout;
    public readonly mBindGroup : GPUBindGroup;
    public readonly mUniformBuffers : GPUBuffer[];
};