import {  IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
    
    @IsString()
    uasername:string;
    
    @IsEmail()
    email:string;


    @MinLength(6)
    password:string;

}