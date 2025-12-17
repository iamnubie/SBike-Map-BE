import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import toStream = require('streamifier');
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'sbike-avatars', // Tên folder trên cloud
          public_id: userId, // Dùng tên file gốc làm public_id (tùy chọn)
          overwrite: true, // Ghi đè nếu đã tồn tại
          resource_type: 'auto',
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) return reject(error);
          
          // Tạo URL đã tối ưu hóa (Auto format, Auto quality) + Crop vuông 500px
          const optimizedUrl = cloudinary.url(result.public_id, {
            version: result.version,
            fetch_format: 'auto',
            quality: 'auto',
            crop: 'fill',
            gravity: 'auto',
            width: 500,
            height: 500,
          });

          // Trả về URL đã xử lý để lưu vào DB
          resolve(optimizedUrl);
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      toStream.createReadStream(file.buffer).pipe(upload);
    });
  }
}