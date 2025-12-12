import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateCourseGradePercentage,
  calculateCourseGradePoints,
  getLetterGrade,
  calculateCategoryAverage,
} from '@/lib/grades'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
        gradingScale: true,
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const categoriesWithAverages = course.categories.map(category => {
      const { average, droppedItems } = calculateCategoryAverage(
        category.items,
        category.dropLowest
      )

      const itemsWithDropped = category.items.map(item => ({
        ...item,
        isDropped: droppedItems.includes(item.id),
      }))

      return {
        ...category,
        items: itemsWithDropped,
        average,
      }
    })

    const finalPercentage =
      course.weightingMode === 'points'
        ? calculateCourseGradePoints(categoriesWithAverages)
        : calculateCourseGradePercentage(categoriesWithAverages)

    const letterGrade = getLetterGrade(finalPercentage, course.gradingScale)

    return NextResponse.json({
      ...course,
      categories: categoriesWithAverages,
      finalPercentage,
      letterGrade,
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


