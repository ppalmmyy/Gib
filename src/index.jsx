import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './main.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Hello name = "donald" surname = "trump"/>
  </React.StrictMode>
);


