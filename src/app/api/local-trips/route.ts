import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import LocalTrip from '@/models/LocalTrip';
import StockEntry from '@/models/StockEntry';

export async function GET(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const truck = searchParams.get('truck');
  const month = searchParams.get('month');
  const date = searchParams.get('date');

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

  const trips = await LocalTrip.find(filter).sort({ date: -1 });
  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  try {
    const body = await request.json();
    const trip = new LocalTrip(body);
    await trip.save();

    // Decrease stock - local truck purchases from stock
    if (trip.sandPurchaseCost > 0) {
      const stockEntry = new StockEntry({
        date: trip.date,
        type: 'out',
        source: 'local_truck_purchase',
        truckNumber: trip.truckNumber,
        quantity: trip.quantity || 0,
        costValue: trip.sandPurchaseCost,
        description: `लोकल ट्रक ${trip.truckNumber} ने स्टॉक से रेती ली`,
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
