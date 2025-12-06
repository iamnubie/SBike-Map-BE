import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Username không được để trống.' })
    @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự.' })
    username: string;

    @IsNotEmpty({ message: 'Password không được để trống.' })
    @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự.' })
    password: string;

    @IsEmail({}, { message: 'Email phải đúng định dạng.' })
    @IsNotEmpty({ message: 'Email không được để trống.' })
    email: string;
}
