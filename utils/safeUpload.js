// export const safeUpload = (multerUpload) => {
//   return (req, res, next) => {
//     multerUpload(req, res, function (err) {
//       if (err) {
//         return res.status(400).json({
//           status: "failed",
//           message: "File upload error",
//           error: err.message,
//         });
//       }
//       next();
//     });
//   };
// };
