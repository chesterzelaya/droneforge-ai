import React, { createContext, useState, useCallback } from 'react';

/**
 * @context LoadingContext
 * @description Context for managing loading state and logs across the application.
 */
export const LoadingContext = createContext();

/**
 * @component LoadingProvider
 * @description Provider component for the LoadingContext.
 * Manages the state of logs and provides a method to add new logs.
 * 
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by this provider.
 * 
 * @example
 * <LoadingProvider>
 *   <App />
 * </LoadingProvider>
 */
export const LoadingProvider = ({ children }) => {
  /**
   * @state {string[]} logs - Array of log messages.
   */
  const [logs, setLogs] = useState([]);

  /**
   * @function addLog
   * @description Adds a new log message to the logs array.
   * @param {string} message - The log message to be added.
   */
  const addLog = useCallback((message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  }, []);

  return (
    <LoadingContext.Provider value={{ logs, addLog }}>
      {children}
    </LoadingContext.Provider>
  );
};
