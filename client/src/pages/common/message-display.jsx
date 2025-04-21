"use client"

import { useState, useEffect } from "react"
import { Alert, Button } from "antd"
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined } from "@ant-design/icons"

const MessageDisplay = ({
  type = "info",
  message,
  description,
  showIcon = true,
  closable = true,
  action,
  actionText,
  duration = 0, // 0 means it won't auto-close
  onClose,
  style = {},
}) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let timer
    if (duration > 0) {
      timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, duration * 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!visible) return null

  const handleClose = () => {
    setVisible(false)
    if (onClose) onClose()
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleOutlined />
      case "error":
        return <CloseCircleOutlined />
      case "warning":
        return <WarningOutlined />
      default:
        return <InfoCircleOutlined />
    }
  }

  return (
    <Alert
      message={message}
      description={description}
      type={type}
      showIcon={showIcon}
      icon={showIcon ? getIcon() : null}
      closable={closable}
      onClose={handleClose}
      action={
        action ? (
          <Button size="small" type={type === "error" ? "danger" : "primary"} onClick={action}>
            {actionText || "Action"}
          </Button>
        ) : null
      }
      style={{
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        marginBottom: "16px",
        ...style,
      }}
    />
  )
}

export default MessageDisplay
