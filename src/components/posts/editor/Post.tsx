import UserAvatar from "@/components/UserAvatar";
import { PostData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";

interface PostProps {
  post: PostData;
}
export default function Post({ post }: PostProps) {
  return (
    <article className="rounded-2xl space-y-3 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/users/${post.user.username}`}
          className="flex items-center gap-2"
        >
          <UserAvatar avatarUrl={post.user.avatarUrl} />
        </Link>
        <div>
          <Link
            href={`/users/${post.user.username}`}
            className="block font-medium hover:underline"
          >
            {post.user.displayName}
          </Link>
          <Link
            href={`/posts/${post.id}`}
            className="block text-sm text-muted-foreground hover:underline"
          >
            {/* {formatRelativeDate(post.createdAt)} */}
          </Link>
        </div>
      </div>
      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  );
}
