import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const Navbar = () => {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-6 px-6 py-3 rounded-full border bg-background/80 backdrop-blur-md shadow-sm">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img
            src="/ncdmb.png"
            alt="NCCC Portal"
            className="h-8 w-8 object-contain"
          />
          <span>
            <span className="text-primary">NCCC</span> Portal
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            About
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth/signin">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
