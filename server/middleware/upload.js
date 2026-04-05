import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /image|video|audio|pdf|msword|vnd.openxmlformats-officedocument/;
        if (allowedTypes.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("File type not supported"), false);
        }
    },
});

export default upload;
