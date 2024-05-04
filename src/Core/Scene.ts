import * as glm from "gl-matrix";
import { Utils } from "../Utils";
import PerspectiveCamera, { CameraDirections } from "./PerspectiveCamera";
import simpleSquareShaderSrc from  "../../Shaders/Square.wgsl?raw"
import { CameraComponent, MaterialComponent, SceneComponent, SquareGeometryComponent, TransformComponent } from "../ECS/Components";
import Input from "./Input";
import { Types } from "../Types";
import Entity from "../ECS/Entity";
import AssetManager from "../AssetManager";
import Level from "./Level";
import OrthographicCamera from "./OrthographicCamera";
import Player from "./Player";

export default class Scene implements Types.IApplicationLayer
{
    constructor(device : GPUDevice) 
    {
        
        this.mCamera = new OrthographicCamera(0, Utils.Sizes.mCanvasWidth, Utils.Sizes.mCanvasHeight, 0);
        
        // Camera
        //
        let camera = new CameraComponent("Camera_Component", this.mCamera.GetProjectionMatrix(), this.mCamera.GetViewMatrix(), this.mCamera.mPosition);
        AssetManager.SubmitComponent(camera, Types.ComponentAssets.CameraComponent); 

        const player = new Player(device);
        const level = new Level(device);

        this.mSceneComponents.push(player);
        this.mSceneComponents.push(level);
    }

    public ListenToUserInput() : void 
    {   
        const cPlayer = AssetManager.GetEntity(Types.EntityAssets.Player) as Entity;
        let cTransforms = cPlayer.GetComponent(`${cPlayer.mLabel + `_Transform_Component`}`) as TransformComponent;
        
        if(Input.IsKeyPressed("w")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(0.0, -1.0*Utils.Time.GetDeltaTime()*10.0,     0.0));  
        if(Input.IsKeyPressed("a")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(-1.0*Utils.Time.GetDeltaTime()*10.0, 0.0,     0.0));  
        if(Input.IsKeyPressed("s")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(0.0, 1.0*Utils.Time.GetDeltaTime()*10.0,      0.0));  
        if(Input.IsKeyPressed("d")) glm.mat4.translate(cTransforms.mModelMatrix, cTransforms.mModelMatrix, glm.vec3.fromValues(1.0*Utils.Time.GetDeltaTime()*10.0, 0.0,      0.0));

        // if(Input.IsKeyPressed("ArrowUp")) this.mCamera.ProcessUserInput(CameraDirections.UP);
        // if(Input.IsKeyPressed("ArrowLeft")) this.mCamera.ProcessUserInput(CameraDirections.LEFT);
        // if(Input.IsKeyPressed("ArrowDown")) this.mCamera.ProcessUserInput(CameraDirections.DOWN);
        // if(Input.IsKeyPressed("ArrowRight")) this.mCamera.ProcessUserInput(CameraDirections.RIGHT); 
    }

    public OnCanvasResize(w : number, h : number) : void
    {
        this.mCamera.mRight = w;
        this.mCamera.mBottom = h;
        this.mCamera.UpdateProjectionMatrix();
    }


    private mCamera : OrthographicCamera;
    private mSceneComponents : SceneComponent[] = [];
};