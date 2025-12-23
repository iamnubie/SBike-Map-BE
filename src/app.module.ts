import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseModule } from './firebase/firebase.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TripsModule } from './trips/trips.module';
// import { APP_FILTER } from '@nestjs/core';
// import { ExceptionLoggerFilter } from './utils/exceptionLogger.filter';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    FirebaseModule,
    CloudinaryModule,
    TripsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: ExceptionLoggerFilter,
    // }//cach 2
  ],
})
export class AppModule {}
