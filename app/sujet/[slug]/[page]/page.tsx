"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation"
import { Edit3, Save } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { Editor } from "@/components/DynamicEditor"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const subjectTitles: Record<string, string> = {
  "guide-frontend": "Guide Frontend",
  "runbook-infra": "Runbook Infra",
  "api-dev": "API Dev",
}

const pageTitles: Record<string, string> = {
  "design-system": "Design System",
  composants: "Composants",
  monitoring: "Monitoring",
  alerting: "Alerting",
  architecture: "Architecture",
  endpoints: "Endpoints",
}

const defaultPageContent: Record<string, string> = {
  "guide-frontend/design-system": `# Design System

## Vision
Notre design system garantit une UI coherente, accessible et maintenable.

## Tokens
### Couleurs
- Primary
- Secondary
- Accent

### Espacements
- 4
- 8
- 12
- 16

## Typographie
Regles de hierarchie visuelle pour titres, sous-titres et contenu.
`,
  "guide-frontend/composants": `# Composants

## Navigation
Standards pour sidebar, header, breadcrumb et menus.

## Formulaires
Bonnes pratiques de validation, erreurs et etats de chargement.
`,
  "runbook-infra/monitoring": `# Monitoring

## Dashboards
Liste des dashboards critiques pour la plateforme.

## SLO
Objectifs de fiabilite et seuils de qualite de service.
`,
  "runbook-infra/alerting": `# Alerting

## Seuils
Definition des seuils par niveau de gravite.

## Escalade
Processus d'escalade et responsables par palier.
`,
  "api-dev/architecture": `# Architecture API

## Bounded Context
Decoupage des domaines metier.

## Security
Authentication, authorization, rate limiting et audit.
`,
}

const LEGACY_SAMPLE_TITLE = "Exemple de page avec sommaire"
const PAGE_TITLES_STORAGE_KEY = "wiki:page-titles"

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
}

function extractToc(markdown: string): { id: string; title: string; level: number }[] {
  return markdown
    .split("\n")
    .map((line) => {
      const match = /^(#{1,3})\s+(.+)$/.exec(line.trim())
      if (!match) return null
      const level = match[1].length
      const title = match[2].trim()
      return { id: slugifyHeading(title), title, level }
    })
    .filter((item): item is { id: string; title: string; level: number } => Boolean(item))
}

function extractDocumentTitle(markdown: string): string | null {
  const lines = markdown.split("\n")
  for (const line of lines) {
    const match = /^#\s+(.+)$/.exec(line.trim())
    if (match) {
      return match[1].trim()
    }
  }
  return null
}

function replaceLegacySampleTitle(markdown: string, fallbackTitle: string): string {
  return markdown.replace(/^#\s+Exemple de page avec sommaire\s*$/im, `# ${fallbackTitle}`)
}

function readStoredPageTitles(): Record<string, string> {
  try {
    const rawValue = window.localStorage.getItem(PAGE_TITLES_STORAGE_KEY)
    if (!rawValue) return {}
    const parsed = JSON.parse(rawValue) as Record<string, string>
    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export default function SubjectContentPage() {
  const params = useParams<{ slug: string; page: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get("edit") === "1"
  const [content, setContent] = useState("")

  const context = useMemo(() => {
    const slug = params?.slug
    const page = params?.page
    if (!slug || !page) return null

    const subjectTitle = subjectTitles[slug]
    const pageTitle = pageTitles[page]

    if (!subjectTitle || !pageTitle) return null
    return { subjectTitle, pageTitle, slug, page }
  }, [params?.slug, params?.page])

  const storageKey = useMemo(() => {
    if (!context) return null
    return `wiki:page:${context.slug}/${context.page}`
  }, [context])

  useEffect(() => {
    if (!context || !storageKey) return
    const stored = window.localStorage.getItem(storageKey)
    if (stored) {
      const normalized = replaceLegacySampleTitle(stored, context.pageTitle)
      setContent(normalized)
      if (normalized !== stored) {
        window.localStorage.setItem(storageKey, normalized)
      }
      return
    }
    const fallback = defaultPageContent[`${context.slug}/${context.page}`] ?? `# ${context.pageTitle}\n\nContenu a rediger.`
    setContent(fallback)
  }, [context, storageKey])

  if (!context) {
    notFound()
  }

  const toc = extractToc(content).filter((item) => item.level > 1)
  const extractedTitle = extractDocumentTitle(content)
  const dynamicPageTitle =
    extractedTitle && extractedTitle.toLowerCase() !== LEGACY_SAMPLE_TITLE.toLowerCase()
      ? extractedTitle
      : context.pageTitle

  useEffect(() => {
    if (!context) return
    if (!dynamicPageTitle) return
    const routeKey = `/sujet/${context.slug}/${context.page}`
    const currentTitles = readStoredPageTitles()
    if (currentTitles[routeKey] === dynamicPageTitle) return

    const nextTitles = { ...currentTitles, [routeKey]: dynamicPageTitle }
    window.localStorage.setItem(PAGE_TITLES_STORAGE_KEY, JSON.stringify(nextTitles))
    window.dispatchEvent(new CustomEvent("wiki:page-titles-updated", { detail: nextTitles }))
  }, [context, dynamicPageTitle])

  const handleSave = () => {
    if (!storageKey) return
    window.localStorage.setItem(storageKey, content)
    router.push(`/sujet/${context.slug}/${context.page}`)
  }

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
                <BreadcrumbLink asChild>
                  <Link href={`/sujet/${context.slug}`}>{context.subjectTitle}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{dynamicPageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {!isEditMode && (
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => router.push(`/sujet/${context.slug}/${context.page}?edit=1`)}
            >
              <Edit3 className="mr-2 size-4" />
              Edit
            </Button>
          )}
        </header>
        <div className="p-4">
          <div className="relative">
            <section>
              {isEditMode ? (
                <div className="mx-auto w-full max-w-4xl space-y-4">
                  <Editor initialMarkdown={content} onChangeMarkdown={setContent} />
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSave}>
                      <Save className="mr-2 size-4" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/sujet/${context.slug}/${context.page}`)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <article className="mx-auto w-full max-w-4xl">
                  <Editor initialMarkdown={content} editable={false} />
                </article>
              )}
            </section>
            {!isEditMode && (
              <aside className="fixed right-6 top-24 hidden w-[260px] lg:block">
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <SidebarGroup>
                    <SidebarGroupLabel>Sommaire</SidebarGroupLabel>
                    <SidebarMenu>
                      {toc.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild
                            className={item.level === 3 ? "pl-8" : item.level === 2 ? "pl-6" : ""}
                          >
                            <a href={`#${item.id}`}>{item.title}</a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroup>
                </div>
              </aside>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
