import * as glm from "gl-matrix";
import AssetManager from "../AssetManager";
import { PhysicsComponent, SpriteComponent, TransformComponent } from "./Components";
import Entity from "./Entity";
import { System } from "./Systems";
import Input from "../Core/Input";
import { Types } from "../Types";
import { Utils } from "../Utils";

export default class Physics extends System 
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
            if(e.GetComponent(`${e.mLabel + `_Physics_Component`}`)) this.mEntities.push(e);
            else continue;
        }

        for(const e of this.mEntities) 
        {
            this.TeleportEntity(e);
        }
    }

    public Run(pass: GPURenderPassEncoder): void 
    {
        for(const e of this.mEntities) 
        {
            const cPhysics = (e.GetComponent(`${e.mLabel + `_Physics_Component`}`)) as PhysicsComponent;
            const cTransform = (e.GetComponent(`${e.mLabel + `_Transform_Component`}`)) as TransformComponent | undefined;
            if (!cTransform) {console.warn("Entity submitted to Physics System has no Transform Component!"); continue;}
            const cSprite = (e.GetComponent(`${e.mLabel + `_Sprite_Component`}`)) as SpriteComponent | undefined;
            if (!cSprite) {console.warn("Entity submitted to Physics System has no Sprite Component!"); continue;}

            glm.vec3.add(cPhysics.mVelocity[0], cPhysics.mVelocity[0], cPhysics.mAcceleration[0]);
            glm.vec3.add(cSprite.mPosition[0], cSprite.mPosition[0], cPhysics.mVelocity[0]);

            // Gravitational Acceleration.
            // TODO:
            
            cPhysics.mVelocity[0] = glm.vec3.create();
            cTransform.mModelMatrices[0] = glm.mat4.create();
            glm.mat4.translate(cTransform.mModelMatrices[0], cTransform.mModelMatrices[0], cSprite.mPosition[0]);
            glm.mat4.scale(cTransform.mModelMatrices[0], cTransform.mModelMatrices[0], cSprite.mSize[0]);

            
        }
    }

    public ListenToUserInput(): void 
    {
        const cPlayer = AssetManager.GetEntity(Types.EntityAssets.Player) as Entity;
        let cTransforms = cPlayer.GetComponent(`${cPlayer.mLabel + `_Transform_Component`}`) as TransformComponent;
        let cPhysics = cPlayer.GetComponent(`${cPlayer.mLabel + `_Physics_Component`}`) as PhysicsComponent;
        
        Input.CallSingleKeyPress(" ", () => {
            this.AppplyForce(cPhysics, glm.vec3.fromValues(0.0, -10.0, 0.0));
            console.log('hi');
            
        });
        if(Input.IsKeyPressed("a")) this.AppplyForce(cPhysics, glm.vec3.fromValues(-1.0, 0.0, 0.0));   
        if(Input.IsKeyPressed("d")) this.AppplyForce(cPhysics, glm.vec3.fromValues(1.0, 0.0, 0.0));

        this.SetTransformFloatArray(cTransforms);
    }

    private TeleportEntity(e : Entity) : void 
    {
        const cTransform = e.GetComponent(`${e.mLabel + `_Transform_Component`}`) as TransformComponent;
        const cSprite = e.GetComponent(`${e.mLabel + `_Sprite_Component`}`) as SpriteComponent;
        
        glm.mat4.translate(cTransform.mModelMatrices[0], cTransform.mModelMatrices[0], cSprite.mPosition[0]);
        glm.mat4.scale(cTransform.mModelMatrices[0], cTransform.mModelMatrices[0], cSprite.mSize[0]);

        this.SetTransformFloatArray(cTransform);
    }

    private SetTransformFloatArray(t : TransformComponent) : void 
    {
        t.mFloatArray = new Float32Array(t.mModelMatrices.length * 16);
        let offset = 0;
        for(const m of t.mModelMatrices) 
        {
            t.mFloatArray.set(m, offset);
            offset += 16;
        }
    }

    private AppplyForce(physics : PhysicsComponent, force : glm.vec3) : void
    {
        // f = ma  | Newton's 2nd law of motion.
        //
        const a = glm.vec3.div(glm.vec3.create(), force, glm.vec3.fromValues(physics.mMass[0], physics.mMass[0], physics.mMass[0]));
        glm.vec3.add(physics.mAcceleration[0], physics.mAcceleration[0], glm.vec3.scale(a, a, Utils.Time.GetDeltaTime()));
    }
};