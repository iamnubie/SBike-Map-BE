import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../user.repository';
import { User } from '../users.model';
import * as bcrypt from 'bcrypt';
import { UserNotFoundException } from '../exceptions/userNotFound.exception';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) { }

  // 1. Tạo User mới
  async create(createUserDto: CreateUserDto): Promise<User> {

    const saltRounds = 10;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    createUserDto.password = await bcrypt.hash(createUserDto.password, saltRounds);

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await this.userRepository.findOneByCondition({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại trong hệ thống');
    }

    // return this.userRepository.create({ ...createUserDto, password: hashedPassword });

    return this.userRepository.create(createUserDto);
  }

  async createFirebaseUser(firebase_uid: string, email: string, username: string = ''): Promise<User> {
    // ... (Kiểm tra existingUser giữ nguyên)

    //  SỬA: Đảm bảo username không bao giờ rỗng nếu Schema yêu cầu
    const safeUsername = username || 'User_' + firebase_uid.substring(0, 5);

    const newUser = {
      firebase_uid,
      email,
      username: safeUsername, // Sử dụng tên an toàn
    };

    //  Đảm bảo rằng hàm create xử lý lỗi email đã tồn tại (nếu cần)
    try {
      return this.userRepository.create(newUser);
    } catch (e) {
      // Log lỗi Mongoose chi tiết nếu có
      console.error("Mongoose Create Error:", e);
      throw new HttpException('Failed to create user profile in DB.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByLogin({ email, password }: LoginUserDto) {
    const user = await this.userRepository.findOneByCondition({ email });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    // Dùng compare bất đồng bộ để tránh chặn event loop
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const is_equal = await bcrypt.compare(password, user.password);

    if (!is_equal) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Nếu thành công, trả về user
    return user;
  }

  // 2. Lấy danh sách tất cả Users
  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  // 3. Tìm User theo ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      // throw new NotFoundException(`Không tìm thấy User với ID: ${id}`);
      throw new UserNotFoundException(id);
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

  // 7. Cập nhật Refresh Token
  async updateRefreshToken(filter, update) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (update.refreshToken) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      update.refreshToken = await bcrypt.hash(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        update.refreshToken,
        10
      );
    }
    return await this.userRepository.findByConditionAndUpdate(filter, update);
  }

  async getUserByRefresh(refresh_token, email) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const is_equal = await bcrypt.compare(
      refresh_token,
      user.refreshToken
    );
    if (!is_equal) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async findByFirebaseUid(firebase_uid: string): Promise<User | null> {
    // Gọi hàm tìm kiếm từ Repository
    return this.userRepository.findOneByCondition({ firebase_uid });
  }

}

