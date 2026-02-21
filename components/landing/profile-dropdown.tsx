"use client";

import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ProfileDropdown() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const createdDate = new Date(user.createdAt);
  const expiryDate = new Date(createdDate.getTime() + 90 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-border bg-background px-1.5 py-1 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open profile menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <span className="hidden pr-2 text-sm font-medium text-foreground sm:block">
            {user.name.split(" ")[0]}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1 text-muted-foreground"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 border-border bg-background p-0">
        {/* Profile info */}
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            <span className="truncate text-xs text-muted-foreground">{user.phone}</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Account expiry notice */}
        <div className="px-4 py-3">
          <div
            className={`flex items-center gap-2 rounded border px-3 py-2 text-xs ${
              daysLeft <= 14
                ? "border-destructive/30 bg-destructive/5 text-destructive"
                : "border-primary/20 bg-primary/5 text-primary"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              Account expires in <strong>{daysLeft} days</strong>
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Logout (auto-closes dropdown) */}
        <div className="p-2">
          <DropdownMenuItem
            onClick={async () => {
              await logout();
            }}
            className="cursor-pointer gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted focus:bg-muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </DropdownMenuItem>
        </div>

        {/* Optional extra action example (kept from your original imports) */}
        {/* If you don't use Button anywhere else in this file, you can remove the Button import above. */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}