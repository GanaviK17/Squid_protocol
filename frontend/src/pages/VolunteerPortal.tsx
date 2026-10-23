import React from 'react';
import { Navigate } from 'react-router-dom';

export const VolunteerPortal: React.FC = () => {
  return <Navigate to="/login" replace />;
};
