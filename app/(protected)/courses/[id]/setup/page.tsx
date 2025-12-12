import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CategorySetup from '@/components/CategorySetup'

export default async function CourseSetupPage({
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
    },
  })

  if (!course) {
    redirect('/courses')
  }

  if (course.userId !== session.user.id) {
    redirect('/courses')
  }

  return (
    <div className="content-wrapper">
      <div className="section-header">
        <Link href="/courses" className="button-link-primary back-link">
          ← Back to Courses
        </Link>
        <h1 className="heading-section section-title">Set Up Class</h1>
      </div>

      <CategorySetup courseId={params.id} categories={course.categories} />
    </div>
  )
}


