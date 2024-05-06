import { Utils } from "../Utils";
import { Camera, SceneComponent } from "../ECS/Components";
import { Types } from "../Types";
import Enemy from "./Enemy";
import OrthographicCamera from "./OrthographicCamera";
import Player from "./Player";
import Background from "./Background";
import ECSWizard from "../ECS/ECSWizard";

export default class Scene implements Types.IApplicationLayer
{
    constructor(device : GPUDevice) 
    {
        
        this.mCamera = new OrthographicCamera(0, Utils.Sizes.mCanvasWidth, Utils.Sizes.mCanvasHeight, 0);
        
        // Camera
        //
        let camera = new Camera("Camera", this.mCamera.GetProjectionMatrix(), this.mCamera.GetViewMatrix(), this.mCamera.mPosition);
        ECSWizard.SubmitCamera(camera, Types.Cameras.Camera); 

        const background = new Background(device);
        const player = new Player(device);
        const enemy = new Enemy(device);

        this.mSceneComponents.push(background);
        this.mSceneComponents.push(player);
        this.mSceneComponents.push(enemy);
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