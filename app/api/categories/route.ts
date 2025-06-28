import { NextRequest, NextResponse } from 'next/server';

// Mock categories data - in a real app, this would come from a database
let categories = [
  { id: '1', name: '和食', color: '#FF6B6B' },
  { id: '2', name: '洋食', color: '#4ECDC4' },
  { id: '3', name: '中華', color: '#45B7D1' },
  { id: '4', name: 'エスニック', color: '#96CEB4' },
  { id: '5', name: 'デザート', color: '#FFEAA7' },
  { id: '6', name: 'サラダ', color: '#DDA0DD' },
  { id: '7', name: 'スープ', color: '#98D8C8' },
  { id: '8', name: 'パスタ', color: '#F7DC6F' },
];

export async function GET() {
  try {
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const newCategory = {
      id: Date.now().toString(),
      name,
      color: color || '#6B7280',
    };

    categories.push(newCategory);

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const initialLength = categories.length;
    categories = categories.filter(category => category.id !== id);

    if (categories.length === initialLength) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { name, color } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const categoryIndex = categories.findIndex(category => category.id === id);
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name,
      color: color || categories[categoryIndex].color,
    };

    return NextResponse.json({ category: categories[categoryIndex] });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
} 