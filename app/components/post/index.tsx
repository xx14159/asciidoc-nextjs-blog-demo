/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import "lazysizes";

import CatchLinks from "@/app/components/catch-links";
import type { getPostBySlug } from "@/app/lib/server/parse-post";
import MathJaxStyle from "./mathjax-style";

type Props = {
  post: NonNullable<ReturnType<typeof getPostBySlug>>;
  setTitle?: boolean;
  setDescription?: boolean;
  setKeywords?: boolean;
};

const Post = ({ post }: Props) => {
  return (
    <>
      {post.mathjaxStyles ? (
        <MathJaxStyle mathjaxStyles={post.mathjaxStyles} />
      ) : null}

      <article
        className={`${post.pageHeadingStyle.big ? "big-heading" : ""} ${
          post.pageHeadingStyle.center ? "center-heading" : ""
        } ${post.pageHeadingStyle.hr ? "hr-heading" : ""} ${
          post.pageHeadingStyle.sans ? "sans-heading" : ""
        } ${post.pageHeadingStyle.smallCaps ? "small-caps-heading" : ""}`}
      >
        <header
          className={`article-header ${
            post.lead
              ? `with-lead ${post.lead.dark ? "dark-lead" : ""} ${
                  post.lead.color ? "colored-lead" : ""
                } ${post.lead.blur ? "blurred-lead" : ""} ${post.lead.align} ${
                  post.lead.layout.type
                } ${post.lead.layout.variant ?? ""}`
              : ""
          }`}
          style={
            post.lead?.color
              ? { ["--lead-color" as any]: post.lead.color }
              : undefined
          }
        >
          {post.lead ? (
            <div className="lead lazyload-img-wrapper tw-overflow-hidden">
              <img
                className="lazyload blur-up tw-h-full tw-w-full tw-object-cover tw-object-center"
                src={post.lead.imageSrc}
                alt=""
                data-sizes="auto"
                data-srcset={post.lead.imageSrcset}
              />
              <div className="overlay"></div>
            </div>
          ) : null}
          <div className="header-container">
            <div className="header-content">
              <div className="tags">
                {post.pageTags.map((tag) => (
                  <Link key={tag} href={`/tags/${tag}/`} className="tag">
                    {tag}
                  </Link>
                ))}
              </div>

              <CatchLinks>
                <h1 lang={post.lang} className="title adoc">
                  <span
                    className={`title-text ${
                      post.pageHeadingStyle.sans ? "font-sans" : "font-serif"
                    } font-bold`}
                    dangerouslySetInnerHTML={{ __html: post.main }}
                  ></span>
                </h1>
                <p lang={post.lang} className="subtitle adoc">
                  <span
                    className={`subtitle-text ${
                      post.pageHeadingStyle.sans ? "font-sans" : "font-serif"
                    } font-light`}
                    dangerouslySetInnerHTML={{ __html: post.subtitle }}
                  ></span>
                </p>
              </CatchLinks>
            </div>
          </div>
        </header>

        <div className="article-body tw-mx-auto tw-flow-root tw-max-w-screen-lg tw-pb-32 tw-pt-8">
          <div className="tw-mb-12 tw-px-4 sm:tw-px-8 md:tw-px-12">
            <div className="tw-h-0 tw-w-full tw-border-b tw-border-gray-900"></div>
            <p className="tw-mt-1 tw-font-sans tw-text-lg tw-font-light tw-leading-relaxed">
              <span className="tw-text-gray-700">
                <span>By </span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: getAuthorsString(post.authors),
                  }}
                ></span>
              </span>{" "}
              <span className="tw-inline-block tw-select-none tw-px-1.5 tw-text-gray-300">
                /
              </span>{" "}
              <time
                className="tw-text-gray-700"
                dateTime={(post.pageUpdateDate ?? post.pageCTime).toISOString()}
              >
                {getDateString(post.pageCTime, post.pageUpdateDate)}
              </time>
            </p>
          </div>

          <CatchLinks>
            <div
              lang={post.lang}
              className="adoc-container adoc adoc-extend tw-mx-auto lg:tw-ml-0"
              dangerouslySetInnerHTML={{ __html: post.html }}
            ></div>
          </CatchLinks>
        </div>
      </article>
    </>
  );
};

export default Post;

const getAuthorsString = (authors: string[]) => {
  const n_authors = authors.length;

  if (n_authors === 0) return "Anonymous";
  if (n_authors === 1) return authors[0];
  if (n_authors === 2) return `${authors[0]} and ${authors[1]}`;
  else
    return `${authors.slice(0, n_authors - 1).join(", ")}, and ${
      authors[n_authors - 1]
    }`;
};

const getDateString = (cTime: Date, updateDate: Date | null) => {
  const dateString = (updateDate ?? cTime).toLocaleString("en", {
    dateStyle: "medium",
  });

  if (updateDate === null) return dateString;
  else return `Updated ${dateString}`;
};
