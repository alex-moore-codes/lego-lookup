"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { SharedList } from "@/types/lego";
import { Calendar, Check, Loader2, ToyBrick } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface SharedListViewerProps {
  listId: string;
}

export function SharedListViewer({ listId }: SharedListViewerProps) {
  const [sharedList, setSharedList] = useState<SharedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchSharedList = useCallback(async () => {
    try {
      const response = await fetch(`/api/shared/${listId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch shared list");
      }
      const data = await response.json();
      setSharedList(data);
    } catch (error) {
      console.error("Error fetching shared list:", error);
      toast.error("Error", {
        description: "Failed to load shared list. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchSharedList();
  }, [fetchSharedList]);

  const togglePurchased = async (setNum: string, purchased: boolean) => {
    setUpdating(setNum);
    try {
      const response = await fetch(`/api/shared/${listId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ setNum, purchased }),
      });

      if (!response.ok) {
        throw new Error("Failed to update purchase status");
      }

      // Update local state
      if (sharedList) {
        const updatedSets = sharedList.sets.map((set) =>
          set.set_num === setNum ? { ...set, purchased } : set
        );
        setSharedList({ ...sharedList, sets: updatedSets });
      }

      toast.success("Updated", {
        description: `Marked as ${purchased ? "purchased" : "not purchased"}`,
      });
    } catch (error) {
      console.error("Error updating purchase status:", error);
      toast.error("Error", {
        description: "Failed to update purchase status.",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!sharedList) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Shared list not found</h2>
        <p className="text-muted-foreground">
          The shared list you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Shared LEGO Collection</h1>
        <p className="text-muted-foreground mt-2">
          {sharedList.sets.length} LEGO sets • Shared on{" "}
          {new Date(sharedList.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-4">
        {sharedList.sets.map((set) => (
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
            <CardHeader className="pb-3">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={set.set_img_url}
                    alt={set.name}
                    className="w-32 h-32 object-cover rounded-lg bg-muted"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-xl">{set.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    #{set.set_num}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{set.year}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ToyBrick className="h-4 w-4" />
                      <span>{set.num_parts} parts</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant={set.purchased ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePurchased(set.set_num, !set.purchased);
                  }}
                  disabled={updating === set.set_num || set.purchased}
                  className={`w-fit`}
                >
                  {updating === set.set_num ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {set.purchased ? "Purchased" : "Mark as Purchased"}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
