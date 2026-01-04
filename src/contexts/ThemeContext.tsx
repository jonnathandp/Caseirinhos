'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface ThemeContextData {
  theme: 'claro' | 'escuro'
  setTheme: (theme: 'claro' | 'escuro') => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'claro' | 'escuro'>('claro')
  const { data: session } = useSession()

  useEffect(() => {
    // Carregar tema das configurações do usuário
    if (session) {
      loadUserTheme()
    } else {
      // Carregar tema do localStorage se não logado
      const savedTheme = localStorage.getItem('theme') as 'claro' | 'escuro'
      if (savedTheme) {
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      }
    }
  }, [session])

  const loadUserTheme = async () => {
    try {
      // Usar API temporária
      const response = await fetch('/api/configuracoes-temp')
      if (response.ok) {
        const config = await response.json()
        const userTheme = config.sistema.tema as 'claro' | 'escuro'
        setThemeState(userTheme)
        applyTheme(userTheme)
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error)
    }
  }

  const setTheme = async (newTheme: 'claro' | 'escuro') => {
    setThemeState(newTheme)
    applyTheme(newTheme)

    if (session) {
      // Salvar no arquivo via API temporária se usuário logado
      try {
        // Primeiro buscar configurações atuais
        const configResponse = await fetch('/api/configuracoes-temp')
        if (configResponse.ok) {
          const currentConfig = await configResponse.json()
          
          // Atualizar apenas o tema
          const updatedConfig = {
            ...currentConfig,
            sistema: {
              ...currentConfig.sistema,
              tema: newTheme
            }
          }

          await fetch('/api/configuracoes-temp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedConfig)
          })
        }
      } catch (error) {
        console.error('Erro ao salvar tema:', error)
      }
    } else {
      // Salvar no localStorage se não logado
      localStorage.setItem('theme', newTheme)
    }
  }

  const applyTheme = (theme: 'claro' | 'escuro') => {
    const root = document.documentElement
    
    if (theme === 'escuro') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        isDark: theme === 'escuro' 
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}