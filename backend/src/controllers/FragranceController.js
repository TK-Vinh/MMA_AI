const Fragrance = require('../models/Fragrance');

const mongoose = require('mongoose');



// Create a new fragrance

exports.createFragrance = async (req, res) => {

  try {

    const fragrance = new Fragrance(req.body);

    const savedFragrance = await fragrance.save();

    res.status(201).json(savedFragrance);

  } catch (error) {

    console.error('Error in createFragrance:', error);

    res.status(400).json({ message: error.message });

  }

};



// Get all fragrances with optional filtering

exports.getAllFragrances = async (req, res) => {

  try {

    console.log('Received GET /api/fragrances request with query:', req.query);

    const { category, brand, gender, concentration, minRating, search } = req.query;

    const query = {};



    // Optional filters - only add to query if present

    if (category) {

      if (!['Fresh', 'Floral', 'Oriental', 'Woody', 'Citrus', 'Gourmand', 'Aquatic', 'Spicy', 'Green', 'Fruity'].includes(category)) {

        return res.status(400).json({ message: `Invalid category: ${category}` });

      }

      query.category = category;

    }

    if (brand) query.brand = brand;

    if (gender) {

      if (!['Men', 'Women', 'Unisex'].includes(gender)) {

        return res.status(400).json({ message: `Invalid gender: ${gender}` });

      }

      query.gender = gender;

    }

    if (concentration) {

      if (!['EDT', 'EDP', 'Parfum', 'EDC', 'Cologne'].includes(concentration)) {

        return res.status(400).json({ message: `Invalid concentration: ${concentration}` });

      }

      query.concentration = concentration;

    }

    if (minRating) {

      const minRatingNum = parseFloat(minRating);

      if (isNaN(minRatingNum) || minRatingNum < 0 || minRatingNum > 5) {

        return res.status(400).json({ message: `Invalid minRating: ${minRating}, must be between 0 and 5` });

      }

      query.rating = { $gte: minRatingNum };

    }

    if (search) {

      if (typeof search !== 'string') {

        return res.status(400).json({ message: 'Search parameter must be a string' });

      }

      query.$text = { $search: search };

    }



    console.log('Executing query:', query);

    const fragrances = await Fragrance.find(query)

      .sort({ createdAt: -1 })

      .limit(20);

    console.log('Found fragrances:', fragrances.length);

    res.json(fragrances);

  } catch (error) {

    console.error('Error in getAllFragrances:', error.message);

    console.error('Stack trace:', error.stack);

    res.status(500).json({ message: 'Internal server error', error: error.message });

  }

};



// Get a single fragrance by ID

exports.getFragranceById = async (req, res) => {

  try {

    const fragrance = await Fragrance.findById(req.params.id);

    if (!fragrance) {

      return res.status(404).json({ message: 'Fragrance not found' });

    }

    res.json(fragrance);

  } catch (error) {

    if (error instanceof mongoose.CastError) {

      return res.status(400).json({ message: 'Invalid fragrance ID' });

    }

    console.error('Error in getFragranceById:', error);

    res.status(500).json({ message: 'Internal server error', error: error.message });

  }

};



// Update a fragrance

exports.updateFragrance = async (req, res) => {

  try {

    const fragrance = await Fragrance.findByIdAndUpdate(

      req.params.id,

      { $set: req.body },

      { new: true, runValidators: true }

    );

    if (!fragrance) {

      return res.status(404).json({ message: 'Fragrance not found' });

    }

    res.json(fragrance);

  } catch (error) {

    if (error instanceof mongoose.CastError) {

      return res.status(400).json({ message: 'Invalid fragrance ID' });

    }

    console.error('Error in updateFragrance:', error);

    res.status(400).json({ message: error.message });

  }

};



// Delete a fragrance

exports.deleteFragrance = async (req, res) => {

  try {

    const fragrance = await Fragrance.findByIdAndDelete(req.params.id);

    if (!fragrance) {

      return res.status(404).json({ message: 'Fragrance not found' });

    }

    res.json({ message: 'Fragrance deleted successfully' });

  } catch (error) {

    if (error instanceof mongoose.CastError) {

      return res.status(400).json({ message: 'Invalid fragrance ID' });

    }

    console.error('Error in deleteFragrance:', error);

    res.status(500).json({ message: 'Internal server error', error: error.message });

  }

};



// Update fragrance rating

exports.updateRating = async (req, res) => {

  try {

    const { rating } = req.body;

    if (rating < 0 || rating > 5) {

      return res.status(400).json({ message: 'Rating must be between 0 and 5' });

    }



    const fragrance = await Fragrance.findById(req.params.id);

    if (!fragrance) {

      return res.status(404).json({ message: 'Fragrance not found' });

    }



    const newTotalRatings = fragrance.totalRatings + 1;

    const newRating = ((fragrance.rating * fragrance.totalRatings) + rating) / newTotalRatings;



    fragrance.rating = Math.round(newRating * 10) / 10;

    fragrance.totalRatings = newTotalRatings;



    await fragrance.save();

    res.json(fragrance);

  } catch (error) {

    if (error instanceof mongoose.CastError) {

      return res.status(400).json({ message: 'Invalid fragrance ID' });

    }

    console.error('Error in updateRating:', error);

    res.status(400).json({ message: error.message });

  }

};