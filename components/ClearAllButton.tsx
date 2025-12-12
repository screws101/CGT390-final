'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ConfirmModal from './ConfirmModal'

export default function ClearAllButton() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleClearAll = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/courses', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to clear courses')
      }

      toast.success('All courses cleared')
      router.refresh()
    } catch (error) {
      toast.error('Failed to clear courses')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="danger-button"
      >
        Clear All Courses
      </button>
      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleClearAll}
        title="Clear All Courses"
        message="Are you sure you want to remove all courses? This cannot be undone."
        confirmText="Clear All"
      />
    </>
  )
}


