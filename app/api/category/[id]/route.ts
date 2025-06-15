import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Category from '@/model/Category';
import { auth } from '@/auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string  }>}) {
  await connectToDatabase();
  const { id } = await params;
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
  const category = await Category.findById(id);
  if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

  return NextResponse.json(category);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string  }>}) {
  await connectToDatabase();
     const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  const body = await req.json();
  const { id } = await params;
  const updated = await Category.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string  }>}) {
  await connectToDatabase();
  const { id } = await params;

  await Category.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Category deleted' });
}
