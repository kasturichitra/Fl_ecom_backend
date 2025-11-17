import multer from "multer";
import path from "path";
import fs from "fs";

const getUploadMiddleware = (modelName) => {
  const uploadDir = path.join("uploads", `${modelName.toLowerCase()}Images`);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  // Allow only image files
  const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("Only image files (jpeg, jpg, png, webp,) are allowed"));
  };

  return multer({ storage, fileFilter });
};

export default getUploadMiddleware;



// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import ffmpeg from "fluent-ffmpeg";

// // Helper — validate video duration ≤ 30 seconds
// const checkVideoDuration = (filePath, maxSeconds = 30) => {
//   return new Promise((resolve, reject) => {
//     ffmpeg.ffprobe(filePath, (err, metadata) => {
//       if (err) return reject(err);
//       const duration = metadata.format.duration;
//       if (duration > maxSeconds) {
//         reject(new Error(`Video duration exceeds ${maxSeconds} seconds.`));
//       } else resolve(true);
//     });
//   });
// };

// const getUploadMiddleware = (modelName) => {
//   const uploadDir = path.join("uploads", `${modelName.toLowerCase()}Files`);

//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       const ext = path.extname(file.originalname);
//       cb(null, `${uniqueSuffix}${ext}`);
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     const allowedImage = /jpeg|jpg|png|webp/;
//     const allowedVideo = /mp4|mov|avi|mkv/;
//     const ext = path.extname(file.originalname).toLowerCase();

//     if (allowedImage.test(ext) || allowedVideo.test(ext)) cb(null, true);
//     else cb(new Error("Only image (jpeg, jpg, png, webp) or video (mp4, mov, avi, mkv) files are allowed"));
//   };

//   const upload = multer({ storage, fileFilter });

//   // Custom middleware to validate video duration
//   const validateVideoDuration = async (req, res, next) => {
//     try {
//       const videoFiles = [];

//       // collect any video files
//       if (req.files) {
//         for (const key in req.files) {
//           req.files[key].forEach((file) => {
//             const ext = path.extname(file.originalname).toLowerCase();
//             if (/mp4|mov|avi|mkv/.test(ext)) videoFiles.push(file.path);
//           });
//         }
//       }

//       // Check each uploaded video
//       for (const videoPath of videoFiles) {
//         await checkVideoDuration(videoPath);
//       }

//       next();
//     } catch (error) {
//       console.error("Video validation error:", error.message);

//       // Clean up invalid video files
//       if (req.files) {
//         for (const key in req.files) {
//           req.files[key].forEach((file) => {
//             if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//           });
//         }
//       }

//       return res.status(400).json({
//         status: "Failed",
//         message: error.message,
//       });
//     }
//   };

//   return { upload, validateVideoDuration };
// };

// export default getUploadMiddleware;
