'use client'

import { useState, useEffect } from 'react'

export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se está em modo mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Sidebar sempre inicia fechada
      setSidebarOpen(false)
    }

    // Evita flash inicial
    handleResize()
    
    // Debounce para resize
    let timeoutId: NodeJS.Timeout
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 150)
    }
    
    window.addEventListener('resize', debouncedHandleResize)
    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return {
    sidebarOpen,
    setSidebarOpen,
    isMobile,
    toggleSidebar
  }
}