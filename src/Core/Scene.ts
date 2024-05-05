import { Utils } from "../Utils";
import { CameraComponent, SceneComponent } from "../ECS/Components";
import { Types } from "../Types";
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

    public OnCanvasResize() : void
    {
        this.mCamera.mRight = Utils.Sizes.mCanvasWidth;
        this.mCamera.mBottom = Utils.Sizes.mCanvasHeight;
        this.mCamera.UpdateProjectionMatrix();
    }


    private mCamera : OrthographicCamera;
    private mSceneComponents : SceneComponent[] = [];
};