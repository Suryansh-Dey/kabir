import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import KhadanTrip from '@/models/KhadanTrip';
import StockEntry from '@/models/StockEntry';

export async function GET(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const truck = searchParams.get('truck');
  const month = searchParams.get('month'); // YYYY-MM
  const date = searchParams.get('date');   // YYYY-MM-DD

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};
  if (truck) filter.truckNumber = truck;
  if (date) {
    const d = new Date(date);
    filter.date = {
      $gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      $lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
    };
  } else if (month) {
    const [y, m] = month.split('-').map(Number);
    filter.date = {
      $gte: new Date(y, m - 1, 1),
      $lt: new Date(y, m, 1),
    };
  }

  const trips = await KhadanTrip.find(filter).sort({ date: -1 });
  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  try {
    const body = await request.json();
    const trip = new KhadanTrip(body);
    await trip.save();

    // If selling mode is stock, add to stock
    if (trip.sellingMode === 'stock') {
      const stockEntry = new StockEntry({
        date: trip.date,
        type: 'in',
        source: 'khadan_truck',
        truckNumber: trip.truckNumber,
        quantity: trip.quantity || 0,
        costValue: trip.totalExpense,
        description: `खदान ट्रक ${trip.truckNumber} से माल आया`,
        referenceId: trip._id,
      });
      await stockEntry.save();
    }

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
