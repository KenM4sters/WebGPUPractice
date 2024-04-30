// ----------------------------------------------------------------
// This is essentailly a wrapper class around the native GPUVertexBuffferAttribute
// that matches my personal code convention preferences.
// When using this class for defining render pipelines, you'll always want to call
// @function GetNative() instead of using the class directly. 
// ----------------------------------------------------------------
export class BufferAttribute 
{
    constructor(label : string, shaderLoc : number, format : GPUVertexFormat) 
    {
        this.mLabel = label;
        this.mShaderLoc = shaderLoc;
        this.mFormat = format;

        switch(format) 
        {
            case "float32":     this.mSize = 4*1; break;
            case "float32x2":   this.mSize = 4*2; break;
            case "float32x3":   this.mSize = 4*3; break;
            case "float32x4":   this.mSize = 4*4; break;
            case "uint32":      this.mSize = 4*1; break;
            case "uint32x2":    this.mSize = 4*2; break;
            case "uint32x3":    this.mSize = 4*3; break;
            case "uint32x4":    this.mSize = 4*4; break;
        };
    }

    public GetAttribOffset() : number {return this.mOffset;}
    public SetAttribOffset(val : number) : void {this.mOffset = val;}

    public readonly mSize : number = 0;
    public readonly mFormat : GPUVertexFormat = "float32x3";
    public readonly mShaderLoc : number = 0;
    public readonly mLabel : string = "default";
    private mOffset : number = 0; // Needs more information about the wider buffer layout in order to be set - see BufferLayout.
};


// ----------------------------------------------------------------
// This is essentailly a wrapper class around the native GPUVertexBuffferLayout
// that matches my personal code convention preferences.
// When using this class for defining render pipelines, you'll always want to call
// @function GetNativeLayout() instead of using the class directly. 
// ----------------------------------------------------------------
export class BufferLayout 
{
    constructor(attributes : BufferAttribute[] ) 
    {
        this.mAttribs = attributes;
        this.CalculateStrideAndOffset();
    } 
    
    public GetLayout() : BufferAttribute[] { return this.mAttribs; }
    public GetStride() : number { return this.mStride; }

    public GetNativeLayout() : GPUVertexBufferLayout 
    {
        let nativeAttribs : GPUVertexAttribute[] = [];

        for(const a of this.mAttribs) 
        {
            let attrib : GPUVertexAttribute = 
            {
                format: a.mFormat,
                shaderLocation: a.mShaderLoc,
                offset: a.GetAttribOffset()
            }

            nativeAttribs.push(attrib);
        }

        const nativeLayout : GPUVertexBufferLayout = 
        {
            arrayStride: this.mStride,
            attributes: nativeAttribs
        }

        return nativeLayout;
    }

    public CalculateStrideAndOffset() : void
    {
        for(const a of this.mAttribs) 
        {
            a.SetAttribOffset(this.mStride);
            this.mStride += a.mSize;
        }
    }

    public readonly mAttribs : BufferAttribute[] = [];
    private mStride : number = 0;  
};