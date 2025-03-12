"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { BarChart3, Car, CreditCard, Grid3X3, Home, LogOut, Menu, Settings, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: pathname === "/admin/users",
    },
    {
      label: "Payments",
      icon: CreditCard,
      href: "/admin/payments",
      active: pathname === "/admin/payments",
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/reports",
      active: pathname.startsWith("/reports"),
    },
    {
      label: "Parking",
      icon: Grid3X3,
      href: "/admin/parking",
      active: pathname === "/admin/parking",
    },
    {
      label: "Vehicles",
      icon: Car,
      href: "/gatekeeper",
      active: pathname.startsWith("/gatekeeper"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <div className="flex flex-col h-full">
          <div className="flex h-14 items-center px-4 border-b border-gray-800">
            <Link href="/admin" className="flex items-center gap-2">
              <Car className="h-6 w-6 text-white" />
              <span className="font-bold text-white text-xl">ParkSmart</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-x-2 text-sm font-medium rounded-md px-3 py-2 hover:bg-gray-800 hover:text-white transition-colors",
                    route.active ? "bg-gray-800 text-white" : "text-gray-300",
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-800">
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <main className="md:pl-72 h-full">
        <div className="flex items-center p-4 h-14 md:h-[60px] border-b">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-auto flex items-center gap-x-4">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              John Doe
            </Button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 bg-gray-900">
          <div className="flex flex-col h-full">
            <div className="flex h-14 items-center px-4 border-b border-gray-800">
              <Link href="/admin" className="flex items-center gap-2">
                <Car className="h-6 w-6 text-white" />
                <span className="font-bold text-white text-xl">ParkSmart</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto text-gray-300" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-x-2 text-sm font-medium rounded-md px-3 py-2 hover:bg-gray-800 hover:text-white transition-colors",
                      route.active ? "bg-gray-800 text-white" : "text-gray-300",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-800">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

