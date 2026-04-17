import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import KhadanTrip from '@/models/KhadanTrip';
import LocalTrip from '@/models/LocalTrip';
import LoaderEntry from '@/models/LoaderEntry';
import StockEntry from '@/models/StockEntry';
import Loan from '@/models/Loan';

export async function GET() {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Today's data
  const todayKhadan = await KhadanTrip.find({ date: { $gte: todayStart, $lt: todayEnd } });
  const todayLocal = await LocalTrip.find({ date: { $gte: todayStart, $lt: todayEnd } });
  const todayLoader = await LoaderEntry.find({ date: { $gte: todayStart, $lt: todayEnd } });

  // Monthly data
  const monthKhadan = await KhadanTrip.find({ date: { $gte: monthStart, $lt: monthEnd } });
  const monthLocal = await LocalTrip.find({ date: { $gte: monthStart, $lt: monthEnd } });
  const monthLoader = await LoaderEntry.find({ date: { $gte: monthStart, $lt: monthEnd } });

  // Stock value
  const allStock = await StockEntry.find();
  const stockIn = allStock.filter(e => e.type === 'in').reduce((s, e) => s + e.costValue, 0);
  const stockOut = allStock.filter(e => e.type === 'out').reduce((s, e) => s + e.costValue, 0);

  // Active loans
  const activeLoans = await Loan.find({ isActive: true });
  const totalEmi = activeLoans.reduce((s, l) => s + l.emiAmount, 0);

  const dashboard = {
    today: {
      khadanProfit: todayKhadan.reduce((s, t) => s + t.profitLoss, 0),
      khadanExpense: todayKhadan.reduce((s, t) => s + t.totalExpense, 0),
      khadanTrips: todayKhadan.length,
      localProfit: todayLocal.reduce((s, t) => s + t.profitLoss, 0),
      localExpense: todayLocal.reduce((s, t) => s + t.totalExpense, 0),
      localRevenue: todayLocal.reduce((s, t) => s + t.sellingPrice, 0),
      localTrips: todayLocal.length,
      loaderIncome: todayLoader.reduce((s, t) => s + t.totalIncome, 0),
      loaderExpense: todayLoader.reduce((s, t) => s + t.totalExpense, 0),
      loaderProfit: todayLoader.reduce((s, t) => s + t.profitLoss, 0),
      totalProfit: todayKhadan.reduce((s, t) => s + t.profitLoss, 0) +
        todayLocal.reduce((s, t) => s + t.profitLoss, 0) +
        todayLoader.reduce((s, t) => s + t.profitLoss, 0),
    },
    month: {
      khadanProfit: monthKhadan.reduce((s, t) => s + t.profitLoss, 0),
      khadanExpense: monthKhadan.reduce((s, t) => s + t.totalExpense, 0),
      khadanTrips: monthKhadan.length,
      localProfit: monthLocal.reduce((s, t) => s + t.profitLoss, 0),
      localExpense: monthLocal.reduce((s, t) => s + t.totalExpense, 0),
      localRevenue: monthLocal.reduce((s, t) => s + t.sellingPrice, 0),
      localTrips: monthLocal.length,
      loaderIncome: monthLoader.reduce((s, t) => s + t.totalIncome, 0),
      loaderExpense: monthLoader.reduce((s, t) => s + t.totalExpense, 0),
      loaderProfit: monthLoader.reduce((s, t) => s + t.profitLoss, 0),
      totalProfit: monthKhadan.reduce((s, t) => s + t.profitLoss, 0) +
        monthLocal.reduce((s, t) => s + t.profitLoss, 0) +
        monthLoader.reduce((s, t) => s + t.profitLoss, 0),
      totalExpense: monthKhadan.reduce((s, t) => s + t.totalExpense, 0) +
        monthLocal.reduce((s, t) => s + t.totalExpense, 0) +
        monthLoader.reduce((s, t) => s + t.totalExpense, 0),
    },
    stock: {
      value: stockIn - stockOut,
      totalIn: stockIn,
      totalOut: stockOut,
    },
    loans: {
      activeCount: activeLoans.length,
      monthlyEmi: totalEmi,
      totalRemaining: activeLoans.reduce((s, l) => s + l.remainingAmount, 0),
    },
  };

  return NextResponse.json(dashboard);
}
