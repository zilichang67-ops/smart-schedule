"use client";

import { useState } from "react";
import { format, startOfWeek } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";

interface Props {
  view: "week" | "day" | "month";
  currentDate: Date;
  onJumpToDate: (date: Date) => void;
}

export function JumpToDate({ view, currentDate, onJumpToDate }: Props) {
  const [open, setOpen] = useState(false);

  const label =
    view === "day"
      ? format(currentDate, "MMM d, yyyy")
      : view === "week"
      ? `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")}`
      : format(currentDate, "MMMM yyyy");

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onJumpToDate(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 px-2 text-xs rounded-md hover:bg-muted ghost">
        <CalendarDays className="h-3.5 w-3.5" />
        <span className="hidden sm:inline max-w-[160px] truncate">{label}</span>
        <span className="sm:hidden">Date</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
