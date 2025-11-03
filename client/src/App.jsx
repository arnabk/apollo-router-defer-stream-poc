import React, { useState } from 'react';
import './styles/App.css';
import Header from './components/Header';
import DemoSelector from './components/DemoSelector';
import UserProfileDemo from './components/demos/UserProfileDemo';
import ProductPageDemo from './components/demos/ProductPageDemo';
import DashboardDemo from './components/demos/DashboardDemo';

function App() {
  const [selectedDemo, setSelectedDemo] = useState('user-profile');

  const renderDemo = () => {
    switch (selectedDemo) {
      case 'user-profile':
        return <UserProfileDemo />;
      case 'product-page':
        return <ProductPageDemo />;
      case 'dashboard':
        return <DashboardDemo />;
      default:
        return <UserProfileDemo />;
    }
  };

  return (
    <div className="app">
      <Header />
      <DemoSelector selectedDemo={selectedDemo} onSelect={setSelectedDemo} />
      <main className="main-content">
        {renderDemo()}
      </main>
    </div>
  );
}

export default App;

