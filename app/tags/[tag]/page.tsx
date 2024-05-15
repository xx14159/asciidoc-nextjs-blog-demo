import { Metadata } from "next";

import chunk from "lodash/chunk";
import uniq from "lodash/uniq";

import HrTitle from "@/app/components/hr-title";
import InfinitePostList from "@/app/components/post-list/infinite";
import { postChunkSize, basePrefix, imgPrefix } from "@/app/lib/server/env";
import { getAllPublicPosts, savePostsData } from "@/app/lib/server/parse-post";

type Props = { params: { tag: string } };

export const generateMetadata = ({ params: { tag } }: Props): Metadata => {
  const title = `TAG · ${tag.toUpperCase()}`;
  const url = new URL(`tags/${tag}`, basePrefix);
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

export const dynamicParams = false;

export const generateStaticParams = async () => {
  const allTags = uniq(
    (await getAllPublicPosts()).map((post) => post.pageTags).flat(),
  );
  return allTags.map((tag) => ({ tag }));
};

const getData = async (tag: string) => {
  const postsLists = chunk(
    (await getAllPublicPosts()).filter((post) => post.pageTags.includes(tag)),
    postChunkSize,
  );
  const urlPrefix = await savePostsData(
    postsLists,
    `TAG · ${tag}`.toUpperCase(),
  );
  const totalChunks = postsLists.length;
  return { posts: postsLists[0], urlPrefix, totalChunks };
};

const Page = async ({ params: { tag } }: Props) => {
  const { posts, urlPrefix, totalChunks } = await getData(tag);

  return (
    <article className="tw-mx-auto tw-max-w-screen-lg tw-pb-32 tw-pt-16">
      <HrTitle spacing="0.2em">{`TAG · ${tag.toUpperCase()}`}</HrTitle>

      <InfinitePostList
        posts={posts}
        urlPrefix={urlPrefix}
        totalChunks={totalChunks}
      />
    </article>
  );
};

export default Page;
