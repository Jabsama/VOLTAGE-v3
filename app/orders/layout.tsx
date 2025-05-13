'use client'

import { ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import styles from './orders.module.css'

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="layout-with-sidebar">
      <Sidebar />
      {children}
    </div>
  )
}
