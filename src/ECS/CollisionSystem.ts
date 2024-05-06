import * as glm from "gl-matrix"
import { SupportSystem } from "./Systems";
import Entity from "./Entity";
import ECSWizard from "./ECSWizard";

    export default class CollisionSystem extends SupportSystem
    {
        constructor() 
        {
            super();
            this.CollectEntites();
        }

        public CollectEntites(): void 
        {
            for(const e of ECSWizard.GetAllEntities()) 
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
            for(const key of map) 
            {
                for(let i = 0; i < key.length; i++) 
                {
                    for(let j = 0; j < key[1].length; j++) 
                    {
                        if(i == j) continue;
                        this.CheckCollision(key[1][j], key[1][j]);
                    }
                }
            }
        }

        private CheckCollision(e1 : Entity, e2 : Entity) : boolean 
        {

            const xOverlap : boolean = false;
            const yOverlap : boolean = true;

            return xOverlap && yOverlap;
        }

        public ListenToUserInput(): void 
        {
            
        }


        private readonly mParticipiants !: [{Position : glm.vec3, Size : glm.vec3}];
    }