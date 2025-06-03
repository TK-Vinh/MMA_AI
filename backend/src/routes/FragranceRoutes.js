const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const fragranceController = require('../controllers/FragranceController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/categories', fragranceController.getCategories);
router.get('/brands', fragranceController.getBrands);

router.route('/')
  .get(fragranceController.getAllFragrances)
  .post(protect, adminOnly, fragranceController.createFragrance);

router.route('/:id')
  .get(fragranceController.getFragrance)
  .put(protect, adminOnly, fragranceController.updateFragrance)
  .delete(protect, adminOnly, fragranceController.deleteFragrance);

module.exports = router;