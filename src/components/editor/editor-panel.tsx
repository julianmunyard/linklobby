"use client"

import { Link2, Palette } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-4">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          {description}
        </p>
      </div>
    </div>
  )
}

export function EditorPanel() {
  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="links" className="flex h-full flex-col">
        <div className="border-b px-4 py-2">
          <TabsList className="w-full">
            <TabsTrigger value="links" className="flex-1 gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Links</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex-1 gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Design</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="links"
          className={cn(
            "h-full overflow-auto",
            "data-[state=inactive]:hidden"
          )}
        >
          <EmptyState
            icon={<Link2 className="h-8 w-8 text-muted-foreground" />}
            title="No links yet"
            description="Add your first link to start building your page. Choose from links, images, videos, and more."
          />
        </TabsContent>

        <TabsContent
          value="design"
          className={cn(
            "h-full overflow-auto",
            "data-[state=inactive]:hidden"
          )}
        >
          <EmptyState
            icon={<Palette className="h-8 w-8 text-muted-foreground" />}
            title="Customize your design"
            description="Choose colors, fonts, and backgrounds to match your brand and style."
          />
        </TabsContent>

        </Tabs>
    </div>
  )
}
