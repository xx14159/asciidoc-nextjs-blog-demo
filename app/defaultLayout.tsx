"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { text: "Posts", url: "/posts", regex: /^\/posts(?:\/|$)/ },
  { text: "Projects", url: "/projects", regex: /^\/projects(?:\/|$)/ },
  { text: "About", url: "/about", regex: /^\/about(?:\/|$)/ },
];

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <>
      <header className="tw-w-full tw-min-w-[320px] tw-bg-neutral-900">
        <div className="tw-mx-auto tw-flex tw-max-w-screen-lg tw-items-baseline tw-justify-between tw-px-4 sm:tw-px-8 md:tw-px-12">
          <h1 className="tw-select-none tw-whitespace-nowrap tw-text-center tw-font-serif tw-text-2xl tw-font-extralight tw-leading-none tw-text-white">
            <Link href="/">Blog</Link>
          </h1>

          <nav className="tw-flex tw-select-none tw-items-stretch tw-justify-center tw-whitespace-nowrap tw-font-serif tw-text-lg tw-font-light tw-leading-5 tw-text-gray-300">
            <ul className="tw-flex tw-items-stretch tw-justify-center">
              {navLinks.map((link) => (
                <li
                  key={link.text}
                  className="tw-flex tw-items-stretch tw-justify-center"
                >
                  <Link
                    href={link.url}
                    className={`tw-border-t-4 tw-px-3 tw-py-2 tw-transition-colors hover:tw-bg-gray-50 hover:tw-text-gray-900 ${
                      link.regex.test(pathname)
                        ? "tw-border-gray-50"
                        : "tw-border-transparent"
                    }`}
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <div className="tw-flow-root tw-min-h-screen tw-min-w-[320px]">
        {children}
      </div>
    </>
  );
};

export default DefaultLayout;
