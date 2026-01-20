import './App.css'

function App() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">
          <h2>WebWaka</h2>
          <span>Superadmin</span>
        </div>
        <nav className="nav">
          <a href="#" className="nav-item active">Dashboard</a>
          <a href="#" className="nav-item">Users</a>
          <a href="#" className="nav-item">Modules</a>
          <a href="#" className="nav-item">Settings</a>
        </nav>
      </aside>
      <main className="main-content">
        <header className="header">
          <h1>Dashboard</h1>
          <div className="user-info">Admin</div>
        </header>
        <section className="stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">1,234</p>
          </div>
          <div className="stat-card">
            <h3>Active Modules</h3>
            <p className="stat-value">12</p>
          </div>
          <div className="stat-card">
            <h3>System Status</h3>
            <p className="stat-value status-ok">Healthy</p>
          </div>
          <div className="stat-card">
            <h3>Uptime</h3>
            <p className="stat-value">99.9%</p>
          </div>
        </section>
        <section className="content-area">
          <div className="card">
            <h2>Recent Activity</h2>
            <ul className="activity-list">
              <li>User signup: john@example.com</li>
              <li>Module deployed: auth-service</li>
              <li>Config updated: rate-limits</li>
              <li>User signup: jane@example.com</li>
            </ul>
          </div>
          <div className="card">
            <h2>Quick Actions</h2>
            <div className="actions">
              <button className="btn">Add User</button>
              <button className="btn">Deploy Module</button>
              <button className="btn">View Logs</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
