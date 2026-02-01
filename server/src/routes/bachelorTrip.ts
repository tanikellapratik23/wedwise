import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { BachelorTrip, BachelorExpense, BachelorFlight, BachelorStay } from '../models/BachelorTrip';

const router = Router();

// Create or get bachelor trip
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { eventName, eventType, tripDate, location, estimatedBudget } = req.body;
    const userId = req.userId;

    console.log('🔍 Bachelor Trip Create Request:');
    console.log('  User ID:', userId);
    console.log('  Event Name:', eventName);
    console.log('  Event Type:', eventType);
    console.log('  Trip Date:', tripDate, 'type:', typeof tripDate);
    console.log('  Location:', location);
    console.log('  Budget:', estimatedBudget, 'type:', typeof estimatedBudget);
    console.log('  Full request body:', req.body);

    if (!eventName || !eventType || !tripDate || !location || estimatedBudget === undefined) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: eventName, eventType, tripDate, location, estimatedBudget' 
      });
    }

    let trip = await BachelorTrip.findOne({ userId });

    if (trip) {
      console.log('📝 Updating existing trip');
      trip.eventName = eventName;
      trip.eventType = eventType;
      trip.tripDate = new Date(tripDate);
      trip.location = location;
      trip.estimatedBudget = parseFloat(estimatedBudget);
      await trip.save();
      console.log('✅ Trip updated successfully:', trip._id);
      return res.json({ success: true, data: trip });
    }

    console.log('✨ Creating new trip');
    trip = new BachelorTrip({
      userId,
      eventName,
      eventType,
      tripDate: new Date(tripDate),
      location,
      estimatedBudget: parseFloat(estimatedBudget),
      attendees: [],
      expenses: [],
      flights: [],
      stays: [],
      totalExpenses: 0,
      status: 'planning',
    });

    await trip.save();
    console.log('✅ Trip created successfully:', trip._id);
    res.json({ success: true, data: trip });
  } catch (error) {
    console.error('❌ Error creating bachelor trip:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get bachelor trip
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const trip = await BachelorTrip.findOne({ userId })
      .populate('expenses')
      .populate('flights')
      .populate('stays');

    if (!trip) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Add attendee
router.post('/attendees', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, email, phone } = req.body;

    const trip = await BachelorTrip.findOne({ userId });
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    trip.attendees.push({ name, email, phone });
    await trip.save();

    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Add expense
router.post('/expenses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { tripId, description, amount, category, paidBy, splitBetween } = req.body;

    const expense = new BachelorExpense({
      description,
      amount,
      category,
      paidBy,
      splitBetween,
    });

    await expense.save();

    const trip = await BachelorTrip.findById(tripId);
    if (trip) {
      trip.expenses.push(expense._id.toString());
      trip.totalExpenses += amount;
      await trip.save();
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get expenses for trip
router.get('/:tripId/expenses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const expenses = await BachelorExpense.find({ _id: { $in: (await BachelorTrip.findById(tripId))?.expenses || [] } });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Mark expense as paid
router.put('/expenses/:expenseId/paid', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { expenseId } = req.params;
    const { userId: payingUserId } = req.body;

    const expense = await BachelorExpense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    const split = expense.splitBetween.find(s => s.userId === payingUserId);
    if (split) {
      split.paid = true;
    }

    await expense.save();
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Save flight
router.post('/flights', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { tripId, airline, departure, arrival, price, bookingUrl } = req.body;
    const userId = req.userId;

    const flight = new BachelorFlight({
      tripId,
      airline,
      departure,
      arrival,
      price,
      bookingUrl,
      savedByUsers: [userId],
    });

    await flight.save();

    const trip = await BachelorTrip.findById(tripId);
    if (trip) {
      trip.flights.push(flight._id.toString());
      await trip.save();
    }

    res.json({ success: true, data: flight });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get flights for trip
router.get('/:tripId/flights', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const flights = await BachelorFlight.find({ tripId });
    res.json({ success: true, data: flights });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Save stay
router.post('/stays', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { tripId, name, location, checkIn, checkOut, pricePerNight, bookingUrl } = req.body;
    const userId = req.userId;

    const totalNights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

    const stay = new BachelorStay({
      tripId,
      name,
      location,
      checkIn,
      checkOut,
      pricePerNight,
      totalNights,
      bookingUrl,
      savedByUsers: [userId],
    });

    await stay.save();

    const trip = await BachelorTrip.findById(tripId);
    if (trip) {
      trip.stays.push(stay._id.toString());
      await trip.save();
    }

    res.json({ success: true, data: stay });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get stays for trip
router.get('/:tripId/stays', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const stays = await BachelorStay.find({ tripId });
    res.json({ success: true, data: stays });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
