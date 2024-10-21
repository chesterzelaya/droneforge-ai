import React from 'react';
import PropTypes from 'prop-types';

/**
 * @class ErrorBoundary
 * @extends React.Component
 * @description A React component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * @example
 * // Wrap your component tree with ErrorBoundary
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  /**
   * @constructor
   * @param {Object} props - The props passed to the component.
   */
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * @static
   * @method getDerivedStateFromError
   * @param {Error} error - The error that was caught.
   * @returns {Object} New state to update the component.
   * @description Update state so the next render will show the fallback UI.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * @method componentDidCatch
   * @param {Error} error - The error that was caught.
   * @param {Object} errorInfo - React-specific error information.
   * @description Catch errors in any components below and re-render with error message.
   */
  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    
    // You can also log the error to a more sophisticated error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  /**
   * @method render
   * @returns {React.ReactNode} The component to render.
   * @description Render the fallback UI if there's an error, otherwise render the children.
   */
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  /**
   * The components that this ErrorBoundary wraps.
   */
  children: PropTypes.node.isRequired,
  /**
   * Optional custom fallback UI to display when an error occurs.
   */
  fallback: PropTypes.node,
};

export default ErrorBoundary;
