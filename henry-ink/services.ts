import { useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { contentStateSignal } from "@/henry-ink/signals";
import { currentUrl } from "@/src/lib/messaging";
import { useEffect } from "preact/hooks";

async function fetchSimplifiedContent(targetUrl: string) {
	if (!targetUrl || !targetUrl.startsWith("http")) {
		contentStateSignal.value = {
			type: "error",
			message: "Invalid URL provided for fetching.",
		};
		return;
	}

	contentStateSignal.value = { type: "loading" };

	try {
		// The worker expects the target URL as a path segment AFTER the initial slash.
		// So, if targetUrl is "https://example.com", the request path to worker is "/https://example.com"
		const response = await fetch(`${import.meta.env.VITE_JINA_URL}/${targetUrl}`);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Worker error: ${response.status} ${response.statusText}. ${errorText}`,
			);
		}
		const content = await response.text();
		
		// Extract title from the content (look for first h1 or title tag)
		let title = '';
		try {
			const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i) || 
							   content.match(/^#\s+(.+)$/m) ||
							   content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
			if (titleMatch) {
				title = titleMatch[1].trim();
			}
		} catch (e) {
			// Ignore title extraction errors
		}
		
		contentStateSignal.value = { type: "success", content, title };
	} catch (e: unknown) {
		console.error("Fetch error:", e);
		contentStateSignal.value = {
			type: "error",
			message:
				e.message || "An unexpected error occurred while fetching content.",
		};
	}
}

// Custom hook to sync URL path from address bar with currentUrl
export function useUrlPathSyncer() {
	const location = useLocation();

	useEffect(() => {
		const currentPath = location.path;
		if (currentPath.length > 1 && currentPath.startsWith("/")) {
			const potentialUrl = currentPath.substring(1); // Remove leading '/'
			if (potentialUrl.startsWith("http")) {
				if (currentUrl.value !== potentialUrl) {
					currentUrl.value = potentialUrl;
				}
			}
		} else if (currentPath === "/") {
			// Clear everything when at root
			if (currentUrl.value) {
				currentUrl.value = "";
			}
		}
	}, [location.path]);
}

// Effect to fetch content when currentUrl changes
export function useContentFetcher() {
	useSignalEffect(() => {
		if (currentUrl.value?.startsWith("http")) {
			fetchSimplifiedContent(currentUrl.value);
		} else {
			// If targetUrl is cleared or invalid, reset to idle
			if (!currentUrl.value) {
				contentStateSignal.value = { type: "idle" };
			}
		}
	});
}
