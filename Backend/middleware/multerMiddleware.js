import multer from "multer";

// Configure local disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files temporarily to a 'public/temp' folder
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // You can generate a unique name here if you want, but the original name is
    // usually fine for temp files since they get deleted right after upload
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
