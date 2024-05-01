import { Mesh } from "./Mesh";
import PipeLine from "./Pipeline";

export abstract class RenderSystem 
{
    constructor() {};

    private readonly mPipeline !: PipeLine;
};


//----------------------------------------------------------------
// The MeshSystem is a RenderSystem that handles the rendering
// of any scene objects that are Meshes - think squares,
// triangles, circles etc.. 
//----------------------------------------------------------------
export class MeshSystem extends RenderSystem 
{
    constructor(m : Mesh[]) 
    {
        super();

    }
};