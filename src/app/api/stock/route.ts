import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import StockEntry from '@/models/StockEntry';

export async function GET(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const limit = parseInt(searchParams.get('limit') || '50');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};
  if (month) {
    const [y, m] = month.split('-').map(Number);
    filter.date = {
      $gte: new Date(y, m - 1, 1),
      $lt: new Date(y, m, 1),
    };
  }

  const entries = await StockEntry.find(filter).sort({ date: -1 }).limit(limit);

  // Calculate total stock value
  const allEntries = await StockEntry.find();
  const totalIn = allEntries.filter(e => e.type === 'in').reduce((s, e) => s + e.costValue, 0);
  const totalOut = allEntries.filter(e => e.type === 'out').reduce((s, e) => s + e.costValue, 0);
  const totalQuantityIn = allEntries.filter(e => e.type === 'in').reduce((s, e) => s + e.quantity, 0);
  const totalQuantityOut = allEntries.filter(e => e.type === 'out').reduce((s, e) => s + e.quantity, 0);

  return NextResponse.json({
    entries,
    stockValue: totalIn - totalOut,
    stockQuantity: totalQuantityIn - totalQuantityOut,
    totalIn,
    totalOut,
  });
}

// Manual stock entry (for external truck purchases)
export async function POST(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  try {
    const body = await request.json();
    const entry = new StockEntry({
      ...body,
      type: body.type || 'in',
      source: body.source || 'external_truck',
    });
    await entry.save();
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
