"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BookMarked,
  BookOpen,
  FolderKanban,
  Home,
  Layers,
  Star,
  Timer,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const PAGE_TITLES_STORAGE_KEY = "wiki:page-titles"

function readStoredPageTitles(): Record<string, string> {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(PAGE_TITLES_STORAGE_KEY)
    if (!rawValue) return {}
    const parsed = JSON.parse(rawValue) as Record<string, string>
    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

// This is sample data.
const data = {
  user: {
    name: "Crevoisier",
    email: "admin@mon-wiki.dev",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "Dev",
      logo: Layers,
      plan: "Workspace",
    },
    {
      name: "Infra",
      logo: FolderKanban,
      plan: "Workspace",
    },
    {
      name: "Front",
      logo: BookMarked,
      plan: "Workspace",
    },
  ],
  navMain: [
    {
      title: "Accueil",
      url: "/",
      icon: Home,
      isActive: true,
    },
  ],
  subjects: {
    favorites: [
      { title: "Guide Frontend", url: "#" },
      { title: "Runbook Infra", url: "#" },
      { title: "API Dev", url: "#" },
      { title: "Playbook Produit", url: "#" },
      { title: "Onboarding", url: "#" },
    ],
    recent: [
      { title: "Observabilite", url: "#" },
      { title: "Design Tokens", url: "#" },
      { title: "Gestion des incidents", url: "#" },
      { title: "Conventions API", url: "#" },
      { title: "Checklist release", url: "#" },
      { title: "CI/CD", url: "#" },
      { title: "Securite Auth", url: "#" },
      { title: "Testing e2e", url: "#" },
    ],
  },
  projects: [
    {
      name: "Guide Frontend",
      url: "/sujet/guide-frontend",
      icon: Star,
      pages: [
        {
          name: "Design System",
          url: "/sujet/guide-frontend/design-system",
        },
        {
          name: "Composants",
          url: "/sujet/guide-frontend/composants",
        },
      ],
    },
    {
      name: "Runbook Infra",
      url: "/sujet/runbook-infra",
      icon: Timer,
      pages: [
        {
          name: "Monitoring",
          url: "/sujet/runbook-infra/monitoring",
        },
        {
          name: "Alerting",
          url: "/sujet/runbook-infra/alerting",
        },
      ],
    },
    {
      name: "API Dev",
      url: "/sujet/api-dev",
      icon: BookOpen,
      pages: [
        {
          name: "Architecture",
          url: "/sujet/api-dev/architecture",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [pageTitles, setPageTitles] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const syncTitles = () => {
      setPageTitles(readStoredPageTitles())
    }

    const onCustomUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Record<string, string>>
      if (customEvent.detail) {
        setPageTitles(customEvent.detail)
      } else {
        syncTitles()
      }
    }

    syncTitles()
    window.addEventListener("storage", syncTitles)
    window.addEventListener("wiki:page-titles-updated", onCustomUpdate)
    return () => {
      window.removeEventListener("storage", syncTitles)
      window.removeEventListener("wiki:page-titles-updated", onCustomUpdate)
    }
  }, [])

  const projectsWithDynamicTitles = React.useMemo(() => {
    return data.projects.map((project) => ({
      ...project,
      pages: project.pages.map((page) => ({
        ...page,
        name: pageTitles[page.url] ?? page.name,
      })),
    }))
  }, [pageTitles])

  const openProject =
    projectsWithDynamicTitles.find((project) => pathname.startsWith(project.url)) ??
    projectsWithDynamicTitles[0]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} subjects={data.subjects} />
        <NavProjects project={openProject} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
