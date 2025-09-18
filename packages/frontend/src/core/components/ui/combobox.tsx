import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { ChevronDown, Check, Plus } from "lucide-react"

export interface ComboboxOption {
  value: string
  label: string
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  allowCreate?: boolean
  onCreateNew?: (value: string) => void
  createText?: string
}

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({
    options,
    value,
    onValueChange,
    placeholder = "Pilih...",
    searchPlaceholder = "Cari...",
    emptyText = "Tidak ada data ditemukan",
    className,
    disabled = false,
    allowCreate = false,
    onCreateNew,
    createText = "Tambah baru"
  }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const [inputValue, setInputValue] = React.useState("")
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Find selected option
    const selectedOption = options.find(option => option.value === value)

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
      if (!search) return options
      return options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        option.value.toLowerCase().includes(search.toLowerCase())
      )
    }, [options, search])

    // Handle option selection
    const handleSelect = (optionValue: string) => {
      onValueChange?.(optionValue)
      setOpen(false)
      setSearch("")
    }

    // Handle create new
    const handleCreateNew = () => {
      if (search.trim() && onCreateNew) {
        onCreateNew(search.trim())
        setOpen(false)
        setSearch("")
      }
    }

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setOpen(false)
          setSearch("")
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Update input value when value changes
    React.useEffect(() => {
      setInputValue(selectedOption?.label || "")
    }, [selectedOption])

    // Handle input focus
    const handleInputFocus = () => {
      setOpen(true)
      setSearch(inputValue)
    }

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setSearch(newValue)
      setOpen(true)
    }

    // Handle key navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setSearch("")
      }
    }

    return (
      <div ref={ref} className={cn("relative", className)}>
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-8"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
            onClick={() => setOpen(!open)}
            disabled={disabled}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </Button>
        </div>

        {open && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.length === 0 ? (
              <div className="p-2">
                <div className="text-sm text-gray-500 text-center py-2">
                  {emptyText}
                </div>
                {allowCreate && search.trim() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleCreateNew}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createText}: "{search.trim()}"
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-between",
                      value === option.value && "bg-accent"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span>{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                ))}
                {allowCreate && search.trim() && !filteredOptions.some(opt =>
                  opt.label.toLowerCase() === search.trim().toLowerCase()
                ) && (
                  <div className="border-t pt-1 mt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleCreateNew}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {createText}: "{search.trim()}"
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

Combobox.displayName = "Combobox"