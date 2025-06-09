const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const sharp = require('sharp');

// Configure AWS SDK v3 S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer upload middleware
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory for processing
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to process image before upload
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const processedImage = await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    req.file.buffer = processedImage;
    next();
  } catch (err) {
    next(err);
  }
};

// Custom upload function using AWS SDK v3
const uploadToS3 = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const file = req.file;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `fragrances/${uniqueSuffix}-${file.originalname}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    const result = await upload.done();
    req.file.s3Url = result.Location; // Store the S3 URL for later use
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, processImage, uploadToS3, s3Client };