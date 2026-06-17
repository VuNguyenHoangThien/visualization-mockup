import { Link } from "@tanstack/react-router";
import { Factory, Bell, Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/store/theme";
import { Button } from "@/components/ui/button";

export function TopNav() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="grid h-8 w-8 place-items-center rounded-md gradient-brand text-white shadow-soft">
            <Factory className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground leading-none">
              Advanced Factory
            </div>
            <div className="text-sm font-semibold leading-tight">Analytics</div>
          </div>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Profile">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <User className="h-3.5 w-3.5" />
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}
