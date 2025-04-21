"use client"
import { AlertCircle, RefreshCw, XCircle } from "lucide-react"

const ErrorMessage = ({
  message = "An error occurred",
  description,
  type = "error",
  onRetry,
  onDismiss,
  fullWidth = false,
  className = "",
}) => {
  const types = {
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-800",
    },
    info: {
      icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
    },
  }

  const { icon, bgColor, borderColor, textColor } = types[type] || types.error

  return (
    <div
      className={`${fullWidth ? "w-full" : "max-w-md mx-auto"} ${bgColor} border ${borderColor} rounded-lg p-4 shadow-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${textColor}`}>{message}</h3>
          {description && <div className={`mt-2 text-sm ${textColor} opacity-80`}>{description}</div>}
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
