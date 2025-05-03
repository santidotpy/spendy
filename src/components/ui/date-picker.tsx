"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "~/components/ui/calendar"
import { Button } from "~/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { CalendarIcon } from "lucide-react"

// Include the cn utility function directly to avoid import issues
function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return inputs.filter(Boolean).join(" ")
}

export interface DatePickerRef {
  openPopover: () => void
}

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  disabled?: boolean
  disabledDates?: (date: Date) => boolean
  placeholder?: string
}

export const DatePicker = React.forwardRef<DatePickerRef, DatePickerProps>(
  ({ value, onChange, disabled, disabledDates, placeholder = "Selecciona una fecha" }, ref) => {
    const [open, setOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLButtonElement>(null)

    const openPopover = React.useCallback(() => {
      setOpen(true)
    }, [])

    React.useImperativeHandle(ref, () => ({
      openPopover,
    }))

    return (
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant={"outline"}
            disabled={disabled}
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
            onClick={() => setOpen(true)}
            onTouchEnd={(e) => {
              e.preventDefault()
              setOpen(true)
            }}
          >
            {value ? format(value, "PPP", { locale: es }) : <span>{placeholder}</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
            disabled={disabledDates}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    )
  },
)

DatePicker.displayName = "DatePicker"