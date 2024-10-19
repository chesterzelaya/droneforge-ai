import React, { createContext, useState, useCallback } from 'react';

// Create the context
export const LoadingContext = createContext();

// Create a provider component
export const LoadingProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  }, []);

  return (
    <LoadingContext.Provider value={{ logs, addLog }}>
      {children}
    </LoadingContext.Provider>
  );
};
