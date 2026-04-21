"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BookOpen, Clock3, LayoutGrid, List, Pencil, Pin, Search, Trash2 } from "lucide-react"
import { notFound, useParams, useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const PAGE_TITLES_STORAGE_KEY = "wiki:page-titles"

function readStoredPageTitles(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const rawValue = window.localStorage.getItem(PAGE_TITLES_STORAGE_KEY)
    if (!rawValue) return {}
    const parsed = JSON.parse(rawValue) as Record<string, string>
    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
}

interface SubjectPageInfo {
  name: string
  href: string
  summary: string
  updatedAt: string
  sectionCount: number
}

interface SubjectInfo {
  title: string
  description: string
  updatedAt: string
  pages: SubjectPageInfo[]
}

const projectPages: Record<string, SubjectInfo> = {
  "guide-frontend": {
    title: "Guide Frontend",
    description: "Conventions UI, architecture front et bibliotheque de composants.",
    updatedAt: "Mise a jour il y a 2h",
    pages: [
      {
        name: "Design System",
        href: "/sujet/guide-frontend/design-system",
        summary: "Tokens, typographie, couleurs et patterns de mise en page.",
        updatedAt: "il y a 4h",
        sectionCount: 7,
      },
      {
        name: "Composants",
        href: "/sujet/guide-frontend/composants",
        summary: "Catalogue des composants reutilisables et conventions d'utilisation.",
        updatedAt: "hier",
        sectionCount: 11,
      },
    ],
  },
  "runbook-infra": {
    title: "Runbook Infra",
    description: "Procedures operationnelles, monitoring et gestion d'incident.",
    updatedAt: "Mise a jour hier",
    pages: [
      {
        name: "Monitoring",
        href: "/sujet/runbook-infra/monitoring",
        summary: "Dashboards critiques, SLO, supervision et verification de sante.",
        updatedAt: "il y a 1j",
        sectionCount: 6,
      },
      {
        name: "Alerting",
        href: "/sujet/runbook-infra/alerting",
        summary: "Seuils d'alerte, niveaux de gravite et circuit d'escalade.",
        updatedAt: "il y a 2j",
        sectionCount: 5,
      },
    ],
  },
  "api-dev": {
    title: "API Dev",
    description: "Standards d'API, architecture backend et bonnes pratiques REST.",
    updatedAt: "Mise a jour il y a 3j",
    pages: [
      {
        name: "Architecture",
        href: "/sujet/api-dev/architecture",
        summary: "Domaines fonctionnels, securite et organisation des services.",
        updatedAt: "il y a 3j",
        sectionCount: 9,
      },
    ],
  },
}

export default function SubjectPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [query, setQuery] = useState("")
  const [pinnedPages, setPinnedPages] = useState<string[]>([])
  const [pageTitles, setPageTitles] = useState<Record<string, string>>({})
  const [isManageMode, setIsManageMode] = useState(false)
  const [customPages, setCustomPages] = useState<SubjectPageInfo[]>([])

  const subject = useMemo(() => {
    const slug = params?.slug
    if (!slug) return null
    return projectPages[slug] ?? null
  }, [params?.slug])

  useEffect(() => {
    if (!subject) return
    setCustomPages(subject.pages)
  }, [subject])

  useEffect(() => {
    if (!subject || !params?.slug) return
    const storageKey = `wiki:pinned:${params.slug}`
    const rawPinned = window.localStorage.getItem(storageKey)
    if (!rawPinned) {
      setPinnedPages([])
      return
    }

    try {
      const parsed = JSON.parse(rawPinned) as string[]
      setPinnedPages(Array.isArray(parsed) ? parsed : [])
    } catch {
      setPinnedPages([])
    }
  }, [subject, params?.slug])

  useEffect(() => {
    if (!subject || !params?.slug) return
    const storageKey = `wiki:pinned:${params.slug}`
    window.localStorage.setItem(storageKey, JSON.stringify(pinnedPages))
  }, [pinnedPages, subject, params?.slug])

  useEffect(() => {
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

  useEffect(() => {
    if (!subject) return
    if (customPages.length === 1) {
      router.replace(customPages[0].href)
    }
  }, [customPages, router, subject])

  const handleAddPage = () => {
    if (!subject || !params?.slug) return
    const pageName = window.prompt("Nom de la nouvelle page")
    if (!pageName) return
    const slug = slugify(pageName)
    if (!slug) return
    const href = `/sujet/${params.slug}/${slug}`
    if (customPages.some((page) => page.href === href)) {
      window.alert("Une page avec ce nom existe deja.")
      return
    }

    setCustomPages((current) => [
      ...current,
      {
        name: pageName,
        href,
        summary: "Nouvelle page.",
        updatedAt: "a l'instant",
        sectionCount: 0,
      },
    ])
  }

  const handleDeletePage = (page: SubjectPageInfo) => {
    const confirmed = window.confirm(`Supprimer la page "${page.name}" ?`)
    if (!confirmed) return
    setCustomPages((current) => current.filter((item) => item.href !== page.href))
    setPinnedPages((current) => current.filter((href) => href !== page.href))
  }

  const filteredPages = useMemo(() => {
    if (!subject) return []
    const pagesWithDynamicTitles = customPages.map((page) => ({
      ...page,
      name: pageTitles[page.href] ?? page.name,
    }))
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return pagesWithDynamicTitles

    return pagesWithDynamicTitles.filter(
      (page) =>
        page.name.toLowerCase().includes(normalizedQuery) ||
        page.summary.toLowerCase().includes(normalizedQuery)
    )
  }, [customPages, query, pageTitles, subject])

  const orderedPages = useMemo(() => {
    const pinned = filteredPages.filter((page) => pinnedPages.includes(page.href))
    const unpinned = filteredPages.filter((page) => !pinnedPages.includes(page.href))
    return { pinned, unpinned }
  }, [filteredPages, pinnedPages])

  if (!subject) {
    notFound()
  }

  if (customPages.length === 1) {
    return null
  }

  const cardClass =
    viewMode === "grid"
      ? "rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
      : "rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/40"

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
                <BreadcrumbLink asChild>
                  <Link href="/">Accueil</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{subject.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="p-4">
          <div className="mb-5 rounded-xl border bg-card p-5">
            <h1 className="text-2xl font-semibold">{subject.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subject.description}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{subject.pages.length} pages</span>
              <span>{subject.updatedAt}</span>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une page..."
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Edit pages">
                    <Pencil className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsManageMode((value) => !value)}>
                    {isManageMode ? "Desactiver suppression" : "Activer suppression"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAddPage}>Add page</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {orderedPages.pinned.length > 0 && (
            <div className="mb-4">
              <h2 className="mb-2 text-sm font-medium text-muted-foreground">Pages epinglees</h2>
              <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
                {orderedPages.pinned.map((page) => (
                  <article key={page.href} className={cardClass}>
                    <div className={viewMode === "grid" ? "space-y-3" : "flex items-center justify-between gap-4"}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={page.href} className="font-medium hover:underline">
                            {page.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPinnedPages((current) => current.filter((href) => href !== page.href))}
                            className="ml-auto rounded p-1 text-amber-500 hover:bg-muted"
                            aria-label={`Desepingler ${page.name}`}
                          >
                            <Pin className="size-4 fill-current" />
                          </button>
                          {isManageMode && (
                            <button
                              type="button"
                              onClick={() => handleDeletePage(page)}
                              className="rounded p-1 text-destructive hover:bg-muted"
                              aria-label={`Supprimer ${page.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{page.summary}</p>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="size-3.5" />
                          <span>{page.sectionCount} sections</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock3 className="size-3.5" />
                          <span>{page.updatedAt}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
            {orderedPages.unpinned.map((page) => (
              <article key={page.href} className={cardClass}>
                <div className={viewMode === "grid" ? "space-y-3" : "flex items-center justify-between gap-4"}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link href={page.href} className="font-medium hover:underline">
                        {page.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setPinnedPages((current) =>
                            current.includes(page.href) ? current : [...current, page.href]
                          )
                        }
                        className="ml-auto rounded p-1 text-muted-foreground hover:bg-muted hover:text-amber-500"
                        aria-label={`Epingler ${page.name}`}
                      >
                        <Pin className="size-4" />
                      </button>
                      {isManageMode && (
                        <button
                          type="button"
                          onClick={() => handleDeletePage(page)}
                          className="rounded p-1 text-destructive hover:bg-muted"
                          aria-label={`Supprimer ${page.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{page.summary}</p>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="size-3.5" />
                      <span>{page.sectionCount} sections</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      <span>{page.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
