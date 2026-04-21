"use client"

import { ChevronRight, Search, Star, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  onToggleFavorite,
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
  onToggleFavorite?: (url: string) => void
}) {
  const openCommandPalette = () => {
    window.dispatchEvent(new Event("wiki:open-command-k"))
  }

  return (
    <SidebarGroup>
      <div className="mb-2 px-2 group-data-[collapsible=icon]:hidden">
        <button
          type="button"
          onClick={openCommandPalette}
          className="flex h-8 w-full items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground hover:bg-muted"
        >
          <Search className="size-4" />
          <span>Rechercher</span>
          <span className="ml-auto rounded border px-1.5 py-0.5 text-[11px]">Ctrl+K</span>
        </button>
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
                  <button
                    type="button"
                    className="ml-auto rounded p-0.5 hover:bg-muted"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      onToggleFavorite?.(subject.url)
                    }}
                    aria-label={`Retirer ${subject.title} des favoris`}
                  >
                    <Star className="size-3.5 shrink-0 fill-current text-amber-500" />
                  </button>
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
