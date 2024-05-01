import PipeLine from "./Pipeline";
import { Primitive } from "./Primitives";

export abstract class RenderSystem 
{
    constructor() {};

    private readonly mPipeline !: PipeLine;
};


//----------------------------------------------------------------
// The PrimitiveSystem is a RenderSystem that handles the rendering
// of any scene objects that are basic Primitives - think squares,
// triangles, circles etc.. 
//----------------------------------------------------------------
export class PrimitiveSystem extends RenderSystem 
{
    constructor(primitives : Primitive[]) 
    {
        super();

        
    }
}