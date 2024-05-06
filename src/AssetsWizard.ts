import { Types } from "./Types";

export default class AssetManager 
{
    private constructor() {}

    // Submit.
    //
    public static SubmitTexture(t : GPUTexture, assetIndex : Types.TextureAssets)                       : void { this.mTextures[assetIndex] = t; }


    // Get Single.
    //
    public static GetTexture(assetIndex : Types.TextureAssets)      : GPUTexture { return this.mTextures[assetIndex]; }



    // Members.
    //
    private static mTextures : GPUTexture[] = [];    

};