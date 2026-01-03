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
      
      // Em mobile, sidebar sempre inicia fechada
      if (mobile) {
        setSidebarOpen(false)
      } 
      // Em desktop, recupera o estado do localStorage
      else {
        const savedState = localStorage.getItem('sidebar-open')
        if (savedState !== null) {
          setSidebarOpen(savedState === 'true')
        } else {
          setSidebarOpen(true) // Default para aberto em desktop
        }
      }
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