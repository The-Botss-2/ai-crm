import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/model/Product';
import { auth } from '@/auth';

export async function GET(_: NextRequest,  { params }: { params: Promise<{ id: string  }>}) {
    await connectToDatabase();
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const product = await Product.findById(id).populate('categoryId', 'name');
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string  }>}) {
    await connectToDatabase();
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    const { id } = await params;

    const updated = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string  }>}) {
    await connectToDatabase();
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Product deleted' });
}
