import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Giả sử bạn dùng Passport JWT
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
    constructor(private readonly tripsService: TripsService) {}

    // API: POST /trips/save (Lưu chuyến đi)
    @UseGuards(AuthGuard('jwt'))
    @Post('save')
    async saveTrip(@Req() req, @Body() body: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user._id; // Lấy ID từ JWT Token
        return await this.tripsService.createTrip(userId, body);
    }

    // API: GET /trips/history (Lấy lịch sử)
    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    async getHistory(@Req() req) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user._id;
        return await this.tripsService.getUserHistory(userId);
    }
}