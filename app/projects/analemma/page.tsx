import { Suspense } from "react";
import { Metadata } from "next";

import { basePrefix, imgPrefix } from "@/app/lib/server/env";
import Analemma, { AnalemmaFallback } from "./analemma";

export const generateMetadata = (): Metadata => {
  const title = "Analemma";
  const url = new URL("projects/analemma", basePrefix);
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
        <h1 className="tw-text-4xl tw-font-bold tw-leading-snug">Analemma</h1>
        <p>
          If we were to photograph the Sun from a fixed position at the same
          clock time every day for an entire year, we would see the Sun moving
          along an 8- or ∞-shaped curve called the{" "}
          <em className="tw-italic">analemma</em>. Here you can calculate it for
          any time of the day at any location!
        </p>
      </div>

      <Suspense fallback={<AnalemmaFallback />}>
        <Analemma />
      </Suspense>

      <p className="tw-mt-6 tw-text-right tw-font-inter tw-text-sm tw-font-normal tw-leading-normal tw-text-gray-700">
        Ephemerides from{" "}
        <a
          className="tw-border-b tw-border-orange-600 hover:tw-text-orange-600"
          href="https://ssd.jpl.nasa.gov/planets/eph_export.html"
          target="_blank"
        >
          JPL
        </a>
      </p>
    </article>
  );
};

export default Page;
