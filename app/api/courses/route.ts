import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_GRADING_SCALE } from '@/lib/grades'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      where: { userId: session.user.id },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
        gradingScale: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, number, creditHours, weightingMode } = body

    if (!name || !number || !creditHours) {
      return NextResponse.json(
        { error: 'Name, number, and credit hours are required' },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        userId: session.user.id,
        name,
        number,
        creditHours: parseInt(creditHours),
        weightingMode: weightingMode || 'percentage',
        gradingScale: {
          create: DEFAULT_GRADING_SCALE.map(scale => ({
            grade: scale.grade,
            threshold: scale.threshold,
          })),
        },
      },
      include: {
        gradingScale: true,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.course.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ message: 'All courses deleted' })
  } catch (error) {
    console.error('Error deleting courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


