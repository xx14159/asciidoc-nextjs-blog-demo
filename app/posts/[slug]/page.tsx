import { Metadata } from "next";

import Post from "@/app/components/post";
import { basePrefix, imgPrefix } from "@/app/lib/server/env";
import { getPostBySlug, getAllPublicPosts } from "@/app/lib/server/parse-post";

type Props = { params: { slug: string } };

export const generateMetadata = ({ params: { slug } }: Props): Metadata => {
  const post = getPostBySlug(slug);
  if (post === null) return {};

  const title = post.mainText;
  const url = new URL(`posts/${slug}`, basePrefix);
  return {
    title,
    description: post.description,
    keywords: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      images: post.lead?.imageOG ?? new URL("og.png", imgPrefix),
      url,
    },
  };
};

export const dynamicParams = false;

export const generateStaticParams = async () => {
  const allPosts = await getAllPublicPosts();
  return allPosts.map((post) => ({ slug: post.slug }));
};

const getData = (slug: string) => {
  const post = getPostBySlug(slug as string);
  return { post };
};

const Page = ({ params: { slug } }: Props) => {
  const { post } = getData(slug);

  if (post === null) return null;

  return (
    <Post
      post={post}
      setTitle={true}
      setDescription={true}
      setKeywords={true}
    />
  );
};

export default Page;
