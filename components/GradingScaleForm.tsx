'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface GradingScaleItem {
  id?: string
  grade: string
  threshold: number
}

interface GradingScaleFormProps {
  courseId: string
  gradingScale: GradingScaleItem[]
}

const DEFAULT_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']
const DEFAULT_THRESHOLDS = [97, 93, 90, 87, 83, 80, 77, 73, 70, 67, 63, 60, 0]

export default function GradingScaleForm({ courseId, gradingScale }: GradingScaleFormProps) {
  const router = useRouter()
  const [scale, setScale] = useState<Array<{ grade: string; threshold: number }>>(
    gradingScale.length > 0
      ? gradingScale.map(s => ({ grade: s.grade, threshold: s.threshold }))
      : DEFAULT_GRADES.map((grade, i) => ({ grade, threshold: DEFAULT_THRESHOLDS[i] }))
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleThresholdChange = (index: number, value: string) => {
    const newScale = [...scale]
    newScale[index].threshold = parseFloat(value) || 0
    setScale(newScale)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/scale/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scale }),
      })

      if (!response.ok) {
        throw new Error('Failed to update grading scale')
      }

      toast.success('Grading scale updated')
      router.push(`/courses/${courseId}`)
    } catch (error) {
      toast.error('Failed to update grading scale')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card-large">
      <form onSubmit={handleSubmit}>
        <div className="grid-scale md:grid-cols-3">
          {scale.map((item, index) => (
            <div key={index} className="form-spacing-small">
              <label className="form-label-inline">{item.grade}</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={item.threshold}
                onChange={(e) => handleThresholdChange(index, e.target.value)}
                required
                className="form-field"
              />
            </div>
          ))}
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
            {isLoading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}


