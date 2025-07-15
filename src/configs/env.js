import dotenv from "dotenv";
import fs from "fs";

// Xác định file .env cần dùng dựa vào biến môi trường NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "local"}`;
// Kiểm tra xem file đó có tồn tại không
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile }); // Load các biến môi trường từ file đó
  console.log(`✅ Loaded environment: ${envFile}`);
} else {
  dotenv.config(); // Nếu không có file đó, fallback sang .env mặc định
  console.log("⚠️ Using default .env file");
}
