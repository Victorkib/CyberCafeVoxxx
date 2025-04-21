"use client"
import { useState, useEffect } from "react"
import { Coffee, Wifi, Monitor, Zap, ShoppingBag } from "lucide-react"

const LoadingScreen = ({ message = "Loading VoxCyber...", timeout = 15000 }) => {
  const [progress, setProgress] = useState(0)
  const [currentIcon, setCurrentIcon] = useState(0)
  const [showTimeout, setShowTimeout] = useState(false)

  const icons = [
    { icon: <Coffee className="w-8 h-8" />, color: "text-amber-500" },
    { icon: <Wifi className="w-8 h-8" />, color: "text-blue-500" },
    { icon: <Monitor className="w-8 h-8" />, color: "text-purple-500" },
    { icon: <Zap className="w-8 h-8" />, color: "text-yellow-500" },
    { icon: <ShoppingBag className="w-8 h-8" />, color: "text-green-500" },
  ]

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Slow down progress as it gets closer to 100%
        const increment = Math.max(0.5, (100 - prevProgress) / 20)
        return Math.min(prevProgress + increment, 99)
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Cycle through icons
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIcon((prevIcon) => (prevIcon + 1) % icons.length)
    }, 2000)

    return () => clearInterval(iconInterval)
  }, [icons.length])

  // Show timeout message if loading takes too long
  useEffect(() => {
    const timeoutTimer = setTimeout(() => {
      setShowTimeout(true)
    }, timeout)

    return () => clearTimeout(timeoutTimer)
  }, [timeout])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 z-50">
      <div className="w-full max-w-md px-8 py-12">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`transition-all duration-500 ${icons[currentIcon].color}`}>{icons[currentIcon].icon}</div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-blue-600 dark:border-blue-400 border-t-transparent animate-spin"></div>
          </div>
          <span className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">
            Vox<span className="text-blue-600 dark:text-blue-400">Cyber</span>
          </span>
        </div>

        {/* Loading bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading message */}
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-2">{message}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {showTimeout ? (
              <span className="text-amber-600 dark:text-amber-400">
                This is taking longer than expected. Please wait a moment...
              </span>
            ) : (
              <span>Loading your digital experience...</span>
            )}
          </p>
        </div>

        {/* Loading facts */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 italic">
            "Did you know? VoxCyber offers high-speed internet access with speeds up to 1Gbps for all your gaming and
            streaming needs."
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
