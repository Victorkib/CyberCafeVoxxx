"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, Row, Col, Statistic, Progress, Table, Tag, Spin, Empty } from "antd"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { fetchCategories } from "../../../redux/slices/adminSlice"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

const CategoryStats = () => {
  const dispatch = useDispatch()
  const { categories, loading } = useSelector((state) => state.admin)
  const [categoryStats, setCategoryStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    featuredCategories: 0,
    parentCategories: 0,
    childCategories: 0,
    categoriesWithProducts: 0,
    categoriesWithoutProducts: 0,
    averageProductsPerCategory: 0,
  })
  const [pieData, setPieData] = useState([])
  const [barData, setBarData] = useState([])

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    if (categories && categories.length > 0) {
      // Calculate statistics
      const totalCategories = categories.length
      const activeCategories = categories.filter((cat) => cat.status === "active").length
      const featuredCategories = categories.filter((cat) => cat.featured).length
      const parentCategories = categories.filter((cat) => !cat.parent).length
      const childCategories = totalCategories - parentCategories
      
      // For demo purposes, we'll simulate product counts
      // In a real app, you'd get this from the API
      const categoriesWithProductCounts = categories.map((cat) => ({
        ...cat,
        productCount: Math.floor(Math.random() * 50), // Simulate product count
      }))
      
      const categoriesWithProducts = categoriesWithProductCounts.filter((cat) => cat.productCount > 0).length
      const categoriesWithoutProducts = totalCategories - categoriesWithProducts
      
      const totalProducts = categoriesWithProductCounts.reduce((sum, cat) => sum + cat.productCount, 0)
      const averageProductsPerCategory = totalProducts / totalCategories || 0

      setCategoryStats({
        totalCategories,
        activeCategories,
        featuredCategories,
        parentCategories,
        childCategories,
        categoriesWithProducts,
        categoriesWithoutProducts,
        averageProductsPerCategory,
      })

      // Prepare pie chart data
      setPieData([
        { name: "Active", value: activeCategories },
        { name: "Inactive", value: totalCategories - activeCategories },
      ])

      // Prepare bar chart data - top 5 categories by product count
      const sortedCategories = [...categoriesWithProductCounts].sort((a, b) => b.productCount - a.productCount).slice(0, 5)
      setBarData(sortedCategories.map((cat) => ({
        name: cat.name,
        products: cat.productCount,
      })))
    }
  }, [categories])

  if (loading && categories.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Spin size="large" tip="Loading category statistics..." />
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return <Empty description="No categories found" />
  }

  // Table columns for category list
  const columns = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "success" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      render: (featured) => (
        <Tag color={featured ? "blue" : "default"}>{featured ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Products",
      dataIndex: "productCount",
      key: "productCount",
      render: (count) => count || 0,
    },
  ]

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>Category Statistics</h2>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Categories"
              value={categoryStats.totalCategories}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Active Categories"
              value={categoryStats.activeCategories}
              suffix={`/ ${categoryStats.totalCategories}`}
              valueStyle={{ color: "#52c41a" }}
            />
            <Progress
              percent={Math.round((categoryStats.activeCategories / categoryStats.totalCategories) * 100) || 0}
              status="active"
              strokeColor="#52c41a"
              size="small"
              style={{ marginTop: "8px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
        <Card>
            <Statistic
                title="Featured Categories"
                value={categoryStats.featuredCategories}
                suffix={`/ ${categoryStats.totalCategories}`}
                valueStyle={{ color: "#722ed1" }}
            />
            <Progress
                percent={
                categoryStats.totalCategories
                    ? Math.round((categoryStats.featuredCategories / categoryStats.totalCategories) * 100)
                    : 0
                }
                status="active"
                strokeColor="#722ed1"
                size="small"
                style={{ marginTop: "8px" }}
            />
        </Card>

        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Avg. Products Per Category"
              value={categoryStats.averageProductsPerCategory.toFixed(1)}
              precision={1}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Card title="Category Status Distribution">
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Top Categories by Products">
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="products" fill="#8884d8" name="Products" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Category Table */}
      <Card title="Category List" style={{ marginBottom: "24px" }}>
        <Table
          dataSource={categories.map((cat, index) => ({
            ...cat,
            key: cat._id || index,
            productCount: Math.floor(Math.random() * 50), // Simulate product count
          }))}
          columns={columns}
          pagination={{ pageSize: 5 }}
          size="middle"
        />
      </Card>

      {/* Category Structure */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title="Category Structure">
            <Statistic
              title="Parent Categories"
              value={categoryStats.parentCategories}
              valueStyle={{ color: "#1890ff" }}
              style={{ marginBottom: "16px" }}
            />
            <Statistic
              title="Child Categories"
              value={categoryStats.childCategories}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Product Distribution">
            <Statistic
              title="Categories with Products"
              value={categoryStats.categoriesWithProducts}
              valueStyle={{ color: "#1890ff" }}
              style={{ marginBottom: "16px" }}
            />
            <Statistic
              title="Categories without Products"
              value={categoryStats.categoriesWithoutProducts}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CategoryStats
