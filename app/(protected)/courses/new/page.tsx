'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewCoursePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [creditHours, setCreditHours] = useState('')
  const [weightingMode, setWeightingMode] = useState<'points' | 'percentage'>('percentage')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          number,
          creditHours: parseInt(creditHours),
          weightingMode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course')
      }

      toast.success('Course created successfully')
      router.push(`/courses/${data.id}/setup`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create course')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="content-wrapper-small">
      <div className="card-large">
        <h1 className="heading-section spacing-bottom-medium">New Course</h1>
        <form onSubmit={handleSubmit} className="form-container">
          <div>
            <label htmlFor="name" className="form-label-inline">
              Course Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-field"
            />
          </div>
          <div>
            <label htmlFor="number" className="form-label-inline">
              Course Number
            </label>
            <input
              id="number"
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
              className="form-field"
            />
          </div>
          <div>
            <label htmlFor="creditHours" className="form-label-inline">
              GPA Credit Hours
            </label>
            <input
              id="creditHours"
              type="number"
              min="1"
              value={creditHours}
              onChange={(e) => setCreditHours(e.target.value)}
              required
              className="form-field"
            />
          </div>
          <div>
            <label className="form-label-inline spacing-bottom-small">
              My assignments are weighted by:
            </label>
            <div className="flex-gap">
              <label className="checkbox-row">
                <input
                  type="radio"
                  name="weightingMode"
                  value="points"
                  checked={weightingMode === 'points'}
                  onChange={(e) => setWeightingMode(e.target.value as 'points' | 'percentage')}
                  className="checkbox-spacing"
                />
                <span className="text-body">Points</span>
              </label>
              <label className="checkbox-row">
                <input
                  type="radio"
                  name="weightingMode"
                  value="percentage"
                  checked={weightingMode === 'percentage'}
                  onChange={(e) => setWeightingMode(e.target.value as 'points' | 'percentage')}
                  className="checkbox-spacing"
                />
                <span className="text-body">Percentages</span>
              </label>
            </div>
          </div>
          <div className="button-group-end">
            <Link href="/courses" className="secondary-button">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button disabled-state"
            >
              {isLoading ? 'Creating...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


