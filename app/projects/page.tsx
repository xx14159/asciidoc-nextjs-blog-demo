import { Metadata } from "next";
import Link from "next/link";

import colors from "tailwindcss/colors";

import HrTitle from "@/app/components/hr-title";
import { dev, basePrefix, imgPrefix } from "@/app/lib/server/env";

export const generateMetadata = (): Metadata => {
  const title = "Projects";
  const url = new URL("projects", basePrefix);
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

const projects = [
  {
    name: "Analemma",
    link: "/projects/analemma",
    description: "See how the Sun moves on the sky throughout a year!",
    color: colors.orange[300],
    showInProduction: true,
  },
  {
    name: "AsciiDoc Post Preview",
    link: "/projects/asciidoc-post-preview",
    description: "Customized AsciiDoc parser for post previewing",
    color: colors.gray[300],
    showInProduction: true,
  },
];

const Page = () => {
  return (
    <article className="tw-mx-auto tw-max-w-screen-lg tw-pb-32 tw-pt-16">
      <HrTitle>PROJECTS</HrTitle>

      <div className="tw-grid tw-grid-cols-1 tw-gap-x-8 tw-gap-y-6 tw-pl-10 tw-pr-4 sm:tw-grid-cols-2 sm:tw-pl-20 sm:tw-pr-8 md:tw-pl-24 md:tw-pr-12 lg:tw-grid-cols-3">
        {projects
          .filter(({ showInProduction }) => dev || showInProduction)
          .map(({ name, link, description, color }) => (
            <ProjectEntry
              key={name}
              name={name}
              link={link}
              description={description}
              color={color}
            />
          ))}
      </div>
    </article>
  );
};

export default Page;

type ProjectEntryProps = {
  name: string;
  link: string;
  description: string;
  color: string;
};

const ProjectEntry = ({
  name,
  link,
  description,
  color,
}: ProjectEntryProps) => (
  <article className="tw-col-span-1">
    <h3 className="tw-mb-2 tw-font-serif tw-text-lg tw-font-semibold tw-leading-normal tw-text-gray-900">
      <Link
        href={link}
        className="tw-mx-[-0.2em] tw-bg-bottom tw-bg-no-repeat tw-px-[0.2em] tw-transition-[background-size] [background-size:var(--bg-size)] hover:[background-size:var(--bg-size-other)]"
        style={{
          backgroundImage: `linear-gradient(${color},${color})`,
          ["--bg-size" as any]: "calc(100% - 0.4em) 35%",
          ["--bg-size-other" as any]: "100% 100%",
        }}
      >
        {name}
      </Link>
    </h3>
    <p className="tw-font-sans tw-text-base tw-font-light tw-leading-relaxed tw-text-gray-700">
      {description}
    </p>
  </article>
);
