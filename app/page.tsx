"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, Clock3, LayoutGrid, List, Search, Star } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const books = [
  {
    title: "Guide Frontend",
    description: "Design system, composants UI, conventions CSS et accessibilite.",
    pages: 24,
    updatedAt: "il y a 2h",
    sectionCount: 7,
    favorite: true,
    href: "/sujet/guide-frontend",
  },
  {
    title: "Runbook Infra",
    description: "Procedures incident, monitoring, alerting et escalade.",
    pages: 18,
    updatedAt: "il y a 1j",
    sectionCount: 5,
    favorite: true,
    href: "/sujet/runbook-infra",
  },
  {
    title: "API Dev",
    description: "Architecture API, endpoints, conventions de versionning.",
    pages: 31,
    updatedAt: "il y a 3j",
    sectionCount: 11,
    favorite: false,
    href: "/sujet/api-dev",
  },
  {
    title: "Playbook Produit",
    description: "Vision produit, roadmap, discovery et process de livraison.",
    pages: 12,
    updatedAt: "il y a 5j",
    sectionCount: 4,
    favorite: false,
    href: "#",
  },
]

export default function Page() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [query, setQuery] = React.useState("")

  const filteredBooks = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return books
    }

    return books.filter((book) => {
      return (
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.description.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [query])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Accueil</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un sujet ou une page..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                aria-label="Afficher en grille"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                aria-label="Afficher en liste"
                onClick={() => setViewMode("list")}
              >
                <List />
              </Button>
            </div>
          </div>

          <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-3"}>
            {filteredBooks.map((book) => (
              <Link
                key={book.title}
                href={book.href}
                className={
                  viewMode === "grid"
                    ? "block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
                    : "block rounded-lg border bg-card px-5 py-4 transition-colors hover:bg-muted/40"
                }
              >
                <div className={viewMode === "grid" ? "space-y-3" : "flex items-center justify-between gap-4"}>
                  <div className="space-y-2">
                    {viewMode === "grid" && (
                      <div className="flex h-24 items-end justify-between rounded-md border bg-gradient-to-br from-muted/60 to-muted p-3">
                        <BookOpen className="size-5 text-muted-foreground" />
                        {book.favorite && <Star className="size-4 fill-current text-amber-500" />}
                      </div>
                    )}
                    <h2 className="font-semibold">{book.title}</h2>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{book.description}</p>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="size-3.5" />
                      <span>{book.pages} pages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <LayoutGrid className="size-3.5" />
                      <span>{book.sectionCount} sections</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      <span>{book.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
