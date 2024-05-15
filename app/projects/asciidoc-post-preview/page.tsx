import fs from "fs";
import path from "path";

import { Suspense } from "react";
import { Metadata } from "next";

import AsciiDocPostPreview, {
  AsciiDocPostPreviewFallback,
} from "./asciidoc-post-preview";
import {
  dev,
  basePrefix,
  apiPrefix,
  imgPrefix,
  staticPrefix,
} from "@/app/lib/server/env";
import { adocDirectory } from "@/app/lib/server/parse-post";

export const generateMetadata = (): Metadata => {
  const title = "AsciiDoc Post Preview";
  const url = new URL("projects/asciidoc-post-preview", basePrefix);
  return {
    title,
    robots: { index: false, follow: false },
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
  const demo = await fs.promises.readFile(
    path.join(adocDirectory, "asciidoc-post-preview.Demo.adoc"),
    "utf-8",
  );
  return {
    demo,
  };
};

const Page = async () => {
  const { demo } = await getData();

  return (
    <Suspense fallback={<AsciiDocPostPreviewFallback />}>
      <AsciiDocPostPreview
        demo={demo}
        dev={dev}
        apiPrefix={apiPrefix}
        imgPrefix={imgPrefix}
        staticPrefix={staticPrefix}
      />
    </Suspense>
  );
};

export default Page;
