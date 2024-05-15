import fs from "fs";
import path from "path";

import { cache } from "react";

import SHA3 from "crypto-js/sha3";
import { JSDOM } from "jsdom";

import { getContext, doc2Post } from "@/app/lib/parse-post";
import { dev, imgPrefix, staticPrefix } from "@/app/lib/server/env";
import getLocalImage from "@/app/lib/server/local-image";

export const adocDirectory = path.join(process.cwd(), "data", "adoc");
const postsDirectory = path.join(process.cwd(), "_posts");
const tmpDirectory = path.join(process.cwd(), ".tmp");
const dataDirectory = path.join(process.cwd(), "public", "_data");

const cacheFile = path.join(
  tmpDirectory,
  dev ? ".allPublicPosts.dev.json" : ".allPublicPosts.prod.json",
);

const ctx = getContext(JSDOM, getLocalImage, imgPrefix, staticPrefix, dev);

// exports

export const getSimpleAdocBySlug = (slug: string) => {
  const fullPath = path.join(adocDirectory, `${slug}.adoc`);
  const doc = ctx.adocConverter.loadFile(
    fullPath,
    ctx.asciidoctorProcessorOptions,
  );
  const html = doc.convert();
  return { slug, html };
};

export const getPostBySlug = cache((slug: string) => {
  const fullPath = path.join(postsDirectory, `${slug}.adoc`);
  const doc = ctx.adocConverter.loadFile(
    fullPath,
    ctx.asciidoctorProcessorOptions,
  );
  return doc2Post(doc, slug, ctx);
});

const getPostSlugs = async () => {
  const slugs = [];

  const files = await fs.promises.readdir(postsDirectory);
  for (const filename of files) {
    const stats = await fs.promises.stat(path.join(postsDirectory, filename));
    if (stats.isFile() && path.extname(filename).match(/\.adoc$/))
      slugs.push({
        slug: filename.replace(/\.adoc$/, ""),
        mtime: stats.mtime,
      });
  }

  return slugs;
};

type ValueType<T> = T extends Promise<infer U> ? U : T;

export type Post = {
  slug: string;
  main: string;
  subtitle: string;
  lang: string;
  pageCTime: string;
  pageTags: string[];
};

const _getAllPublicPosts = (
  slugs: ValueType<ReturnType<typeof getPostSlugs>>,
) => {
  return (
    slugs
      .map(({ slug }) => getPostBySlug(slug))
      .filter((res) => res !== null) as NonNullable<
      ReturnType<typeof getPostBySlug>
    >[]
  )
    .sort((a, b) => b.pageCTime.getTime() - a.pageCTime.getTime())
    .map((res) => {
      return {
        slug: res.slug,
        main: res.main,
        subtitle: res.subtitle,
        lang: res.lang,
        pageCTime: res.pageCTime.toISOString(),
        pageTags: res.pageTags,
      } as Post;
    });
};

const toKey = (slugs: ValueType<ReturnType<typeof getPostSlugs>>) =>
  SHA3(
    slugs
      .map(({ slug, mtime }) => `${slug}, ${mtime.toISOString()}`)
      .join("; ") + `; dev: ${dev}`,
  ).toString();

export const getAllPublicPosts = async () => {
  let cacheFileExists = false;
  try {
    await fs.promises.access(cacheFile, fs.constants.F_OK);
    cacheFileExists = true;
  } catch {}

  const { key, res } = cacheFileExists
    ? JSON.parse(await fs.promises.readFile(cacheFile, "utf-8"))
    : { key: "", res: "" };

  const slugs = await getPostSlugs();
  const newKey = toKey(slugs);

  if (key === newKey) return res as Post[];

  const newRes = _getAllPublicPosts(slugs);
  await fs.promises.mkdir(tmpDirectory, { recursive: true });
  await fs.promises.writeFile(
    cacheFile,
    JSON.stringify({ key: newKey, res: newRes }),
  );

  return newRes;
};

export const savePostsData = async (postsLists: Post[][], key: string) => {
  const hash = SHA3(`blog/${SHA3(key).toString()}`).toString();
  await fs.promises.mkdir(dataDirectory, { recursive: true });

  await Promise.all(
    postsLists.map(async (posts, index) => {
      if (index === 0) return;
      await fs.promises.writeFile(
        path.join(dataDirectory, `${hash}-${index}.json`),
        JSON.stringify(posts),
      );
    }),
  );
  return `/_data/${hash}`;
};
