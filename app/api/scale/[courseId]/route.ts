import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { scale } = body

    if (!Array.isArray(scale)) {
      return NextResponse.json(
        { error: 'Scale must be an array' },
        { status: 400 }
      )
    }

    await prisma.gradingScale.deleteMany({
      where: { courseId: params.courseId },
    })

    const newScale = await prisma.gradingScale.createMany({
      data: scale.map((s: { grade: string; threshold: number }) => ({
        courseId: params.courseId,
        grade: s.grade,
        threshold: parseFloat(s.threshold.toString()),
      })),
    })

    return NextResponse.json({ message: 'Grading scale updated', count: newScale.count })
  } catch (error) {
    console.error('Error updating grading scale:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


