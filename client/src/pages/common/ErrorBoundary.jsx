"use client"
import React from "react"
import ErrorFallback from "./ErrorFallback"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    this.setState({ errorInfo })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to console in development
    if (process.env.NODE_ENV !== "production") {
      console.error("Error caught by ErrorBoundary:", error, errorInfo)
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })

    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
          showDetails={this.props.showDetails || process.env.NODE_ENV !== "production"}
          onBack={this.props.onBack}
          onHome={this.props.onHome}
          onSupport={this.props.onSupport}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
