import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Thêm dòng này để kích hoạt validation toàn cục:
  app.useGlobalPipes(new ValidationPipe({
      // Tùy chọn để loại bỏ các trường không mong muốn
      whitelist: true, 
      // Tùy chọn để ngăn chặn dữ liệu không cần thiết
      forbidNonWhitelisted: true, 
      // Tùy chọn để bật transformer (như chuyển string sang number/boolean, etc.)
      transform: true,
  }));

  // const {httpAdapter} = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new (await import('./utils/exceptionLogger.filter')).ExceptionLoggerFilter(httpAdapter));
  // //cach 1
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
