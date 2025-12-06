import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  // 1. Tạo User mới
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await this.userRepository.findOneByCondition({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại trong hệ thống');
    }

    // TODO: Mã hóa password (ví dụ dùng bcrypt) trước khi lưu
    // const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    // return this.userRepository.create({ ...createUserDto, password: hashedPassword });

    return this.userRepository.create(createUserDto);
  }

  // 2. Lấy danh sách tất cả Users
  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  // 3. Tìm User theo ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy User với ID: ${id}`);
    }
    return user;
  }

  // 4. Tìm User theo Email (thường dùng cho chức năng Login)
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneByCondition({ email });
  }

  // 5. Cập nhật User
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Kiểm tra user có tồn tại không trước khi update (tùy chọn, vì findByIdAndUpdate trả về null nếu ko thấy)
    // Nhưng nếu muốn chắc chắn để throw lỗi rõ ràng:
    const updatedUser = await this.userRepository.findByIdAndUpdate(id, updateUserDto);
    
    if (!updatedUser) {
      throw new NotFoundException(`Không thể cập nhật. Không tìm thấy User với ID: ${id}`);
    }

    return updatedUser;
  }

  // 6. Xóa User
  async remove(id: string): Promise<void> {
    const result = await this.userRepository.deleteById(id);
    
    // result trả về từ mongoose deleteOne có thuộc tính deletedCount
    if (result.deletedCount === 0) {
        throw new NotFoundException(`Không thể xóa. Không tìm thấy User với ID: ${id}`);
    }
  }

}
