import { Component } from "./Components";
import ECSWizard from "./ECSWizard";

export default class Entity 
{
    constructor(label : string) 
    {          
        this.mLabel = label;
        this.mUUID = Entity.UUIDCounter++;
    };

    public AddComponent(comp : Component) : void 
    {
        ECSWizard.SubmitComponent(comp);
    }

    public readonly mLabel : string;
    public readonly mUUID : number;
    private static UUIDCounter : number = 0;
};