"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { LegoSet } from "@/types/lego";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface LegoSearchProps {
  onSave: (set: LegoSet) => void;
  savedSets: Array<{ set_num: string }>;
  isAuthenticated: boolean;
  onSignIn: () => void;
}

export function LegoSearch({
  onSave,
  savedSets,
  isAuthenticated,
  onSignIn,
}: LegoSearchProps) {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LegoSet | null>(null);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error("Error", {
        description: "Please enter a LEGO set ID",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/lego/${searchId.trim()}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Not Found", {
            description:
              "LEGO set not found. Please check the ID and try again.",
          });
        } else {
          throw new Error("Failed to fetch LEGO set");
        }
        setResult(null);
        return;
      }

      const data = await response.json();
      setResult(data);
      toast.success("Success", {
        description: "LEGO set found!",
      });
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error", {
        description: "Failed to search for LEGO set. Please try again.",
      });
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      onSignIn();
      return;
    }

    if (result) {
      onSave(result);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Enter LEGO set ID (e.g., 75192)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{result.name}</CardTitle>
                <p className="text-muted-foreground">Set #{result.set_num}</p>
              </div>
              <Button
                onClick={handleSave}
                disabled={
                  isAuthenticated &&
                  savedSets.some((saved) => saved.set_num === result.set_num)
                }
              >
                {!isAuthenticated
                  ? "Sign In to Save"
                  : savedSets.some((saved) => saved.set_num === result.set_num)
                  ? "Already Saved"
                  : "Save"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {result.set_img_url && (
                  <Image
                    src={result.set_img_url || "/placeholder.svg"}
                    alt={result.name}
                    width={400}
                    height={256}
                    className="w-full h-64 object-contain rounded-lg bg-muted"
                  />
                )}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Year
                    </p>
                    <p className="text-lg">{result.year}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Parts
                    </p>
                    <p className="text-lg">{result.num_parts}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Theme ID
                  </p>
                  <Badge variant="secondary">{result.theme_id}</Badge>
                </div>
                {result.set_url && (
                  <div>
                    <a
                      href={result.set_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View on LEGO →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
