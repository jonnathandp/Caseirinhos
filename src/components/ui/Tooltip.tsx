'use client'

import { useState } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  show?: boolean
  position?: 'right' | 'left' | 'top' | 'bottom'
}

export function Tooltip({ content, children, show = true, position = 'right' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  if (!show) return <>{children}</>

  const positionClasses = {
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2'
  }

  const arrowClasses = {
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-r-gray-800 border-r-4 border-y-transparent border-y-4 border-l-0',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1 border-l-gray-800 border-l-4 border-y-transparent border-y-4 border-r-0',
    top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1 border-t-gray-800 border-t-4 border-x-transparent border-x-4 border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1 border-b-gray-800 border-b-4 border-x-transparent border-x-4 border-t-0'
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap ${positionClasses[position]}`}>
          {content}
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  )
}