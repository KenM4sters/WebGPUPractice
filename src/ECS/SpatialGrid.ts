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
                this.mEntityGridMap.set(quad.Position, []);
                
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
            const cXcell = Math.floor(cSprite.mPosition[0] / this.mCellWidth);
            const cYcell = Math.floor(cSprite.mPosition[1] / this.mCellHeight);

            const cellEntities = this.mEntityGridMap.get({x: cXcell, y: cYcell});
            
            cellEntities?.push(e);
            
            
            
        } 
        else if(cSprite && cSprite instanceof InstancedSpriteComponent) 
        {
        } 
        else {
            console.warn("Attempting to assing a grid to an entity with no Sprite Component!"); 
            return;
        }
    }

    private readonly mEntityGridMap = new Map<{x: number, y: number}, Entity[]>(); 
    private readonly mGridCells : Types.GridCell[] = [];
    private readonly mCellWidth : number;
    private readonly mCellHeight : number;
};   