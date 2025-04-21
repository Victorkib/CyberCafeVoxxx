import { Loader2 } from "lucide-react"

const LoadingSpinner = ({
  fullScreen = false,
  size = "default",
  message = "Loading...",
  overlay = true,
  spinnerColor = "#0066FF",
}) => {
  const spinnerSizes = {
    small: "w-5 h-5",
    default: "w-8 h-8",
    large: "w-12 h-12",
  }

  const containerClasses = fullScreen
    ? "fixed inset-0 flex flex-col items-center justify-center z-50"
    : "flex flex-col items-center justify-center py-12"

  return (
    <div className={containerClasses}>
      {overlay && fullScreen && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80" />}
      <div className="relative flex flex-col items-center justify-center gap-3">
        <Loader2 className={`animate-spin ${spinnerSizes[size]} text-blue-600`} style={{ color: spinnerColor }} />
        {message && <p className="text-sm font-medium text-gray-600 dark:text-gray-300 animate-pulse">{message}</p>}
      </div>
    </div>
  )
}

export default LoadingSpinner
