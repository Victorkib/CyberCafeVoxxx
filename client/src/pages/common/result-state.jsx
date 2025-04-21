import { Result } from "antd"

const ResultState = ({
  status = "success", // success, error, info, warning, 404, 403, 500
  title,
  subTitle,
  extra,
  icon,
}) => {
  return (
    <Result
      status={status}
      title={title || getDefaultTitle(status)}
      subTitle={subTitle || getDefaultSubTitle(status)}
      icon={icon}
      extra={extra}
    />
  )
}

const getDefaultTitle = (status) => {
  switch (status) {
    case "success":
      return "Operation Successful"
    case "error":
      return "Operation Failed"
    case "info":
      return "Information"
    case "warning":
      return "Warning"
    case "404":
      return "404"
    case "403":
      return "403"
    case "500":
      return "500"
    default:
      return "Result"
  }
}

const getDefaultSubTitle = (status) => {
  switch (status) {
    case "success":
      return "The operation completed successfully."
    case "error":
      return "The operation failed. Please try again."
    case "info":
      return "Here is some information you should know."
    case "warning":
      return "There are some issues that require your attention."
    case "404":
      return "Sorry, the page you visited does not exist."
    case "403":
      return "Sorry, you are not authorized to access this page."
    case "500":
      return "Sorry, something went wrong on the server."
    default:
      return ""
  }
}

export default ResultState
