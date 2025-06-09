const { upload, processImage, uploadToS3, s3Client } = require('../config/s3Upload');

const Fragrance = require('../models/Fragrance');

const { DeleteObjectCommand } = require('@aws-sdk/client-s3');



const uploadImage = [

  upload.single('image'), // Middleware to handle single file upload

  processImage,          // Process the image

  uploadToS3,            // Upload to S3

  async (req, res) => {

    try {

      const { id } = req.params;

      const fragrance = await Fragrance.findById(id);

      if (!fragrance) {

        return res.status(404).json({ message: 'Fragrance not found' });

      }



      // Add the S3 URL to the fragrance images array

      fragrance.images.push({

        url: req.file.s3Url,

        key: req.file.key || req.file.s3Url.split('/').pop(), // Derive key if not set

      });

      await fragrance.save();



      res.status(201).json(fragrance);

    } catch (error) {

      console.error('Error in uploadImage:', error);

      res.status(500).json({ message: 'Failed to upload image', error: error.message });

    }

  },

];



const deleteImage = async (req, res) => {

    console.log('User making request:', req.user); // Check if user is admin

  console.log('Token:', req.headers.authorization);

  try {

    const { id, imageId } = req.params;

    const fragrance = await Fragrance.findById(id);

    if (!fragrance) {

      return res.status(404).json({ message: 'Fragrance not found' });

    }



    const imageIndex = fragrance.images.findIndex((img) => img._id == imageId);

    if (imageIndex === -1) {

      return res.status(404).json({ message: 'Image not found' });

    }



    const imageKey = fragrance.images[imageIndex].key;

    await s3Client.send(new DeleteObjectCommand({

      Bucket: process.env.AWS_S3_BUCKET_NAME,

      Key: imageKey,

    }));



    fragrance.images.splice(imageIndex, 1);

    await fragrance.save();



    res.status(200).json({ message: 'Image deleted successfully' });

  } catch (error) {

    console.error('Error deleting image:', error);

    res.status(500).json({ message: 'Failed to delete image', error: error.message });

  }

};



module.exports = {

  uploadImage,

  deleteImage,

};
