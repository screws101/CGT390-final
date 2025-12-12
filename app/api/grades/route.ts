import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { categoryId, name, percent } = body

    if (!categoryId || !name) {
      return NextResponse.json(
        { error: 'Category ID and name are required' },
        { status: 400 }
      )
    }

    const category = await prisma.gradeCategory.findUnique({
      where: { id: categoryId },
      include: { course: true },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const gradeItem = await prisma.gradeItem.create({
      data: {
        categoryId,
        name,
        percent: percent !== undefined && percent !== null ? parseFloat(percent) : null,
      },
    })

    return NextResponse.json(gradeItem, { status: 201 })
  } catch (error) {
    console.error('Error creating grade item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


