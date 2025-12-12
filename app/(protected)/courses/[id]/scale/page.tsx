import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import GradingScaleForm from '@/components/GradingScaleForm'

export default async function GradingScalePage({
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
      gradingScale: {
        orderBy: { threshold: 'desc' },
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
    <div className="content-wrapper-medium">
      <div className="section-header">
        <Link href={`/courses/${params.id}`} className="button-link-primary back-link">
          ← Back to Course
        </Link>
        <h1 className="heading-section section-title">Grading Scale</h1>
      </div>

      <GradingScaleForm courseId={params.id} gradingScale={course.gradingScale} />
    </div>
  )
}


