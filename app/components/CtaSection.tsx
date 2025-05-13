'use client'

import { useEffect, useState, useRef } from 'react'
import Button from './Button'

export default function CtaSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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
      className="bg-gradient-to-br from-secondary-dark to-secondary py-24 px-6 text-center relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/5"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white/5"></div>
      </div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 
          className={`text-3xl md:text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Ready to supercharge your computing?
        </h2>
        
        <p 
          className={`text-lg md:text-xl text-text-secondary leading-relaxed mb-10 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Join thousands of developers, researchers, and businesses who trust VoltageGPU for their high-performance computing needs.
        </p>
        
        <div 
          className={`transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Button 
            href="/browse-pods" 
            variant="primary"
            size="lg"
            ariaLabel="Browse available GPUs"
          >
            Browse Available GPUs
          </Button>
        </div>
      </div>
    </section>
  )
}
