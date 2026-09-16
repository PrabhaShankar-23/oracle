import { Link, Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="layout">
      <header className="site-header">
        <Link to="/" className="brand">
          My Notes
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
