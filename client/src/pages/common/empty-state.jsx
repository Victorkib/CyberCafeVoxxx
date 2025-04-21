"use client"
import { Empty, Button } from "antd"
import { PlusOutlined } from "@ant-design/icons"

const EmptyState = ({
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  description = "No data found",
  buttonText,
  buttonIcon = <PlusOutlined />,
  onButtonClick,
  height = "300px",
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height,
        width: "100%",
        padding: "24px",
        background: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <Empty
        image={image}
        imageStyle={{
          height: 80,
        }}
        description={<span style={{ color: "#666", fontSize: "16px" }}>{description}</span>}
      >
        {buttonText && onButtonClick && (
          <Button type="primary" icon={buttonIcon} onClick={onButtonClick}>
            {buttonText}
          </Button>
        )}
      </Empty>
    </div>
  )
}

export default EmptyState
