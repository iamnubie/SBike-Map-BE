import { Model, FilterQuery, QueryOptions, Document, UpdateQuery } from 'mongoose';

// T đại diện cho Model/Entity cụ thể (ví dụ: User) và phải kế thừa Mongoose Document
export class BaseRepository<T extends Document> {
  // Dependency Injection của Mongoose Model
  constructor(private readonly model: Model<T>) { }

  // 1. Tạo mới (Create)
  // doc là dữ liệu đầu vào (ví dụ: DTO). Tương thích với CreateQuery<T>
  async create(doc: any): Promise<T> {
    const createdEntity = new this.model(doc);
    return await createdEntity.save();
  }

  // 2. Tìm theo ID (Read)
  // Sử dụng FindByIdAndUpdateOptions cho tham số options rõ ràng hơn
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    // Trả về T hoặc null nếu không tìm thấy
    return this.model.findById(id, null, options).exec();
  }

  // 3. Tìm một tài liệu theo điều kiện (Read One)
  // filter là kiểu FilterQuery<T> để đảm bảo an toàn kiểu dữ liệu
  async findOneByCondition(
    filter: FilterQuery<T>,
    options?: QueryOptions,
    populate?: any, // Sử dụng any cho populate vì cấu trúc rất đa dạng
  ): Promise<T | null> {
    return this.model.findOne(filter, null, options).populate(populate).exec();
  }

  // 4. Lấy nhiều tài liệu theo điều kiện (Read Many)
  async findManyByCondition(
    filter: FilterQuery<T>,
    options?: QueryOptions,
    populate?: any,
  ): Promise<T[]> {
    return this.model.find(filter, null, options).populate(populate).exec();
  }

  // 5. Lấy tất cả tài liệu (Read All)
  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  // 6. Cập nhật một tài liệu theo điều kiện (Update One)
  // Sử dụng UpdateQuery<T> cho update rõ ràng hơn về kiểu
  async findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    // Thêm { new: true } để trả về tài liệu đã được cập nhật (mặc định Mongoose trả về tài liệu cũ)
    return this.model.findOneAndUpdate(filter, update, { new: true }).exec();
  }

  // 7. Cập nhật theo ID (Update By Id)
  async findByIdAndUpdate(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async findByConditionAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      filter,
      update,
      { new: true } // QUAN TRỌNG: Thêm tùy chọn này để trả về document sau khi cập nhật
    ).exec(); // QUAN TRỌNG: Thêm .exec() để thực thi truy vấn Mongoose
  }

  // 8. Cập nhật nhiều tài liệu (Update Many)
  // Thay thế hàm `updateMany` cũ với cú pháp đơn giản hơn
  async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>) {
    // Hàm updateMany không trả về tài liệu, mà trả về kết quả thao tác (WriteResult)
    return this.model.updateMany(filter, update).exec();
  }

  // 9. Xóa một tài liệu theo ID (Delete One)
  async deleteById(id: string) {
    return this.model.deleteOne({ _id: id } as FilterQuery<T>).exec();
  }

  // 10. Xóa nhiều tài liệu theo danh sách ID (Delete Many)
  async deleteManyByIds(ids: string[]) {
    return this.model.deleteMany({ _id: { $in: ids } } as FilterQuery<T>).exec();
  }

  // 11. Xóa nhiều tài liệu theo điều kiện (Delete By Condition)
  async deleteManyByCondition(filter: FilterQuery<T>) {
    return this.model.deleteMany(filter).exec();
  }

  // 12. Aggregate (không thay đổi)
  async aggregate(pipeline: any) {
    return this.model.aggregate(pipeline).exec();
  }
}