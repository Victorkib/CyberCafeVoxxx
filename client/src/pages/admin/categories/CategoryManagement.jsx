"use client"

import { useState } from "react"
import { Tabs } from "antd"
import Categories from "./categories"
import CategoryTree from "./category-tree"
import CategoryStats from "./category-stats"

const { TabPane } = Tabs

const CategoryManagement = () => {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <div style={{ padding: "2px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>Category Management</h1>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab="Category List" key="list">
          <Categories />
        </TabPane>
        <TabPane tab="Category Hierarchy" key="tree">
          <CategoryTree />
        </TabPane>
        <TabPane tab="Statistics" key="stats">
          <CategoryStats />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default CategoryManagement
