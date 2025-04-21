"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  ArrowUp,
  ArrowDown,
  Box,
  MenuIcon,
  Grid,
  List,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Star,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  SlidersHorizontal,
  Download,
  FileUp,
  Folder,
  FolderTree,
} from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSVLink } from "react-csv"
import Papa from "papaparse"
import PropTypes from "prop-types"
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../../redux/slices/adminSlice"
import { notificationClient } from "../../../services/notification.service"
import UploadWidget from "../../../components/uploadWidget/UploadWidget"

// Sortable table row component
const SortableTableRow = ({ category, onEdit, onDelete, onToggleStatus, selected, onSelect }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category._id })
  const [isExpanded, setIsExpanded] = useState(false)

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
        selected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(category._id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <button
            type="button"
            className="cursor-move rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
            {...attributes}
            {...listeners}
          >
            <MenuIcon size={16} />
          </button>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          {category.image ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "https://placehold.co/100x100?text=No+Image"
                }}
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <Box className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{category.slug || "No slug"}</div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="relative">
          <div className={`text-sm text-gray-600 dark:text-gray-300 ${!isExpanded ? "line-clamp-2" : ""}`}>
            {category.description || <span className="text-gray-400 dark:text-gray-500">No description</span>}
          </div>
          {category.description && category.description.length > 100 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>
      </td>
      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
        {category.parent ? (
          <div className="flex items-center gap-2">
            <FolderTree size={16} className="text-gray-400" />
            <span>{category.parent.name}</span>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">None</span>
        )}
      </td>
      <td className="p-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            category.featured
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {category.featured && <Star size={12} className="mr-1" />}
          {category.featured ? "Featured" : "Regular"}
        </span>
      </td>
      <td className="p-4">
        <button
          type="button"
          onClick={() => onToggleStatus(category._id, category.status === "active" ? "inactive" : "active")}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            category.status === "active" ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              category.status === "active" ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700"
          >
            <Edit size={16} className="mr-1.5 -ml-0.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-red-400 dark:ring-gray-700 dark:hover:bg-gray-700"
          >
            <Trash2 size={16} className="mr-1.5 -ml-0.5" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

SortableTableRow.propTypes = {
  category: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
}

// Message component
const MessageDisplay = ({ type, message, description, duration, action, actionText, onClose }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  }

  const colors = {
    success: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  }

  const textColors = {
    success: "text-green-800 dark:text-green-300",
    error: "text-red-800 dark:text-red-300",
    warning: "text-yellow-800 dark:text-yellow-300",
    info: "text-blue-800 dark:text-blue-300",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`mb-4 rounded-lg border p-4 ${colors[type]}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${textColors[type]}`}>{message}</h3>
          {description && <div className={`mt-2 text-sm ${textColors[type]} opacity-90`}>{description}</div>}
          {action && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  onClick={action}
                  className={`rounded-md px-2 py-1.5 text-sm font-medium ${textColors[type]} hover:bg-opacity-10 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {actionText || "Retry"}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

MessageDisplay.propTypes = {
  type: PropTypes.oneOf(["success", "error", "warning", "info"]).isRequired,
  message: PropTypes.string.isRequired,
  description: PropTypes.string,
  duration: PropTypes.number,
  action: PropTypes.func,
  actionText: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

// Loading state component
const LoadingState = ({ tip, fullScreen = false }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? "fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm" : "py-16"
      }`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{tip}</p>
    </div>
  )
}

LoadingState.propTypes = {
  tip: PropTypes.string.isRequired,
  fullScreen: PropTypes.bool,
}

// Empty state component
const EmptyState = ({ description, buttonText, onButtonClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Folder className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No categories found</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {buttonText && onButtonClick && (
        <button
          type="button"
          onClick={onButtonClick}
          className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <Plus className="mr-1.5 -ml-0.5 h-5 w-5" />
          {buttonText}
        </button>
      )}
    </div>
  )
}

EmptyState.propTypes = {
  description: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func,
}

// CSV import preview component
const CSVImportPreview = ({ data, headers, onConfirm, onCancel }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-96 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {data.slice(0, 5).map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {headers.map((header) => (
                  <td key={header} className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {row[header] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {data.length > 5 && <p>Showing 5 of {data.length} rows</p>}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(data)}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Import {data.length} Categories
        </button>
      </div>
    </div>
  )
}

CSVImportPreview.propTypes = {
  data: PropTypes.array.isRequired,
  headers: PropTypes.array.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

// Main Categories component
const Categories = () => {
  const dispatch = useDispatch()
  const { categories, loading, error } = useSelector((state) => state.admin)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParent, setSelectedParent] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [featuredFilter, setFeaturedFilter] = useState("all")
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [viewMode, setViewMode] = useState("table")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false)
  const [isImportModalVisible, setIsImportModalVisible] = useState(false)
  const [importData, setImportData] = useState(null)
  const [importHeaders, setImportHeaders] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    featured: false,
    parent: null,
    status: "active",
    order: 0,
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    featured: false,
    parent: null,
    status: "active",
    order: 0,
  })
  const fileInputRef = useRef(null)
  const [loadingMessage, setLoadingMessage] = useState("Loading categories...")
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [operationInProgress, setOperationInProgress] = useState(false)
  const [operationProgress, setOperationProgress] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Check for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if user has dark mode preference
      const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(isDark)

      // Listen for changes in color scheme preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e) => {
        setIsDarkMode(e.matches)
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Fetch categories on component mount or refresh trigger change
  useEffect(() => {
    setLoadingMessage("Loading categories...")
    setErrorMessage(null)
    dispatch(fetchCategories())
      .unwrap()
      .then(() => {
        setSuccessMessage({
          type: "success",
          message: "Categories loaded successfully",
          duration: 3,
        })
      })
      .catch((err) => {
        setErrorMessage({
          type: "error",
          message: "Failed to load categories",
          description: err.message || "An error occurred while loading categories",
          action: handleRefresh,
          actionText: "Retry",
        })
      })
  }, [dispatch, refreshTrigger])

  // Reset form when modal closes
  useEffect(() => {
    if (!isAddModalVisible && !isEditModalVisible) {
      resetForm()
    }
  }, [isAddModalVisible, isEditModalVisible])

  // Set form values when editing a category
  useEffect(() => {
    if (selectedCategory && isEditModalVisible) {
      setForm({
        name: selectedCategory.name,
        description: selectedCategory.description || "",
        parent: selectedCategory.parent?._id || null,
        featured: selectedCategory.featured,
        status: selectedCategory.status,
        order: selectedCategory.order,
        image: selectedCategory.image || "",
      })

      setFormData({
        name: selectedCategory.name,
        description: selectedCategory.description || "",
        image: selectedCategory.image || "",
        featured: selectedCategory.featured,
        parent: selectedCategory.parent?._id || null,
        status: selectedCategory.status,
        order: selectedCategory.order,
      })
    }
  }, [selectedCategory, isEditModalVisible])

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage && successMessage.duration && successMessage.duration > 0) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, successMessage.duration * 1000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleCloudinaryUpload = useCallback((imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }))

    setSuccessMessage({
      type: "success",
      message: "Image uploaded successfully",
      description: "Your image has been uploaded to Cloudinary",
      duration: 3,
    })
  }, [])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Merge form values with formData (for image)
    const categoryData = {
      ...form,
      image: formData.image,
    }

    // Validate that we have an image URL
    if (!categoryData.image) {
      setErrorMessage({
        type: "error",
        message: "Image Required",
        description: "Please upload a category image before saving",
      })
      return
    }

    setOperationInProgress(true)
    setOperationProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setOperationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      if (selectedCategory) {
        await dispatch(updateCategory({ id: selectedCategory._id, categoryData })).unwrap()

        // Send notification
        notificationClient.showToast({
          title: "Category Updated",
          message: `${categoryData.name} has been updated successfully`,
          priority: "medium",
        })

        setSuccessMessage({
          type: "success",
          message: "Category Updated",
          description: `${categoryData.name} has been updated successfully`,
          duration: 3,
        })
      } else {
        await dispatch(createCategory(categoryData)).unwrap()

        // Send notification
        notificationClient.showToast({
          title: "Category Created",
          message: `${categoryData.name} has been added to your categories`,
          priority: "medium",
        })

        setSuccessMessage({
          type: "success",
          message: "Category Created",
          description: `${categoryData.name} has been added to your categories`,
          duration: 3,
        })
      }

      clearInterval(progressInterval)
      setOperationProgress(100)

      setIsAddModalVisible(false)
      setIsEditModalVisible(false)
      resetForm()
      handleRefresh()
    } catch (error) {
      setErrorMessage({
        type: "error",
        message: "Error saving category",
        description: error.message || "An error occurred while saving the category",
      })
    } finally {
      setOperationInProgress(false)
      setOperationProgress(0)
    }
  }

  // Handle category deletion
  const handleDelete = async () => {
    if (!selectedCategory) return

    setOperationInProgress(true)
    setOperationProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setOperationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 200)

      await dispatch(deleteCategory(selectedCategory._id)).unwrap()

      clearInterval(progressInterval)
      setOperationProgress(100)

      // Send notification
      notificationClient.showToast({
        title: "Category Deleted",
        message: `${selectedCategory.name} has been deleted`,
        priority: "medium",
      })

      setSuccessMessage({
        type: "success",
        message: "Category Deleted",
        description: `${selectedCategory.name} has been deleted successfully`,
        duration: 3,
      })

      setIsDeleteModalVisible(false)
      setSelectedCategory(null)
      handleRefresh()
    } catch (error) {
      setErrorMessage({
        type: "error",
        message: "Error deleting category",
        description: error.message || "An error occurred while deleting the category",
      })
    } finally {
      setOperationInProgress(false)
      setOperationProgress(0)
    }
  }

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return

    setOperationInProgress(true)
    setOperationProgress(0)

    try {
      const totalItems = selectedCategories.length
      let completedItems = 0

      for (const id of selectedCategories) {
        await dispatch(deleteCategory(id)).unwrap()
        completedItems++
        setOperationProgress(Math.round((completedItems / totalItems) * 100))
      }

      // Send notification
      notificationClient.showToast({
        title: "Categories Deleted",
        message: `${selectedCategories.length} categories have been deleted`,
        priority: "medium",
      })

      setSuccessMessage({
        type: "success",
        message: "Bulk Delete Successful",
        description: `${selectedCategories.length} categories have been deleted`,
        duration: 3,
      })

      setIsBulkDeleteModalVisible(false)
      setSelectedCategories([])
      handleRefresh()
    } catch (error) {
      setErrorMessage({
        type: "error",
        message: "Error deleting categories",
        description: error.message || "An error occurred while deleting categories",
      })
    } finally {
      setOperationInProgress(false)
      setOperationProgress(0)
    }
  }

  // Handle status toggle
  const handleToggleStatus = async (id, newStatus) => {
    try {
      const category = categories.find((cat) => cat._id === id)
      if (category) {
        await dispatch(
          updateCategory({
            id,
            categoryData: { ...category, status: newStatus },
          }),
        ).unwrap()

        setSuccessMessage({
          type: "success",
          message: `Category ${newStatus === "active" ? "activated" : "deactivated"}`,
          description: `${category.name} has been ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
          duration: 3,
        })

        handleRefresh()
      }
    } catch (error) {
      setErrorMessage({
        type: "error",
        message: "Error updating category status",
        description: error.message || "An error occurred while updating category status",
      })
    }
  }

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status) => {
    if (selectedCategories.length === 0) return

    setOperationInProgress(true)
    setOperationProgress(0)

    try {
      const totalItems = selectedCategories.length
      let completedItems = 0

      for (const id of selectedCategories) {
        const category = categories.find((cat) => cat._id === id)
        if (category) {
          await dispatch(
            updateCategory({
              id,
              categoryData: { ...category, status },
            }),
          ).unwrap()
          completedItems++
          setOperationProgress(Math.round((completedItems / totalItems) * 100))
        }
      }

      setSuccessMessage({
        type: "success",
        message: "Bulk Update Successful",
        description: `${selectedCategories.length} categories have been ${status === "active" ? "activated" : "deactivated"}`,
        duration: 3,
      })

      setSelectedCategories([])
      handleRefresh()
    } catch (error) {
      setErrorMessage({
        type: "error",
        message: "Error updating categories",
        description: error.message || "An error occurred while updating categories",
      })
    } finally {
      setOperationInProgress(false)
      setOperationProgress(0)
    }
  }

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      image: "",
      featured: false,
      parent: null,
      status: "active",
      order: 0,
    })
    setFormData({
      name: "",
      description: "",
      image: "",
      featured: false,
      parent: null,
      status: "active",
      order: 0,
    })
    setSelectedCategory(null)
  }

  // Handle CSV import
  const handleCSVImport = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setOperationInProgress(true)
      setOperationProgress(0)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setOperationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      Papa.parse(file, {
        header: true,
        complete: (results) => {
          clearInterval(progressInterval)
          setOperationProgress(100)

          if (results.data && results.data.length > 0) {
            setImportData(results.data)
            setImportHeaders(Object.keys(results.data[0]))
            setIsImportModalVisible(true)
          } else {
            setErrorMessage({
              type: "error",
              message: "Empty CSV file",
              description: "No data found in the CSV file",
            })
          }

          setOperationInProgress(false)
          setOperationProgress(0)
        },
        error: (error) => {
          clearInterval(progressInterval)
          setOperationProgress(0)
          setOperationInProgress(false)

          setErrorMessage({
            type: "error",
            message: "Error parsing CSV",
            description: error.message || "An error occurred while parsing the CSV file",
          })
        },
      })
    }
  }

  // Process CSV import
  const processImport = async (data) => {
    setOperationInProgress(true)
    setOperationProgress(0)

    try {
      // Map CSV data to category format
      const categoriesToImport = data.map((row) => ({
        name: row.name,
        description: row.description || "",
        image: row.image || "",
        featured: row.featured === "true",
        parent: row.parent || null,
        status: row.status || "active",
        order: Number(row.order) || 0,
      }))

      // Create categories one by one
      let successCount = 0
      let errorCount = 0
      const totalItems = categoriesToImport.length

      for (const [index, category] of categoriesToImport.entries()) {
        try {
          await dispatch(createCategory(category)).unwrap()
          successCount++
        } catch (error) {
          errorCount++
          console.error("Error importing category:", error)
        }

        setOperationProgress(Math.round(((index + 1) / totalItems) * 100))
      }

      if (successCount > 0) {
        setSuccessMessage({
          type: "success",
          message: "Import Successful",
          description: `Successfully imported ${successCount} categories${errorCount > 0 ? `, failed to import ${errorCount} categories` : ""}`,
          duration: 5,
        })
      }

      if (errorCount > 0 && successCount === 0) {
        setErrorMessage({
          type: "error",
          message: "Import Failed",
          description: `Failed to import ${errorCount} categories`,
        })
      }

      setIsImportModalVisible(false)
      setImportData(null)
      setImportHeaders([])

      // Refresh category list
      handleRefresh()
    } catch (error) {
      setErrorMessage({
        type: "error",
        message: "Error processing import",
        description: error.message || "An error occurred while processing the import",
      })
    } finally {
      setOperationInProgress(false)
      setOperationProgress(0)
    }
  }

  // Prepare CSV export data
  const prepareExportData = () => {
    return categories.map((category) => ({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      featured: category.featured ? "true" : "false",
      parent: category.parent?._id || "",
      status: category.status,
      order: category.order,
      slug: category.slug || "",
    }))
  }

  // Handle category selection
  const handleSelectCategory = (id) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) {
        return prev.filter((categoryId) => categoryId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Handle select all categories
  const handleSelectAllCategories = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(filteredCategories.map((category) => category._id))
    }
  }

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle table row reordering
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((p) => p._id === active.id)
      const newIndex = categories.findIndex((p) => p._id === over.id)

      // In a real application, you would update the order in the database
      // For now, we'll just update the local state
      const newCategories = arrayMove(categories, oldIndex, newIndex)

      // Update the order of each category
      newCategories.forEach(async (category, index) => {
        try {
          await dispatch(
            updateCategory({
              id: category._id,
              categoryData: { ...category, order: index },
            }),
          ).unwrap()
        } catch (error) {
          console.error("Error updating category order:", error)
        }
      })

      setSuccessMessage({
        type: "success",
        message: "Category order updated",
        description: "The categories have been reordered successfully",
        duration: 3,
      })
    }
  }

  // Filter categories based on search and filters
  const filteredCategories = (categories || []).filter((category) => {
    // Search term filter
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))

    // Parent filter
    const matchesParent = !selectedParent || category.parent?._id === selectedParent

    // Status filter
    const matchesStatus = statusFilter === "all" || category.status === statusFilter

    // Featured filter
    const matchesFeatured =
      featuredFilter === "all" || (featuredFilter === "featured" ? category.featured : !category.featured)

    return matchesSearch && matchesParent && matchesStatus && matchesFeatured
  })

  // Sort filtered categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle special cases
    if (sortField === "parent") {
      aValue = a.parent?.name || ""
      bValue = b.parent?.name || ""
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue
  })

  // Paginate categories
  const paginatedCategories = sortedCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Calculate total pages
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage)

  // Loading state
  if (loading && categories.length === 0) {
    return <LoadingState tip={loadingMessage} fullScreen={false} />
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8 dark:bg-gray-900">
      {/* Operation Progress */}
      {operationInProgress && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Operation in progress...</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{operationProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${operationProgress}%` }}
              className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
              transition={{ ease: "easeInOut", duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <MessageDisplay
            type={errorMessage.type}
            message={errorMessage.message}
            description={errorMessage.description}
            action={errorMessage.action}
            actionText={errorMessage.actionText}
            onClose={() => setErrorMessage(null)}
          />
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <MessageDisplay
            type={successMessage.type}
            message={successMessage.message}
            description={successMessage.description}
            duration={successMessage.duration}
            onClose={() => setSuccessMessage(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your product categories, descriptions, and visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Import/Export buttons */}
          <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleCSVImport} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <FileUp className="mr-1.5 -ml-0.5 h-4 w-4" />
            Import
          </button>

          <CSVLink
            data={prepareExportData()}
            filename="categories-export.csv"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Download className="mr-1.5 -ml-0.5 h-4 w-4" />
            Export
          </CSVLink>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`mr-1.5 -ml-0.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {/* Add Category button */}
          <button
            type="button"
            onClick={() => {
              resetForm()
              setIsAddModalVisible(true)
            }}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Plus className="mr-1.5 -ml-0.5 h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-grow max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative min-w-[200px]">
            <select
              value={selectedParent || ""}
              onChange={(e) => setSelectedParent(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Parents</option>
              {(categories || []).map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showAdvancedFilters
                ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Filter className="mr-1.5 -ml-0.5 h-4 w-4" />
            Filters
          </button>

          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                viewMode === "table"
                  ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                viewMode === "grid"
                  ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Advanced filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label
                      htmlFor="status-filter"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Status
                    </label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="featured-filter"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Featured
                    </label>
                    <select
                      id="featured-filter"
                      value={featuredFilter}
                      onChange={(e) => setFeaturedFilter(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="all">All Categories</option>
                      <option value="featured">Featured Only</option>
                      <option value="regular">Regular Only</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sort By
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <select
                        id="sort-by"
                        value={sortField}
                        onChange={(e) => {
                          setSortField(e.target.value)
                          setSortDirection("asc")
                        }}
                        className="block w-full rounded-l-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="name">Name</option>
                        <option value="createdAt">Created Date</option>
                        <option value="order">Order</option>
                        <option value="parent">Parent</option>
                        <option value="featured">Featured</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                        className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selectedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {selectedCategories.length} category{selectedCategories.length !== 1 ? "ies" : "y"} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkStatusUpdate("active")}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <Eye className="mr-1.5 -ml-0.5 h-4 w-4" />
                  Activate
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkStatusUpdate("inactive")}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <EyeOff className="mr-1.5 -ml-0.5 h-4 w-4" />
                  Deactivate
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalVisible(true)}
                  className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  <Trash2 className="mr-1.5 -ml-0.5 h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filteredCategories.length === 0 && !loading && (
        <EmptyState
          description={
            searchTerm || selectedParent || statusFilter !== "all" || featuredFilter !== "all"
              ? "No categories match your filters"
              : "No categories found"
          }
          buttonText="Add Category"
          onButtonClick={() => {
            resetForm()
            setIsAddModalVisible(true)
          }}
        />
      )}

      {/* Categories table */}
      {viewMode === "table" && filteredCategories.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={paginatedCategories.map((category) => category._id)}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="w-16 px-4 py-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.length === paginatedCategories.length}
                            onChange={handleSelectAllCategories}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                          />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        <button
                          type="button"
                          onClick={() => handleSortChange("name")}
                          className="group inline-flex items-center"
                        >
                          Category
                          {sortField === "name" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                            )
                          ) : (
                            <SlidersHorizontal className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        <button
                          type="button"
                          onClick={() => handleSortChange("parent")}
                          className="group inline-flex items-center"
                        >
                          Parent
                          {sortField === "parent" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                            )
                          ) : (
                            <SlidersHorizontal className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        <button
                          type="button"
                          onClick={() => handleSortChange("featured")}
                          className="group inline-flex items-center"
                        >
                          Featured
                          {sortField === "featured" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                            )
                          ) : (
                            <SlidersHorizontal className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {paginatedCategories.map((category) => (
                      <SortableTableRow
                        key={category._id}
                        category={category}
                        onEdit={(category) => {
                          setSelectedCategory(category)
                          setIsEditModalVisible(true)
                        }}
                        onDelete={(category) => {
                          setSelectedCategory(category)
                          setIsDeleteModalVisible(true)
                        }}
                        onToggleStatus={handleToggleStatus}
                        selected={selectedCategories.includes(category._id)}
                        onSelect={handleSelectCategory}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </DndContext>

          {/* Pagination */}
          {filteredCategories.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
              <div className="flex flex-1 items-center justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === 1
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  } dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700`}
                >
                  Previous
                </button>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === totalPages
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  } dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredCategories.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredCategories.length}</span> categories
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-4">
                    <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                      Show
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="rounded-md border border-gray-300 bg-white py-1 pl-2 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                        currentPage === 1
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      } dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronUp className="h-5 w-5 rotate-90" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = i + 1
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                            currentPage === pageNumber
                              ? "z-10 border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                              : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        {currentPage > 3 && (
                          <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            ...
                          </span>
                        )}
                        {currentPage > 3 && currentPage < totalPages - 1 && (
                          <button
                            onClick={() => setCurrentPage(currentPage)}
                            className="relative z-10 inline-flex items-center border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            {currentPage}
                          </button>
                        )}
                        {currentPage < totalPages - 2 && (
                          <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            ...
                          </span>
                        )}
                        {currentPage < totalPages - 1 && (
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                              currentPage === totalPages
                                ? "z-10 border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            }`}
                          >
                            {totalPages}
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                        currentPage === totalPages
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      } dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronDown className="h-5 w-5 rotate-90" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories grid view */}
      {viewMode === "grid" && filteredCategories.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedCategories.map((category) => (
              <div
                key={category._id}
                className={`group relative overflow-hidden rounded-lg border bg-white shadow transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
                  selectedCategories.includes(category._id)
                    ? "ring-2 ring-blue-500 dark:ring-blue-400"
                    : "hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700">
                    {category.image ? (
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://placehold.co/300x200?text=No+Image"
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute right-2 top-2 flex items-center gap-2">
                    <div
                      className={`rounded-full p-1 ${
                        selectedCategories.includes(category._id)
                          ? "bg-blue-500 text-white"
                          : "bg-white/80 text-gray-700 backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleSelectCategory(category._id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                      />
                    </div>
                    {category.featured && (
                      <span className="rounded-full bg-blue-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        <Star className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                    {category.description || <span className="text-gray-400 dark:text-gray-500">No description</span>}
                  </p>
                  <div className="mb-4 flex items-center gap-2">
                    {category.parent ? (
                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        <FolderTree className="h-3 w-3" />
                        <span>{category.parent.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        <Folder className="h-3 w-3" />
                        <span>Root Category</span>
                      </div>
                    )}
                    <div
                      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                        category.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {category.status === "active" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      <span>{category.status === "active" ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category)
                          setIsEditModalVisible(true)
                        }}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700"
                      >
                        <Edit className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category)
                          setIsDeleteModalVisible(true)
                        }}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-red-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-red-400 dark:ring-gray-700 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleStatus(category._id, category.status === "active" ? "inactive" : "active")
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        category.status === "active" ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          category.status === "active" ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add category card */}
            <button
              type="button"
              onClick={() => {
                resetForm()
                setIsAddModalVisible(true)
              }}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Add new category</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Create a new product category</p>
            </button>
          </div>

          {/* Pagination for grid view */}
          {filteredCategories.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
              <div className="flex flex-1 items-center justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === 1
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  } dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700`}
                >
                  Previous
                </button>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === totalPages
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  } dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredCategories.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredCategories.length}</span> categories
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-4">
                    <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                      Show
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="rounded-md border border-gray-300 bg-white py-1 pl-2 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                      <option value={20}>20</option>
                      <option value={40}>40</option>
                    </select>
                  </div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                        currentPage === 1
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      } dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronUp className="h-5 w-5 rotate-90" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = i + 1
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                            currentPage === pageNumber
                              ? "z-10 border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                              : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        {currentPage > 3 && (
                          <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            ...
                          </span>
                        )}
                        {currentPage > 3 && currentPage < totalPages - 1 && (
                          <button
                            onClick={() => setCurrentPage(currentPage)}
                            className="relative z-10 inline-flex items-center border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            {currentPage}
                          </button>
                        )}
                        {currentPage < totalPages - 2 && (
                          <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            ...
                          </span>
                        )}
                        {currentPage < totalPages - 1 && (
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                              currentPage === totalPages
                                ? "z-10 border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            }`}
                          >
                            {totalPages}
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${
                        currentPage === totalPages
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      } dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronDown className="h-5 w-5 rotate-90" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {(isAddModalVisible || isEditModalVisible) && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75"
                aria-hidden="true"
              />
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                &#8203;
              </span>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, type: "spring", damping: 20 }}
                className="relative inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle"
              >
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalVisible(false)
                      setIsEditModalVisible(false)
                    }}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      {selectedCategory ? "Edit Category" : "Add New Category"}
                    </h3>
                    <div className="mt-6">
                      {operationInProgress && (
                        <div className="mb-4">
                          <div className="mb-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Operation in progress...
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {operationProgress}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${operationProgress}%` }}
                              className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                              transition={{ ease: "easeInOut", duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              required
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Description
                            </label>
                            <textarea
                              id="description"
                              name="description"
                              rows={4}
                              value={form.description}
                              onChange={(e) => setForm({ ...form, description: e.target.value })}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="parent"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Parent Category
                            </label>
                            <select
                              id="parent"
                              name="parent"
                              value={form.parent || ""}
                              onChange={(e) => setForm({ ...form, parent: e.target.value || null })}
                              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                            >
                              <option value="">None (Root Category)</option>
                              {(categories || [])
                                .filter((cat) => cat._id !== selectedCategory?._id)
                                .map((category) => (
                                  <option key={category._id} value={category._id}>
                                    {category.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Category Image <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                              {formData.image ? (
                                <div className="relative mt-2 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                                  <img
                                    src={formData.image || "/placeholder.svg"}
                                    alt="Category"
                                    className="h-48 w-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, image: "" })}
                                    className="absolute right-2 top-2 rounded-full bg-white p-1 text-gray-600 shadow-md hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <UploadWidget
                                    uwConfig={{
                                      cloudName: "victorkib",
                                      uploadPreset: "VoxCyber",
                                      multiple: false,
                                      maxImageFileSize: 2000000,
                                      folder: "cybercafe/categories",
                                    }}
                                    onUploadSuccess={handleCloudinaryUpload}
                                    setLoading={setIsUploading}
                                  />
                                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Click the upload button to select an image from your device or drag and drop.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex items-center">
                              <input
                                id="featured"
                                name="featured"
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                              />
                              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Featured Category
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                id="status"
                                name="status"
                                type="checkbox"
                                checked={form.status === "active"}
                                onChange={(e) => setForm({ ...form, status: e.target.checked ? "active" : "inactive" })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                              />
                              <label htmlFor="status" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Active
                              </label>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="order"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Display Order
                            </label>
                            <input
                              type="number"
                              name="order"
                              id="order"
                              min="0"
                              value={form.order}
                              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddModalVisible(false)
                              setIsEditModalVisible(false)
                            }}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading || isUploading || operationInProgress}
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                          >
                            {loading || isUploading || operationInProgress ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {selectedCategory ? "Saving..." : "Creating..."}
                              </>
                            ) : (
                              <>{selectedCategory ? "Save Changes" : "Create Category"}</>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {isDeleteModalVisible && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75"
                aria-hidden="true"
              />
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                &#8203;
              </span>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, type: "spring", damping: 20 }}
                className="relative inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle"
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Delete Category</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this category? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                {operationInProgress && (
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deleting category...</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{operationProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${operationProgress}%` }}
                        className="h-full rounded-full bg-red-600 dark:bg-red-500"
                        transition={{ ease: "easeInOut", duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {selectedCategory && (
                  <div className="mt-4 rounded-md bg-gray-50 p-4 dark:bg-gray-700">
                    <div className="flex items-center">
                      <div className="mr-4 h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-600">
                        {selectedCategory.image ? (
                          <img
                            src={selectedCategory.image || "/placeholder.svg"}
                            alt={selectedCategory.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Box className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{selectedCategory.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedCategory.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Warning: Deleting this category may affect products that are assigned to it.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3 sm:mt-4">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalVisible(false)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading || operationInProgress}
                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
                  >
                    {loading || operationInProgress ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk delete confirmation modal */}
      <AnimatePresence>
        {isBulkDeleteModalVisible && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75"
                aria-hidden="true"
              />
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                &#8203;
              </span>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, type: "spring", damping: 20 }}
                className="relative inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle"
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Delete Multiple Categories
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete {selectedCategories.length} categories? This action cannot be
                        undone.
                      </p>
                    </div>
                  </div>
                </div>

                {operationInProgress && (
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Deleting categories...
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{operationProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${operationProgress}%` }}
                        className="h-full rounded-full bg-red-600 dark:bg-red-500"
                        transition={{ ease: "easeInOut", duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Warning: Deleting these categories may affect products that are assigned to them.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3 sm:mt-4">
                  <button
                    type="button"
                    onClick={() => setIsBulkDeleteModalVisible(false)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={loading || operationInProgress}
                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
                  >
                    {loading || operationInProgress ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      `Delete ${selectedCategories.length} Categories`
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CSV import preview modal */}
      <AnimatePresence>
        {isImportModalVisible && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75"
                aria-hidden="true"
              />
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                &#8203;
              </span>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, type: "spring", damping: 20 }}
                className="relative inline-block w-full max-w-4xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle"
              >
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportModalVisible(false)
                      setImportData(null)
                      setImportHeaders([])
                    }}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Import Categories</h3>
                    <div className="mt-6">
                      {operationInProgress && (
                        <div className="mb-4">
                          <div className="mb-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Processing import...
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {operationProgress}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${operationProgress}%` }}
                              className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                              transition={{ ease: "easeInOut", duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}

                      {importData && (
                        <CSVImportPreview
                          data={importData}
                          headers={importHeaders}
                          onConfirm={processImport}
                          onCancel={() => {
                            setIsImportModalVisible(false)
                            setImportData(null)
                            setImportHeaders([])
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Categories
