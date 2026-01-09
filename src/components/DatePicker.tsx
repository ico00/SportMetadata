import { useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  className?: string;
}

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DatePicker({
  value,
  onChange,
  id,
  required = false,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Format date for display (YYYY-MM-DD)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Update display when value changes
  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value));
    if (value) {
      setCurrentMonth(new Date(value + "T00:00:00"));
    }
  }, [value]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  const handleDisplayClick = () => {
    setIsOpen(!isOpen);
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const selectedDate = new Date(year, month, day);
    const dateString = selectedDate.toISOString().split("T")[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    onChange(dateString);
    setIsOpen(false);
  };

  // Generate days in month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days = [];
    
    // Empty days at start
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const days = getDaysInMonth();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Display input */}
      <div className="relative">
        <input
          type="text"
          id={id}
          value={displayValue}
          readOnly
          onClick={handleDisplayClick}
          placeholder="YYYY-MM-DD"
          required={required}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all cursor-pointer pr-10"
        />
        <button
          type="button"
          onClick={handleDisplayClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-600 transition-colors"
          aria-label="Open calendar"
        >
          <FaCalendarAlt className="h-4 w-4" />
        </button>
      </div>

      {/* Custom calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-gray-600 bg-gray-800 p-4 shadow-xl animate-slide-down">
          {/* Header with month and year */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors"
              aria-label="Previous month"
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-lg font-semibold text-gray-200">
              {MONTHS_EN[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors"
              aria-label="Next month"
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of week */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS_EN.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="py-2" />;
              }

              const isSelected =
                selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth.getMonth() &&
                selectedDate.getFullYear() === currentMonth.getFullYear();

              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === currentMonth.getMonth() &&
                new Date().getFullYear() === currentMonth.getFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`py-2 text-sm transition-all duration-200 ${
                    isSelected
                      ? "rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 shadow-md"
                      : isToday
                      ? "rounded-full bg-green-900/30 text-green-400 border border-green-600/50 hover:bg-green-900/50"
                      : "rounded text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleToday}
              className="rounded-lg bg-green-900/30 border border-green-600/50 px-4 py-2 text-sm font-medium text-green-400 transition-all duration-200 hover:bg-green-900/50 hover:border-green-500"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
