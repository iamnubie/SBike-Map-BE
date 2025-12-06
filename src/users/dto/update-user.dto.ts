import { IsOptional, IsEmail, MinLength, IsMongoId } from 'class-validator';

// Sử dụng PartialType từ @nestjs/mapped-types để kế thừa và làm optional 
// (Nếu không muốn import PartialType, có thể dùng @IsOptional() cho từng trường)

export class UpdateUserDto {
    // ID thường được lấy từ @Param, nhưng nếu nó có trong body và cần validate:
    @IsOptional()
    @IsMongoId({ message: 'ID phải là định dạng Mongo ObjectId hợp lệ.' })
    id?: string; 

    @IsOptional()
    @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự.' })
    username?: string;

    @IsOptional()
    @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự.' })
    password?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email phải đúng định dạng.' })
    email?: string;
}
