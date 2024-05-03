import AssetManager from "../AssetManager";
import { Types } from "../Types";
import { Component } from "./Components";

export default class Entity 
{
    constructor(components : Types.ComponentAssets[], label : string = "EntityWithNoName") 
    { 
        for(const a of components) 
        {
            const cComponent = AssetManager.GetComponent(a);
            if(!cComponent) continue;
            this.mComponentIndexes[cComponent.mLabel] = a;
        }  
        this.mLabel = label;
    };

    GetComponent<T extends Component>(componentName: string): T | undefined {
        return AssetManager.GetComponent(this.mComponentIndexes[componentName]) as T | undefined;
    }

    private readonly mComponentIndexes : Record<string, Types.ComponentAssets> = {};
    public readonly mLabel : string;
};