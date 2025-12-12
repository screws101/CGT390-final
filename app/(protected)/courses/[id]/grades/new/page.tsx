'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewGradePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [categories, setCategories] = useState<Array<{ id: string; label: string; multiple: boolean }>>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [name, setName] = useState('')
  const [percent, setPercent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(data => {
        if (data.categories) {
          setCategories(data.categories.map((c: any) => ({
            id: c.id,
            label: c.label,
            multiple: c.multiple,
          })))
        }
      })
      .catch(() => {
        fetch('/api/courses')
          .then(res => res.json())
          .then(courses => {
            const course = courses.find((c: any) => c.id === courseId)
            if (course?.categories) {
              setCategories(course.categories.map((c: any) => ({
                id: c.id,
                label: c.label,
                multiple: c.multiple,
              })))
            }
          })
          .catch(() => {
            toast.error('Failed to load categories')
          })
      })
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!selectedCategoryId) {
        toast.error('Please select a category')
        return
      }

      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          name,
          percent: percent ? parseFloat(percent) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create grade')
      }

      toast.success('Grade added successfully')
      router.push(`/courses/${courseId}`)
    } catch (error) {
      toast.error('Failed to add grade')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="content-wrapper-small">
      <div className="card-large">
        <div className="section-header">
          <Link href={`/courses/${courseId}`} className="button-link-primary back-link">
            ← Back to Course
          </Link>
          <h1 className="heading-section section-title">New Grade</h1>
        </div>
        <form onSubmit={handleSubmit} className="form-container">
          <div>
            <label htmlFor="category" className="form-label-inline">
              Category
            </label>
            <select
              id="category"
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value)
                const category = categories.find(c => c.id === e.target.value)
                if (category && !name) {
                  setName(category.label)
                }
              }}
              required
              className="form-field"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name" className="form-label-inline">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Exam 1, Homework 1"
              className="form-field"
            />
          </div>
          <div>
            <label htmlFor="percent" className="form-label-inline">
              Grade (Percentage)
            </label>
            <input
              id="percent"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              placeholder="e.g., 95 for 95%"
              className="form-field"
            />
          </div>
          <div className="button-group-end">
            <Link href={`/courses/${courseId}`} className="secondary-button">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button disabled-state"
            >
              {isLoading ? 'Adding...' : 'Add Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

