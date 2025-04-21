import { Spin } from "antd"
import { LoadingOutlined } from "@ant-design/icons"

const LoadingState = ({ tip = "Loading...", size = "large", fullScreen = false, height = "400px" }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === "large" ? 40 : 24 }} spin />

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255, 255, 255, 0.8)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <Spin indicator={antIcon} size={size} />
        <div style={{ marginTop: 16, color: "#1890ff", fontWeight: 500 }}>{tip}</div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height,
        width: "100%",
      }}
    >
      <Spin indicator={antIcon} size={size} />
      <div style={{ marginTop: 16, color: "#1890ff", fontWeight: 500 }}>{tip}</div>
    </div>
  )
}

export default LoadingState
