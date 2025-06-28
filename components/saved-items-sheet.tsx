"use client"

import type React from "react"

import { useState } from "react"
import { Share2, Trash2, ExternalLink, Check } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { SavedLegoSet } from "@/types/lego"

interface SavedItemsSheetProps {
  savedSets: SavedLegoSet[]
  onRemove: (setNum: string) => void
  onShare: () => Promise<string>
  children: React.ReactNode
}

export function SavedItemsSheet({ savedSets, onRemove, onShare, children }: SavedItemsSheetProps) {
  const [sharing, setSharing] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    if (savedSets.length === 0) {
      toast({
        title: "No items to share",
        description: "Save some LEGO sets first before sharing.",
        variant: "destructive",
      })
      return
    }

    setSharing(true)
    try {
      const shareUrl = await onShare()
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard.",
      })
    } catch (error) {
      console.error("Share error:", error)
      toast({
        title: "Error",
        description: "Failed to create share link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSharing(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Saved LEGO Sets</SheetTitle>
          <SheetDescription>Your collection of saved LEGO sets ({savedSets.length} items)</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {savedSets.length > 0 && (
            <Button onClick={handleShare} disabled={sharing} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              {sharing ? "Creating link..." : "Share Collection"}
            </Button>
          )}

          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {savedSets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No saved LEGO sets yet. Search and save some sets to see them here!
              </p>
            ) : (
              savedSets.map((set) => (
                <Card key={set.set_num}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-sm">{set.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">#{set.set_num}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => onRemove(set.set_num)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {set.year} • {set.num_parts} parts
                      </span>
                      {set.set_url && (
                        <a href={set.set_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    {set.purchased && (
                      <Badge variant="secondary" className="mt-2">
                        <Check className="h-3 w-3 mr-1" />
                        Purchased
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
