import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto, LoginUserDto } from "../dto/create-user.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService, 
    ){}

    async register(createUserDto: CreateUserDto) {
        const user = await this.userService.create(createUserDto);
        const token = this._createToken(user);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
            email: user.email,
            ...token,
        };
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.userService.findByLogin(loginUserDto);
        const token = this._createToken(user);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
            email: user.email,
            ...token,
        };
    }

    async validateUser(email) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
        return user;
    }

    private _createToken({ email }): any {
        const accessToken = this.jwtService.sign({ email });
        return {
            expiresIn: process.env.EXPIRES_IN,
            accessToken,
        };
    }
}