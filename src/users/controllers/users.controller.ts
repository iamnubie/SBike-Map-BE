import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseFilters,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ExceptionLoggerFilter } from 'src/utils/exceptionLogger.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  // eslint-disable-next-line @typescript-eslint/require-await
  async getProfile(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user;
  }

  // Endpoint để user tự cập nhật hồ sơ (Dùng Token để xác định user)
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile/me') // Đường dẫn: /users/profile/me
  async updateMyProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    // req.user được passport-jwt giải mã và gán vào. 
    // Giả sử req.user chứa _id hoặc userId.
    // Dựa vào file user.repository.ts, User kế thừa Document nên sẽ có _id
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return this.usersService.update(req.user._id, updateUserDto); 
  }

  @Post('upload-avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file')) 
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const optimizedUrl = await this.cloudinaryService.uploadImage(file, req.user._id);
    // Lưu URL vào DB
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    await this.usersService.update(req.user._id, { avatarUrl: optimizedUrl } as any);

    return { url: optimizedUrl };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseFilters(ExceptionLoggerFilter)//cach 3
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  
}
