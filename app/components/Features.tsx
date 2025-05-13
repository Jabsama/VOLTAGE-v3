'use client'

import { FiZap, FiDollarSign, FiLock, FiGlobe } from 'react-icons/fi'
import { useEffect, useState, useRef } from 'react'

// Feature card component with animation
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  delay: number 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div 
      ref={cardRef}
      className={`bg-bg-card p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-500 transform hover:scale-105 cursor-pointer ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      tabIndex={0}
      role="article"
      aria-label={`Feature: ${title}`}
    >
      <div className="w-16 h-16 rounded-full bg-bg-light flex items-center justify-center mx-auto mb-6 transform transition-transform duration-500 hover:rotate-12">
        <Icon className="w-12 h-12 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-semibold text-center mb-3">{title}</h3>
      <p className="text-text-secondary text-center leading-relaxed text-base">
        {description}
      </p>
    </div>
  )
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)
  const [sectionVisible, setSectionVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section 
      ref={sectionRef} 
      className={`py-24 bg-bg-dark ${sectionVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-4xl text-center font-bold mb-4 readable-width">Why Choose VoltageGPU</h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto mb-16 leading-relaxed">
          Our platform offers unparalleled performance, security, and flexibility for all your GPU computing needs.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 scrollable-container">
          <FeatureCard 
            icon={FiZap} 
            title="Instant Access" 
            description="Get your GPU up and running in seconds, not hours or days."
            delay={100}
          />
          <FeatureCard 
            icon={FiDollarSign} 
            title="Cost Effective" 
            description="Pay only for what you use with our flexible pricing model."
            delay={200}
          />
          <FeatureCard 
            icon={FiLock} 
            title="Secure & Private" 
            description="Enterprise-grade security with dedicated resources."
            delay={300}
          />
          <FeatureCard 
            icon={FiGlobe} 
            title="Global Network" 
            description="Access GPUs from data centers around the world."
            delay={400}
          />
        </div>
      </div>
    </section>
  )
}
