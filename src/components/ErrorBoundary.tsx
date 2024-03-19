import React, { ReactNode } from 'react'
import ControlBox from './ControlBox'

interface Props {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: string
}

export class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: '',
    }
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error.toString() }
  }

  componentDidCatch(_: Error, __: React.ErrorInfo) {
    /**
     * You can also log the error to an error reporting service:
     * logError(_, __)
     *
     * PS. Use better names.
     *
     */
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ControlBox>
          <span className="close">&times;</span>
          <h2>App Crashed</h2>
          <p>Something has went horribly wrong.</p>
          {this.state.error}
        </ControlBox>
      )
    }

    // If there is no error just render the children component.
    return this.props.children
  }
}
