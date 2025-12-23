import { Body, Controller, Get, Post, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // API thêm địa điểm
  // POST http://localhost:3000/search/add
  @Post('add')
  async addPlace(@Body() body: any) {
    return this.searchService.createPlace(body);
  }

  @Post('save')
  async saveSelectedPlace(@Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log("Saving place:", body.name);
    return this.searchService.createPlace(body);
  }

  // API Tìm kiếm AI
  // GET http://localhost:3000/search/smart?q=tìm quán sửa xe
  @Get('smart')
  async search(@Query('q') query: string) {
    if (!query) return [];
    return this.searchService.searchSmart(query);
  }

  @Get('all')
  async getAllPlaces() {
    return this.searchService.findAll();
  }

  @UseGuards(AuthGuard('jwt')) // Bắt buộc đăng nhập mới được xóa
  @Delete(':id')
  async deletePlace(@Param('id') id: string) {
    return this.searchService.deletePlace(id);
  }
}