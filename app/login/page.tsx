'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
      } else {
        toast.success('Logged in successfully')
        router.push('/courses')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: '/courses' })
  }

  return (
    <div className="page-container">
      <div className="auth-split-top">
        <div className="auth-card">
          <h1 className="heading-section">Login</h1>
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
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="spacing-top form-spacing">
            <div className="divider">
              <div className="divider-line">
                <div className="divider-border"></div>
              </div>
              <div className="divider-text">
                <span className="divider-text-inner">Or continue with</span>
              </div>
            </div>
            <button
              onClick={() => handleOAuth('google')}
              disabled={isLoading}
              className="secondary-button-full disabled-state"
            >
              Login with Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              disabled={isLoading}
              className="secondary-button-full disabled-state"
            >
              Login with GitHub
            </button>
          </div>
          <p className="spacing-top text-centered-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="button-link">
              Sign up
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


