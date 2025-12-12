'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          <Link href="/courses" className="navbar-brand">
            ClassMate
          </Link>
          {session && (
            <div className="navbar-user">
              <span className="text-body">{session.user?.email}</span>
              <button onClick={() => signOut()} className="primary-button">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}


