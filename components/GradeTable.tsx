'use client'

import Link from 'next/link'

interface GradeTableProps {
  course: {
    id: string
    weightingMode: string
    categories: Array<{
      id: string
      label: string
      weightPercent: number | null
      multiple: boolean
      expectedCount: number | null
      items: Array<{
        id: string
        name: string
        percent: number | null
        isDropped: boolean
      }>
      average: number | null
    }>
  }
}

export default function GradeTable({ course }: GradeTableProps) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr className="table-header">
            <th className="table-header-cell">Name</th>
            <th className="table-header-cell">
              {course.weightingMode === 'points' ? 'Total Points' : 'Weight'}
            </th>
            <th className="table-header-cell">Grade</th>
          </tr>
        </thead>
        <tbody>
          {course.categories.map((category) => (
            <tr key={category.id} className="table-row">
              <td className="table-cell">
                <Link
                  href={`/courses/${course.id}/categories/${category.id}`}
                  className="button-link-primary"
                >
                  {category.label}
                </Link>
              </td>
              <td className="table-cell-gray">
                {category.weightPercent !== null && category.weightPercent !== undefined ? (
                  <>
                    {course.weightingMode === 'points' ? (
                      `${category.weightPercent} pts`
                    ) : (
                      `${category.weightPercent}% of grade`
                    )}
                    {category.multiple && category.expectedCount && (
                      <span className="text-secondary spacing-left">
                        ({category.items.length} / {category.expectedCount} grades)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-muted">Weight not set</span>
                )}
              </td>
              <td className="table-cell">
                {category.average !== null ? (
                  <div>
                    <span className="font-weight-medium">{category.average.toFixed(1)}%</span>
                    {category.items.some(item => item.isDropped) && (
                      <span className="text-size-xs text-muted spacing-left">(lowest dropped)</span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted">No grades</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {course.categories.length === 0 && (
        <div className="text-center-muted spacing-y">
          No categories yet. Add categories in the setup page.
        </div>
      )}
    </div>
  )
}


