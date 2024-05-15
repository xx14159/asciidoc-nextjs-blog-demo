import Link from "next/link";

import "lazysizes";

import Button from "@/app/components/button";
import CatchLinks from "@/app/components/catch-links";
import Form from "@/app/components/forms/form";
import type { Post } from "@/app/lib/server/parse-post";

type Props = {
  posts: Post[];
  ending?:
    | "seeMore"
    | "end"
    | {
        type: "loadMore";
        props: Parameters<typeof LoadMore>[number];
      };
};

const PostList = ({ posts, ending }: Props) => {
  return (
    <div className="tw-max-w-screen-md tw-pl-10 tw-pr-4 sm:tw-pl-20 sm:tw-pr-8 md:tw-pl-24 md:tw-pr-12">
      {posts.map((post) => (
        <PostEntry key={post.slug} post={post} />
      ))}

      {ending === undefined ? null : (
        <div className="tw-flex tw-flex-col tw-items-stretch tw-justify-start tw-gap-x-16 tw-pt-3 sm:tw-flex-row sm:tw-items-baseline">
          <div
            className="tw-invisible tw-hidden tw-flex-none tw-font-sans tw-text-base tw-font-light tw-leading-normal tw-text-gray-700 sm:tw-block"
            aria-hidden
          >
            <span className="tw-whitespace-nowrap tw-tabular-nums">
              0000-00-00
            </span>
          </div>

          {ending === "seeMore" ? (
            <SeeMore />
          ) : ending === "end" ? (
            <End />
          ) : (
            <LoadMore
              callback={ending.props.callback}
              loading={ending.props.loading}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PostList;

const formatDate = (date: Date) => {
  let year = date.getFullYear();
  let month = "" + (date.getMonth() + 1);
  let day = "" + date.getDate();

  while (month.length < 2) month = "0" + month;
  while (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const PostEntry = ({ post }: { post: Props["posts"][number] }) => (
  <article className="tw-flex tw-flex-col tw-items-stretch tw-justify-start tw-gap-x-16 tw-py-3 sm:tw-flex-row sm:tw-items-baseline">
    <div className="tw-flex-none tw-font-sans tw-text-base tw-font-light tw-leading-normal tw-text-gray-700">
      <time
        dateTime={post.pageCTime}
        className="tw-whitespace-nowrap tw-tabular-nums"
      >
        {formatDate(new Date(post.pageCTime))}
      </time>
    </div>

    <header className="tw-flex-auto">
      <div className="tw-float-right tw-min-w-min tw-max-w-[40%] tw-text-right tw-font-serif tw-text-sm tw-font-light tw-leading-normal tw-text-gray-600">
        {post.pageTags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag}/`}
            className="tw-mx-[3px] tw-my-[2px] tw-inline-block tw-whitespace-nowrap tw-bg-gray-100 tw-px-[6px] tw-py-px tw-capitalize hover:tw-bg-neutral-900 hover:tw-text-white"
          >
            {tag}
          </Link>
        ))}
      </div>

      <h3 className="tw-font-serif tw-text-lg tw-leading-normal">
        <span className="tw-font-cjk-serif"></span>
        <Link
          lang={post.lang}
          href={`/posts/${post.slug}`}
          className="adoc tw-border-b tw-border-transparent tw-text-lg tw-leading-normal hover:tw-border-current md:tw-text-lg md:tw-leading-normal"
        >
          <span
            className="font-semibold"
            dangerouslySetInnerHTML={{ __html: post.main }}
          ></span>
        </Link>
      </h3>
      {post.subtitle ? (
        <CatchLinks>
          <p
            lang={post.lang}
            className="adoc tw-text-base tw-leading-normal md:tw-text-base md:tw-leading-normal"
          >
            <span
              className="font-light gray"
              dangerouslySetInnerHTML={{
                __html: post.subtitle,
              }}
            ></span>
          </p>
        </CatchLinks>
      ) : null}
    </header>
  </article>
);

const SeeMore = () => (
  <p className="tw-font-sans tw-text-xs tw-font-semibold tw-leading-normal">
    <Link
      href="/posts"
      className="tw-whitespace-nowrap tw-bg-gradient-to-t tw-from-neutral-900 tw-to-neutral-900 tw-bg-bottom tw-bg-no-repeat tw-text-gray-900 tw-transition-[background-size,color] [background-size:var(--bg-size)] hover:tw-text-white hover:[background-size:var(--bg-size-other)]"
      style={{
        ["--bg-size" as any]: "100% 2px",
        ["--bg-size-other" as any]: "100% 100%",
      }}
    >
      SEE MORE
    </Link>
  </p>
);

const End = () => (
  <div className="tw-relative tw-mx-auto tw-mt-6 tw-flex tw-w-fit tw-items-center tw-justify-center sm:tw-ml-0">
    <div className="tw-absolute tw-h-0 tw-w-full tw-border-b tw-border-gray-400"></div>
    <div className="tw-relative tw-mx-12 tw-inline-block tw-whitespace-nowrap tw-bg-white tw-px-4 tw-text-center tw-font-serif tw-text-xs tw-font-normal tw-uppercase tw-leading-none tw-text-gray-600 sm:tw-mx-24">
      <span className="tw-mr-[-0.5em] tw-tracking-[0.5em]">END</span>
    </div>
  </div>
);

const LoadMore = ({
  callback,
  loading,
}: {
  callback: React.MouseEventHandler<HTMLButtonElement>;
  loading: boolean;
}) => (
  <Form className="tw-mx-auto tw-mt-3 tw-max-w-full sm:tw-ml-0">
    <Button
      kind="ghost2solid-trans"
      className="tw-w-72 tw-max-w-full"
      onClick={callback}
    >
      <div className="tw-flex tw-items-center tw-justify-center tw-gap-x-2 tw-py-1">
        <div className="tw-rotate-90">
          <svg
            className={`tw-fill-current ${loading ? "tw-animate-spin" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            width="24"
            viewBox="0 0 24 24"
          >
            <path d="M5.1 16.05q-.55-.95-.825-1.95Q4 13.1 4 12.05q0-3.35 2.325-5.7T12 4h.175l-1.6-1.6 1.4-1.4 4 4-4 4-1.4-1.4 1.6-1.6H12Q9.5 6 7.75 7.762 6 9.525 6 12.05q0 .65.15 1.275.15.625.45 1.225ZM12.025 23l-4-4 4-4 1.4 1.4-1.6 1.6H12q2.5 0 4.25-1.762Q18 14.475 18 11.95q0-.65-.15-1.275-.15-.625-.45-1.225l1.5-1.5q.55.95.825 1.95.275 1 .275 2.05 0 3.35-2.325 5.7T12 20h-.175l1.6 1.6Z" />
          </svg>
        </div>
        <div className="tw-whitespace-nowrap tw-font-sans tw-text-sm tw-font-semibold tw-leading-normal tw-tracking-wider">
          LOAD MORE
        </div>
      </div>
    </Button>
  </Form>
);
