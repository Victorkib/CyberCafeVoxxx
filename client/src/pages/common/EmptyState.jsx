"use client"
import { Package } from "lucide-react"

const EmptyState = ({
  title = "No items found",
  message = "There are no items to display at this time.",
  icon = <Package className="w-12 h-12 text-gray-400" />,
  action,
  actionText,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">{message}</p>
        {action && actionText && (
          <div className="mt-6">
            <button
              type="button"
              onClick={action}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmptyState
