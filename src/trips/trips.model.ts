import { Schema, Document } from 'mongoose';

export const TripSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Liên kết với User
        originName: { type: String, required: true },      // Tên điểm đi
        destinationName: { type: String, required: true }, // Tên điểm đến
        startTime: { type: Date, required: true },         // Thời gian bắt đầu
        durationSeconds: { type: Number, required: true }, // Thời gian di chuyển (giây)
        distanceMeters: { type: Number, required: true },  // Quãng đường (mét)
        
        // Lưu cân nặng TẠI THỜI ĐIỂM ĐI (để tính calo chính xác cho lịch sử)
        userWeightSnapshot: { type: Number, required: false }, 
        caloriesBurned: { type: Number, required: false }, // Calo tiêu thụ (tính từ app gửi lên)
    },
    { timestamps: true, collection: 'trips' }
);

export interface Trip extends Document {
    user: string;
    originName: string;
    destinationName: string;
    startTime: Date;
    durationSeconds: number;
    distanceMeters: number;
    userWeightSnapshot?: number;
    caloriesBurned?: number;
}