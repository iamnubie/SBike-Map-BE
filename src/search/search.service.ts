import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place, PlaceDocument } from './search.schema';

@Injectable()
export class SearchService implements OnModuleInit {
  private extractor: any;

  constructor(
    @InjectModel(Place.name) private placeModel: Model<PlaceDocument>,
  ) {}

  async onModuleInit() {
    console.log(' Đang tải model AI...');

    // Cách này ép buộc Node.js chạy lệnh import() chuẩn ESM
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const { pipeline } = await dynamicImport('@xenova/transformers');

    this.extractor = await pipeline('feature-extraction', 'Xenova/bge-m3');
    console.log(' Model AI đã sẵn sàng!');
  }

  // Hàm chuyển Text -> Vector (Embedding)
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.extractor) {
        throw new Error("Model AI chưa khởi tạo xong, vui lòng đợi giây lát.");
    }
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return Array.from(output.data);
  }

  // API thêm địa điểm mới (Tự động tạo vector)
  async createPlace(createPlaceDto: any) {
    const { name, lat, lng, address, category } = createPlaceDto;

    // Tạo nội dung cho AI đọc
    // Nên ghép "Tên + Category" để AI hiểu rõ ngữ cảnh hơn
    // Ví dụ: "Sửa xe chú Bảy - Dịch vụ sửa xe đạp" sẽ tốt hơn chỉ là "Dịch vụ sửa xe đạp"
    const contentForAI = `${name} - ${category || ''} - ${address || ''}`;

    // Tạo Vector từ nội dung đó
    const vector = await this.generateEmbedding(contentForAI);

    return this.placeModel.updateOne(
      { name: name, 'location.coordinates': [lng, lat] }, 
      {
        $set: {
          name,
          address,
          category: category || "Địa điểm", 
          embedding: vector,
          location: { type: 'Point', coordinates: [lng, lat] }
        }
      },
      { upsert: true } // Quan trọng: Nếu chưa có thì tạo mới
    );
  }

  //API Tìm kiếm thông minh (Vector Search)
  async searchSmart(queryText: string) {
    const queryVector = await this.generateEmbedding(queryText);

    const results = await this.placeModel.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 100,
          limit: 10
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          location: 1,
          category: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return results;
  }
}