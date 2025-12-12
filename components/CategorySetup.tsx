'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import CategoryModal from './CategoryModal'

interface Category {
  id: string
  label: string
  weightPercent: number
  multiple: boolean
  expectedCount: number | null
  dropLowest: number
  items: Array<{ id: string }>
}

interface CategorySetupProps {
  courseId: string
  categories: Category[]
}

const CATEGORY_LABELS = ['Homework', 'Exams', 'Labs', 'Final', 'Quiz', 'Other']

export default function CategorySetup({ courseId, categories }: CategorySetupProps) {
  const router = useRouter()
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleCategoryClick = (label: string) => {
    const existing = categories.find(c => c.label === label)
    if (existing) {
      setEditingCategory(existing)
    } else {
      setSelectedLabel(label)
    }
  }

  const handleCategorySaved = () => {
    setSelectedLabel(null)
    setEditingCategory(null)
    router.refresh()
  }

  return (
    <div className="grid-cols-2 md:grid-cols-2">
      <div className="card">
        <h2 className="heading-card spacing-bottom-medium">Add</h2>
        <div className="form-spacing">
          {CATEGORY_LABELS.map((label) => (
            <button
              key={label}
              onClick={() => handleCategoryClick(label)}
              className="primary-button full-width"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="heading-card spacing-bottom-medium">Grades</h2>
        <div className="form-spacing">
          {categories.map((category) => (
            <div key={category.id} className="category-item">
              <div className="category-item-inner">
                <div>
                  <h3 className="category-item-title">{category.label}</h3>
                  <p className="category-item-text">
                    {category.weightPercent}% of grade
                    {category.multiple && category.expectedCount && (
                      <span> • {category.items.length} / {category.expectedCount} grades</span>
                    )}
                    {category.dropLowest > 0 && (
                      <span> • Drop lowest {category.dropLowest}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setEditingCategory(category)}
                  className="edit-link"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-center-muted spacing-y">
              No categories added yet
            </p>
          )}
        </div>
      </div>
      <div className="nav-links md:col-span-2">
        <Link href="/courses" className="secondary-button">
          Back
        </Link>
        <Link href={`/courses/${courseId}`} className="primary-button">
          Next
        </Link>
      </div>
      {selectedLabel && (
        <CategoryModal
          courseId={courseId}
          label={selectedLabel}
          onClose={() => setSelectedLabel(null)}
          onSave={handleCategorySaved}
        />
      )}
      {editingCategory && (
        <CategoryModal
          courseId={courseId}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={handleCategorySaved}
        />
      )}
    </div>
  )
}


