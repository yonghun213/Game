
import React from 'react'

export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <div className={`p-4 border-b border-slate-100 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <h3 className={`font-semibold text-lg text-slate-900 ${className}`}>{children}</h3>
}

export function CardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <div className={`p-4 ${className}`}>{children}</div>
}
