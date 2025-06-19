import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/model/Product';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  await connectToDatabase();
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  const body = await req.json();

  const { name,  price, teamId, createdBy, categoryId,currency, description, quantity } = body;

  if (!name || !price || !teamId) {
    return NextResponse.json({ error: 'Name, Price, and Team ID are required' }, { status: 400 });
  }

  const product = await Product.create({
    name,
    price,
    currency,
    teamId,
    createdBy :session.user?.id,
    categoryId,
    description,
    quantity,
  });

  return NextResponse.json(product, { status: 201 });
}

export async function GET(req: NextRequest) {
  await connectToDatabase();
      const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  const teamId = req.nextUrl.searchParams.get('team-id');
  if (!teamId) return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });

  const products = await Product.find({ teamId }).populate('categoryId', 'name');
  return NextResponse.json(products);
}
