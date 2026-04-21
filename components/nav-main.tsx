"use client"

import { ChevronRight, Search, Star, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
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

export function NavMain({
  items,
  subjects,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  subjects: {
    favorites: {
      title: string
      url: string
    }[]
    recent: {
      title: string
      url: string
    }[]
  }
}) {
  return (
    <SidebarGroup>
      <div className="relative mb-2 px-2 group-data-[collapsible=icon]:hidden">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher..." className="h-8 pl-9" />
      </div>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items && item.items.length > 0)

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
      <div className="mt-4 space-y-2 px-2 group-data-[collapsible=icon]:hidden">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bibliotheque</h3>

        <Collapsible defaultOpen className="group/favorites">
          <CollapsibleTrigger className="flex w-full items-center rounded-md px-1 py-1 text-left text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <span>Favoris</span>
            <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/favorites:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
              {subjects.favorites.map((subject) => (
                <a
                  key={subject.title}
                  href={subject.url}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span className="truncate">{subject.title}</span>
                  <Star className="ml-auto size-3.5 shrink-0 fill-current text-amber-500" />
                </a>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
        <div className="space-y-2">
          <p className="px-1 text-xs font-medium text-muted-foreground">Recemment ouverts</p>
          <div className="space-y-1">
            {subjects.recent.slice(0, 3).map((subject) => (
              <a
                key={subject.title}
                href={subject.url}
                className="block truncate rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {subject.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </SidebarGroup>
  )
}
