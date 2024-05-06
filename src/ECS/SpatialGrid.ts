import * as glm from "gl-matrix";
import AssetManager from "../AssetManager";
import { Types } from "../Types";
import { Utils } from "../Utils";
import { InstancedSpriteComponent, SpriteComponent } from "./Components";
import Entity from "./Entity";
import { SupportSystem } from "./Systems";

export default class SpatialGrid extends SupportSystem 
{
    constructor() 
    {
        super();

        // Grid Setup.
        //
        this.mCellWidth = Utils.Sizes.mCanvasWidth;
        this.mCellHeight = Utils.Sizes.mCanvasHeight;

        const cWidthSegs = 2;
        const cHeightSegs = 2;


        for(let i = 0; i < cHeightSegs; i++) 
        {
            for(let j = 0; j < cWidthSegs; j++) 
            {
                let quad : Types.GridCell = 
                {
                    Position: {x: this.mCellWidth * (j/cWidthSegs), y: this.mCellHeight * (i/cHeightSegs)},
                    Size: {x: this.mCellWidth / cWidthSegs, y: this.mCellHeight / cHeightSegs},
                };
                this.mGridCells.push(quad);
                // this.mEntityGridMap.set(quad.Position, []);
                
            }
        }         
        this.CollectEntites();
    }

    public CollectEntites(): void 
    {
        for(const e of AssetManager.GetAllEntities()) 
        {
            if(e.GetComponent(`${e.mLabel + `_Sprite_Component`}`)) 
            {
                this.mEntities.push(e)
                this.AssignGrids(e);
            }
            else continue;
        }        
    }

    public Run(): void 
    {
        this.mEntityGridMap.clear();
        for(const e of this.mEntities) 
        {
            this.AssignGrids(e);            
        }
    }

    private AssignGrids(e : Entity) : void 
    {
        const cSprite = e.GetComponent(`${e.mLabel + `_Sprite_Component`}`);
        if(cSprite && cSprite instanceof SpriteComponent) 
        {
            const cXcell = Math.round(cSprite.mPosition[0] / this.mCellWidth);
            const cYcell = Math.round(cSprite.mPosition[1] / this.mCellHeight);

            this.AddEntityToCells(`${cXcell},${cYcell}`, e);            

        } 
        else if(cSprite && cSprite instanceof InstancedSpriteComponent) 
        {
            for(const pos of cSprite.mPosition) 
            {   
                const cXcell = Math.round(pos[0] / this.mCellWidth);
                const cYcell = Math.round(pos[1] / this.mCellHeight);
    
                this.AddEntityToCells(`${cXcell},${cYcell}`, e); 
            }         
        } 
        else {
            console.warn("Attempting to assing a grid to an entity with no Sprite Component!"); 
            return;
        }
    }

    private AddEntityToCells(cell : string, e : Entity) : void 
    {
        if(this.mEntityGridMap.has(cell)) 
        {
            const cArr = this.mEntityGridMap.get(cell);
            if(!cArr) {console.warn("Cell doesn't exist!"); return;}
            cArr.push(e);
            this.mEntityGridMap.set(cell, cArr);
            
        }
        else 
        {
            this.mEntityGridMap.set(cell, [e]);
        }
    }

    public readonly mEntityGridMap = new Map<string, Entity[]>(); 
    private readonly mGridCells : Types.GridCell[] = [];
    private readonly mCellWidth : number;
    private readonly mCellHeight : number;
};   