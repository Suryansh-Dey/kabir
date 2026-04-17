import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import LoaderEntry from '@/models/LoaderEntry';

export async function GET(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const loader = searchParams.get('loader');
  const month = searchParams.get('month');
  const date = searchParams.get('date');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};
  if (loader) filter.loaderNumber = loader;
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

  const entries = await LoaderEntry.find(filter).sort({ date: -1 });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  try {
    const body = await request.json();
    const entry = new LoaderEntry(body);
    await entry.save();
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
