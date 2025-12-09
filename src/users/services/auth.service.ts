import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { CreateUserDto, LoginUserDto } from "../dto/create-user.dto";
import { User } from "../users.model";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async register(createUserDto: CreateUserDto) {
        const user = await this.userService.create(createUserDto);
        const token = await this._createToken(user);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
            email: user.email,
            ...token,
        };
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.userService.findByLogin(loginUserDto);
        const token = await this._createToken(user);
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

    private async _createToken({ email }, refresh = true): Promise<any> {
        const accessToken = this.jwtService.sign({ email });
        if (refresh) {
            const options: JwtSignOptions = {
                secret: process.env.SECRETKEY_REFRESH,
                expiresIn: process.env.EXPIRES_IN_REFRESH,
            } as JwtSignOptions; // Ép kiểu

            const refreshToken = this.jwtService.sign(
                { email }, // Tham số 1
                options // Tham số 2
            );
            await this.userService.updateRefreshToken(
                { email: email },
                { refreshToken: refreshToken },
            );
            return {
                expiresIn: process.env.EXPIRES_IN,
                accessToken,
                refreshToken,
                expiresInRefresh: process.env.EXPIRES_IN_REFRESH,
            };
        } else {
            return {
                expiresIn: process.env.EXPIRES_IN,
                accessToken,
            };
        }
    }

    async refresh(refresh_token) {
        try {
            const payload = this.jwtService.verify(refresh_token, {
                secret: process.env.SECRETKEY_REFRESH,
            });
            const user = await this.userService.getUserByRefresh(
                refresh_token,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                payload.email
            );
            const token = await this._createToken(user, false);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return {
                email: user.email,
                ...token,
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
    }

    async logout(user: User) {
        await this.userService.updateRefreshToken(
            { email: user.email },
            { refreshToken: null },
        );
    }
}