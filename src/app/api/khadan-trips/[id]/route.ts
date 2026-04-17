import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import KhadanTrip from '@/models/KhadanTrip';
import StockEntry from '@/models/StockEntry';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  try {
    const { id } = await params;
    const body = await request.json();

    // Remove old stock entry if exists
    await StockEntry.deleteMany({ referenceId: id, source: 'khadan_truck' });

    const trip = await KhadanTrip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    Object.assign(trip, body);
    await trip.save();

    // Re-create stock entry if applicable
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
  await StockEntry.deleteMany({ referenceId: id, source: 'khadan_truck' });
  await KhadanTrip.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
