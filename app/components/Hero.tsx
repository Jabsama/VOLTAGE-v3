'use client'

import { useEffect, useState } from 'react'
import Button from './Button'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true)
  }, [])

  return (
    <section className="h-screen flex items-center justify-center bg-hero-pattern overflow-hidden relative hero-overlay pt-header">
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-hero-shine opacity-30"></div>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 z-[1]"></div>
      
      {/* Animated particles or light effect could be added here */}
      
      <div className="max-w-3xl text-center px-6 z-10 relative">
        <h1 
          className={`text-5xl md:text-7xl font-extrabold leading-tight mb-8 transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          GPU compute <br className="hidden md:block" />
          <span className="text-primary">made easy</span>
        </h1>
        
        <p 
          className={`text-lg md:text-2xl max-w-2xl mb-10 mx-auto text-white leading-relaxed transition-all duration-1000 delay-300 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          Access enterprise-grade GPUs in seconds with VoltageGPU.
        </p>
        
        <div 
          className={`transition-all duration-1000 delay-500 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <Button 
            href="/browse-pods"
            variant="primary"
            size="lg"
            ariaLabel="Browse available GPUs"
            className="px-8 py-4 rounded-full text-lg"
          >
            Browse Available GPUs
          </Button>
        </div>
      </div>
    </section>
  )
}
