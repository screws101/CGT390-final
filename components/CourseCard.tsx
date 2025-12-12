'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ConfirmModal from './ConfirmModal'

interface CourseCardProps {
  course: {
    id: string
    name: string
    number: string
    finalPercentage?: number | null
    letterGrade?: string | null
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete course')
      }

      toast.success('Course deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete course')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="card position-relative">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="delete-button"
          disabled={isDeleting}
        >
          <svg className="icon-button" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="card-title">{course.name}</h3>
        <p className="card-subtitle">{course.number}</p>
        <div className="card-content">
          <div className="card-grade-large">
            {course.finalPercentage !== null && course.finalPercentage !== undefined
              ? `${course.finalPercentage.toFixed(1)}%`
              : 'N/A'}
          </div>
          {course.letterGrade && (
            <div className="card-grade-small">{course.letterGrade}</div>
          )}
        </div>
        <Link href={`/courses/${course.id}`} className="primary-button display-inline-block">
          Go to Class
        </Link>
      </div>
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This cannot be undone."
        confirmText="Delete"
      />
    </>
  )
}


