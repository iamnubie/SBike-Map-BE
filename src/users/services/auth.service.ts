import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { CreateUserDto, LoginUserDto } from "../dto/create-user.dto";
import { User } from "../users.model";
import * as admin from 'firebase-admin';

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

    async firebaseLogin(idToken: string) {
        console.log('--- Firebase ID Token received from Frontend ---');
        console.log(idToken);
        let uid: string;
        let email: string;
        let name: string = '';

        try {
            // 1. Xác minh Token từ FE và giải mã
            console.time('VerifyFirebase');
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            console.timeEnd('VerifyFirebase');
            uid = decodedToken.uid;
            email = decodedToken.email!;
            name = decodedToken.name || '';
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Token không hợp lệ, hết hạn, hoặc bị giả mạo
            throw new HttpException('Invalid or expired Firebase ID token.', HttpStatus.UNAUTHORIZED);
        }

        // 2. Tìm User trong DB nội bộ bằng UID
        let user = await this.userService.findByFirebaseUid(uid);

        if (!user) {
            // 3. Tự động Đăng ký nếu chưa có trong DB (Provisioning)
            user = await this.userService.createFirebaseUser(uid, email, name);
        }

        // 4. Tạo Token nội bộ (sử dụng _createToken sẵn có của bạn)
        console.time('CreateToken');
        const token = await this._createToken(user);
        console.timeEnd('CreateToken');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
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