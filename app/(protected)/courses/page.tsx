import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateGPA, getLetterGrade, calculateCourseGradePercentage, calculateCourseGradePoints } from '@/lib/grades'
import CourseCard from '@/components/CourseCard'
import GpaCard from '@/components/GpaCard'
import AddCourseCard from '@/components/AddCourseCard'
import ClearAllButton from '@/components/ClearAllButton'

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
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

  const coursesWithGrades = courses.map(course => {
    const finalPercentage =
      course.weightingMode === 'points'
        ? calculateCourseGradePoints(course.categories)
        : calculateCourseGradePercentage(course.categories)
    
    const letterGrade = getLetterGrade(finalPercentage, course.gradingScale)

    return {
      ...course,
      finalPercentage,
      letterGrade,
    }
  })

  const gpa = calculateGPA(
    coursesWithGrades.map(course => ({
      creditHours: course.creditHours,
      finalPercentage: course.finalPercentage,
      gradingScale: course.gradingScale,
    }))
  )

  return (
    <div className="page-wrapper">
      <div className="flex-between">
        <h1 className="heading-page">Courses</h1>
        <ClearAllButton />
      </div>
      <div className="grid-courses">
        <GpaCard gpa={gpa} />
        <AddCourseCard />
        {coursesWithGrades.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}


