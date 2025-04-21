"use client"
import { useState } from "react"
import { AlertTriangle, RefreshCw, Home, ArrowLeft, HelpCircle } from "lucide-react"

const ErrorFallback = ({
  error,
  resetErrorBoundary,
  errorInfo = null,
  showDetails = false,
  onBack = null,
  onHome = null,
  onSupport = null,
}) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false)

  // Extract meaningful error message
  const getErrorMessage = () => {
    if (!error) return "An unknown error occurred"

    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message
    }

    if (error.message) {
      return error.message
    }

    return "An unexpected error occurred"
  }

  // Get error code if available
  const getErrorCode = () => {
    if (error && error.response && error.response.status) {
      return error.response.status
    }
    return null
  }

  const errorCode = getErrorCode()
  const errorMessage = getErrorMessage()

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle size={40} className="text-red-600 dark:text-red-400" />
          </div>
        </div>

        {errorCode && <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Error {errorCode}</h1>}

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{errorMessage}</h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We're sorry, something went wrong while loading this page. Please try again or contact support if the problem
          persists.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={resetErrorBoundary}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Go Back
            </button>
          )}

          {onHome && (
            <button
              onClick={onHome}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Home size={18} className="mr-2" />
              Home
            </button>
          )}

          {onSupport && (
            <button
              onClick={onSupport}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HelpCircle size={18} className="mr-2" />
              Contact Support
            </button>
          )}
        </div>

        {(errorInfo || showDetails) && (
          <div className="mt-6">
            <button
              onClick={() => setIsDetailsVisible(!isDetailsVisible)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isDetailsVisible ? "Hide Technical Details" : "Show Technical Details"}
            </button>

            {isDetailsVisible && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left overflow-auto max-h-60">
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {errorInfo ? errorInfo.componentStack : JSON.stringify(error, null, 2)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ErrorFallback
