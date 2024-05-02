export enum KEYS 
{
    W, A, S, D, Q, E, SPACE_BAR, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, ARROW_DOWN
};

const keys : {[key: string] : boolean } = 
{
    "w": false,
    "a": false,
    "s": false,
    "d": false,
    "q": false,
    "e": false,
    "space": false,
    "ArrowLeft": false,
    "ArrowRight": false,
    "ArrowUp": false,
    "ArrowDown": false,
};

export default class Input 
{
    constructor() {}

    public static ListenToEvents() : void 
    {
        window.addEventListener("keydown", (event : KeyboardEvent) => 
        {
            keys[event.key] = true;
        });

        window.addEventListener("keyup", (event : KeyboardEvent) => 
        {
            keys[event.key] = false;
        });
    }

    public static IsKeyPressed(key : string) : boolean 
    {
        return keys[key];
    }
};