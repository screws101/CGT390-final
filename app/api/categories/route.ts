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
    const { courseId, label, weightPercent, multiple, expectedCount, dropLowest } = body

    if (!courseId || !label) {
      return NextResponse.json(
        { error: 'Course ID and label are required' },
        { status: 400 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const category = await prisma.gradeCategory.create({
      data: {
        courseId,
        label,
        weightPercent: weightPercent !== null && weightPercent !== undefined ? parseFloat(weightPercent) : null,
        multiple: multiple || false,
        expectedCount: expectedCount ? parseInt(expectedCount) : null,
        dropLowest: dropLowest !== null && dropLowest !== undefined ? parseInt(dropLowest) : null,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


