import { Component } from "./Components";

export default class Entity 
{
    constructor(components : Component[], label : string = "EntityWithNoName") 
    {   
        this.mComponents = components;
        this.mLabel = label;
    };

    public readonly mComponents : Component[];
    public readonly mLabel : string;
};