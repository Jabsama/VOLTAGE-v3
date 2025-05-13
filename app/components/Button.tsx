import { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  isFullWidth?: boolean
  isIconOnly?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  isFullWidth = false,
  isIconOnly = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${isLoading ? styles.loading : ''}
        ${disabled ? styles.disabled : ''}
        ${isFullWidth ? styles.fullWidth : ''}
        ${isIconOnly ? styles.iconOnly : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {!isLoading && leftIcon}
      {!isLoading && children}
      {!isLoading && rightIcon}
    </button>
  )
}
