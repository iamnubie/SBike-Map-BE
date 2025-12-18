import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip } from './trips.model';

@Injectable()
export class TripsService {
    constructor(@InjectModel('Trip') private readonly tripModel: Model<Trip>) {}

    // Lưu chuyến đi mới
    async createTrip(userId: string, tripData: any) {
        const newTrip = new this.tripModel({
            ...tripData,
            user: userId, // Gán ID user lấy từ Token
        });
        return await newTrip.save();
    }

    // Lấy danh sách lịch sử của user
    async getUserHistory(userId: string) {
        // Sắp xếp chuyến mới nhất lên đầu (sort -1)
        return await this.tripModel.find({ user: userId }).sort({ startTime: -1 }).exec();
    }
}