import * as glm from "gl-matrix";

export default class OrthographicCamera 
{
    constructor(left: number, right: number, bottom: number, top: number) 
    {   
        this.mLeft = left;
        this.mRight = right;
        this.mBottom = bottom;
        this.mTop = top;
        this.UpdateProjectionMatrix();
    }
    
    public UpdateProjectionMatrix(): void 
    {
        this.mProjectionMatrix = glm.mat4.ortho(this.mProjectionMatrix, this.mLeft, this.mRight, this.mBottom, this.mTop, -10.0, 10.0);
    }

    public UpdateViewMatrix() : void 
    {
        return;
    }

    public GetViewMatrix() : glm.mat4 
    {
        return this.mViewMatrix; // Identity for now - it makes it easier to switch between perspective and ortho cameras without having to modify bind groups.
    }

    public GetProjectionMatrix() : glm.mat4 
    {
        return this.mProjectionMatrix;
    }

    public mLeft : number;
    public mRight : number;
    public mBottom : number;
    public mTop : number;

    public mPosition : glm.vec3 = glm.vec3.fromValues(0.0, 0.0, 5.0);

    private mProjectionMatrix = glm.mat4.create();
    private mViewMatrix = glm.mat4.create();
}