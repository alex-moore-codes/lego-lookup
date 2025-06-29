"use client";

import { LegoSearch } from "@/components/lego-search";
import { SavedItemsSheet } from "@/components/saved-items-sheet";
import { SharedListViewer } from "@/components/shared-list-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useToast } from "@/hooks/use-toast";
import type { LegoSet, SavedLegoSet } from "@/types/lego";
import { useClerk, useUser } from "@clerk/nextjs";
import { Bookmark, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const { signOut, openSignIn } = useClerk();
  const [savedSets, setSavedSets] = useState<SavedLegoSet[]>([]);
  const { toast } = useToast();

  // Check for shared list in URL
  const [sharedListId, setSharedListId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get("shared");
    if (shared) {
      setSharedListId(shared);
    }
  }, []);

  useEffect(() => {
    if (user?.unsafeMetadata?.savedSets) {
      setSavedSets(user.unsafeMetadata.savedSets as SavedLegoSet[]);
    }
  }, [user]);

  const handleSave = async (set: LegoSet) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save LEGO sets.",
        variant: "destructive",
      });
      return;
    }

    const savedSet: SavedLegoSet = {
      ...set,
      savedAt: new Date().toISOString(),
    };

    const updatedSets = [...savedSets, savedSet];
    setSavedSets(updatedSets);

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          savedSets: updatedSets,
        },
      });
    } catch (error) {
      console.error("Error saving set:", error);
      setSavedSets(savedSets); // Revert on error
      toast({
        title: "Error",
        description: "Failed to save LEGO set. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (setNum: string) => {
    const updatedSets = savedSets.filter((set) => set.set_num !== setNum);
    setSavedSets(updatedSets);

    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          savedSets: updatedSets,
        },
      });
      toast({
        title: "Removed",
        description: "LEGO set removed from your collection.",
      });
    } catch (error) {
      console.error("Error removing set:", error);
      setSavedSets(savedSets); // Revert on error
      toast({
        title: "Error",
        description: "Failed to remove LEGO set. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    const shareId = `${user.id}-${Date.now()}`;
    const sharedList = {
      id: shareId,
      userId: user.id,
      sets: savedSets,
      createdAt: new Date().toISOString(),
    };

    const existingSharedLists =
      (user.unsafeMetadata.sharedLists as Array<{
        id: string;
        userId: string;
        sets: Array<unknown>;
        createdAt: string;
      }>) || [];
    const updatedSharedLists = [...existingSharedLists, sharedList];

    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        sharedLists: updatedSharedLists,
      },
    });

    return `${window.location.origin}?shared=${shareId}`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show shared list view if accessing a shared link
  if (sharedListId) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">LEGO Lookup</h1>
              <Button
                variant="outline"
                onClick={() => {
                  window.history.replaceState({}, "", window.location.pathname);
                  setSharedListId(null);
                }}
              >
                Back to Search
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <SharedListViewer listId={sharedListId} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">LEGO Lookup</h1>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              {user ? (
                <>
                  <SavedItemsSheet
                    savedSets={savedSets}
                    onRemove={handleRemove}
                    onShare={handleShare}
                  >
                    <Button variant="outline">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Saved ({savedSets.length})
                    </Button>
                  </SavedItemsSheet>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">
                      {user.firstName || user.emailAddresses[0]?.emailAddress}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={() => openSignIn()}>
                  Sign In with Google
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search LEGO Sets</CardTitle>
              <p className="text-muted-foreground">
                Enter a LEGO set ID to find detailed information about any LEGO
                set.
              </p>
            </CardHeader>
            <CardContent>
              <LegoSearch onSave={handleSave} />
            </CardContent>
          </Card>

          {!user && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Sign in to save your favorite sets
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create an account to save LEGO sets and share your
                    collection with others.
                  </p>
                  <Button onClick={() => openSignIn()}>
                    Sign In with Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
