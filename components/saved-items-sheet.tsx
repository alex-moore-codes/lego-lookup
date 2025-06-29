"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SavedLegoSet } from "@/types/lego";
import { Calendar, Check, Share2, ToyBrick, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SavedItemsSheetProps {
  savedSets: SavedLegoSet[];
  onRemove: (setNum: string) => void;
  onShare: () => Promise<string>;
  children: React.ReactNode;
}

export function SavedItemsSheet({
  savedSets,
  onRemove,
  onShare,
  children,
}: SavedItemsSheetProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (savedSets.length === 0) {
      toast.error("No items to share", {
        description: "Save some LEGO sets first before sharing.",
      });
      return;
    }

    setSharing(true);
    try {
      const shareUrl = await onShare();
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!", {
        description: "Share link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Error", {
        description: "Failed to create share link. Please try again.",
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Saved LEGO Sets</SheetTitle>
          <SheetDescription>
            Your collection of saved LEGO sets ({savedSets.length} items)
          </SheetDescription>
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
                No saved LEGO sets yet. Search and save some sets to see them
                here!
              </p>
            ) : (
              savedSets.map((set) => (
                <Card
                  key={set.set_num}
                  className={`transition-colors ${
                    set.set_url ? "cursor-pointer hover:bg-muted/20" : ""
                  }`}
                  onClick={() => {
                    if (set.set_url) {
                      window.open(set.set_url, "_blank", "noopener,noreferrer");
                    }
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={set.set_img_url}
                          alt={set.name}
                          className="w-16 h-16 object-cover rounded-md bg-muted"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm truncate">
                              {set.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mb-2">
                              #{set.set_num}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{set.year}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ToyBrick className="h-3 w-3" />
                                <span>{set.num_parts} parts</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(set.set_num);
                            }}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {set.purchased && (
                      <Badge variant="secondary" className="mt-0">
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
  );
}
