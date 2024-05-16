import { Metadata } from "next";

import Button from "@/app/components/button";
import Form from "@/app/components/forms/form";
import InputGroup from "@/app/components/forms/input-group";
import Tooltip from "@/app/components/tooltip";
import TooltipWrapper from "@/app/components/tooltip/wrapper";
import { basePrefix, imgPrefix } from "@/app/lib/server/env";

export const generateMetadata = (): Metadata => {
  const title = "Buttons";
  const url = new URL("projects/buttons", basePrefix);
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
  return (
    <article className="tw-mx-auto tw-max-w-screen-lg tw-px-4 tw-pb-32 tw-pt-16 sm:tw-px-8 md:tw-px-12">
      <div className="tw-pb-8 tw-font-inter tw-text-base tw-font-normal tw-leading-relaxed tw-text-gray-900">
        <h1 className="tw-text-2xl tw-font-bold">Some components</h1>
      </div>
    </article>
  );
};

export default Page;
