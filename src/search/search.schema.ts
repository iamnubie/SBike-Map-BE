import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlaceDocument = HydratedDocument<Place>;

@Schema({ timestamps: true })
export class Place {
  @Prop({ required: true })
  name: string; // Tên địa điểm

  @Prop()
  address: string;

  @Prop({ type: [Number], required: true })
  embedding: number[]; // Vector (được tạo từ category)
  
  @Prop({ 
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  })
  location: { type: string; coordinates: number[] };
  
  @Prop({ required: true })
  category: string; // "Sửa xe", "Cà phê", "Trạm xăng"... (Model sẽ đọc cái này)
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
PlaceSchema.index({ location: '2dsphere' });