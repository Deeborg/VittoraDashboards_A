// salesroot.tsx
import React from 'react';
import AppRouter from './router';
import './styles/global.scss';

const App: React.FC = () => {
  return (
    /* THIS IS THE MAGIC FENCE! All your SCSS will instantly turn on when you add this line */
    <div id="sales-dashboard-isolated">
      <AppRouter />
    </div>
  );
};

export default App;