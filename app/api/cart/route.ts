import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticate } from '@/app/lib/auth';

// Type assertion to help with TypeScript
const typedPrisma = prisma as any;

// Get user's cart
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const cart = await typedPrisma.cart.findUnique({
      where: { userId: auth.userId },
      include: {
        items: {
          include: {
            plant: true
          }
        }
      }
    });

    if (!cart) {
      return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        cart: {
          id: cart.id,
          userId: cart.userId,
          items: cart.items.map((item: any) => ({
            id: item.id,
            plantId: item.plantId,
            quantity: item.quantity,
            plant: item.plant
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while getting the cart' },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { plantId, quantity = 1 } = await req.json();

    if (!plantId) {
      return NextResponse.json(
        { success: false, message: 'Plant ID is required' },
        { status: 400 }
      );
    }

    // Check if plant exists
    const plant = await typedPrisma.plant.findUnique({ where: { id: plantId } });
    if (!plant) {
      return NextResponse.json(
        { success: false, message: 'Plant not found' },
        { status: 404 }
      );
    }

    // Get or create cart
    let cart = await typedPrisma.cart.findUnique({ where: { userId: auth.userId } });
    if (!cart) {
      cart = await typedPrisma.cart.create({ data: { userId: auth.userId } });
    }

    // Check if item already exists in cart
    const existingItem = await typedPrisma.cartItem.findFirst({
      where: { cartId: cart.id, plantId }
    });

    let cartItem;
    if (existingItem) {
      // Update quantity if item exists
      cartItem = await typedPrisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { plant: true }
      });
    } else {
      // Add new item to cart
      cartItem = await typedPrisma.cartItem.create({
        data: {
          cartId: cart.id,
          plantId,
          quantity
        },
        include: { plant: true }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: { item: cartItem }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while adding to cart' },
      { status: 500 }
    );
  }
}

// Update or remove cart item
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get cart
    const cart = await typedPrisma.cart.findUnique({ where: { userId: auth.userId } });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    // Check if item exists in cart
    const existingItem = await typedPrisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Remove item if quantity is 0, otherwise update quantity
    if (quantity <= 0) {
      await typedPrisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      });
    } else {
      const updatedItem = await typedPrisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
        include: { plant: true }
      });
      return NextResponse.json({
        success: true,
        message: 'Cart updated',
        data: { item: updatedItem }
      });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating the cart' },
      { status: 500 }
    );
  }
}

// Clear cart (DELETE all items)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Find the user's cart
    const cart = await typedPrisma.cart.findUnique({
      where: { userId: auth.userId },
      include: { items: true }
    });

    if (!cart) {
      return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });
    }

    if (cart.items.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Cart is already empty'
      });
    }

    // Delete all cart items
    await typedPrisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while clearing the cart' },
      { status: 500 }
    );
  }
} 