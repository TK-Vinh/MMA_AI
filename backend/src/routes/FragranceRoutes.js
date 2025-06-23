const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const fragranceController = require('../controllers/FragranceController');
const fragranceImageController = require('../controllers/FragranceImageController');

router.route('')
  .get(fragranceController.getAllFragrances)
  .post(protect, fragranceController.createFragrance);

router.route('/:id')
  .get(fragranceController.getFragranceById)
  .put(protect, fragranceController.updateFragrance)
  .delete(protect, fragranceController.deleteFragrance);

router.route('/:id/images')
  .post(protect, fragranceImageController.uploadImage);

router.route('/:id/images/:imageId')
  .delete(protect, fragranceImageController.deleteImage);

router.put('/:id/rating', fragranceController.updateRating);

module.exports = router;