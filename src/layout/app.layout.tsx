import { useEffect } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import {
  Search,
  FileText,
  History,
  Bookmark,
  Settings,
  LogOut,
  Home,
  MessageSquareText,
  Shield,
  ChevronRight,
  Archive,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/store/auth.store";
import { useBookmarkStore } from "@/store/bookmark.store";

interface NavItem {
  to: string;
  icon: typeof Search;
  label: string;
}

const navItems: NavItem[] = [
  { to: "/app", icon: Search, label: "Search NCCC" },
  { to: "/app/query", icon: MessageSquareText, label: "NCCC Contracts" },
  { to: "/app/archive", icon: Archive, label: "Archive" },
  { to: "/app/history", icon: History, label: "History" },
  { to: "/app/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

const routeLabels: Record<string, string> = {
  app: "Dashboard",
  contracts: "Contracts",
  query: "Query",
  documents: "Documents",
  archive: "Archive",
  history: "History",
  bookmarks: "Bookmarks",
  settings: "Settings",
};

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { bookmarks, fetchBookmarks } = useBookmarkStore();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleLogout = () => {
    logout();
    navigate("/auth/signin");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    return paths.map((path, index) => ({
      label: routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1),
      href: "/" + paths.slice(0, index + 1).join("/"),
      isLast: index === paths.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src="/ncdmb.png"
              alt="logo"
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-lg font-semibold">NCCC Data Query</h1>
          </div>
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
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`
              }
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="p-2 border-t space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">Theme</span>
            <ModeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full hover:bg-muted text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="border-b">
          <div className="h-14 flex items-center justify-between px-4">
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/app"
                    className="flex items-center gap-1"
                  >
                    <Home className="h-4 w-4" />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.slice(1).map((crumb) => (
                  <BreadcrumbItem key={crumb.href}>
                    <BreadcrumbSeparator />
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback>
                    {getInitials(user?.username || "U")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bookmarks Bar */}
          <div className="h-9 px-4 flex items-center gap-1 border-t bg-muted/30 overflow-x-auto">
            <Bookmark className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {bookmarks.length > 0 ? (
              <>
                <div className="flex items-center gap-1 overflow-hidden">
                  {bookmarks.slice(0, 6).map((bookmark) => (
                    <Link
                      key={bookmark.id}
                      to={`/app/contracts/${bookmark.id}`}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-muted transition-colors truncate max-w-[140px]"
                      title={bookmark.contractTitle}
                    >
                      <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{bookmark.contractTitle}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/app/bookmarks"
                  className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-auto"
                >
                  All ({bookmarks.length})
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </>
            ) : (
              <span className="text-xs text-muted-foreground ml-2">
                No bookmarks yet
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
