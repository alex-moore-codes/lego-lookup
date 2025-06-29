"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { SharedList } from "@/types/lego";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface SharedListViewerProps {
  listId: string;
}

export function SharedListViewer({ listId }: SharedListViewerProps) {
  const [sharedList, setSharedList] = useState<SharedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to load shared list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [listId, toast]);

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

      toast({
        title: "Updated",
        description: `Marked as ${purchased ? "purchased" : "not purchased"}`,
      });
    } catch (error) {
      console.error("Error updating purchase status:", error);
      toast({
        title: "Error",
        description: "Failed to update purchase status.",
        variant: "destructive",
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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Shared LEGO Collection</h1>
        <p className="text-muted-foreground mt-2">
          {sharedList.sets.length} LEGO sets • Shared on{" "}
          {new Date(sharedList.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-4">
        {sharedList.sets.map((set) => (
          <Card key={set.set_num}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{set.name}</CardTitle>
                  <p className="text-muted-foreground">Set #{set.set_num}</p>
                </div>
                <Button
                  variant={set.purchased ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePurchased(set.set_num, !set.purchased)}
                  disabled={updating === set.set_num}
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
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {set.set_img_url && (
                    <Image
                      src={set.set_img_url || "/placeholder.svg"}
                      alt={set.name}
                      width={400}
                      height={192}
                      className="w-full h-48 object-contain rounded-lg bg-muted"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Year
                      </p>
                      <p className="text-lg">{set.year}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Parts
                      </p>
                      <p className="text-lg">{set.num_parts}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Theme ID
                    </p>
                    <Badge variant="secondary">{set.theme_id}</Badge>
                  </div>
                  {set.set_url && (
                    <div>
                      <a
                        href={set.set_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        View on Rebrickable
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  )}
                  {set.purchased && (
                    <Badge variant="default">
                      <Check className="h-3 w-3 mr-1" />
                      Purchased
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
