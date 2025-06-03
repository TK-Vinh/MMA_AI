const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Fragrance = require('../models/Fragrance');

const router = express.Router();

// GET /api/fragrances - Get all fragrances with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      gender,
      minPrice,
      maxPrice,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (gender && gender !== 'All') filter.gender = gender;
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Price filter (assuming we want to filter by the minimum size price)
    if (minPrice || maxPrice) {
      filter['size.price'] = {};
      if (minPrice) filter['size.price'].$gte = Number(minPrice);
      if (maxPrice) filter['size.price'].$lte = Number(maxPrice);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const fragrances = await Fragrance.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Fragrance.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: fragrances.length,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: {
        fragrances
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// GET /api/fragrances/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Fragrance.distinct('category', { isActive: true });
    res.status(200).json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// GET /api/fragrances/brands - Get all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Fragrance.distinct('brand', { isActive: true });
    res.status(200).json({
      status: 'success',
      data: {
        brands: brands.sort()
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// GET /api/fragrances/:id - Get single fragrance
router.get('/:id', async (req, res) => {
  try {
    const fragrance = await Fragrance.findById(req.params.id);
    
    if (!fragrance || !fragrance.isActive) {
      return res.status(404).json({
        status: 'fail',
        message: 'Fragrance not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        fragrance
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// POST /api/fragrances - Create new fragrance (admin only - you can add admin middleware later)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const fragrance = await Fragrance.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        fragrance
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
});

module.exports = router;