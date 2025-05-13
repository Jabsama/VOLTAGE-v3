'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Grid, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import Logo from './Logo'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Check if user is logged in and fetch user data
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    
    if (token) {
      fetch('/api/users/me')
        .then(res => res.json())
        .then(data => {
          if (data.username) {
            setUsername(data.username)
          }
          if (data.email) {
            setEmail(data.email)
          }
        })
        .catch(err => {
          console.error('Error fetching user data:', err)
        })
    }
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    // Clear cookies and redirect to home
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/'
  }

  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Logo />
            <span className={styles.logoText}>VoltageGPU</span>
          </div>
          <button 
            className={styles.closeButton} 
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link 
                href="/browse-pods" 
                className={`${styles.navLink} ${pathname === '/browse-pods' ? styles.navLinkActive : ''}`}
              >
                <Grid size={18} className={styles.navIcon} />
                <span>Browse Pods</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                href="/dashboard" 
                className={`${styles.navLink} ${pathname === '/dashboard' ? styles.navLinkActive : ''}`}
              >
                <LayoutDashboard size={18} className={styles.navIcon} />
                <span>Dashboard</span>
              </Link>
            </li>
          </ul>
        </nav>

        {username ? (
          <div className={styles.footer}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{username}</span>
                <span className={styles.userEmail}>{email}</span>
              </div>
            </div>
            <button 
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : null}
      </aside>

      {/* Mobile menu button */}
      <button 
        className={styles.mobileMenuButton}
        onClick={toggleSidebar}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>
    </>
  )
}
