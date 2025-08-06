import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedLogo from '../components/auth/AnimatedLogo'
import BackgroundAnimation from '../components/auth/BackgroundAnimation'
import AuthForm from '../components/auth/AuthForm'
import { useAuth } from '../contexts/AuthContext' // Import useAuth

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const navigate = useNavigate()
  const { user } = useAuth() // Get user from auth context
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleAuthMode = () => {
    setAuthMode(prev => {
      const next = prev === 'login' ? 'signup' : 'login';
      if (next === 'signup') {
        localStorage.setItem("selectedAvatar", "/characters/Intern1.png");
      }
      return next;
    });
  }

  // Mobile layout with scroll
  if (isMobile) {
    return (
      <div 
        className="h-screen relative bg-gradient-to-b from-slate-950 to-slate-900"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden'
        }}
      >
        <BackgroundAnimation />
        
        <div
          className={`relative z-10 h-full overflow-y-scroll ${
            window.innerWidth > window.innerHeight
              ? (authMode === 'signup' ? 'px-16' : 'p-1')
              : 'p-4'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            scrollBehavior: 'smooth',
            // Force hardware acceleration
            transform: 'translateZ(0)',
            willChange: 'scroll-position',
            // Mobile-specific fixes
            touchAction: 'pan-y',
            overflowScrolling: 'touch',
            // Ensure minimum height for scrolling
            minHeight: '100vh',
            height: '100%'
          }}
        >
          <div 
            className="w-full max-w-4xl mx-auto py-8"
            style={{
              minHeight: 'calc(100vh + 1px)', // Force content to be slightly taller than viewport
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div className="flex-shrink-0 mb-4">
              <AnimatedLogo />
            </div>
            <div className="flex-shrink-0 mb-4">
              <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />
            </div>
            {/* Footer */}
            <div className="text-center mt-8 flex-shrink-0">
              <p className="text-sm text-gray-500">
                <span className="block md:inline-block text-xs sm:text-sm">
                  © 2025 Rareminds. All rights reserved.
                </span>
              </p>
            </div>
            {/* Invisible spacer to ensure scrollability */}
            <div style={{ height: '1px', flexShrink: 0 }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop layout (original)
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
      <BackgroundAnimation />
      
      <div
        className={`relative z-10 min-h-screen flex items-center justify-center ${
          window.innerWidth > window.innerHeight
            ? (authMode === 'signup' ? 'px-16' : 'p-1')
            : 'p-4'
        }`}
      >
        <div className="w-full max-w-4xl">
          <AnimatedLogo />
          <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />
          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              <span className="block md:inline-block text-xs sm:text-sm">
                © 2025 Rareminds. All rights reserved.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage