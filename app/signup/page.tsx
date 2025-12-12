'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }

      toast.success('Account created successfully! Please login.')
      router.push('/login')
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="auth-split-top">
        <div className="auth-card">
          <h1 className="heading-section">Sign Up</h1>
          <form onSubmit={handleSubmit} className="form-container">
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-field"
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-field"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button-full"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="spacing-top text-centered-secondary">
            Already have an account?{' '}
            <Link href="/login" className="button-link">
              Login
            </Link>
          </p>
        </div>
      </div>
      <div
        className="library-image-full"
        style={{ backgroundImage: 'url("/library_image.png")' }}
      ></div>
    </div>
  )
}


