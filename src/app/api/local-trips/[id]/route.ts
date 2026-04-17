import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import LocalTrip from '@/models/LocalTrip';
import StockEntry from '@/models/StockEntry';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  try {
    const { id } = await params;
    const body = await request.json();

    await StockEntry.deleteMany({ referenceId: id, source: 'local_truck_purchase' });

    const trip = await LocalTrip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    Object.assign(trip, body);
    await trip.save();

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

    return NextResponse.json(trip);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  await StockEntry.deleteMany({ referenceId: id, source: 'local_truck_purchase' });
  await LocalTrip.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
