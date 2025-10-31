"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import {
  Table,
  Input,
  Button,
  Select,
  Modal,
  Form,
  Switch,
  Checkbox,
  Spin,
  Tag,
  Tooltip,
  Upload,
  Tabs,
  Divider,
  Space,
  Card,
  InputNumber,
  Slider,
  Progress,
  Radio,
  Alert,
} from "antd"
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  InboxOutlined,
  MenuOutlined,
  AppstoreOutlined,
  BarsOutlined,
  WarningOutlined,
  CopyOutlined,
  PictureOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSVLink } from "react-csv"
import Papa from "papaparse"
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  fetchCategories,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
} from "../../../redux/slices/adminSlice"
import { notificationClient } from "../../../services/notification.service"
import UploadWidget from "../../../components/uploadWidget/UploadWidget"

const { Option } = Select
const { TabPane } = Tabs
const { TextArea } = Input
const { confirm } = Modal
const { Dragger } = Upload
const { Group: RadioGroup } = Radio

// Custom hook for debouncing values
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'KSh 0.00';
  const num = Number(amount);
  if (Number.isNaN(num)) return 'KSh 0.00';
  return `KSh ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Helper function to generate SKU
const generateSKU = (name, categoryId) => {
  const namePrefix = name.substring(0, 3).toUpperCase()
  const catPrefix = categoryId.substring(0, 3).toUpperCase()
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${namePrefix}-${catPrefix}-${randomNum}`
}

// Sortable table row component
const SortableTableRow = ({ product, categories, onEdit, onDelete, onToggleStatus, selected, onSelect }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: product._id })

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
  }

  return (
    <tr ref={setNodeRef} style={style} className={selected ? "ant-table-row-selected" : ""}>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Checkbox checked={selected} onChange={() => onSelect(product._id)} />
          <Button
            type="text"
            icon={<MenuOutlined />}
            size="small"
            {...attributes}
            {...listeners}
            style={{ cursor: "move" }}
          />
        </div>
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "4px" }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "https://placehold.co/100x100?text=No+Image"
              }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
              }}
            >
              <InboxOutlined style={{ fontSize: "24px", color: "#bfbfbf" }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{product.name}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>{product.sku || "No SKU"}</div>
          </div>
        </div>
      </td>
      <td>{categories.find((cat) => cat._id === product.category)?.name || "Uncategorized"}</td>
      <td>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 500 }}>{formatCurrency(product.price)}</span>
          {product.salePrice && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "12px", textDecoration: "line-through", color: "#8c8c8c" }}>
                {formatCurrency(product.price)}
              </span>
              <Tag color="error">-{Math.round(((product.price - product.salePrice) / product.price) * 100)}%</Tag>
            </div>
          )}
        </div>
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 500, color: product.stock <= 5 ? "#ff4d4f" : "inherit" }}>{product.stock}</span>
          {product.stock <= 5 && (
            <Tooltip title="Low stock alert">
              <WarningOutlined style={{ color: "#ff4d4f" }} />
            </Tooltip>
          )}
        </div>
      </td>
      <td>
        <Switch
          checked={product.status === "active"}
          onChange={() => onToggleStatus(product._id, product.status === "active" ? "inactive" : "active")}
        />
      </td>
      <td>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEdit(product)}>
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(product)}>
            Delete
          </Button>
        </Space>
      </td>
    </tr>
  )
}

// Image preview component with delete functionality
const ImagePreview = ({ images, onRemove, onReorder, onSetMain }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img === active.id)
      const newIndex = images.findIndex((img) => img === over.id)

      onReorder(arrayMove(images, oldIndex, newIndex))
    }
  }

  return (
    <div style={{ marginTop: "16px" }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={images} strategy={verticalListSortingStrategy}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
            {images.map((image, index) => (
              <SortableImageItem
                key={image}
                id={image}
                url={image}
                index={index}
                onRemove={onRemove}
                onSetMain={onSetMain}
                isMain={index === 0}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

// Sortable image item
const SortableImageItem = ({ id, url, index, onRemove, onSetMain, isMain }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const [showOverlay, setShowOverlay] = useState(false)

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    position: "relative",
    border: isMain ? "2px solid #1890ff" : "1px solid #d9d9d9",
    borderRadius: "4px",
    overflow: "hidden",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <img
        src={url || "/placeholder.svg"}
        alt={`Product ${index + 1}`}
        style={{ width: "100%", height: "96px", objectFit: "cover" }}
        onError={(e) => {
          e.target.onerror = null
          e.target.src = "https://placehold.co/100x100?text=Error"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: showOverlay ? 1 : 0,
        }}
      >
        <Space>
          <Button
            type="primary"
            shape="circle"
            size="small"
            icon={<MenuOutlined />}
            {...attributes}
            {...listeners}
            title="Drag to reorder"
          />
          {!isMain && (
            <Button
              type="primary"
              shape="circle"
              size="small"
              icon={<PictureOutlined />}
              onClick={() => onSetMain(url)}
              title="Set as main image"
            />
          )}
          <Button
            type="primary"
            danger
            shape="circle"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onRemove(url)}
            title="Remove image"
          />
        </Space>
      </div>
      {isMain && (
        <Tag color="blue" style={{ position: "absolute", top: "4px", left: "4px" }}>
          Main
        </Tag>
      )}
    </div>
  )
}

// Image gallery component for viewing product images
const ImageGallery = ({ images, visible, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <Modal visible={visible} onCancel={onClose} footer={null} width={800} centered bodyStyle={{ padding: 0 }}>
      <div style={{ position: "relative", height: "500px" }}>
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Product image ${currentIndex + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        <div
          style={{ position: "absolute", bottom: "16px", left: 0, right: 0, display: "flex", justifyContent: "center" }}
        >
          <div
            style={{ display: "flex", gap: "8px", background: "rgba(0,0,0,0.5)", padding: "8px", borderRadius: "4px" }}
          >
            <Button type="primary" shape="circle" icon={<LeftOutlined />} onClick={handlePrev} />
            <span style={{ color: "white", alignSelf: "center" }}>
              {currentIndex + 1} / {images.length}
            </span>
            <Button type="primary" shape="circle" icon={<RightOutlined />} onClick={handleNext} />
          </div>
        </div>
      </div>
      <div style={{ padding: "16px", display: "flex", gap: "8px", overflowX: "auto" }}>
        {images.map((image, index) => (
          <div
            key={index}
            style={{
              width: "80px",
              height: "80px",
              border: currentIndex === index ? "2px solid #1890ff" : "1px solid #d9d9d9",
              borderRadius: "4px",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={() => setCurrentIndex(index)}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </Modal>
  )
}

// CSV import preview component
const CSVImportPreview = ({ data, headers, onConfirm, onCancel }) => {
  const [mappedFields, setMappedFields] = useState({})
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)

  const requiredFields = ["name", "price", "stock", "category"]
  const allFields = [
    "name",
    "description",
    "price",
    "salePrice",
    "category",
    "stock",
    "status",
    "featured",
    "isNewProduct",
    "onSale",
    "tags",
    "sku",
  ]

  // Initialize field mapping
  useEffect(() => {
    const initialMapping = {}
    headers.forEach((header) => {
      // Try to find a matching field
      const matchingField = allFields.find(
        (field) => field.toLowerCase() === header.toLowerCase() || header.toLowerCase().includes(field.toLowerCase()),
      )
      if (matchingField) {
        initialMapping[header] = matchingField
      } else {
        initialMapping[header] = ""
      }
    })
    setMappedFields(initialMapping)
  }, [headers])

  const handleFieldChange = (header, value) => {
    setMappedFields((prev) => ({
      ...prev,
      [header]: value,
    }))
  }

  const handleImport = () => {
    // Check if all required fields are mapped
    const mappedRequiredFields = Object.values(mappedFields)
    const missingRequiredFields = requiredFields.filter((field) => !mappedRequiredFields.includes(field))

    if (missingRequiredFields.length > 0) {
      toast.error(`Missing required fields: ${missingRequiredFields.join(", ")}`)
      return
    }

    setImporting(true)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 5
      })
    }, 200)

    // Map data according to field mapping
    const mappedData = data.map((row) => {
      const mappedRow = {}
      Object.entries(mappedFields).forEach(([header, field]) => {
        if (field) {
          mappedRow[field] = row[header]
        }
      })
      return mappedRow
    })

    // Process import after a short delay to show progress
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      onConfirm(mappedData)
      setImporting(false)
    }, 1000)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {importing ? (
        <div>
          <Progress percent={progress} status={progress < 100 ? "active" : "success"} />
          <p style={{ textAlign: "center", marginTop: "16px" }}>
            {progress < 100 ? "Importing products..." : "Import completed!"}
          </p>
        </div>
      ) : (
        <>
          <div>
            <h3>Map CSV Fields to Product Fields</h3>
            <p>Please map each CSV column to the corresponding product field. Required fields are marked with *.</p>

            <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {headers.map((header) => (
                <div key={header} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>{header}:</span>
                  <Select
                    style={{ flex: 1 }}
                    value={mappedFields[header]}
                    onChange={(value) => handleFieldChange(header, value)}
                    placeholder="Select field"
                  >
                    <Option value="">-- Ignore this field --</Option>
                    {allFields.map((field) => (
                      <Option key={field} value={field}>
                        {field} {requiredFields.includes(field) ? "*" : ""}
                      </Option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ maxHeight: "300px", overflow: "auto" }}>
            <h3>Preview (First 5 rows)</h3>
            <Table
              dataSource={data.slice(0, 5).map((row, index) => ({ ...row, key: index }))}
              columns={headers.map((header) => ({
                title: (
                  <div>
                    {header}
                    {mappedFields[header] && (
                      <Tag color="blue" style={{ marginLeft: "4px" }}>
                        → {mappedFields[header]} {requiredFields.includes(mappedFields[header]) ? "*" : ""}
                      </Tag>
                    )}
                  </div>
                ),
                dataIndex: header,
                key: header,
                ellipsis: true,
              }))}
              pagination={false}
              size="small"
              scroll={{ x: true }}
            />
          </div>

          <div style={{ color: "#8c8c8c", fontSize: "14px" }}>
            {data.length > 5 && <p>Showing 5 of {data.length} rows</p>}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleImport}>
              Import {data.length} Products
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Duplicate product modal
const DuplicateProductModal = ({ product, visible, onCancel, onConfirm, categories }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product && visible) {
      form.setFieldsValue({
        name: `${product.name} (Copy)`,
        category: product.category,
        copyImages: true,
        copySpecifications: true,
        copyTags: true,
        adjustStock: true,
        stock: Math.max(0, product.stock - 1),
      })
    }
  }, [product, visible, form])

  const handleSubmit = (values) => {
    setLoading(true)

    // Create a new product object based on the original and form values
    const newProduct = {
      ...product,
      name: values.name,
      category: values.category,
      stock: values.adjustStock ? values.stock : product.stock,
      images: values.copyImages ? [...product.images] : [],
      specifications: values.copySpecifications ? { ...product.specifications } : {},
      tags: values.copyTags ? [...product.tags] : [],
      sku: generateSKU(values.name, values.category),
    }

    // Remove the _id to ensure a new product is created
    delete newProduct._id

    // Simulate a delay for better UX
    setTimeout(() => {
      setLoading(false)
      onConfirm(newProduct)
    }, 800)
  }

  return (
    <Modal title="Duplicate Product" open={visible} onCancel={onCancel} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="New Product Name"
          rules={[{ required: true, message: "Please enter a name for the new product" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="category" label="Category" rules={[{ required: true, message: "Please select a category" }]}>
          <Select placeholder="Select category">
            {categories.map((category) => (
              <Option key={category._id} value={category._id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item name="copyImages" valuePropName="checked">
          <Checkbox>Copy images ({product?.images?.length || 0} images)</Checkbox>
        </Form.Item>

        <Form.Item name="copySpecifications" valuePropName="checked">
          <Checkbox>Copy specifications ({Object.keys(product?.specifications || {}).length} items)</Checkbox>
        </Form.Item>

        <Form.Item name="copyTags" valuePropName="checked">
          <Checkbox>Copy tags ({product?.tags?.length || 0} tags)</Checkbox>
        </Form.Item>

        <Form.Item name="adjustStock" valuePropName="checked">
          <Checkbox>Adjust stock</Checkbox>
        </Form.Item>

        <Form.Item
          name="stock"
          label="Stock for new product"
          dependencies={["adjustStock"]}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!getFieldValue("adjustStock") || (value !== undefined && value >= 0)) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error("Stock must be 0 or greater"))
              },
            }),
          ]}
        >
          <InputNumber min={0} disabled={form.getFieldValue("adjustStock") === false} style={{ width: "100%" }} />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Duplicate Product
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

// Batch edit modal
const BatchEditModal = ({ visible, onCancel, onConfirm, selectedCount, categories }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values) => {
    setLoading(true)

    // Filter out fields that weren't selected for update
    const updates = {}
    Object.entries(values).forEach(([key, value]) => {
      if (values[`update_${key}`] && value !== undefined) {
        updates[key] = value
      }
    })

    // Simulate a delay for better UX
    setTimeout(() => {
      setLoading(false)
      onConfirm(updates)
    }, 800)
  }

  return (
    <Modal
      title={`Batch Edit ${selectedCount} Products`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Alert
        message="Batch Edit Mode"
        description="Only checked fields will be updated. All other fields will remain unchanged."
        type="info"
        showIcon
        style={{ marginBottom: "16px" }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          update_status: false,
          update_featured: false,
          update_category: false,
          update_price: false,
          update_salePrice: false,
          update_stock: false,
          update_isNewProduct: false,
          update_onSale: false,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "16px", alignItems: "center" }}>
          <Form.Item name="update_status" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item name="update_featured" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item name="featured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="update_category" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select placeholder="Select category">
              {categories.map((category) => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="update_price" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item name="price" label="Price ($)">
            <InputNumber min={0} precision={2} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="update_salePrice" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item name="salePrice" label="Sale Price ($)">
            <InputNumber min={0} precision={2} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="update_stock" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item name="stock" label="Stock">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="update_isNewProduct" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item name="isNewProduct" label="Mark as New" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="update_onSale" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item name="onSale" label="On Sale" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update {selectedCount} Products
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

// Main Products component
const Products = () => {
  const dispatch = useDispatch()
  const { products, categories, loading } = useSelector((state) => state.admin)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [stockRange, setStockRange] = useState([0, 100])
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [viewMode, setViewMode] = useState("table")
  const [selectedProducts, setSelectedProducts] = useState([])
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [isBulkDeleteModalVisible, setIsBulkDeleteModalVisible] = useState(false)
  const [isImportModalVisible, setIsImportModalVisible] = useState(false)
  const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState(false)
  const [isBatchEditModalVisible, setIsBatchEditModalVisible] = useState(false)
  const [isGalleryVisible, setIsGalleryVisible] = useState(false)
  const [importData, setImportData] = useState(null)
  const [importHeaders, setImportHeaders] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: "",
    stock: "",
    images: [],
    status: "active",
    featured: false,
    isNewProduct: true,
    onSale: false,
    specifications: {},
    tags: [],
  })
  const [activeTab, setActiveTab] = useState("basic")
  const [newTag, setNewTag] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: "victorkib",
    uploadPreset: "VoxCyber",
    multiple: false,
    maxImageFileSize: 2000000,
    folder: "cybercafe/products",
  })
  const [form] = Form.useForm()
  const fileInputRef = useRef(null)

  // Create debounced versions of filter states
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const debouncedCategory = useDebounce(selectedCategory, 300)
  const debouncedPriceRange = useDebounce(priceRange, 500)
  const debouncedStockRange = useDebounce(stockRange, 500)
  const debouncedStatusFilter = useDebounce(statusFilter, 300)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Update the price and stock ranges only on initial load
  useEffect(() => {
    if (products && products.length > 0 && !initialLoadComplete) {
      const maxPrice = Math.max(...products.map((p) => p.price || 0), 1000)
      const maxStock = Math.max(...products.map((p) => p.stock || 0), 100)
      
      setPriceRange([0, maxPrice])
      setStockRange([0, maxStock])
      setInitialLoadComplete(true)
    }
  }, [products, initialLoadComplete])

  // Fetch products with debounced filters
  useEffect(() => {
    const order = sortDirection;
    dispatch(fetchProducts({
      page: currentPage,
      limit: itemsPerPage,
      sort: sortField,
      order: order,
      filter: {
        keyword: debouncedSearchTerm,
        category: debouncedCategory,
        status: debouncedStatusFilter !== "all" ? debouncedStatusFilter : undefined,
        minPrice: debouncedPriceRange[0],
        maxPrice: debouncedPriceRange[1],
        minStock: debouncedStockRange[0],
        maxStock: debouncedStockRange[1]
      }
    }));
  }, [
    dispatch, 
    currentPage, 
    itemsPerPage, 
    sortField, 
    sortDirection, 
    debouncedSearchTerm, 
    debouncedCategory, 
    debouncedStatusFilter, 
    debouncedPriceRange, 
    debouncedStockRange
  ]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isAddModalVisible && !isEditModalVisible) {
      resetForm()
    }
  }, [isAddModalVisible, isEditModalVisible])

  // Set form values when editing a product
  useEffect(() => {
    if (selectedProduct && isEditModalVisible) {
      form.setFieldsValue({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        salePrice: selectedProduct.salePrice || "",
        category: selectedProduct.category,
        stock: selectedProduct.stock,
        status: selectedProduct.status,
        featured: selectedProduct.featured,
        isNewProduct: selectedProduct.isNewProduct,
        onSale: selectedProduct.onSale,
      })

      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        salePrice: selectedProduct.salePrice || "",
        category: selectedProduct.category,
        stock: selectedProduct.stock,
        images: selectedProduct.images || [],
        status: selectedProduct.status,
        featured: selectedProduct.featured,
        isNewProduct: selectedProduct.isNewProduct,
        onSale: selectedProduct.onSale,
        specifications: selectedProduct.specifications || {},
        tags: selectedProduct.tags || [],
      })
    }
  }, [selectedProduct, isEditModalVisible, form])

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      // Search term filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))

      // Category filter
      const matchesCategory = !selectedCategory || product.category === selectedCategory

      // Price range filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      // Stock range filter
      const matchesStock = product.stock >= stockRange[0] && product.stock <= stockRange[1]

      // Status filter
      const matchesStatus = statusFilter === "all" || product.status === statusFilter

      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesStatus
    });
  }, [products, searchTerm, selectedCategory, priceRange, stockRange, statusFilter]);

  // Memoize sorted products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle special cases
      if (sortField === "category") {
        aValue = categories.find((cat) => cat._id === a.category)?.name || ""
        bValue = categories.find((cat) => cat._id === b.category)?.name || ""
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    });
  }, [filteredProducts, sortField, sortDirection, categories]);

  // Memoize paginated products
  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  // Handle specification change
  const handleSpecificationChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }))
  }

  // Add new specification
  const handleAddSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      handleSpecificationChange(newSpecKey.trim(), newSpecValue.trim())
      setNewSpecKey("")
      setNewSpecValue("")
    }
  }

  // Remove specification
  const handleRemoveSpecification = (key) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications }
      delete newSpecs[key]
      return {
        ...prev,
        specifications: newSpecs,
      }
    })
  }

  // Handle tag input
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  // Remove tag
  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  // Handle Cloudinary image upload
  const handleCloudinaryUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrl],
    }))
    toast.success("Image uploaded successfully")
  }

  // Handle image removal
  const handleRemoveImage = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageUrl),
    }))
  }

  // Handle setting main image
  const handleSetMainImage = (imageUrl) => {
    setFormData((prev) => {
      const newImages = prev.images.filter(img => img !== imageUrl)
      return {
        ...prev,
        images: [imageUrl, ...newImages],
      }
    })
    toast.success("Main image updated")
  }

  // Handle image reordering
  const handleReorderImages = (newOrder) => {
    setFormData((prev) => ({
      ...prev,
      images: newOrder,
    }))
  }

  // Generate SKU button handler
  const handleGenerateSKU = () => {
    if (formData.name && formData.category) {
      const sku = generateSKU(formData.name, formData.category)
      form.setFieldsValue({ sku })
      setFormData((prev) => ({
        ...prev,
        sku,
      }))
    } else {
      toast.error("Product name and category are required to generate SKU")
    }
  }

  // Handle form submission
const handleSubmit = async (values) => {
  // Validate images
  if (formData.images.length === 0) {
    toast.error("Please upload at least one product image");
    setActiveTab("images");
    return;
  }

  // Convert boolean status to string enum if needed
  let statusValue = values.status;
  if (typeof statusValue === 'boolean') {
    statusValue = statusValue === true ? 'active' : 'inactive';
  }

  // Merge form values with formData (for images, specs, tags)
  const productData = {
    ...values,
    status: statusValue, // Use the converted status value
    images: formData.images,
    specifications: formData.specifications || {},
    tags: formData.tags || [],
  };

  try {
    if (selectedProduct) {
      await dispatch(updateProduct({ id: selectedProduct._id, productData: productData })).unwrap();
      toast.success("Product updated successfully");
    } else {
      await dispatch(createProduct(productData)).unwrap();
      toast.success("Product created successfully");
    }

    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    resetForm();
  } catch (error) {
    toast.error(error.message || "Error saving product");
  }
};

  // Handle product duplication
  const handleDuplicateProduct = (productData) => {
    dispatch(createProduct(productData))
      .unwrap()
      .then(() => {
        toast.success(`Product "${productData.name}" duplicated successfully`)
        setIsDuplicateModalVisible(false)
      })
      .catch((error) => {
        toast.error(`Error duplicating product: ${error.message || "Unknown error"}`)
      })
  }

  // Handle batch edit
const handleBatchEdit = (updates) => {
  if (Object.keys(updates).length === 0) {
    toast.warning("No fields selected for update");
    return;
  }

  const updateData = {};
  const updateFields = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key.startsWith('update_')) {
      const fieldName = key.replace('update_', '');
      updateFields.push(fieldName);
    } else if (updateFields.includes(key)) {
      // Convert boolean status to string enum if needed
      if (key === 'status' && typeof value === 'boolean') {
        updateData[key] = value === true ? 'active' : 'inactive';
      } else {
        updateData[key] = value;
      }
    }
  });

  dispatch(bulkUpdateProductStatus({ 
    ids: selectedProducts, 
    ...updateData 
  }))
    .unwrap()
    .then(() => {
      toast.success(`${selectedProducts.length} products updated successfully`);
      setIsBatchEditModalVisible(false);
      setSelectedProducts([]);
    })
    .catch((error) => {
      toast.error(`Error updating products: ${error.message || "Unknown error"}`);
    });
};

  // Handle product deletion
  const handleDelete = async () => {
    try {
      await dispatch(deleteProduct(selectedProduct._id)).unwrap()

      // Send notification
      notificationClient.showToast({
        title: "Product Deleted",
        message: `${selectedProduct.name} has been deleted`,
        priority: "medium",
      })

      toast.success("Product deleted successfully")
      setIsDeleteModalVisible(false)
      setSelectedProduct(null)
    } catch (error) {
      toast.error(error.message || "Error deleting product")
    }
  }

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return

    try {
      await dispatch(bulkDeleteProducts(selectedProducts)).unwrap()

      // Send notification
      notificationClient.showToast({
        title: "Products Deleted",
        message: `${selectedProducts.length} products have been deleted`,
        priority: "medium",
      })

      toast.success(`${selectedProducts.length} products deleted successfully`)
      setIsBulkDeleteModalVisible(false)
      setSelectedProducts([])
    } catch (error) {
      toast.error(error.message || "Error deleting products")
    }
  }

// Handle status toggle
const handleToggleStatus = async (id, newStatus) => {
  try {
    // Make sure newStatus is a string enum value, not a boolean
    const statusValue = typeof newStatus === 'boolean' 
      ? (newStatus ? 'active' : 'inactive') 
      : newStatus;
      
    await dispatch(updateProductStatus({ id, status: statusValue })).unwrap();
    toast.success(`Product ${statusValue === "active" ? "activated" : "deactivated"} successfully`);
  } catch (error) {
    toast.error(error.message || "Error updating product status");
  }
};

// Handle bulk status update
const handleBulkStatusUpdate = async (status) => {
  if (selectedProducts.length === 0) return;

  try {
    // Make sure status is a string enum value, not a boolean
    const statusValue = typeof status === 'boolean' 
      ? (status ? 'active' : 'inactive') 
      : status;
      
    await dispatch(bulkUpdateProductStatus({ ids: selectedProducts, status: statusValue })).unwrap();
    toast.success(`${selectedProducts.length} products updated successfully`);
    setSelectedProducts([]);
  } catch (error) {
    toast.error(error.message || "Error updating products");
  }
};

  // Reset form
  const resetForm = () => {
    form.resetFields()
    setFormData({
      name: "",
      description: "",
      price: "",
      salePrice: "",
      category: "",
      stock: "",
      images: [],
      status: "active",
      featured: false,
      isNewProduct: true,
      onSale: false,
      specifications: {},
      tags: [],
    })
    setSelectedProduct(null)
    setActiveTab("basic")
  }

  // Handle CSV import
  const handleCSVImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setImportData(results.data)
            setImportHeaders(Object.keys(results.data[0]))
            setIsImportModalVisible(true)
          } else {
            toast.error("No data found in CSV file")
          }
        },
        error: (error) => {
          toast.error("Error parsing CSV: " + error.message)
        },
      })
    }
  }

  // Process CSV import
  const processImport = async (data) => {
    try {
      // Map CSV data to product format
      const productsToImport = data.map((row) => ({
        name: row.name,
        description: row.description || "",
        price: Number(row.price) || 0,
        salePrice: row.salePrice ? Number(row.salePrice) : undefined,
        category: row.category,
        stock: Number(row.stock) || 0,
        status: row.status || "active",
        featured: row.featured === "true",
        isNewProduct: row.isNewProduct === "true",
        onSale: row.onSale === "true",
        tags: row.tags ? row.tags.split(",").map((tag) => tag.trim()) : [],
        // Add other fields as needed
      }))

      // Create products one by one
      let successCount = 0
      let errorCount = 0

      for (const product of productsToImport) {
        try {
          await dispatch(createProduct(product)).unwrap()
          successCount++
        } catch (error) {
          errorCount++
          console.error("Error importing product:", error)
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} products`)
      }

      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} products`)
      }

      setIsImportModalVisible(false)
      setImportData(null)
      setImportHeaders([])

      // Refresh product list
      dispatch(fetchProducts())
    } catch (error) {
      toast.error("Error processing import: " + (error.message || "Unknown error"))
    }
  }

  // Handle traditional file upload
  const handleImageUpload = (files) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    const uploadPromises = Array.from(files).map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.onerror = (error) => {
          reject(error)
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(uploadPromises)
      .then((imageUrls) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...imageUrls],
        }))
        clearInterval(interval)
        setUploadProgress(100)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
        toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully`)
      })
      .catch((error) => {
        clearInterval(interval)
        setIsUploading(false)
        setUploadProgress(0)
        toast.error("Error uploading images: " + (error.message || "Unknown error"))
      })
  }

  // Prepare CSV export data
  const prepareExportData = () => {
    return products.map((product) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || "",
      category: categories.find((cat) => cat._id === product.category)?.name || "",
      stock: product.stock,
      status: product.status,
      featured: product.featured ? "true" : "false",
      isNewProduct: product.isNewProduct ? "true" : "false",
      onSale: product.onSale ? "true" : "false",
      tags: product.tags ? product.tags.join(", ") : "",
      sku: product.sku || "",
    }))
  }

  // Handle product selection
  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) {
        return prev.filter((productId) => productId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Handle select all products
  const handleSelectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((product) => product._id))
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
      const oldIndex = products.findIndex((p) => p._id === active.id)
      const newIndex = products.findIndex((p) => p._id === over.id)

      // In a real application, you would update the order in the database
      // For now, we'll just update the local state
      const newProducts = arrayMove(products, oldIndex, newIndex)
      // You would dispatch an action to update the products order in the store
      // dispatch(updateProductsOrder(newProducts));

      toast.success("Product order updated")
    }
  }

  // Calculate total pages
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  // Table columns configuration
  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length}
          indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length}
          onChange={handleSelectAllProducts}
        />
      ),
      key: "selection",
      width: 80,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Checkbox checked={selectedProducts.includes(record._id)} onChange={() => handleSelectProduct(record._id)} />
        </div>
      ),
    },
    {
      title: (
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => handleSortChange("name")}
        >
          Product
          {sortField === "name" &&
            (sortDirection === "asc" ? (
              <SortAscendingOutlined style={{ marginLeft: 8 }} />
            ) : (
              <SortDescendingOutlined style={{ marginLeft: 8 }} />
            ))}
        </div>
      ),
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {record.images && record.images.length > 0 ? (
            <img
              src={record.images[0] || "/placeholder.svg"}
              alt={record.name}
              style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "4px", cursor: "pointer" }}
              onClick={() => {
                setSelectedProduct(record)
                setIsGalleryVisible(true)
              }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "https://placehold.co/100x100?text=No+Image"
              }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
              }}
            >
              <InboxOutlined style={{ fontSize: "24px", color: "#bfbfbf" }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>{record.sku || "No SKU"}</div>
          </div>
        </div>
      ),
    },
    {
      title: (
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => handleSortChange("category")}
        >
          Category
          {sortField === "category" &&
            (sortDirection === "asc" ? (
              <SortAscendingOutlined style={{ marginLeft: 8 }} />
            ) : (
              <SortDescendingOutlined style={{ marginLeft: 8 }} />
            ))}
        </div>
      ),
      dataIndex: "category",
      key: "category",
      render: (_, record) => categories.find((cat) => cat._id === record.category)?.name || "Uncategorized",
    },
    {
      title: (
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => handleSortChange("price")}
        >
          Price
          {sortField === "price" &&
            (sortDirection === "asc" ? (
              <SortAscendingOutlined style={{ marginLeft: 8 }} />
            ) : (
              <SortDescendingOutlined style={{ marginLeft: 8 }} />
            ))}
        </div>
      ),
      dataIndex: "price",
      key: "price",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 500 }}>{formatCurrency(record.price)}</span>
          {record.salePrice && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "12px", textDecoration: "line-through", color: "#8c8c8c" }}>
                {formatCurrency(record.price)}
              </span>
              <Tag color="error">-{Math.round(((record.price - record.salePrice) / record.price) * 100)}%</Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => handleSortChange("stock")}
        >
          Stock
          {sortField === "stock" &&
            (sortDirection === "asc" ? (
              <SortAscendingOutlined style={{ marginLeft: 8 }} />
            ) : (
              <SortDescendingOutlined style={{ marginLeft: 8 }} />
            ))}
        </div>
      ),
      dataIndex: "stock",
      key: "stock",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 500, color: record.stock <= 5 ? "#ff4d4f" : "inherit" }}>{record.stock}</span>
          {record.stock <= 5 && (
            <Tooltip title="Low stock alert">
              <WarningOutlined style={{ color: "#ff4d4f" }} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <Switch
          checked={record.status === "active"}
          onChange={() => handleToggleStatus(record._id, record.status === "active" ? "inactive" : "active")}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedProduct(record)
              setIsEditModalVisible(true)
            }}
          >
            Edit
          </Button>
          <Button
            icon={<CopyOutlined />}
            onClick={() => {
              setSelectedProduct(record)
              setIsDuplicateModalVisible(true)
            }}
          >
            Duplicate
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedProduct(record)
              setIsDeleteModalVisible(true)
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Products</h2>
          <p style={{ color: "#8c8c8c", margin: "4px 0 0 0" }}>Manage your product inventory, prices, and details.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {/* Import/Export buttons */}
          <input type="file" ref={fileInputRef} accept=".csv" style={{ display: "none" }} onChange={handleCSVImport} />
          <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current.click()}>
            Import
          </Button>

          <CSVLink
            data={prepareExportData()}
            filename="products-export.csv"
            className="ant-btn ant-btn-default"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <DownloadOutlined style={{ marginRight: "8px" }} />
            Export
          </CSVLink>

          {/* Add Product button */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              resetForm()
              setIsAddModalVisible(true)
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "300px" }}
            allowClear
          />

          <Select
            placeholder="All Categories"
            value={selectedCategory || undefined}
            onChange={setSelectedCategory}
            style={{ width: "200px" }}
            allowClear
          >
            {(categories || []).map((category) => (
              <Option key={category._id} value={category._id}>
                {category.name}
              </Option>
            ))}
          </Select>

          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            type={showAdvancedFilters ? "primary" : "default"}
          >
            Filters
          </Button>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              icon={<BarsOutlined />}
              type={viewMode === "table" ? "primary" : "default"}
              onClick={() => setViewMode("table")}
            />
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === "grid" ? "primary" : "default"}
              onClick={() => setViewMode("grid")}
            />
          </div>
        </div>

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <Card style={{ marginBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              <div>
                <p>Price Range</p>
                <Slider
                  range
                  value={priceRange}
                  min={0}
                  max={Math.max(...(products || []).map((p) => p.price), 1000)}
                  onChange={setPriceRange}
                />
                <div style={{ display: "flex", justifyContent: "space-between", color: "#8c8c8c" }}>
                  <span>KSh {priceRange[0]}</span>
                  <span>KSh {priceRange[1]}</span>
                </div>
              </div>

              <div>
                <p>Stock Range</p>
                <Slider
                  range
                  value={stockRange}
                  min={0}
                  max={Math.max(...(products || []).map((p) => p.stock), 100)}
                  onChange={setStockRange}
                />
                <div style={{ display: "flex", justifyContent: "space-between", color: "#8c8c8c" }}>
                  <span>{stockRange[0]}</span>
                  <span>{stockRange[1]}</span>
                </div>
              </div>

              <div>
                <p>Status</p>
                <Select style={{ width: "100%" }} value={statusFilter} onChange={setStatusFilter}>
                  <Option value="all">All Statuses</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>

              <div>
                <p>Tags</p>
                <Select
                  mode="tags"
                  style={{ width: "100%" }}
                  placeholder="Filter by tags"
                  onChange={(values) => {
                    // Implement tag filtering logic
                  }}
                >
                    {Array.from(new Set(products.flatMap(p => p.tags || []))).map(tag => (
    <Option key={tag} value={tag}>
      {tag}
    </Option>
  ))}
</Select>
              </div>
            </div>
          </Card>
        )}

        {/* Bulk actions */}
        {selectedProducts.length > 0 && (
          <div style={{ marginBottom: "16px", padding: "12px", background: "#f0f0f0", borderRadius: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                <strong>{selectedProducts.length}</strong> products selected
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button onClick={() => setIsBatchEditModalVisible(true)}>Batch Edit</Button>
                <Button
                  onClick={() => handleBulkStatusUpdate("active")}
                >
                  Activate
                </Button>
                <Button
                  onClick={() => handleBulkStatusUpdate("inactive")}
                >
                  Deactivate
                </Button>
                <Button danger onClick={() => setIsBulkDeleteModalVisible(true)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products List */}
      {viewMode === "table" ? (
        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={paginatedProducts.map(product => ({ ...product, key: product._id }))}
            columns={columns}
            pagination={{
              current: currentPage,
              pageSize: itemsPerPage,
              total: sortedProducts.length,
              onChange: setCurrentPage,
              showSizeChanger: true,
              onShowSizeChange: (_, size) => {
                setItemsPerPage(size);
                setCurrentPage(1);
              },
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            rowClassName={(record) => selectedProducts.includes(record._id) ? "ant-table-row-selected" : ""}
            loading={loading}
          />
        </div>
      ) : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
            {paginatedProducts.map((product) => (
              <Card
                key={product._id}
                hoverable
                cover={
                  <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsGalleryVisible(true);
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <InboxOutlined style={{ fontSize: "48px", color: "#bfbfbf" }} />
                      </div>
                    )}
                    {product.status === "inactive" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "#ff4d4f",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Inactive
                      </div>
                    )}
                    {product.featured && (
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          background: "#1890ff",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Featured
                      </div>
                    )}
                    <Checkbox
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelectProduct(product._id)}
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "8px",
                        background: "white",
                        borderRadius: "4px",
                        padding: "4px",
                      }}
                    />
                  </div>
                }
                actions={[
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditModalVisible(true);
                    }}
                  />,
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsDuplicateModalVisible(true);
                    }}
                  />,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsDeleteModalVisible(true);
                    }}
                  />,
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <div>
                      <div style={{ marginBottom: "8px" }}>
                        <strong>Price:</strong>{" "}
                        {product.salePrice ? (
                          <span>
                            <span style={{ textDecoration: "line-through", color: "#8c8c8c" }}>
                              {formatCurrency(product.price)}
                            </span>{" "}
                            {formatCurrency(product.salePrice)}
                          </span>
                        ) : (
                          formatCurrency(product.price)
                        )}
                      </div>
                      <div style={{ marginBottom: "8px" }}>
                        <strong>Category:</strong>{" "}
                        {categories.find((cat) => cat._id === product.category)?.name || "Uncategorized"}
                      </div>
                      <div>
                        <strong>Stock:</strong>{" "}
                        <span style={{ color: product.stock <= 5 ? "#ff4d4f" : "inherit" }}>
                          {product.stock}
                          {product.stock <= 5 && (
                            <WarningOutlined style={{ color: "#ff4d4f", marginLeft: "4px" }} />
                          )}
                        </span>
                      </div>
                    </div>
                  }
                />
              </Card>
            ))}
          </div>

          {/* Pagination for grid view */}
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
              </span>
              <div>
                <Button
                  icon={<LeftOutlined />}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                <Button
                  icon={<RightOutlined />}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={{ marginLeft: "8px" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        title={selectedProduct ? "Edit Product" : "Add Product"}
        open={isAddModalVisible || isEditModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          setIsEditModalVisible(false);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: "active" }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Basic Info" key="basic">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: "Please enter product name" }]}
                >
                  <Input
                    placeholder="Enter product name"
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </Form.Item>

                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: "Please select a category" }]}
                >
                  <Select
                    placeholder="Select category"
                    onChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    {categories.map((category) => (
                      <Option key={category._id} value={category._id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item name="description" label="Description">
                <TextArea
                  rows={4}
                  placeholder="Enter product description"
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </Form.Item>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Form.Item
                  name="price"
                  label="Price ($)"
                  rules={[{ required: true, message: "Please enter product price" }]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: "100%" }}
                    placeholder="0.00"
                    onChange={(value) => setFormData((prev) => ({ ...prev, price: value }))}
                  />
                </Form.Item>

                <Form.Item name="salePrice" label="Sale Price ($)">
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: "100%" }}
                    placeholder="0.00"
                    onChange={(value) => setFormData((prev) => ({ ...prev, salePrice: value }))}
                  />
                </Form.Item>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Form.Item
                  name="stock"
                  label="Stock"
                  rules={[{ required: true, message: "Please enter stock quantity" }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="0"
                    onChange={(value) => setFormData((prev) => ({ ...prev, stock: value }))}
                  />
                </Form.Item>

                <Form.Item name="sku" label="SKU">
                  <Input
                    placeholder="Enter SKU or generate automatically"
                    suffix={
                      <Button type="link" size="small" onClick={handleGenerateSKU}>
                        Generate
                      </Button>
                    }
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                  />
                </Form.Item>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
                <Form.Item name="status" label="Status" valuePropName="checked">
                  <RadioGroup
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <Radio value="active">Active</Radio>
                    <Radio value="inactive">Inactive</Radio>
                  </RadioGroup>
                </Form.Item>

                <Form.Item name="featured" label="Featured" valuePropName="checked">
                  <Switch
                    onChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
                  />
                </Form.Item>

                <Form.Item name="isNewProduct" label="New Product" valuePropName="checked">
                  <Switch
                    onChange={(checked) => setFormData((prev) => ({ ...prev, isNewProduct: checked }))}
                  />
                </Form.Item>

                <Form.Item name="onSale" label="On Sale" valuePropName="checked">
                  <Switch
                    onChange={(checked) => setFormData((prev) => ({ ...prev, onSale: checked }))}
                  />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Images" key="images">
              <div style={{ marginBottom: "16px" }}>
                <p>Upload product images</p>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{ width: "100%", maxWidth: "400px" }}>
                    <div style={{ marginBottom: "16px" }}>
                      <UploadWidget
                        uwConfig={cloudinaryConfig}
                        onUploadSuccess={handleCloudinaryUpload}
                        setLoading={setIsUploading}
                      />
                    </div>
                    <p style={{ textAlign: "center", fontSize: "12px", color: "#8c8c8c" }}>
                      Click the upload button to add images via Cloudinary
                    </p>
                  </div>
                </div>

                <Divider />

                <p>Or use traditional upload:</p>
                {isUploading && (
                  <div style={{ marginBottom: "16px" }}>
                    <Progress percent={uploadProgress} status="active" />
                  </div>
                )}
                <Dragger
                  name="images"
                  multiple
                  beforeUpload={(file) => {
                    handleImageUpload([file]);
                    return false;
                  }}
                  showUploadList={false}
                  disabled={isUploading}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {isUploading ? "Uploading..." : "Click or drag files to this area to upload"}
                  </p>
                  <p className="ant-upload-hint">
                    Support for single or bulk upload. Strictly prohibited from uploading company data or other banned
                    files.
                  </p>
                </Dragger>

                {formData.images.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <p>Product Images</p>
                    <p style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "8px" }}>
                      Drag to reorder. The first image will be used as the main product image.
                    </p>
                    <ImagePreview
                      images={formData.images}
                      onRemove={handleRemoveImage}
                      onReorder={handleReorderImages}
                      onSetMain={handleSetMainImage}
                    />
                  </div>
                )}
              </div>
            </TabPane>

            <TabPane tab="Specifications" key="specifications">
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <Input
                    placeholder="Specification name"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Input
                    placeholder="Specification value"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button type="primary" onClick={handleAddSpecification}>
                    Add
                  </Button>
                </div>

                {Object.keys(formData.specifications).length > 0 ? (
                  <Table
                    dataSource={Object.entries(formData.specifications).map(([key, value], index) => ({
                      key: index,
                      name: key,
                      value,
                    }))}
                    columns={[
                      {
                        title: "Name",
                        dataIndex: "name",
                        key: "name",
                      },
                      {
                        title: "Value",
                        dataIndex: "value",
                        key: "value",
                      },
                      {
                        title: "Action",
                        key: "action",
                        render: (_, record) => (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveSpecification(record.name)}
                          />
                        ),
                      },
                    ]}
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      background: "#f0f0f0",
                      borderRadius: "4px",
                    }}
                  >
                    <p>No specifications added yet</p>
                  </div>
                )}
              </div>
            </TabPane>

            <TabPane tab="Tags" key="tags">
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onPressEnter={handleAddTag}
                    style={{ flex: 1 }}
                  />
                  <Button type="primary" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>

                <div style={{ marginTop: "16px" }}>
                  {formData.tags.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {formData.tags.map((tag) => (
                        <Tag
                          key={tag}
                          closable
                          onClose={() => handleRemoveTag(tag)}
                          style={{ fontSize: "14px", padding: "4px 8px" }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        background: "#f0f0f0",
                        borderRadius: "4px",
                      }}
                    >
                      <p>No tags added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </TabPane>
          </Tabs>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px" }}>
            <Button
              onClick={() => {
                setIsAddModalVisible(false);
                setIsEditModalVisible(false);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {selectedProduct ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Product"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title="Delete Products"
        open={isBulkDeleteModalVisible}
        onCancel={() => setIsBulkDeleteModalVisible(false)}
        onOk={handleBulkDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete <strong>{selectedProducts.length}</strong> products? This action cannot be
          undone.
        </p>
      </Modal>

      {/* Import Preview Modal */}
      <Modal
        title="Import Products"
        open={isImportModalVisible}
        onCancel={() => {
          setIsImportModalVisible(false);
          setImportData(null);
          setImportHeaders([]);
        }}
        footer={null}
        width={800}
      >
        <CSVImportPreview
          data={importData}
          headers={importHeaders}
          onConfirm={processImport}
          onCancel={() => {
            setIsImportModalVisible(false);
            setImportData(null);
            setImportHeaders([]);
          }}
        />
      </Modal>

      {/* Duplicate Product Modal */}
      <DuplicateProductModal
        product={selectedProduct}
        visible={isDuplicateModalVisible}
        onCancel={() => setIsDuplicateModalVisible(false)}
        onConfirm={handleDuplicateProduct}
        categories={categories}
      />

      {/* Batch Edit Modal */}
      <BatchEditModal
        visible={isBatchEditModalVisible}
        onCancel={() => setIsBatchEditModalVisible(false)}
        onConfirm={handleBatchEdit}
        selectedCount={selectedProducts.length}
        categories={categories}
      />

      {/* Image Gallery Modal */}
      {selectedProduct && (
        <ImageGallery
          images={selectedProduct.images || []}
          visible={isGalleryVisible}
          onClose={() => setIsGalleryVisible(false)}
        />
      )}
    </div>
  );
};

export default Products;
