import * as glm from "gl-matrix"
import AssetManager from "../AssetManager";
import { SpriteComponent } from "./Components";
import { System } from "./Systems";

    export default class CollisionSystem extends System
    {
        constructor(device : GPUDevice) 
        {
            super(device);
            this.CollectEntites();
        }

        public UpdateBuffers(): void 
        {
            
        }   

        public CollectEntites(): void 
        {
            for(const e of AssetManager.GetAllEntities()) 
            {
               if(e.GetComponent(`${e.mLabel + `_Sprite_Component`}`)) this.mEntities.push(e);
               else continue; 
            }

            for(const e of this.mEntities) 
            {
                
            }

        }

        public Run(pass: GPURenderPassEncoder): void 
        {   
            for(let i = 0; i < this.mEntities.length; i++) 
            {
                const SpriteA = this.mEntities[i].GetComponent(`${this.mEntities[i].mLabel + `_Sprite_Component`}`) as SpriteComponent;

                for(let j = 0; j < this.mEntities.length; j++) 
                {
                    if(j == i) continue;
                    const SpriteB = this.mEntities[j].GetComponent(`${this.mEntities[j].mLabel + `_Sprite_Component`}`) as SpriteComponent;

                    this.CheckCollision(SpriteA, SpriteB);
                } 
            }
        }

        private CheckCollision(SpriteA : SpriteComponent, SpriteB : SpriteComponent) : boolean 
        {
            // Sprite A Position
            const aPosX = SpriteA.mPosition[0][0];
            const aPosY = SpriteA.mPosition[0][1];

            // Sprite A Size
            const aSizeX = SpriteA.mSize[0][0];
            const aSizeY = SpriteA.mSize[0][1];

            // Sprite B Position
            const bPosX = SpriteA.mPosition[0][0];
            const bPosY = SpriteA.mPosition[0][1];

            // Sprite B Size
            const bSizeX = SpriteA.mSize[0][0];
            const bSizeY = SpriteA.mSize[0][1];

            const xOverlap : boolean = false;

            const yOverlap : boolean = true;

            return xOverlap && yOverlap;
        }

        public ListenToUserInput(): void 
        {
            
        }


        private readonly mParticipiants !: [{Position : glm.vec3, Size : glm.vec3}];
    }