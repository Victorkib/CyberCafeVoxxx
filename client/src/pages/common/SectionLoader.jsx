"use client"
import { Loader2 } from "lucide-react"

const SectionLoader = ({
  message = "Loading...",
  height = "300px",
  withOverlay = false,
  withBlur = true,
  dark = false,
}) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center ${
        withOverlay ? "absolute inset-0 z-10" : ""
      } ${height ? `h-[${height}]` : "h-full"}`}
    >
      {withOverlay && (
        <div
          className={`absolute inset-0 ${withBlur ? "backdrop-blur-sm" : ""} ${
            dark ? "bg-gray-900/70" : "bg-white/70"
          }`}
        ></div>
      )}

      <div className="relative flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
        {message && <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">{message}</p>}
      </div>
    </div>
  )
}

export default SectionLoader
