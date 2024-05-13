import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/home/uvesh/Documents/Storage");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + Date.now());
  },
});

// const upload = multer({ storage: storage });

function createMulterMiddleware(fieldNames) {
  return multer({ storage: storage }).fields(fieldNames);
}

export { createMulterMiddleware };
