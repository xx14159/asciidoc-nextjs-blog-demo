import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 Not Found",
};

const NotFoundPage = () => {
  return (
    <article className="tw-relative tw-flex tw-h-screen tw-items-center tw-justify-center tw-overflow-hidden">
      <h1 className="tw-pointer-events-none tw-absolute tw-select-none tw-whitespace-nowrap tw-text-center tw-font-mono tw-text-[50vw] tw-font-normal tw-leading-none tw-text-gray-100 portrait:tw-text-[50vh] portrait:[writing-mode:vertical-rl]">
        404
      </h1>
      <h2 className="tw-absolute tw-top-[30vh] tw-text-center tw-font-serif tw-text-3xl tw-font-bold tw-leading-snug tw-text-gray-800">
        Whoops, this page doesn’t exist :-(
      </h2>
    </article>
  );
};

export default NotFoundPage;
