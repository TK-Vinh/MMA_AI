const Collection = require('../models/Collection');
const Fragrance = require('../models/Fragrance');

// Get user's collection
exports.getCollection = async (req, res) => {
  try {
    const { status = 'owned', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const collection = await Collection.find({
      userId: req.user._id,
      status
    })
      .populate('fragranceId', 'name brand category imageUrl concentration size')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Collection.countDocuments({
      userId: req.user._id,
      status
    });

    res.status(200).json({
      status: 'success',
      results: collection.length,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: {
        collection
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Add fragrance to collection
exports.addToCollection = async (req, res) => {
  try {
    const { fragranceId, status = 'owned', ...otherData } = req.body;

    // Check if fragrance exists
    const fragrance = await Fragrance.findById(fragranceId);
    if (!fragrance) {
      return res.status(404).json({
        status: 'fail',
        message: 'Fragrance not found'
      });
    }

    // Check if already in collection with same status
    const existing = await Collection.findOne({
      userId: req.user._id,
      fragranceId,
      status
    });

    if (existing) {
      return res.status(400).json({
        status: 'fail',
        message: `Fragrance already in your ${status} list`
      });
    }

    const collectionItem = await Collection.create({
      userId: req.user._id,
      fragranceId,
      status,
      ...otherData
    });

    await collectionItem.populate('fragranceId', 'name brand category imageUrl');

    res.status(201).json({
      status: 'success',
      data: {
        collection: collectionItem
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update collection item
exports.updateCollectionItem = async (req, res) => {
  try {
    const collectionItem = await Collection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('fragranceId', 'name brand category imageUrl');

    if (!collectionItem) {
      return res.status(404).json({
        status: 'fail',
        message: 'Collection item not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        collection: collectionItem
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Remove from collection
exports.removeFromCollection = async (req, res) => {
  try {
    const collectionItem = await Collection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!collectionItem) {
      return res.status(404).json({
        status: 'fail',
        message: 'Collection item not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get collection statistics
exports.getCollectionStats = async (req, res) => {
  try {
    const stats = await Collection.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSpent: { $sum: '$purchasePrice' }
        }
      }
    ]);

    const formattedStats = {
      owned: 0,
      wishlist: 0,
      tried: 0,
      sold: 0,
      totalSpent: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      if (stat._id === 'owned') {
        formattedStats.totalSpent = stat.totalSpent || 0;
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: formattedStats
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Mark as worn
exports.markAsWorn = async (req, res) => {
  try {
    const collectionItem = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'owned'
    });

    if (!collectionItem) {
      return res.status(404).json({
        status: 'fail',
        message: 'Collection item not found'
      });
    }

    await collectionItem.updateWearCount();

    res.status(200).json({
      status: 'success',
      data: {
        collection: collectionItem
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};