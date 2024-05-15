"use client";

import useSWRInfinite from "swr/infinite";

import type { Post } from "@/app/lib/server/parse-post";
import fetcher from "@/app/lib/utils/fetcher";
import PostList from ".";

type Props = {
  posts: Post[];
  urlPrefix: string;
  totalChunks: number;
};

const InfinitePostList = ({ posts, urlPrefix, totalChunks }: Props) => {
  const { data, size, setSize } = useSWRInfinite<typeof posts>(
    (i) => `${urlPrefix}-${i + 1}.json`,
    fetcher,
    {
      initialSize: 0,
      revalidateFirstPage: false,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return (
    <PostList
      posts={posts.concat(data?.flat() ?? [])}
      ending={
        data !== undefined && data.length + 1 < totalChunks
          ? {
              type: "loadMore",
              props: {
                callback:
                  data.length !== size ? () => {} : () => setSize(size + 1),
                loading: data.length !== size,
              },
            }
          : "end"
      }
    />
  );
};

export default InfinitePostList;
