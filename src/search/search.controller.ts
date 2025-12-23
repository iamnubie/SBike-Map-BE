import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SearchService } from './search.service';

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
}