import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gradeItem = await prisma.gradeItem.findUnique({
      where: { id: params.id },
      include: {
        category: {
          include: { course: true },
        },
      },
    })

    if (!gradeItem) {
      return NextResponse.json({ error: 'Grade item not found' }, { status: 404 })
    }

    if (gradeItem.category.course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, percent } = body

    const updated = await prisma.gradeItem.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(percent !== undefined && { percent: percent !== null ? parseFloat(percent) : null }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating grade item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gradeItem = await prisma.gradeItem.findUnique({
      where: { id: params.id },
      include: {
        category: {
          include: { course: true },
        },
      },
    })

    if (!gradeItem) {
      return NextResponse.json({ error: 'Grade item not found' }, { status: 404 })
    }

    if (gradeItem.category.course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.gradeItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Grade item deleted' })
  } catch (error) {
    console.error('Error deleting grade item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


