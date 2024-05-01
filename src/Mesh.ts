import { Material } from "./Material";
import { Primitive } from "./Primitives";

export class Mesh 
{
    constructor(primitive : Primitive, material : Material) 
    {  
        this.mPrimitive = primitive;
        this.mMaterial = material;
    }

    public readonly mPrimitive;
    public readonly mMaterial;
};