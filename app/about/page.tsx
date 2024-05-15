import { Metadata } from "next";
import "lazysizes";

import CatchLinks from "@/app/components/catch-links";
import { basePrefix, imgPrefix } from "@/app/lib/server/env";
import { getSimpleAdocBySlug } from "@/app/lib/server/parse-post";

export const generateMetadata = (): Metadata => {
  const title = "About";
  const url = new URL("about", basePrefix);
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

const Page = () => {
  const { html: aboutHtml } = getSimpleAdocBySlug("about");

  return (
    <article className="tw-mx-auto tw-max-w-screen-lg tw-pb-32 tw-pt-16">
      <header className="tw-mx-auto tw-max-w-screen-md tw-px-4 sm:tw-px-8 md:tw-px-12 lg:tw-ml-0">
        <h1 className="tw-relative tw-z-0 tw-my-24 tw-px-1 tw-text-center tw-font-serif tw-text-[2rem] tw-font-bold tw-leading-snug tw-text-gray-900 before:tw-pointer-events-none before:tw-absolute before:tw-left-0 before:tw-top-[-0.5em] before:tw--z-10 before:tw-text-[18rem] before:tw-uppercase before:tw-leading-none before:tw-text-gray-100 before:tw-content-['A'] sm:tw-pl-36 sm:tw-pr-0 sm:tw-text-left lg:tw--mr-64">
          About
        </h1>
      </header>

      <CatchLinks>
        <div
          className="adoc-container adoc adoc-extend tw-mx-auto lg:tw-ml-0"
          dangerouslySetInnerHTML={{ __html: aboutHtml }}
        ></div>
      </CatchLinks>
    </article>
  );
};

export default Page;
