import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown } from "react-icons/fa";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  focusColor?: "blue" | "green" | "yellow";
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "-- Select --",
  id,
  className = "",
  focusColor = "blue",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, openAbove: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Find selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside container and dropdown menu
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(target instanceof Element && target.closest('[data-dropdown-menu]'))
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

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 240; // max-h-60 = 15rem = 240px
      const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      
      setPosition({
        top: openAbove 
          ? rect.top
          : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        openAbove,
      });
    }
    setIsOpen(!isOpen);
  };

  // Update position on scroll/resize when open
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current!.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 240; // max-h-60 = 15rem = 240px
        const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        
        setPosition({
          top: openAbove 
            ? rect.top
            : rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          openAbove,
        });
      };

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Focus color classes
  const focusClasses = {
    blue: "focus:ring-blue-500/50 focus:border-blue-500 hover:border-blue-400/60",
    green: "focus:ring-green-500/50 focus:border-green-500 hover:border-green-400/60",
    yellow: "focus:ring-yellow-500/50 focus:border-yellow-500 hover:border-yellow-400/60",
  };

  // Selected option color classes
  const selectedClasses = {
    blue: "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md",
    green: "bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-md",
    yellow: "bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold shadow-md",
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Display button */}
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={handleToggle}
        className={`w-full px-4 py-3 bg-gradient-to-r from-gray-700/90 to-gray-700/70 border-2 border-gray-600/80 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-700/90 text-gray-100 shadow-inner cursor-pointer text-left flex items-center justify-between ${focusClasses[focusColor]}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex-1 text-lg font-semibold">{displayValue}</span>
        <FaChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen &&
        createPortal(
          <div
            data-dropdown-menu
            className={`fixed z-[9999] rounded-xl border-2 border-gray-600/80 bg-gradient-to-b from-gray-800 to-gray-800/95 p-2 shadow-xl max-h-60 overflow-y-auto animate-slide-down`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              transform: position.openAbove ? 'translateY(-100%)' : 'translateY(0)',
            }}
          >
            {options.length === 0 ? (
            <div className="px-4 py-3 text-gray-400 text-center">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? selectedClasses[focusColor]
                      : "text-gray-100 hover:bg-gray-700/80 hover:text-white font-medium"
                  }`}
                  style={{
                    fontSize: "1.05rem",
                    letterSpacing: "0.01em",
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  {option.label}
                </button>
              );
            })
          )}
          </div>,
          document.body
        )}
    </div>
  );
}