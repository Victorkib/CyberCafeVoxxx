"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Tree, Button, Spin, Empty, Modal, Form, Input, Switch } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons"
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../../redux/slices/adminSlice"
import { toast } from "react-hot-toast"

const { confirm } = Modal
const { TextArea } = Input

const CategoryTree = () => {
  const dispatch = useDispatch()
  const { categories, loading } = useSelector((state) => state.admin)
  const [expandedKeys, setExpandedKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    if (selectedCategory && isEditing) {
      form.setFieldsValue({
        name: selectedCategory.name,
        description: selectedCategory.description,
        featured: selectedCategory.featured,
        status: selectedCategory.status === "active",
      })
    }
  }, [selectedCategory, isEditing, form])

  // Convert categories to tree data
  const buildTreeData = (categories, parentId = null) => {
    return categories
      .filter((category) => (parentId === null ? !category.parent : category.parent === parentId))
      .map((category) => {
        const children = buildTreeData(categories, category._id)
        return {
          title: (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <span>{category.name}</span>
              <div>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(category)
                  }}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(category)
                  }}
                />
              </div>
            </div>
          ),
          key: category._id,
          children: children.length > 0 ? children : undefined,
          isLeaf: children.length === 0,
          category,
        }
      })
  }

  const treeData = buildTreeData(categories || [])

  const handleAdd = (parentId = null) => {
    setIsEditing(false)
    setSelectedCategory(parentId ? { parent: parentId } : null)
    form.resetFields()
    form.setFieldsValue({
      status: true,
      featured: false,
    })
    setIsModalVisible(true)
  }

  const handleEdit = (category) => {
    setIsEditing(true)
    setSelectedCategory(category)
    setIsModalVisible(true)
  }

  const handleDelete = (category) => {
    confirm({
      title: "Are you sure you want to delete this category?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone. Products in this category may be affected.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await dispatch(deleteCategory(category._id)).unwrap()
          toast.success("Category deleted successfully")
          dispatch(fetchCategories())
        } catch (error) {
          toast.error(error.message || "Error deleting category")
        }
      },
    })
  }

  const handleSubmit = async (values) => {
    try {
      const categoryData = {
        ...values,
        status: values.status ? "active" : "inactive",
        parent: selectedCategory?.parent || null,
      }

      if (isEditing) {
        await dispatch(updateCategory({ id: selectedCategory._id, categoryData })).unwrap()
        toast.success("Category updated successfully")
      } else {
        await dispatch(createCategory(categoryData)).unwrap()
        toast.success("Category created successfully")
      }

      setIsModalVisible(false)
      dispatch(fetchCategories())
    } catch (error) {
      toast.error(error.message || "Error saving category")
    }
  }

  const handleExpand = (expandedKeys) => {
    setExpandedKeys(expandedKeys)
  }

  const handleSelect = (selectedKeys, info) => {
    setSelectedKeys(selectedKeys)
  }

  if (loading && categories.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Spin size="large" tip="Loading categories..." />
      </div>
    )
  }

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Category Hierarchy</h2>
          <p style={{ color: "#8c8c8c", margin: "4px 0 0 0" }}>
            Manage your category structure and parent-child relationships.
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
          Add Root Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Empty description="No categories found" />
      ) : (
        <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #f0f0f0" }}>
          <Tree
            showLine={{ showLeafIcon: false }}
            showIcon={false}
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            onExpand={handleExpand}
            onSelect={handleSelect}
            treeData={treeData}
            titleRender={(nodeData) => nodeData.title}
          />
        </div>
      )}

      <Modal
        title={isEditing ? "Edit Category" : "Add Category"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true, message: "Please enter a name" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="featured" valuePropName="checked" label="Featured">
            <Switch />
          </Form.Item>

          <Form.Item name="status" valuePropName="checked" label="Active">
            <Switch />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryTree
