import * as glm from "gl-matrix";
import Entity from "./Entity";
import { SupportSystem } from "./Systems";
import Input from "../Core/Input";
import ECSWizard from "./ECSWizard";
import { Sprite } from "./Components";

export default class PhysicsSystem extends SupportSystem
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
            const cSprite = e.GetComponent(`${e.mLabel + `_Sprite`}`);
            if(cSprite && cSprite instanceof Sprite) this.mEntities.push(e);
            else continue;
        }        
    }

    public Run(): void 
    {
        for(const e of this.mEntities) 
        {
            const cSprite = (e.GetComponent(`${e.mLabel + `_Sprite`}`)) as Sprite | undefined;
            if (!cSprite) {console.warn("Entity submitted to Physics System has no Sprite Component!"); continue;}
            if(!cSprite.mPhysics) continue;

            // Physics 
            //

            // Gravitational Acceleration.
            // glm.vec3.subtract(cSprite.mPhysics.Acceleration, cSprite.mPhysics.Acceleration, glm.vec3.fromValues(0, -1, 0)); // Rounded to 0d.p for peformance.
            
            // If entity is the player, then check for key input to apply forces and update
            // the acceleration.
            if(e.mLabel == "Player") this.MovePlayer(cSprite);  
            
            // Entity Acceleration and Velocity.
            glm.vec3.add(cSprite.mPhysics.Velocity, cSprite.mPhysics.Velocity, cSprite.mPhysics.Acceleration);
            glm.vec3.add(cSprite.mPosition, cSprite.mPosition, cSprite.mPhysics.Velocity);
            

            this.SetInitialTransforms(e);

            // Don't forget to reinitialize the float32array of the entity's transform
            // component - this is the cotainer that's actually inspected by the GPU 
            // to update the final vertices - so it absolutely must be called.
            this.SetTransformFloatArray(cSprite);

            cSprite.mModelMatrix = glm.mat4.create();
            cSprite.mPhysics.Velocity = glm.vec3.create();
            cSprite.mPhysics.Acceleration = glm.vec3.create();

        }
    }

    private MovePlayer(playerSprite : Sprite): void 
    {

        Input.CallSingleKeyPress(" ", () => {
            this.AppplyForce(playerSprite, glm.vec3.fromValues(0.0, -10.0, 0.0));
        });
        if(Input.IsKeyPressed("w")) this.AppplyForce(playerSprite, glm.vec3.fromValues(0.0, -2.0, 0.0));   
        if(Input.IsKeyPressed("a")) this.AppplyForce(playerSprite, glm.vec3.fromValues(-2.0, 0.0, 0.0));   
        if(Input.IsKeyPressed("s")) this.AppplyForce(playerSprite, glm.vec3.fromValues(0.0, 2.0, 0.0));   
        if(Input.IsKeyPressed("d")) this.AppplyForce(playerSprite, glm.vec3.fromValues(2.0, 0.0, 0.0));
    }

    private SetInitialTransforms(e : Entity) : void 
    {
        const cSprite = e.GetComponent(`${e.mLabel + `_Sprite`}`) as Sprite;
        
        glm.mat4.translate(cSprite.mModelMatrix, cSprite.mModelMatrix, cSprite.mPosition);
        glm.mat4.scale(cSprite.mModelMatrix, cSprite.mModelMatrix, cSprite.mSize);
    }

    private SetTransformFloatArray(sprite : Sprite) : void 
    {
        sprite.mFloatArray = new Float32Array(sprite.mModelMatrix);
    }

    private AppplyForce(sprite : Sprite, force : glm.vec3) : void
    {
        if(!sprite.mPhysics) {console.warn("Trying to apply a force to an object with no Physics Properties!"); return;}
        // f = ma  | Newton's 2nd law of motion.
        //
        const a = glm.vec3.div(glm.vec3.create(), force, glm.vec3.fromValues(sprite.mPhysics.Mass, sprite.mPhysics.Mass, sprite.mPhysics.Mass));
        glm.vec3.add(sprite.mPhysics.Acceleration, sprite.mPhysics.Acceleration, a);
    }
};