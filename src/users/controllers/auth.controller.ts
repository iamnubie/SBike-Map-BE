import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { CreateUserDto, LoginUserDto } from "../dto/create-user.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.authService.register(createUserDto);
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.authService.login(loginUserDto);
    }
}