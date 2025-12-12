'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  label: string
  weightPercent: number
  multiple: boolean
  expectedCount: number | null
  dropLowest: number
}

interface CategoryModalProps {
  courseId: string
  label?: string
  category?: Category
  onClose: () => void
  onSave: () => void
}

export default function CategoryModal({
  courseId,
  label,
  category,
  onClose,
  onSave,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    label: category?.label || label || '',
    weightPercent: category?.weightPercent || 0,
    multiple: category?.multiple || false,
    expectedCount: category?.expectedCount || null,
    dropLowest: category?.dropLowest || 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = category
        ? `/api/categories/${category.id}`
        : '/api/categories'
      const method = category ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(category ? {} : { courseId }),
          ...formData,
          expectedCount: formData.multiple && formData.expectedCount
            ? parseInt(formData.expectedCount.toString())
            : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save category')
      }

      toast.success(category ? 'Category updated' : 'Category created')
      onSave()
    } catch (error) {
      toast.error('Failed to save category')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content-scroll">
        <h2 className="heading-card spacing-bottom-medium">
          {category ? 'Edit Category' : 'Add Category'}
        </h2>
        <form onSubmit={handleSubmit} className="form-container">
          <div>
            <label className="form-label-inline">Label</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              className="form-field"
            />
          </div>
          <div>
            <label className="form-label-inline">
              Weight ({category ? 'Percent' : 'Percent of course'})
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.weightPercent}
              onChange={(e) => setFormData({ ...formData, weightPercent: parseFloat(e.target.value) || 0 })}
              required
              className="form-field"
            />
          </div>
          <div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.multiple}
                onChange={(e) => setFormData({ ...formData, multiple: e.target.checked })}
                className="checkbox-spacing"
              />
              <span className="text-body">Multiple grades</span>
            </label>
          </div>
          {formData.multiple && (
            <>
              <div>
                <label className="form-label-inline">
                  Number of grades
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.expectedCount || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    expectedCount: e.target.value ? parseInt(e.target.value) : null,
                  })}
                  className="form-field"
                />
              </div>
              <div>
                <label className="form-label-inline">
                  Drop lowest grades
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dropLowest}
                  onChange={(e) => setFormData({
                    ...formData,
                    dropLowest: parseInt(e.target.value) || 0,
                  })}
                  className="form-field"
                />
              </div>
            </>
          )}
          <div className="button-group-end">
            <button type="button" onClick={onClose} className="secondary-button">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button disabled-state"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


