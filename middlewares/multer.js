import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const destinationDir = path.join(__dirname, "uploads");
    // cb(null, destinationDir);  for dynamically 
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
