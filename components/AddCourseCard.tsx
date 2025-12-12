import Link from 'next/link'

export default function AddCourseCard() {
  return (
    <Link
      href="/courses/new"
      className="add-course-card"
    >
      <div className="card-icon">+</div>
      <h3 className="card-title-small">Add a New Class</h3>
      <p className="card-subtitle-small">Start the year off right</p>
    </Link>
  )
}


