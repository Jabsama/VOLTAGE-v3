'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import CtaSection from './components/CtaSection'
import styles from './page.module.css'

export default function Home() {
  const router = useRouter()

  // Check if user is logged in and redirect to dashboard if they are
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="layout-with-header">
      <Header />
      <main>
        <Hero />
        <Features />
        <CtaSection />
      </main>
    </div>
  )
}
