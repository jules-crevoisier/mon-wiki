"use client"

import {
  Star,
  type LucideIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavProjects({
  project,
  pathname,
}: {
  project: {
    name: string
    url: string
    icon?: LucideIcon
    pages: {
      name: string
      url: string
    }[]
  } | null
  pathname: string
}) {
  if (!project) {
    return null
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projet ouvert</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={project.name}>
            <a href={project.url}>
              <span>{project.name}</span>
              {project.icon ? <project.icon className="ml-auto size-4" /> : <Star className="ml-auto size-4" />}
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuSub>
          {project.pages.map((page) => {
            const pageIsActive = pathname.startsWith(page.url)

            return (
              <SidebarMenuSubItem key={page.name}>
                <SidebarMenuSubButton asChild isActive={pageIsActive}>
                  <a href={page.url}>
                    <span>{page.name}</span>
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      </SidebarMenu>
    </SidebarGroup>
  )
}
