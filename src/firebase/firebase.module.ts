import { Module, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin'; // Import thư viện admin

@Module({})
export class FirebaseModule implements OnModuleInit {
  onModuleInit() {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';

    try {
        // KIỂM TRA: Chỉ khởi tạo nếu chưa có app nào
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath),
                // Tùy chọn: Thêm databaseURL nếu bạn dùng Realtime DB
                // databaseURL: "https://<PROJECT-ID>.firebaseio.com" 
            });
            console.log(' Firebase Admin SDK initialized successfully.');
        }
    } catch (error) {
      console.error(' Firebase Admin SDK Initialization Failed:', error);
      // Bạn có thể chọn crash app nếu initialization là bắt buộc
      // process.exit(1); 
    }
  }
}