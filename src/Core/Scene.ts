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