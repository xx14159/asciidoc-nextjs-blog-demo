import { Metadata } from "next";
import Link from "next/link";

import countBy from "lodash/countBy";
import map from "lodash/map";
import orderBy from "lodash/orderBy";

import HrTitle from "@/app/components/hr-title";
import PostList from "@/app/components/post-list";
import { postChunkSize, basePrefix, imgPrefix } from "@/app/lib/server/env";
import { getAllPublicPosts } from "@/app/lib/server/parse-post";

export const generateMetadata = (): Metadata => {
  const url = basePrefix;
  const title = "Blog";
  return {
    title,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      images: new URL("og.png", imgPrefix),
      url,
    },
  };
};

const getData = async () => {
  const allPosts = await getAllPublicPosts();
  const posts = allPosts.slice(0, Math.floor(postChunkSize / 2));
  const totalCount = allPosts.length;
  const sortedTags = orderBy(
    map(
      countBy(allPosts.map((post) => post.pageTags).flat()),
      (count, tag) => ({ count, tag }),
    ),
    ["count", "tag"],
    ["desc", "asc"],
  );

  return { posts, totalCount, sortedTags };
};

const Page = async () => {
  const { posts, totalCount, sortedTags } = await getData();

  return (
    <div className="tw-mx-auto tw-grid tw-max-w-screen-lg tw-grid-cols-1 tw-gap-y-16 tw-pb-32 tw-pt-16">
      <article>
        <p className="tw-px-4 tw-font-serif tw-text-base tw-font-normal tw-leading-relaxed tw-text-gray-900 sm:tw-px-8 md:tw-px-12">
          👋Hi! This is a demo website showcasing a blog built with Next.js and
          AsciiDoc as the underlying markup language.
        </p>
      </article>

      <article>
        <HrTitle>POSTS</HrTitle>

        <PostList
          posts={posts}
          ending={totalCount > posts.length ? "seeMore" : undefined}
        />
      </article>

      <article>
        <HrTitle>TAGS</HrTitle>

        <div className="tw-px-4 tw-font-serif tw-text-base tw-font-light tw-leading-normal tw-text-gray-600 sm:tw-px-8 md:tw-px-12">
          <div className="tw--mx-1.5">
            {sortedTags.map(({ count, tag }) => (
              <Link
                key={tag}
                href={`/tags/${tag}/`}
                className="tw-mx-1.5 tw-my-1 tw-inline-flex tw-items-stretch tw-justify-stretch tw-whitespace-nowrap tw-bg-gray-100 hover:tw-bg-neutral-900 hover:tw-text-white"
              >
                <span className="tw-flex-none tw-flex-grow tw-border-r tw-border-white tw-py-0.5 tw-pl-2 tw-pr-1.5 tw-capitalize">
                  {tag}
                </span>
                <span className="tw-flex-none tw-py-0.5 tw-pl-1.5 tw-pr-2">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default Page;
