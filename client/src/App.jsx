import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AssetRepair from './pages/AssetRepair';

function App() {
  return (
    <Router>
      <Routes>
        {/* ... other routes ... */}
        
        <Route 
          path="/asset-repair" 
          element={
            <ProtectedRoute>
              <AssetRepair />
            </ProtectedRoute>
          } 
        />
        
        {/* ... other routes ... */}
      </Routes>
    </Router>
  );
}

export default App; 