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
const PROJECT_FAVORITES_STORAGE_KEY = "wiki:project-favorites"

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

function readStoredProjectFavorites(): string[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(PROJECT_FAVORITES_STORAGE_KEY)
    if (!rawValue) return []
    const parsed = JSON.parse(rawValue) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
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
  const [projectFavorites, setProjectFavorites] = React.useState<string[]>([])
  const hasHydratedProjectFavorites = React.useRef(false)

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

  React.useEffect(() => {
    const syncProjectFavorites = () => {
      const favorites = readStoredProjectFavorites()
      setProjectFavorites(favorites)
    }

    const onCustomUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<string[]>
      if (Array.isArray(customEvent.detail)) {
        setProjectFavorites(customEvent.detail)
      } else {
        syncProjectFavorites()
      }
    }

    syncProjectFavorites()
    window.addEventListener("storage", syncProjectFavorites)
    window.addEventListener("wiki:project-favorites-updated", onCustomUpdate)
    return () => {
      window.removeEventListener("storage", syncProjectFavorites)
      window.removeEventListener("wiki:project-favorites-updated", onCustomUpdate)
    }
  }, [])

  React.useEffect(() => {
    if (!hasHydratedProjectFavorites.current) {
      hasHydratedProjectFavorites.current = true
      return
    }

    window.localStorage.setItem(PROJECT_FAVORITES_STORAGE_KEY, JSON.stringify(projectFavorites))
    window.dispatchEvent(new CustomEvent("wiki:project-favorites-updated", { detail: projectFavorites }))
  }, [projectFavorites])

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

  const computedSubjects = React.useMemo(() => {
    const favorites = projectsWithDynamicTitles
      .filter((project) => projectFavorites.includes(project.url))
      .map((project) => ({ title: project.name, url: project.url }))

    return {
      ...data.subjects,
      favorites,
    }
  }, [projectFavorites, projectsWithDynamicTitles])

  const toggleProjectFavorite = (projectUrl: string) => {
    setProjectFavorites((current) =>
      current.includes(projectUrl)
        ? current.filter((url) => url !== projectUrl)
        : [...current, projectUrl]
    )
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} subjects={computedSubjects} onToggleFavorite={toggleProjectFavorite} />
        <NavProjects project={openProject} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
