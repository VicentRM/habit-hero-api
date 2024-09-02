import { IsEmail, IsEnum, IsJSON, IsString, MinLength } from "class-validator";


export class RegisterDto {   
    @IsString()
    username: string;
    @IsEmail()
    email:string;
    @MinLength(6)
    password: string;
    @MinLength(6)
    password2: string;   
}


