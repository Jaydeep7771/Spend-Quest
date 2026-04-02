import { NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Quests from './pages/Quests.jsx';
import Budget from './pages/Budget.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Arena from './pages/Arena.jsx';
import Profile from './pages/Profile.jsx';
import SpendWrapped from './pages/SpendWrapped.jsx';
import Onboarding from './pages/Onboarding.jsx';

function App() {
  return (
    <div className="container">
      <nav className="nav card">
        {['/', '/transactions', '/quests', '/budget', '/leaderboard', '/arena', '/wrapped', '/profile', '/onboarding'].map((p) => (
          <NavLink key={p} to={p}>{p === '/' ? 'dashboard' : p.slice(1)}</NavLink>
        ))}
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wrapped" element={<SpendWrapped />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </div>
  );
}

export default App;
