const express = require('express');
const { protect } = require('../middlewares/auth');
const collectionController = require('../controllers/CollectionController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Collection routes
router.route('/')
  .get(collectionController.getCollection)
  .post(collectionController.addToCollection);

// Collection statistics - must be before /:id routes
router.get('/stats', collectionController.getCollectionStats);

// Individual collection item routes
router.route('/:id')
  .put(collectionController.updateCollectionItem)
  .delete(collectionController.removeFromCollection);

// Mark as worn
router.post('/:id/wear', collectionController.markAsWorn);

module.exports = router;