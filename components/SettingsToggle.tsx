import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { BlueskySettings } from "./BlueskySettings";
import { autoFetchEnabled } from "@/lib/settings";
import { Icon } from "@/components/Icon";
import { lastSeenVersion } from "@/lib/signals";

export function SettingsToggle() {
  const isOpen = useSignal(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        isOpen.value = false;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings button with integrated privacy indicator */}
      <button
        className="relative p-1.5 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
        onClick={toggleDropdown}
        aria-label="Settings"
      >
        {/* Auto-fetch indicator */}
        <div 
          className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${
            autoFetchEnabled.value ? 'bg-green-500' : 'bg-yellow-500'
          } flex items-center justify-center`}
          title={autoFetchEnabled.value ? 'Auto-fetch enabled - Posts are automatically loaded' : 'Auto-fetch disabled - Manual refresh only'}
        >
          {autoFetchEnabled.value && (
            <Icon name="circle" className="h-2.5 w-2.5" />
          )}
        </div>
        {/* Settings icon */}
        <Icon name="cog" className="h-5 w-5" />
      </button>

      {/* Settings dropdown */}
      {isOpen.value && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 dark:border-gray-700 animate-slideDown">
          <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 py-2 px-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Privacy & Settings
            </h3>
          </div>
          <BlueskySettings />
          
          {/* GitHub Repository Link & Welcome Button - Styled as setting rows */}
          <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Source Code Row */}
            <a 
              href="https://github.com/hzoo/extension-annotation-sidebar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Source Code (GitHub)
              </span>
              <Icon name="github" className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </a>
            {/* Show Welcome Message Row */}
            <button
              onClick={() => { lastSeenVersion.value = "0.0.0"; isOpen.value = false; }}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-left"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Show Welcome
              </span>
              <Icon name="arrowPath" className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}