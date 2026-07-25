"use client";

import { useState } from "react";
import { type Activity } from "@/types/activity";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  onParse: (activities: Omit<Activity, "id" | "user_id" | "created_at">[]) => Promise<void>;
  parsing: boolean;
  setParsing: (v: boolean) => void;
  compact?: boolean;
}

export function InputPanel({ onParse, parsing, setParsing, compact }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setError("");
    setParsing(true);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to parse");
        return;
      }

      await onParse(data.activities);
      setText("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setParsing(false);
    }
  };

  if (compact) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Textarea
            placeholder="Or paste notes here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[80px] bg-background resize-none text-sm"
            disabled={parsing}
          />
          <Button
            onClick={handleGenerate}
            disabled={parsing || !text.trim()}
            size="lg"
            className="shrink-0 bg-primary hover:bg-primary/90"
          >
            {parsing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Quick Add
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Paste notes here for quick parsing..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px] bg-background resize-none"
            disabled={parsing}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleGenerate}
            disabled={parsing || !text.trim()}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {parsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Parse Notes
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
