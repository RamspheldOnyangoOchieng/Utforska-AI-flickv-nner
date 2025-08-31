"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DateRangePicker({ className, dateRange, setDateRange }) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Predefined date ranges
  const selectPredefinedRange = (range) => {
    const today = new Date()
    let from, to

    switch (range) {
      case "today":
        from = today
        to = today
        break
      case "yesterday":
        from = new Date(today)
        from.setDate(today.getDate() - 1)
        to = from
        break
      case "last7days":
        from = new Date(today)
        from.setDate(today.getDate() - 6)
        to = today
        break
      case "last30days":
        from = new Date(today)
        from.setDate(today.getDate() - 29)
        to = today
        break
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case "lastMonth":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        to = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      case "clear":
        from = null
        to = null
        break
      default:
        return
    }

    setDateRange({ from, to })
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn("justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => selectPredefinedRange("today")}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectPredefinedRange("yesterday")}>
                Yesterday
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectPredefinedRange("last7days")}>
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectPredefinedRange("last30days")}
                size="sm"
                onClick={() => selectPredefinedRange("last30days")}
              >
                Last 30 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectPredefinedRange("thisMonth")}>
                This Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectPredefinedRange("lastMonth")}>
                Last Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectPredefinedRange("clear")}>
                Clear
              </Button>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
