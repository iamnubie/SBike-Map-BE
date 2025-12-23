import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Place, PlaceSchema } from './search.schema';

@Module({
  imports: [
    // Đăng ký Schema Place với Mongoose
    MongooseModule.forFeature([{ name: Place.name, schema: PlaceSchema }]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService] // Export nếu module khác cần dùng
})
export class SearchModule {}
