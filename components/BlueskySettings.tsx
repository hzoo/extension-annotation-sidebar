import { useSignal } from "@preact/signals";
import {
	autoFetchEnabled,
	addDomainToWhitelist,
	removeDomainFromWhitelist,
} from "@/lib/settings";
import { WhitelistedSitesManager } from "./WhitelistedSitesManager";
import { currentDomain, isWhitelisted } from "@/lib/messaging";

const handleAutoFetchToggle = () => {
	autoFetchEnabled.value = !autoFetchEnabled.value;
};

export function BlueskySettings() {
	const showWhitelistManager = useSignal(false);
	const handleWhitelistToggle = async () => {       
		if (isWhitelisted.value) {
			await removeDomainFromWhitelist(currentDomain.value);
		} else {
			await addDomainToWhitelist(currentDomain.value);
		}
	};

	return (
		<div className="space-y-4">
			{/* Privacy Settings */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between mb-2 gap-1">
					<div>
						<label
							htmlFor="auto-fetch"
							className="text-sm font-medium text-gray-900 dark:text-gray-100"
						>
							Auto-search posts
						</label>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							{autoFetchEnabled.value
								? "Posts searched automatically for whitelisted sites"
								: "Manual search only"}
						</p>
					</div>
					<label className="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							id="auto-fetch"
							className="sr-only"
							checked={autoFetchEnabled.value}
							onChange={handleAutoFetchToggle}
						/>
						<div
							className={`w-9 h-5 rounded-full transition ${
								autoFetchEnabled.value
									? "bg-green-600"
									: "bg-gray-300 dark:bg-gray-600"
							} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
								autoFetchEnabled.value ? "after:translate-x-4" : ""
							}`}
						/>
					</label>
				</div>

				{/* Whitelist toggle for current site */}
				{autoFetchEnabled.value && currentDomain.value && (
					<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
						<div className="flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{currentDomain.value}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{isWhitelisted.value
											? "Auto-search enabled"
											: "Auto-search disabled"}
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										className="sr-only"
										checked={isWhitelisted.value}
										onChange={handleWhitelistToggle}
									/>
									<div
										className={`w-9 h-5 rounded-full transition ${
											isWhitelisted.value
												? "bg-green-600"
												: "bg-gray-300 dark:bg-gray-600"
										} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
											isWhitelisted.value ? "after:translate-x-4" : ""
										}`}
									/>
								</label>
							</div>
							<button
								onClick={() => (showWhitelistManager.value = true)}
								className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-left flex items-center gap-1"
							>
								<span>View all whitelisted sites</span>
								<Icon name="rightArrow" className="h-3 w-3" />
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Whitelisted Sites Manager Modal */}
			{showWhitelistManager.value && (
				<WhitelistedSitesManager
					onClose={() => (showWhitelistManager.value = false)}
				/>
			)}
		</div>
	);
}
