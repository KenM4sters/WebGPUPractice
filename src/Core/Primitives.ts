/**
 * This file contains all the vertices for the shapes of any sprites in the game.
 * Note that the vertices are positioned such that the top left corner is at
 * (0, 0), which allows us to reference the top-left corener of a sprite as it's position.
 */


export namespace Primitives 
{
    export const SQUARE_VERTICES = new Float32Array([
        0.0, 1.0, 0.0, // top-left
        1.0, 0.0, 0.0, // bottom-right
        0.0, 0.0, 0.0, // bottom-left 
    
        0.0, 1.0, 0.0, // top-left
        1.0, 1.0, 0.0, // top-right
        1.0, 0.0, 0.0, // bottom-right
    ]);
}