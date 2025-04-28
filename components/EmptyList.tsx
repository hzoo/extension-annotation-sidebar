import { autoFetchEnabled } from "@/lib/settings";
import { ManualFetchButton } from "@/components/ManualFetchButton";
import { WhitelistButton } from "@/components/WhitelistButton";
import { isWhitelisted, currentDomain, isSearchableUrl, currentUrl } from "@/lib/messaging";
import { Icon } from "@/components/Icon";
import { error } from "@/lib/signals";
import { loading } from "@/lib/signals";
import { currentPosts } from "@/lib/signals";

export function EmptyList() {
  if (currentPosts.value.length > 0 || loading.value || error.value) {
    return null;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
        <Icon name="comment" className="h-6 w-6 text-gray-900 dark:text-gray-100" />
      </div>
      
      {!isSearchableUrl.value ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            not searching this type of page: {currentUrl.value}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Thanks for trying out the annotation sidebar!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            - Henry
          </p>
          <a 
            href="https://github.com/hzoo/extension-annotation-sidebar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600 rounded-md transition-colors duration-150 ease-in-out"
          >
            View on GitHub
          </a>
        </>
      ) : autoFetchEnabled.value ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {isWhitelisted.value ? 
              "No posts found yet" :
              "Enable auto-search for this site?"
            }
          </h3>
          {isWhitelisted.value ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              No one has shared this page on Bluesky yet. Be the first!
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                To protect your privacy, auto-search needs to be enabled for 
                <span className="font-semibold font-mono text-gray-700 dark:text-gray-300 ml-1">{currentDomain.value}</span>
              </p>
              <div className="space-y-3 flex flex-col items-center">
                <div className="relative group">
                  <WhitelistButton />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-max">
                    Permanently save {currentDomain.value} to whitelist
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Or search manually:
                </div>
                
                <div className="relative group">
                  <ManualFetchButton />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-max">
                    One-time search only
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Manual mode
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Search Bluesky for posts about {currentDomain.value}
          </p>
          <ManualFetchButton />
        </>
      )}
    </div>
  );
} 