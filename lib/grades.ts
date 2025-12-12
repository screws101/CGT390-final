import { GradeItem, GradeCategory, GradingScale } from '@prisma/client'

export interface CategoryAverageResult {
  average: number | null
  droppedItems: string[] // IDs of dropped items
}

/**
 * Calculate category average with drop lowest logic
 */
export function calculateCategoryAverage(
  items: GradeItem[],
  dropLowest: number | null
): CategoryAverageResult {
  // Filter out null/undefined grades
  const validItems = items.filter(item => item.percent !== null && item.percent !== undefined)
  
  if (validItems.length === 0) {
    return { average: null, droppedItems: [] }
  }

  // Sort by percent ascending
  const sorted = [...validItems].sort((a, b) => (a.percent || 0) - (b.percent || 0))
  
  // Determine how many to drop (not more than available)
  const dropCount = dropLowest !== null && dropLowest !== undefined ? dropLowest : 0
  const toDrop = Math.min(dropCount, sorted.length - 1) // Keep at least one
  
  // Mark dropped items
  const droppedItems = sorted.slice(0, toDrop).map(item => item.id)
  
  // Calculate average of remaining items
  const remaining = sorted.slice(toDrop)
  
  if (remaining.length === 0) {
    return { average: null, droppedItems }
  }
  
  const sum = remaining.reduce((acc, item) => acc + (item.percent || 0), 0)
  const average = sum / remaining.length
  
  return { average, droppedItems }
}

/**
 * Calculate course grade in percentage mode
 */
export function calculateCourseGradePercentage(
  categories: (GradeCategory & { items: GradeItem[] })[]
): number | null {
  let totalWeight = 0
  let weightedSum = 0
  
  for (const category of categories) {
    if (category.weightPercent === null || category.weightPercent === undefined) {
      continue
    }
    
    const { average } = calculateCategoryAverage(category.items, category.dropLowest)
    
    if (average !== null) {
      const contribution = (average / 100) * (category.weightPercent / 100)
      weightedSum += contribution
      totalWeight += category.weightPercent
    }
  }
  
  if (totalWeight === 0) {
    return null
  }
  
  // Normalize if weights don't sum to 100
  const normalizedWeight = totalWeight / 100
  const finalPercent = (weightedSum / normalizedWeight) * 100
  
  return finalPercent
}

/**
 * Calculate course grade in points mode
 */
export function calculateCourseGradePoints(
  categories: (GradeCategory & { items: GradeItem[] })[]
): number | null {
  let totalPoints = 0
  let earnedPoints = 0
  
  for (const category of categories) {
    const categoryTotalPoints = category.weightPercent // In points mode, weightPercent is total points
    
    if (categoryTotalPoints === null || categoryTotalPoints === undefined || categoryTotalPoints <= 0) {
      continue
    }
    
    const { average } = calculateCategoryAverage(category.items, category.dropLowest)
    
    if (average !== null) {
      // Convert percentage to points earned
      const pointsEarned = (average / 100) * categoryTotalPoints
      earnedPoints += pointsEarned
    }
    
    totalPoints += categoryTotalPoints
  }
  
  if (totalPoints === 0) {
    return null
  }
  
  return (earnedPoints / totalPoints) * 100
}

/**
 * Get letter grade from percentage using grading scale
 */
export function getLetterGrade(
  percentage: number | null,
  gradingScale: GradingScale[]
): string | null {
  if (percentage === null) {
    return null
  }
  
  // Sort by threshold descending to find highest matching grade
  const sorted = [...gradingScale].sort((a, b) => b.threshold - a.threshold)
  
  for (const scale of sorted) {
    if (percentage >= scale.threshold) {
      return scale.grade
    }
  }
  
  return 'F'
}

/**
 * Convert letter grade to GPA numeric value
 */
export function letterGradeToGPA(letterGrade: string | null): number {
  if (!letterGrade) return 0
  
  const gradeMap: Record<string, number> = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'D-': 0.7,
    'F': 0.0,
  }
  
  return gradeMap[letterGrade] || 0
}

/**
 * Calculate overall GPA across all courses
 */
export function calculateGPA(
  courses: Array<{
    creditHours: number
    finalPercentage: number | null
    gradingScale: GradingScale[]
  }>
): number {
  let totalPoints = 0
  let totalCredits = 0
  
  for (const course of courses) {
    if (course.finalPercentage === null) continue
    
    const letterGrade = getLetterGrade(course.finalPercentage, course.gradingScale)
    const gpaPoints = letterGradeToGPA(letterGrade)
    
    totalPoints += gpaPoints * course.creditHours
    totalCredits += course.creditHours
  }
  
  if (totalCredits === 0) {
    return 0
  }
  
  return totalPoints / totalCredits
}

/**
 * Default grading scale thresholds
 */
export const DEFAULT_GRADING_SCALE = [
  { grade: 'A+', threshold: 97 },
  { grade: 'A', threshold: 93 },
  { grade: 'A-', threshold: 90 },
  { grade: 'B+', threshold: 87 },
  { grade: 'B', threshold: 83 },
  { grade: 'B-', threshold: 80 },
  { grade: 'C+', threshold: 77 },
  { grade: 'C', threshold: 73 },
  { grade: 'C-', threshold: 70 },
  { grade: 'D+', threshold: 67 },
  { grade: 'D', threshold: 63 },
  { grade: 'D-', threshold: 60 },
  { grade: 'F', threshold: 0 },
]


