import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripSchema } from './trips.model';

@Module({
  imports: [
    // Đăng ký Schema 'Trip' để Service có thể dùng được Model
    MongooseModule.forFeature([{ name: 'Trip', schema: TripSchema }]),
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService] // Export nếu các module khác cần dùng
})
export class TripsModule {}