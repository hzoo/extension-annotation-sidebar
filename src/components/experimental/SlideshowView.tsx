import {
	useSignal,
	useComputed,
	useSignalEffect,
} from "@preact/signals-react/runtime";
import { useEffect, useRef } from "react";
import { PostText } from "@/src/components/post/PostText";
import { PostEmbed } from "@/src/components/post/PostEmbed";
import { Icon } from "@/src/components/Icon";
import type { DisplayableItem } from "@/src/components/post/FullPost";
import type { ThreadNavigator } from "@/src/lib/threadNavigation";

interface SlideshowViewProps {
	displayItems: DisplayableItem[];
	navigator: ThreadNavigator;
}

export function SlideshowView({ displayItems, navigator }: SlideshowViewProps) {
	const allUris = navigator.chronologicalUris;

	const isTransitioning = useSignal(false);
	const slideContainerRef = useRef<HTMLDivElement>(null);
	const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
	const autoplayEnabled = useSignal(false);
	const showControls = useSignal(true);

	const currentSlideIndex = useComputed(() => {
		if (!navigator.cursor.value || allUris.length === 0) return 0;
		const index = allUris.findIndex((uri) => uri === navigator.cursor.value);
		return index === -1 ? 0 : index;
	});

	// Navigate to next slide using navigator
	const goToNextSlide = () => {
		isTransitioning.value = true;

		// Use chronological navigation for slideshow
		if (!navigator.moveToNext()) {
			// If at the end, loop back to beginning
			const firstUri = allUris[0];
			if (firstUri) navigator.moveTo(firstUri);
		}

		// Reset transition after delay
		setTimeout(() => {
			isTransitioning.value = false;
		}, 300);
	};

	// Navigate to previous slide using navigator
	const goToPrevSlide = () => {
		isTransitioning.value = true;

		// Use chronological navigation for slideshow
		if (!navigator.moveToPrev()) {
			// If at the beginning, loop to end
			const lastUri = allUris[allUris.length - 1];
			if (lastUri) navigator.moveTo(lastUri);
		}

		// Reset transition after delay
		setTimeout(() => {
			isTransitioning.value = false;
		}, 300);
	};

	// Toggle autoplay
	const toggleAutoplay = () => {
		autoplayEnabled.value = !autoplayEnabled.value;
	};

	// Handle autoplay with signal effect
	useSignalEffect(() => {
		if (autoplayEnabled.value) {
			autoplayTimerRef.current = setInterval(goToNextSlide, 5000);
		} else if (autoplayTimerRef.current) {
			clearInterval(autoplayTimerRef.current);
			autoplayTimerRef.current = null;
		}

		return () => {
			if (autoplayTimerRef.current) {
				clearInterval(autoplayTimerRef.current);
			}
		};
	});

	// Toggle controls visibility on mouse movement
	const handleMouseMove = () => {
		showControls.value = true;
		setTimeout(() => {
			showControls.value = false;
		}, 3000);
	};

	// Render the keyboard shortcuts help
	const renderKeyboardHelp = () => (
		<div className="p-3 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 rounded-md mb-4">
			<div className="font-medium mb-1">Keyboard Navigation:</div>
			<div className="grid grid-cols-2 gap-x-4 gap-y-1">
				<div>
					<kbd>←</kbd> / <kbd>k</kbd> Previous slide
				</div>
				<div>
					<kbd>→</kbd> / <kbd>j</kbd> Next slide
				</div>
				<div>
					<kbd>n</kbd> Next slide
				</div>
				<div>
					<kbd>p</kbd> Previous slide
				</div>
				<div>
					<kbd>r</kbd> First slide
				</div>
				<div>
					<kbd>Space</kbd> Toggle autoplay
				</div>
			</div>
		</div>
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: functions are stable in this context
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			const preventDefault = () => {
				e.preventDefault();
				e.stopPropagation();
			};

			let handled = true;
			switch (e.key) {
				case "ArrowRight":
				case "j":
					goToNextSlide();
					break;
				case "ArrowLeft":
				case "k":
					goToPrevSlide();
					break;
				case "n":
					goToNextSlide();
					break;
				case "p":
					goToPrevSlide();
					break;
				case "r":
					isTransitioning.value = true;
					navigator.moveToRoot();
					setTimeout(() => {
						isTransitioning.value = false;
					}, 300);
					break;
				case " ":
				case "Spacebar":
					toggleAutoplay();
					break;
				default:
					handled = false;
					break;
			}
			if (handled) {
				preventDefault();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [navigator, showControls]);

	if (!navigator.currentPost.value) return null;

	const currentNode = navigator.getCurrentNode();
	const isRoot = currentNode?.depth === 0;

	return (
		<div className="flex flex-col">
			{renderKeyboardHelp()}

			<div
				className="relative h-[70vh] overflow-hidden bg-black rounded-xl"
				onMouseMove={handleMouseMove}
				ref={slideContainerRef}
			>
				{/* Slides container */}
				<div
					className="h-full flex items-center justify-center transition-transform duration-300 ease-in-out"
					style={{
						transform: isTransitioning.value
							? "scale(0.95) opacity(0.7)"
							: "scale(1) opacity(1)",
					}}
				>
					{
						<div
							className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-y-auto max-h-[90%] relative"
							style={{
								padding: isRoot ? "2rem" : "1.5rem",
							}}
						>
							<div
								className={`absolute top-3 right-3 text-xs inline-block px-2 py-1 rounded-full ${isRoot ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
							>
								{currentSlideIndex.value + 1} / {allUris.length}
							</div>

							{/* Author information */}
							<div className="flex items-center mb-4 gap-2">
								{displayItems.includes("avatar") && (
									<img
										src={navigator.currentPost.value.author.avatar}
										alt={navigator.currentPost.value.author.displayName}
										className="w-12 h-12 rounded-full"
									/>
								)}

								<div>
									{displayItems.includes("displayName") && (
										<div className="font-semibold text-gray-900 dark:text-white">
											{navigator.currentPost.value.author.displayName}
										</div>
									)}
									{displayItems.includes("handle") && (
										<div className="text-gray-500 text-sm">
											@{navigator.currentPost.value.author.handle}
										</div>
									)}
								</div>
							</div>

							{/* Post content */}
							<div
								className={`prose prose-lg dark:prose-invert max-w-none mb-4 ${isRoot ? "text-xl" : "text-base"}`}
							>
								<PostText post={navigator.currentPost.value} />
							</div>

							{/* Embedded content */}
							<div className="mt-4">
								<PostEmbed post={navigator.currentPost.value} />
							</div>

							{/* Reply indicators */}
							{currentNode && currentNode.depth > 0 && (
								<div className="absolute left-0 top-0 h-full w-1 bg-blue-500 opacity-80" />
							)}
						</div>
					}
				</div>

				{/* Navigation controls (visible on hover) */}
				{showControls.value && (
					<div
						className={`absolute bottom-5 left-0 right-0 flex justify-center items-center gap-4 transition-opacity duration-300 ${showControls.value ? "opacity-100" : "opacity-0"}`}
					>
						<button
							onClick={goToPrevSlide}
							className="bg-white/20 hover:bg-white/40 text-white rounded-full p-3 backdrop-blur-sm transition-colors duration-200"
							title="Previous slide (k)"
						>
							<Icon name="leftArrow" className="size-6" />
						</button>

						<button
							onClick={toggleAutoplay}
							className={`rounded-full p-3 backdrop-blur-sm transition-colors duration-200 ${autoplayEnabled.value ? "bg-rose-500/70 hover:bg-rose-500/90" : "bg-blue-500/70 hover:bg-blue-500/90"} text-white`}
							title="Toggle autoplay (Space)"
						>
							<Icon
								name={autoplayEnabled.value ? "minusCircle" : "plusCircle"}
								className="size-6"
							/>
						</button>

						<button
							onClick={goToNextSlide}
							className="bg-white/20 hover:bg-white/40 text-white rounded-full p-3 backdrop-blur-sm transition-colors duration-200"
							title="Next slide (j)"
						>
							<Icon name="rightArrow" className="size-6" />
						</button>
					</div>
				)}

				{/* Progress bar */}
				<div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
					<div
						className="h-full bg-blue-500 transition-all duration-300"
						style={{
							width: `${allUris.length > 1 ? (currentSlideIndex.value / (allUris.length - 1)) * 100 : 0}%`,
						}}
					/>
				</div>
			</div>
		</div>
	);
}
