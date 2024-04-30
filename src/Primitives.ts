import { BufferAttribute, BufferLayout } from "./Buffer";
import { EDataType, IPrimitivePayload } from "./Types";

export abstract class Primitve 
{   
    constructor(payload : IPrimitivePayload) 
    {
        this.mPayload = payload;
    }

    GetPayload() : IPrimitivePayload { return this.mPayload; }
    SetPayload(payload : IPrimitivePayload) : void {
        this.mPayload = payload;
    }

    private mPayload !: IPrimitivePayload;
}


export class Square extends Primitve 
{
    constructor() 
    {
        const vertices = new Float32Array([
            // Left
            -0.5, -0.5, 0.0,
            -0.5,  0.5, 0.0,
             0.5,  0.5, 0.0,
            // Right
            -0.5, -0.5, 0.0,
             0.5, -0.5, 0.0,
             0.5,  0.5, 0.0,
        ]);

        const bufferLayout = new BufferLayout([
            new BufferAttribute("SquarePositionAttrib", 0, "float32x3")
        ]);

        super({Vertices: vertices, BufferLayout: bufferLayout});
    }
}