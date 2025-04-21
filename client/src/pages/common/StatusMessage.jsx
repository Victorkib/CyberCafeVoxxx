"use client"
import { useState, useEffect } from "react"
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"

const StatusMessage = ({
  id,
  type = "info",
  title,
  message,
  duration = 0, // 0 means it won't auto-dismiss
  onDismiss,
  actions = [],
  className = "",
}) => {
  const [visible, setVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    let timer
    if (duration > 0) {
      timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          setVisible(false)
          if (onDismiss) onDismiss(id)
        }, 300) // Animation duration
      }, duration * 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [duration, onDismiss, id])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      setVisible(false)
      if (onDismiss) onDismiss(id)
    }, 300) // Animation duration
  }

  if (!visible) return null

  const types = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-800 dark:text-green-300",
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-800 dark:text-red-300",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      textColor: "text-amber-800 dark:text-amber-300",
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-800 dark:text-blue-300",
    },
  }

  const { icon, bgColor, borderColor, textColor } = types[type] || types.info

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-4 shadow-md ${
        isExiting ? "opacity-0 transform -translate-y-2" : "opacity-100"
      } transition-all duration-300 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>}
          {message && <div className={`${title ? "mt-1" : ""} text-sm ${textColor} opacity-90`}>{message}</div>}

          {actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${
                    action.primary
                      ? "text-white bg-blue-600 hover:bg-blue-700"
                      : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {action.icon && <span className="mr-1.5">{action.icon}</span>}
                  {action.text}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg p-1.5 inline-flex h-8 w-8 items-center justify-center"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default StatusMessage
