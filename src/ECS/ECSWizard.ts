import { Types } from "../Types";
import { Camera, Component, Material, Sprite, SquareGeometry } from "./Components";
import Entity from "./Entity";

export default class ECSWizard 
{
    constructor() {};


    // Submit.
    //
    public static SubmitEntity(e : Entity) : void { this.mEntities[e.mUUID] = e; }
    public static SubmitComponent(c : Component) : void 
    { 
        if(c instanceof Camera) this.mCameras[c.entityUUID] = c; 
        else if(c instanceof Material) this.mMaterials[c.entityUUID] = c; 
        else if(c instanceof SquareGeometry) this.mSquareGeometries[c.entityUUID] = c; 
        else if(c instanceof Sprite) this.mSprites[c.entityUUID] = c; 
        else if(c instanceof Material) this.mMaterials[c.entityUUID] = c; 
    }
    
    // Get Single.
    //
    public static GetComponent(entityUUID : number, container : Types.ComponentName) : Component | undefined 
    {
        if(container == "Camera")          { for(const c of this.mCameras)          if(c.entityUUID == entityUUID) return c; else continue; } 
        else if(container == "Geometries") { for(const g of this.mSquareGeometries) if(g.entityUUID == entityUUID) return g; else continue; } 
        else if(container == "Materials")  { for(const m of this.mCameras)          if(m.entityUUID == entityUUID) return m; else continue; } 
        else if(container == "Sprites")    { for(const s of this.mCameras)          if(s.entityUUID == entityUUID) return s; else continue; }
        else return undefined; 
    }



    // Get all.
    //
    public static GetAllEntities() : Entity[] { return this.mEntities; }


    // Members
    //
    private static mEntities : Entity[] = [];

    private static mSquareGeometries : SquareGeometry[] = [];
    private static mCameras : Camera[] = [];
    private static mMaterials : Material[] = [];
    private static mSprites : Sprite[] = [];
};