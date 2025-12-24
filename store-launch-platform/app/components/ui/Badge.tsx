
import React from 'react'

export function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline', className?: string }) {
  const styles = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    outline: 'border border-slate-300 text-slate-600'
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}
