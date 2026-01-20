'use client'

import { ReactNode } from 'react'

interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
}

const variantClasses = {
  default: 'bg-white border border-slate-200',
  bordered: 'bg-white border-2 border-slate-300',
  elevated: 'bg-white shadow-lg border border-slate-100',
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
