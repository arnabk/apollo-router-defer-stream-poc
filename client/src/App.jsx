import React from 'react';
import './styles/App.css';
import DeferDemo from './components/DeferDemo';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Apollo @defer Demonstration</h1>
      </header>
      <main className="main-content">
        <DeferDemo />
      </main>
    </div>
  );
}

export default App;
