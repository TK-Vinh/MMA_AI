const express = require('express');

const router = express.Router();

const { protect, adminOnly } = require('../middlewares/auth');

const fragranceController = require('../controllers/FragranceController');

const fragranceImageController = require('../controllers/FragranceImageController');



router.route('')

  .get(fragranceController.getAllFragrances)

  .post(protect, adminOnly, fragranceController.createFragrance);



router.route('/:id')

  .get(fragranceController.getFragranceById)

  .put(protect, adminOnly, fragranceController.updateFragrance)

  .delete(protect, adminOnly, fragranceController.deleteFragrance);



router.route('/:id/images')

  .post(protect, adminOnly, fragranceImageController.uploadImage);



router.route('/:id/images/:imageId')

  .delete(protect, adminOnly, fragranceImageController.deleteImage);



router.put('/:id/rating', fragranceController.updateRating);



module.exports = router;