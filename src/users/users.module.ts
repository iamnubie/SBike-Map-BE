import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './users.model';
import { UserRepository } from './user.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      }
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false
    }),
    // JwtModule.register({
    //   secret: `${process.env.JWT_SECRET_KEY}`,
    //   signOptions: {
    //     expiresIn: process.env.EXPIRES_IN ? Number(process.env.EXPIRES_IN) : undefined,
    //   },
    // }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get<number>('EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    CloudinaryModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [UsersService, UserRepository, AuthService, JwtStrategy],
})
export class UsersModule { }
