import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="page-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="heading-hero md:text-7xl">
            Keep on top of your grades
          </h1>
          <p className="text-hero md:text-3xl">
            Committed to all students in need
          </p>
          <div className="button-group">
            <Link href="/login" className="primary-button">
              Login
            </Link>
            <Link href="/signup" className="primary-button">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <div className="library-image-section md:h-96">
        <div className="image-wrapper">
          <img src="/library_image.png" alt="Library" className="image-cover" />
        </div>
      </div>
    </div>
  )
}


