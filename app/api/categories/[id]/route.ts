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

    const category = await prisma.gradeCategory.findUnique({
      where: { id: params.id },
      include: { course: true },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { label, weightPercent, multiple, expectedCount, dropLowest } = body

    const updated = await prisma.gradeCategory.update({
      where: { id: params.id },
      data: {
        ...(label && { label }),
        ...(weightPercent !== undefined && { 
          weightPercent: weightPercent !== null ? parseFloat(weightPercent) : null 
        }),
        ...(multiple !== undefined && { multiple }),
        ...(expectedCount !== undefined && { expectedCount: expectedCount ? parseInt(expectedCount) : null }),
        ...(dropLowest !== undefined && { 
          dropLowest: dropLowest !== null ? parseInt(dropLowest) : null 
        }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating category:', error)
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

    const category = await prisma.gradeCategory.findUnique({
      where: { id: params.id },
      include: { course: true },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.gradeCategory.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Category deleted' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


