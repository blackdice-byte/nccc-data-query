import { Outlet, NavLink } from "react-router-dom"
import { Search, FileText, History, Bookmark, Settings, LogOut } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

const navItems = [
  { to: "/app", icon: Search, label: "Search" },
  { to: "/app/documents", icon: FileText, label: "Documents" },
  { to: "/app/history", icon: History, label: "History" },
  { to: "/app/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
]

const AppLayout = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">DocQuery</h1>
        </div>
        
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">Theme</span>
            <ModeToggle />
          </div>
          <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full hover:bg-muted text-destructive">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
