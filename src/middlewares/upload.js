import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

if (process.env.NODE_ENV === "production") {
  const required = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`❌ Missing Cloudinary ENV: ${key}`);
    }
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const timestamp = Date.now();
    const userId = req.user?.user_id || "anonymous";
    const extension = file.originalname.split(".").pop();
    const filename = `${userId}_${file.fieldname}_${timestamp}.${extension}`;

    return {
      folder: "employee_profiles",
      public_id: filename,
      allowed_formats: ["jpg", "jpeg", "png"],
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
