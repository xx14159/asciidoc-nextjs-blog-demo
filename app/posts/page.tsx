import { Metadata } from "next";

import chunk from "lodash/chunk";

import HrTitle from "@/app/components/hr-title";
import InfinitePostList from "@/app/components/post-list/infinite";
import { postChunkSize, basePrefix, imgPrefix } from "@/app/lib/server/env";
import { getAllPublicPosts, savePostsData } from "@/app/lib/server/parse-post";

export const generateMetadata = (): Metadata => {
  const title = "Posts";
  const url = new URL("posts", basePrefix);
  return {
    title,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      images: new URL("og.png", imgPrefix),
      url,
    },
  };
};

const getData = async () => {
  const postsLists = chunk(await getAllPublicPosts(), postChunkSize);
  const urlPrefix = await savePostsData(postsLists, "POSTS");
  const totalChunks = postsLists.length;
  return { posts: postsLists[0], urlPrefix, totalChunks };
};

const Page = async () => {
  const { posts, urlPrefix, totalChunks } = await getData();

  return (
    <article className="tw-mx-auto tw-max-w-screen-lg tw-pb-32 tw-pt-16">
      <HrTitle>POSTS</HrTitle>

      <InfinitePostList
        posts={posts}
        urlPrefix={urlPrefix}
        totalChunks={totalChunks}
      />
    </article>
  );
};

export default Page;
