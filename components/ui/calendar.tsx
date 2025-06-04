"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  showYearPicker?: boolean;
};

// Year Picker Component
function YearPicker({
  selectedYear,
  onYearChange,
}: {
  selectedYear: number;
  onYearChange: (year: number) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <Select
      value={selectedYear.toString()}
      onValueChange={(value) => onYearChange(parseInt(value))}
    >
      <SelectTrigger className="w-[80px] h-8 text-xs border-gray-200">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        <div className="max-h-[160px] overflow-y-auto">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()} className="text-sm">
              {year}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showYearPicker = false,
  ...props
}: CalendarProps) {
  // Handle initial month state
  const getInitialMonth = () => {
    if (props.month) return props.month;
    const selected = (props as any).selected;
    if (selected instanceof Date) return selected;
    return new Date();
  };

  const [currentMonth, setCurrentMonth] = React.useState(getInitialMonth());

  const handleYearChange = (year: number) => {
    const newDate = new Date(year, currentMonth.getMonth());
    setCurrentMonth(newDate);
    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }
  };

  // Update month when props change
  React.useEffect(() => {
    if (props.month) {
      setCurrentMonth(props.month);
    }
  }, [props.month]);

  // Update month when selected date changes
  React.useEffect(() => {
    const selected = (props as any).selected;
    if (selected instanceof Date) {
      setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth()));
    }
  }, [(props as any).selected]);

  // Fixed grid-based calendar styling
  const gridStyles = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium",
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse",
    head_row: "grid grid-cols-7 mb-1",
    head_cell: "text-muted-foreground text-center text-xs font-medium py-2",
    row: "grid grid-cols-7 mt-0",
    cell: "text-center p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
    day: cn(
      buttonVariants({ variant: "ghost" }),
      "h-9 w-9 p-0 font-normal aria-selected:opacity-100 mx-auto"
    ),
    day_selected:
      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside:
      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle:
      "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
    ...classNames,
  };

  if (showYearPicker) {
    return (
      <div className="w-auto bg-white rounded-md border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
          <div className="text-sm font-medium text-gray-700">
            {currentMonth.toLocaleDateString("en-US", { month: "long" })}
          </div>
          <YearPicker
            selectedYear={currentMonth.getFullYear()}
            onYearChange={handleYearChange}
          />
        </div>
        <div className="p-3">
          <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-0", className)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            classNames={gridStyles}
            modifiers={{
              today: new Date(),
            }}
            modifiersClassNames={{
              today: "bg-accent text-accent-foreground",
            }}
            {...props}
          />
        </div>
      </div>
    );
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={gridStyles}
      modifiers={{
        today: new Date(),
      }}
      modifiersClassNames={{
        today: "bg-accent text-accent-foreground",
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };