// GlobalSpinner.tsx
import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useLoading } from '../../context/LoadingContext';
import './GlobalSpinner.css'; 

const GlobalSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="spinner-container"> {/* Add styling for positioning */}
      <Spinner animation="border" variant="primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default GlobalSpinner;
