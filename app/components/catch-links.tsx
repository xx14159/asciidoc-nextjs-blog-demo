"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isLocalURL } from "next/dist/shared/lib/router/utils/is-local-url";

const CatchLinks = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (ref.current === null || done) return;

    ref.current.querySelectorAll("a").forEach((el) => {
      if (el.getAttribute("href")?.startsWith("#") ?? true) return;
      const href = el.href;
      if (!isLocalURL(href)) return;

      el.onmouseenter = () => {
        router.prefetch(href);
      };
      el.ontouchstart = () => {
        router.prefetch(href);
      };
      el.onclick = (event) => {
        if (event.defaultPrevented) return;
        if (
          (el.target && el.target !== "_self") ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
          // || (event.nativeEvent && event.nativeEvent.which === 2)
        )
          return;
        event.preventDefault();
        router.push(href, { scroll: false });
      };
    });

    setDone(true);
  }, [router, done]);

  return <div ref={ref}>{children}</div>;
};

export default CatchLinks;
