import * as glm from "gl-matrix"
import AssetManager from "../AssetManager";
import { InstancedSpriteComponent, SpriteComponent } from "./Components";
import { SupportSystem } from "./Systems";
import Entity from "./Entity";

    export default class CollisionSystem extends SupportSystem
    {
        constructor() 
        {
            super();
            this.CollectEntites();
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

        public Run(map : Map<string, Entity[]>): void 
        {   
            
        }

        private CheckCollision(e1 : Entity, e2 : Entity) : boolean 
        {
            let spriteA = e1.GetComponent(`${e1.mLabel + `_Sprite_Component`}`) as SpriteComponent | InstancedSpriteComponent;
            let spriteB = e2.GetComponent(`${e2.mLabel + `_Sprite_Component`}`) as SpriteComponent | InstancedSpriteComponent;

            const xOverlap : boolean = false;

            const yOverlap : boolean = true;

            return xOverlap && yOverlap;
        }

        public ListenToUserInput(): void 
        {
            
        }


        private readonly mParticipiants !: [{Position : glm.vec3, Size : glm.vec3}];
    }