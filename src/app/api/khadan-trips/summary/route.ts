import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import KhadanTrip from '@/models/KhadanTrip';

export async function GET(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM

  let startDate: Date, endDate: Date;
  if (month) {
    const [y, m] = month.split('-').map(Number);
    startDate = new Date(y, m - 1, 1);
    endDate = new Date(y, m, 1);
  } else {
    // Current month
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const trips = await KhadanTrip.find({
    date: { $gte: startDate, $lt: endDate },
  });

  const summary = {
    totalTrips: trips.length,
    totalExpense: trips.reduce((s, t) => s + t.totalExpense, 0),
    totalRevenue: trips.filter(t => t.sellingMode === 'direct').reduce((s, t) => s + t.sellingPrice, 0),
    totalProfit: trips.reduce((s, t) => s + t.profitLoss, 0),
    totalDiesel: trips.reduce((s, t) => s + t.dieselCost, 0),
    totalSalary: trips.reduce((s, t) => s + t.driverSalary, 0),
    totalMaintenance: trips.reduce((s, t) => s + t.maintenance, 0),
    totalRoyalty: trips.reduce((s, t) => s + t.royalty, 0),
    directSales: trips.filter(t => t.sellingMode === 'direct').length,
    stockAdditions: trips.filter(t => t.sellingMode === 'stock').length,
  };

  return NextResponse.json(summary);
}
