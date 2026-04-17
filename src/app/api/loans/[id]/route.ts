import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Loan from '@/models/Loan';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  try {
    const { id } = await params;
    const body = await request.json();
    const loan = await Loan.findById(id);
    if (!loan) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // If adding a payment
    if (body.newPayment) {
      loan.payments.push(body.newPayment);
      await loan.save();
      return NextResponse.json(loan);
    }

    Object.assign(loan, body);
    await loan.save();
    return NextResponse.json(loan);
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
  await Loan.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
