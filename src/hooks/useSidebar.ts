'use client'

import { useState, useEffect } from 'react'

export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se está em modo mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Em mobile, sidebar inicia fechada
      if (mobile && sidebarOpen) {
        setSidebarOpen(false)
      }
      // Em desktop, recupera o estado do localStorage
      else if (!mobile) {
        const savedState = localStorage.getItem('sidebar-open')
        if (savedState !== null) {
          setSidebarOpen(savedState === 'true')
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Salvar estado no localStorage (apenas para desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-open', sidebarOpen.toString())
    }
  }, [sidebarOpen, isMobile])

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