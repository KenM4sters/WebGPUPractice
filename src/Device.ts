export default class Device 
{
    constructor(gpu : GPUDevice) 
    {
        this.mGPU = gpu;
    }

    public readonly mGPU : GPUDevice;
}