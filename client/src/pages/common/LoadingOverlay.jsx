import { Loader2 } from "lucide-react"

const LoadingOverlay = ({
  isLoading,
  children,
  message = "Loading...",
  blur = true,
  spinnerSize = "default",
  spinnerColor = "#0066FF",
  opacity = 80,
}) => {
  const spinnerSizes = {
    small: "w-5 h-5",
    default: "w-8 h-8",
    large: "w-12 h-12",
  }

  if (!isLoading) return children

  return (
    <div className="relative">
      {children}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${blur ? "backdrop-blur-sm" : ""}`}
        style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}
      >
        <Loader2
          className={`animate-spin ${spinnerSizes[spinnerSize]} text-blue-600`}
          style={{ color: spinnerColor }}
        />
        {message && <p className="mt-3 text-sm font-medium text-gray-600 animate-pulse">{message}</p>}
      </div>
    </div>
  )
}

export default LoadingOverlay
