import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  calculateCourseGradePercentage,
  calculateCourseGradePoints,
  getLetterGrade,
  calculateCategoryAverage,
} from '@/lib/grades'
import GradeTable from '@/components/GradeTable'

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
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
    redirect('/courses')
  }

  if (course.userId !== session.user.id) {
    redirect('/courses')
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

  const courseWithGrades = {
    ...course,
    categories: categoriesWithAverages,
    finalPercentage,
    letterGrade,
  }

  return (
    <div className="content-wrapper">
      <div className="section-header">
        <Link href="/courses" className="button-link-primary back-link">
          ← Back to Courses
        </Link>
        <h1 className="heading-page section-title">{course.name}</h1>
        <p className="course-info section-subtitle">{course.number}</p>
      </div>

      <div className="card-large spacing-bottom-medium">
        <div className="text-center-spacing spacing-bottom-medium">
          <div className="grade-display-large">
            {courseWithGrades.finalPercentage !== null && courseWithGrades.finalPercentage !== undefined
              ? `${courseWithGrades.finalPercentage.toFixed(1)}%`
              : 'N/A'}
          </div>
          {courseWithGrades.letterGrade && (
            <div className="grade-display-medium">{courseWithGrades.letterGrade}</div>
          )}
        </div>

        <div className="section-spacing">
          <h2 className="grade-section-title">Grades</h2>
          <GradeTable course={courseWithGrades} />
        </div>

        <div className="button-group-end-mt">
          <Link href={`/courses/${params.id}/grades/new`} className="primary-button">
            + Add a Grade
          </Link>
          <Link href={`/courses/${params.id}/scale`} className="secondary-button">
            Grading Scale
          </Link>
        </div>
      </div>
    </div>
  )
}

