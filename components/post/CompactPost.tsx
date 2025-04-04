import { PostText } from "../PostText";
import { getPostUrl, getAuthorUrl } from "@/lib/utils/postUrls";
import { useSignal } from "@preact/signals";
import { PostReplies } from "@/components/post/PostReplies";
import { getFormattedDate, getTimeAgo } from "@/lib/utils/time";
import { Icon } from "@/components/Icon";
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import type { Signal } from "@preact/signals-core";
import type { ThreadReply } from "@/lib/types";

interface CompactPostProps {
	post: PostView;
	depth?: number;
	expanded?: boolean;
	replies?: ThreadReply[];
}

function ExpandButton({ isExpanded, post }: { isExpanded: Signal<boolean>, post: PostView }) {
	return (<button
		onClick={(e) => {
			e.stopPropagation();
			isExpanded.value = !isExpanded.value;
		}}
		className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-mono"
	>
		<span className="flex items-center gap-0.5 text-xs">
			{isExpanded.value ? "[-]" : "[+]"}
			<Icon name="comment" className="w-3 h-3" />
			{post.replyCount}
		</span>
	</button>)
}

export function CompactPost({
	post,
	depth = 0,
	expanded = false,
	replies,
}: CompactPostProps) {
	const isExpanded = useSignal(expanded);
	const postUrl = getPostUrl(post.author.handle, post.uri);
	const postAuthorUrl = getAuthorUrl(post.author.handle);
	const timeAgo = getTimeAgo(post.indexedAt);

	return (
		<article className={`relative min-w-0 ${depth > 0 ? "pl-3" : ""}`}>
			{/* Thread line */}
			{depth > 0 && (
				<div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
			)}

			<div className="flex items-start gap-2 py-1 px-3 hover:bg-gray-50 dark:hover:bg-gray-800">
				<div className="flex-1 min-w-0">
					{/* Post metadata row */}
					<div className="flex items-center gap-x-1.5 flex-wrap text-gray-500">
						<a
							href={postAuthorUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline font-medium text-gray-800 dark:text-gray-600 truncate max-w-[100px]"
							title={post.author.handle}
						>
							@{post.author.handle}
						</a>
						<span className="text-gray-400">·</span>
						<a
							href={postUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-400 hover:underline"
							title={getFormattedDate(post.indexedAt)}
						>
							{timeAgo}
						</a>
						{post.replyCount !== undefined && post.replyCount > 0 && (
							<ExpandButton isExpanded={isExpanded} post={post} />
						)}
					</div>

					{/* Post content */}
					<div className="text-sm break-words text-gray-900 dark:text-gray-100">
						<PostText record={post.record} truncate={true} />
					</div>
				</div>
			</div>
			{post.replyCount !== undefined && post.replyCount > 0 && (
				<PostReplies 
					post={post} 
					depth={depth + 1} 
					isExpanded={isExpanded} 
					prefetchedReplies={replies}
				/>
			)}
		</article>
	);
}
