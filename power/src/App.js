import React from 'react';
import './App.css';
import Table from './components/Table';
import Heatmap from './components/Heatmap';

function App() {
  return (
    <div className="App">
      <Heatmap />
      <Table />
    </div>
  );
}

export default App;
