import * as glm from "gl-matrix";
import AssetManager from "../AssetManager";
import { SpriteComponent, TransformComponent } from "./Components";
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

    }

    public ListenToUserInput(): void 
    {
        const cPlayer = AssetManager.GetEntity(Types.EntityAssets.Player) as Entity;
        let cTransforms = cPlayer.GetComponent(`${cPlayer.mLabel + `_Transform_Component`}`) as TransformComponent;
        
        if(Input.IsKeyPressed("w")) glm.mat4.translate(cTransforms.mModelMatrices[0], cTransforms.mModelMatrices[0], glm.vec3.fromValues(0.0, -1.0*Utils.Time.GetDeltaTime()*10.0,     0.0));  
        if(Input.IsKeyPressed("a")) glm.mat4.translate(cTransforms.mModelMatrices[0], cTransforms.mModelMatrices[0], glm.vec3.fromValues(-1.0*Utils.Time.GetDeltaTime()*10.0, 0.0,     0.0));  
        if(Input.IsKeyPressed("s")) glm.mat4.translate(cTransforms.mModelMatrices[0], cTransforms.mModelMatrices[0], glm.vec3.fromValues(0.0, 1.0*Utils.Time.GetDeltaTime()*10.0,      0.0));  
        if(Input.IsKeyPressed("d")) glm.mat4.translate(cTransforms.mModelMatrices[0], cTransforms.mModelMatrices[0], glm.vec3.fromValues(1.0*Utils.Time.GetDeltaTime()*10.0, 0.0,      0.0));

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
};