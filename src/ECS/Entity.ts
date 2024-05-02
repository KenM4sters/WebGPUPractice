import { Component } from "./Components";

export default class Entity 
{
    constructor(components : Component[], label : string = "EntityWithNoName") 
    { 
        for(const a of components) 
        {
            this.mComponents[a.mLabel] = a;
        }  
        this.mLabel = label;
    };

    GetComponent<T extends Component>(componentName: string): T | undefined {
        return this.mComponents[componentName] as T | undefined;
    }

    private readonly mComponents : Record<string, Component> = {};
    public readonly mLabel : string;
};