import { ArrowBack, BugReport, RefreshRounded } from "@mui/icons-material";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { Component, ErrorInfo, ReactNode } from "react";
import { toast } from "react-toastify";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  routePath?: string;
  showBackButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Show toast notification
    toast.error("An error occurred. The application will try to recover.", {
      position: "top-right",
      autoClose: 5000,
    });
  }

  handleRefresh = (): void => {
    window.location.reload();
  };

  handleReportError = (): void => {
    // Implement error reporting logic here
    const errorReport = {
      error: this.state.error?.toString(),
      errorInfo: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // You can send this to your error tracking service
    toast.info("Error has been reported to the development team.");
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mt: 4,
              textAlign: "center",
              backgroundColor: (theme) => (theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.grey[50]),
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="error" gutterBottom>
                {this.props.routePath ? `Error in ${this.props.routePath.replace("/", "")}` : "Oops! Something went wrong"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {this.props.routePath
                  ? "An error occurred while displaying this page. You can try going back or reloading the page."
                  : "The application has encountered an unexpected error. Our team has been notified and is working to fix the issue."}
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              {process.env.NODE_ENV === "development" && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 2,
                    backgroundColor: (theme) => (theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[100]),
                    textAlign: "left",
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: "pre-wrap" }}>
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Paper>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              {this.props.showBackButton && (
                <Button variant="outlined" color="primary" startIcon={<ArrowBack />} onClick={() => window.history.back()}>
                  Go Back
                </Button>
              )}
              <Button variant="contained" color="primary" startIcon={<RefreshRounded />} onClick={this.handleRefresh}>
                Refresh Page
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<BugReport />} onClick={this.handleReportError}>
                Report Error
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
