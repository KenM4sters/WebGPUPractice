import { Types } from "./Types";


export namespace Utils 
{
    export class Time 
    {
        private constructor() {}  // Can't make an instace of Time.

        public static Begin() : void 
        {
            Time.mDeltaTime = 0;
            Time.mLastFrame = performance.now();
            Time.mCurrentFrame = 0;
            Time.mStartTime = 0;
        }

        public static Run() : void 
        {
            Time.mCurrentFrame = performance.now();
            Time.mDeltaTime = (Time.mCurrentFrame - Time.mLastFrame) / 1000; // Convert to milliseconds.
            Time.mLastFrame = Time.mCurrentFrame;
        }

        public static GetElapsedTime() : number 
        {
            return performance.now() - this.mStartTime;
        }
        
        public static GetDeltaTime() : number 
        {
            return Time.mDeltaTime;
        }

        private static mDeltaTime : number; 
        private static mLastFrame : number;
        private static mCurrentFrame : number; 
        private static mStartTime : number; 
    }



    
    //----------------------------------------------------------------
    // Static Sizes class handles updating the canvas dimensions 
    // in response to the window resize event.
    //----------------------------------------------------------------
    export class Sizes 
    {
        private constructor() {}

        public static ListenToResize(callback : (w : number, h : number) => void) : void 
        {
            this.mCanvasWidth = window.innerWidth;
            this.mCanvasHeight = window.innerHeight;

            const canvas = document.querySelector("canvas") as HTMLCanvasElement;

            canvas.width = this.mCanvasWidth;
            canvas.height = this.mCanvasHeight;

            window.addEventListener("resize", () => Sizes.OnResize(callback));
        }
        
        private static OnResize(callback : (w : number, h : number) => void) : void 
        {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            if(Sizes.mCanvasWidth != windowWidth || Sizes.mCanvasHeight != windowHeight) 
            {
                Sizes.mCanvasWidth = windowWidth;
                Sizes.mCanvasHeight = windowHeight;
                
                const canvas = document.querySelector("canvas") as HTMLCanvasElement;
                
                canvas.width = Sizes.mCanvasWidth;
                canvas.height = Sizes.mCanvasHeight;
            }

            callback(this.mCanvasWidth, this.mCanvasHeight);
        }
            
        public SetSize(w : number, h : number) : void 
        {
            Sizes.mCanvasWidth = w;
            Sizes.mCanvasHeight = h;
        }
            
        public static mCanvasWidth : number;
        public static mCanvasHeight : number;
        public static readonly mDevicePixelRatio : number = Math.min(2, window.devicePixelRatio);
    };

        //----------------------------------------------------------------
        // Conversion functions to convert between custom types and native
        // WebGPU types.
        //----------------------------------------------------------------
        export function DeepCopy<T>(obj : T) : T
        {
            return JSON.parse(JSON.stringify(obj));
        }

        export function GetDataTypeSize(type : Types.EDataType) : number 
        {
            switch(type) 
            {
                case Types.EDataType.FLOAT : return 4;
                case Types.EDataType.INT : return 4;
            }
        }
}








