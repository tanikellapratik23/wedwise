import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Vendor from '../models/Vendor';
import axios from 'axios';

const router = Router();

// Proxy Yelp API search (to avoid CORS issues in frontend)
router.get('/search', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { city, state, category } = req.query;
    const YELP_API_KEY = process.env.YELP_API_KEY;

    if (!YELP_API_KEY) {
      return res.json({ businesses: [] }); // Return empty if no API key
    }

    const categoryMap: { [key: string]: string } = {
      Photography: 'photographers',
      Venue: 'venues,eventspaces',
      DJ: 'djs',
      Officiant: 'officiants',
      Catering: 'caterers,catering',
      Flowers: 'florists',
      Planning: 'wedding_planning,eventplanners',
    };

    const yelpCategory = categoryMap[category as string] || 'wedding';
    const location = `${city}, ${state}`;

    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
      params: {
        location,
        term: `wedding ${yelpCategory}`,
        limit: 20,
        sort_by: 'rating',
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Yelp API error:', error.response?.data || error.message);
    res.json({ businesses: [] }); // Return empty on error
  }
});

// Get all vendors
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const vendors = await Vendor.find({ userId: req.userId });
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Create vendor
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const vendor = new Vendor({
      userId: req.userId,
      ...req.body,
    });
    await vendor.save();
    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// Update vendor
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// Delete vendor
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

export default router;
