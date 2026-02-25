"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Pencil, Calendar, BarChart3, Plug, Settings, ExternalLink } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { PlanBadge } from "@/components/billing/plan-badge"
import type { PlanTier } from "@/lib/stripe/plans"
import { PRO_THEMES } from "@/lib/stripe/plans"
import { usePlanTier } from "@/contexts/plan-tier-context"
import { useThemeStore } from "@/stores/theme-store"

const navItems = [
  {
    title: "Editor",
    href: "/editor",
    icon: Pencil,
  },
  {
    title: "Schedule",
    href: "/editor?tab=schedule",
    icon: Calendar,
  },
  {
    title: "Insights",
    href: "/editor?tab=insights",
    icon: BarChart3,
  },
  {
    title: "Integrations",
    href: "/editor?tab=settings",
    icon: Plug,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface AppSidebarProps {
  username?: string
  planTier?: PlanTier
}

function isActive(pathname: string, searchParams: URLSearchParams, href: string) {
  if (href.includes("?")) {
    const [path, query] = href.split("?")
    const params = new URLSearchParams(query)
    return pathname === path && params.get("tab") === searchParams.get("tab")
  }
  // Editor is active when on /editor without a tab param (or with links tab)
  if (href === "/editor") {
    return pathname === "/editor" && !searchParams.get("tab")
  }
  return pathname === href
}

export function AppSidebar({ username, planTier }: AppSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { openUpgradeModal } = usePlanTier()
  const themeId = useThemeStore((state) => state.themeId)
  const isProThemeGated = planTier === 'free' && PRO_THEMES.includes(themeId)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            L
          </div>
          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            LinkLobby
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(pathname, searchParams, item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {planTier && (
          <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
            <PlanBadge tier={planTier} />
          </div>
        )}
        {username && (
          <SidebarMenu>
            <SidebarMenuItem>
              {isProThemeGated ? (
                <SidebarMenuButton
                  tooltip="Upgrade to view public page"
                  onClick={() => openUpgradeModal('Premium Theme')}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    linklobby.com/{username}
                  </span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild tooltip="View public page">
                  <a
                    href={`/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      linklobby.com/{username}
                    </span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
