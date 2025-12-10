import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { CreateUserDto, LoginUserDto } from "../dto/create-user.dto";
import { AuthGuard } from "@nestjs/passport";

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

    @Post('firebase-login')
    async firebaseLogin(@Body() body: { idToken: string }) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.authService.firebaseLogin(body.idToken);
    }

    @Post('refresh')
    async refresh(@Body() body) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return await this.authService.refresh(body.refresh_token);
    }

    @UseGuards(AuthGuard())
    @Post('logout')
    async logout(@Req() req: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        await this.authService.logout(req.user);
        return { statusCode: 200, message: 'Logout successful' };
    }
}