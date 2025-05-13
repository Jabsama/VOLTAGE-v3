'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import Logo from './Logo'
import styles from './Header.module.css'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    
    if (token) {
      setIsLoggedIn(true)
      // Fetch user data
      fetch('/api/users/me')
        .then(res => res.json())
        .then(data => {
          if (data.username) {
            setUsername(data.username)
          }
        })
        .catch(err => {
          console.error('Error fetching user data:', err)
        })
    }
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  const handleLogout = () => {
    // Clear cookies and redirect to home
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/'
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Logo />
          <span className={styles.logoText}>VoltageGPU</span>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link 
                href="/" 
                className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
              >
                Home
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                href="/browse-pods" 
                className={`${styles.navLink} ${pathname === '/browse-pods' ? styles.navLinkActive : ''}`}
              >
                Browse Pods
              </Link>
            </li>
            {isLoggedIn && (
              <li className={styles.navItem}>
                <Link 
                  href="/dashboard" 
                  className={`${styles.navLink} ${pathname === '/dashboard' ? styles.navLinkActive : ''}`}
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

          {isLoggedIn ? (
            <div className={styles.userMenu}>
              <button 
                className={styles.userButton} 
                onClick={toggleUserMenu}
                aria-expanded={userMenuOpen}
                aria-label="User menu"
              >
                <div className={styles.userAvatar}>
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className={styles.userName}>{username}</span>
              </button>

              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <Link href="/dashboard" className={styles.userDropdownItem}>
                    <User size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/settings" className={styles.userDropdownItem}>
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  <div className={styles.userDropdownDivider}></div>
                  <button 
                    className={styles.userDropdownItem} 
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/auth/login">
                <button className={styles.loginButton}>Log in</button>
              </Link>
              <Link href="/auth/register">
                <button className={styles.signupButton}>Sign up</button>
              </Link>
            </div>
          )}

          <button 
            className={styles.mobileMenuButton} 
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={`${styles.mobileNav} ${styles.mobileNavOpen}`}>
          <div className={styles.mobileNavHeader}>
            <div className={styles.logoContainer}>
              <Logo />
              <span className={styles.logoText}>VoltageGPU</span>
            </div>
            <button 
              className={styles.mobileMenuButton} 
              onClick={toggleMobileMenu}
              aria-label="Close mobile menu"
            >
              <X size={24} />
            </button>
          </div>

          <ul className={styles.mobileNavList}>
            <li className={styles.mobileNavItem}>
              <Link 
                href="/" 
                className={`${styles.mobileNavLink} ${pathname === '/' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li className={styles.mobileNavItem}>
              <Link 
                href="/browse-pods" 
                className={`${styles.mobileNavLink} ${pathname === '/browse-pods' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Pods
              </Link>
            </li>
            {isLoggedIn && (
              <li className={styles.mobileNavItem}>
                <Link 
                  href="/dashboard" 
                  className={`${styles.mobileNavLink} ${pathname === '/dashboard' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

          {!isLoggedIn && (
            <div className={styles.mobileAuthButtons}>
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <button className={styles.loginButton}>Log in</button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <button className={styles.signupButton}>Sign up</button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
