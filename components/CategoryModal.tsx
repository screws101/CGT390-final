'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  label: string
  weightPercent: number | null
  multiple: boolean
  expectedCount: number | null
  dropLowest: number | null
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
  const [formData, setFormData] = useState<{
    label: string
    weightPercent: string
    multiple: boolean
    expectedCount: number | null
    dropLowest: string
  }>({
    label: category?.label || label || '',
    weightPercent: category?.weightPercent !== null && category?.weightPercent !== undefined ? String(category.weightPercent) : '',
    multiple: category?.multiple || false,
    expectedCount: category?.expectedCount || null,
    dropLowest: category?.dropLowest !== null && category?.dropLowest !== undefined ? String(category.dropLowest) : '',
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

      const finalWeight = formData.weightPercent === '' ? null : Number(formData.weightPercent)
      const finalDropLowest = formData.dropLowest === '' ? null : Number(formData.dropLowest)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(category ? {} : { courseId }),
          label: formData.label,
          weightPercent: finalWeight,
          multiple: formData.multiple,
          expectedCount: formData.multiple && formData.expectedCount
            ? parseInt(formData.expectedCount.toString())
            : null,
          dropLowest: finalDropLowest,
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
              type="text"
              inputMode="decimal"
              value={formData.weightPercent}
              placeholder="Optional"
              onChange={(e) => {
                const val = e.target.value
                setFormData({ ...formData, weightPercent: val })
              }}
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
                  type="text"
                  inputMode="numeric"
                  value={formData.dropLowest}
                  placeholder="Optional"
                  onChange={(e) => {
                    const val = e.target.value
                    setFormData({ ...formData, dropLowest: val })
                  }}
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


