"use client"

import { useState } from "react"
import { Bell, Users, Settings, BarChart2 } from 'lucide-react'
import NotificationBroadcast from "./NotificationBroadcast"
import NotificationAnalytics from "./NotificationAnalytics"
import PageHeader from "../../../components/common/PageHeader"

const NotificationsManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <NotificationAnalytics />
      case "broadcast":
        return <NotificationBroadcast />
      case "settings":
        return (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Notification Expiry</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Set how long notifications are kept in the system before automatic deletion.
                </p>
                <select className="w-full p-2 border rounded">
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Default Notification Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span>Show toast notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span>Play sound for high priority notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span>Auto-retry failed notification deliveries</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <NotificationAnalytics />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Notification Management"
        breadcrumbs={[
          { name: "Dashboard", path: "/admin" },
          { name: "Notifications", path: "/admin/notifications" },
        ]}
      />

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 flex items-center ${activeTab === "dashboard" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart2 className="h-5 w-5 mr-2" />
            Dashboard
          </button>
          <button
            className={`px-4 py-3 flex items-center ${activeTab === "broadcast" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
            onClick={() => setActiveTab("broadcast")}
          >
            <Users className="h-5 w-5 mr-2" />
            Broadcast
          </button>
          <button
            className={`px-4 py-3 flex items-center ${activeTab === "settings" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </button>
        </div>

        <div className="p-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default NotificationsManagement
