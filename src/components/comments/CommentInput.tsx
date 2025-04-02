import { PostData } from "@/lib/types";
import { useSubmitCommentMutation } from "./mutation";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, SendHorizontal } from "lucide-react";

interface CommentInputProps {
  post: PostData;
}

export default function CommentInput({ post }: CommentInputProps) {
  const [input, setInput] = useState("");

  const mutation = useSubmitCommentMutation(post.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input) return;

    mutation.mutate(
      {
        post,
        content: input,
      },
      {
        onSuccess: () => setInput(""),
      },
    );
  }
  return (
    <form action="submit" className="items-centered flex w-full gap-2">
      <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        onClick={onSubmit}
        disabled={!input.trim() || mutation.isPending}
      >
        {!mutation.isPending ? (
          <SendHorizontal />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
