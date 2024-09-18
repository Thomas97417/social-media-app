import kyInstance from "@/lib/ky";
import { CommentLikeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface CommentLikeButtonProps {
  postId: string;
  commentId: string;
  initialState: CommentLikeInfo;
}

export default function CommentLikeButton({
  postId,
  commentId,
  initialState,
}: CommentLikeButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["comment-like-info", postId, commentId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/posts/${postId}/comments/${commentId}/likes`)
        .json<CommentLikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance
            .delete(`/api/posts/${postId}/comments/${commentId}/likes`)
            .json()
        : kyInstance
            .post(`/api/posts/${postId}/comments/${commentId}/likes`)
            .json(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<CommentLikeInfo>(queryKey);
      queryClient.setQueryData<CommentLikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));
      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-1">
      <Heart
        className={cn(
          "size-4",
          data.isLikedByUser && "fill-red-500 text-red-500"
        )}
      />
      <span className="text-xs font-medium tabular-nums">{data.likes}</span>
    </button>
  );
}
