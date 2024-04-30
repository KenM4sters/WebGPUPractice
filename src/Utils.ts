import { EDataType } from "./Types";

//---------------------------------------------------
// Conversion Functions from custom type to native type
//---------------------------------------------------

export function GetDataTypeSize(type : EDataType) : number 
{
    switch(type) 
    {
        case EDataType.FLOAT : return 4;
        case EDataType.INT : return 4;
    }
}

