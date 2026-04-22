import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import LocalTrip from '@/models/LocalTrip';

export async function GET(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');

  let startDate: Date, endDate: Date;
  if (month) {
    const [y, m] = month.split('-').map(Number);
    startDate = new Date(y, m - 1, 1);
    endDate = new Date(y, m, 1);
  } else {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const trips = await LocalTrip.find({
    date: { $gte: startDate, $lt: endDate },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const truckWiseMap: Record<string, any> = {};
  trips.forEach(t => {
    if (!truckWiseMap[t.truckNumber]) {
      truckWiseMap[t.truckNumber] = {
        truckNumber: t.truckNumber,
        totalTrips: 0,
        totalExpense: 0,
        totalRevenue: 0,
        totalProfit: 0,
      };
    }
    const tr = truckWiseMap[t.truckNumber];
    tr.totalTrips += 1;
    tr.totalExpense += t.totalExpense;
    tr.totalRevenue += t.sellingPrice;
    tr.totalProfit += t.profitLoss;
  });

  const summary = {
    totalTrips: trips.length,
    totalExpense: trips.reduce((s, t) => s + t.totalExpense, 0),
    totalRevenue: trips.reduce((s, t) => s + t.sellingPrice, 0),
    totalProfit: trips.reduce((s, t) => s + t.profitLoss, 0),
    totalDiesel: trips.reduce((s, t) => s + t.dieselCost, 0),
    totalSalary: trips.reduce((s, t) => s + t.driverSalary, 0),
    totalMaintenance: trips.reduce((s, t) => s + t.maintenance, 0),
    truckWise: Object.values(truckWiseMap).sort((a, b) => b.totalProfit - a.totalProfit),
  };

  return NextResponse.json(summary);
}
