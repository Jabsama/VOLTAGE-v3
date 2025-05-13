'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, Activity, Server, Clock, Cpu, ArrowUpRight, Plus } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    
    if (!token) {
      router.push('/auth/login')
      return
    }

    setIsLoggedIn(true)
    
    // Fetch user data
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        setUserData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching user data:', err)
        setLoading(false)
      })
  }, [router])

  if (!isLoggedIn) {
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="layout-with-sidebar">
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.container}>
            <h1 className={styles.title}>Dashboard</h1>
            <div className={styles.loading}>Loading your dashboard...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="layout-with-sidebar">
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Dashboard</h1>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>
                <Wallet className={styles.statIcon} size={20} />
                Current Balance
              </h3>
              <p className={styles.statValue}>
                ${userData?.balance?.toFixed(2) || '0.00'}
              </p>
              <button 
                className={styles.topUpButton}
                onClick={() => router.push('/top-up')}
              >
                <Plus size={16} />
                Top Up
              </button>
            </div>
            
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>
                <Server className={styles.statIcon} size={20} />
                Active Pods
              </h3>
              <p className={styles.statValue}>{userData?.activePods || 0}</p>
            </div>
            
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>
                <Activity className={styles.statIcon} size={20} />
                Total Spent
              </h3>
              <p className={styles.statValue}>
                ${userData?.totalSpent?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionTitleText}>
                <Activity className={styles.sectionIcon} size={20} />
                Recent Activity
              </div>
              <a href="#" className={styles.viewAllLink}>View all</a>
            </div>
            {userData?.recentActivity?.length > 0 ? (
              <div className={styles.activityList}>
                {userData.recentActivity.map((activity: any) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityContent}>
                      <p className={styles.activityTitle}>{activity.title}</p>
                      <p className={styles.activityDate}>
                        <Clock size={14} />
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`${styles.activityAmount} ${activity.amount < 0 ? styles.negative : styles.positive}`}>
                      ${Math.abs(activity.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Activity size={48} className={styles.emptyStateIcon} />
                <p className={styles.emptyStateText}>No recent activity</p>
              </div>
            )}
          </div>
          
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionTitleText}>
                <Server className={styles.sectionIcon} size={20} />
                Active Pods
              </div>
              <a href="#" className={styles.viewAllLink}>View all</a>
            </div>
            {userData?.pods?.length > 0 ? (
              <div className={styles.podsGrid}>
                {userData.pods.map((pod: any) => (
                  <div key={pod.id} className={styles.podCard}>
                    <div className={styles.podHeader}>
                      <h3 className={styles.podTitle}>{pod.name}</h3>
                      <span className={styles.podStatus}>Active</span>
                    </div>
                    <p className={styles.podType}>
                      <Cpu className={styles.podTypeIcon} size={16} />
                      {pod.type}
                    </p>
                    <div className={styles.podDetails}>
                      <div className={styles.podDetail}>
                        <span className={styles.podDetailLabel}>
                          <Clock className={styles.podDetailIcon} size={14} />
                          Uptime
                        </span>
                        <span className={styles.podDetailValue}>{pod.uptime}</span>
                      </div>
                      <div className={styles.podDetail}>
                        <span className={styles.podDetailLabel}>
                          <Wallet className={styles.podDetailIcon} size={14} />
                          Cost
                        </span>
                        <span className={styles.podDetailValue}>
                          ${pod.hourlyRate}/hour
                        </span>
                      </div>
                    </div>
                    <button 
                      className={styles.podButton}
                      onClick={() => {
                        // Handle pod management
                      }}
                    >
                      Manage
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Server size={48} className={styles.emptyStateIcon} />
                <p className={styles.emptyStateText}>You don't have any active pods</p>
                <button 
                  className={styles.browseButton}
                  onClick={() => router.push('/browse-pods')}
                >
                  Browse Pods
                  <ArrowUpRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
