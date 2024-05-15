"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import CodeMirror, { EditorState, EditorView } from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import colors from "tailwindcss/colors";

import Post from "@/app/components/post";
import { getContext, getPostFromString } from "@/app/lib/parse-post";

import "./codemirror.scss";

type Props = {
  demo: string;
  dev: boolean;
  apiPrefix: string;
  imgPrefix: string;
  staticPrefix: string;
};

const AsciiDocPostPreview = ({
  demo,
  dev,
  apiPrefix,
  imgPrefix,
  staticPrefix,
}: Props) => {
  const apiURL = useMemo(
    () => new URL("v1/asciidoc-post-preview", apiPrefix),
    [apiPrefix],
  );

  const searchParams = useSearchParams();
  const pid = searchParams?.get("pid") ?? null;
  const sessionStorageKey = "asciidoc-post-preview; input/session";

  const [input, setInput] = useState({
    disabled: true,
    shouldSave: false,
    content: "\n\n",
  });
  useEffect(() => {
    if (pid !== null) {
      const fetchContent = async () => {
        const resp = await fetch(apiURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Get: { pid: pid } }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setInput({
            disabled: false,
            shouldSave: false,
            content: data.content !== null ? String(data.content) : demo,
          });
          if (data.content !== null)
            fetch(apiURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                Touch: { pid: pid },
              }),
            });
        } else {
          alert("Failed to retrieve data!");
        }
      };
      fetchContent();
    } else {
      setInput({
        disabled: false,
        shouldSave: false,
        content: sessionStorage.getItem(sessionStorageKey) ?? demo,
      });
    }
  }, [apiURL, pid, demo]);

  const [ctx, setCtx] = useState<ReturnType<typeof getContext> | null>(null);
  useEffect(() => {
    setCtx(getContext(null, null, imgPrefix, staticPrefix, dev));
  }, [imgPrefix, staticPrefix, dev]);

  const [post, setPost] = useState<ReturnType<typeof getPostFromString> | null>(
    null,
  );
  useEffect(() => {
    if (!input.disabled && ctx !== null) {
      const updatePost = setTimeout(() => {
        setPost(getPostFromString(input.content, ctx));
      }, 1000);
      return () => clearTimeout(updatePost);
    }
  }, [input.disabled, input.content, ctx]);

  const [remoteUpdatedTime, setRemoteUpdatedTime] = useState<number | null>(
    null,
  );
  useEffect(() => {
    if (input.disabled || !input.shouldSave) return;

    if (pid !== null) {
      const checkAndSyncFactory = (seconds: number, force: boolean = false) =>
        setTimeout(() => {
          const newTime = new Date().getTime();
          if (
            remoteUpdatedTime === null ||
            force ||
            newTime - remoteUpdatedTime > 60 * 1000
          ) {
            fetch(apiURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                Update: { pid: pid, content: input.content },
              }),
            }).then((resp) => {
              if (resp.ok) {
                setRemoteUpdatedTime(newTime);
                setInput((prev) => ({ ...prev, shouldSave: false }));
              }
            });
          }
        }, seconds * 1000);
      const checkAfter1s = checkAndSyncFactory(1);
      const saveAfter10s = checkAndSyncFactory(10, true);
      return () => {
        clearTimeout(checkAfter1s);
        clearTimeout(saveAfter10s);
      };
    } else {
      const saveAfter1s = setTimeout(() => {
        sessionStorage.setItem(sessionStorageKey, input.content);
        setInput((prev) => ({ ...prev, shouldSave: false }));
      }, 1000);
      return () => clearTimeout(saveAfter1s);
    }
  }, [apiURL, pid, input, remoteUpdatedTime]);

  return (
    <>
      {post === null ? null : <Post post={post} />}
      <div className="tw-mb-[30vh]"></div>

      <div className="tw-pointer-events-none tw-fixed tw-bottom-0 tw-w-full tw-min-w-[320px] tw-bg-gradient-to-t tw-from-white tw-to-transparent">
        <div className="tw-mx-auto tw-max-w-screen-md tw-px-4 tw-py-8 sm:tw-px-8 md:tw-px-12">
          <div
            className={`loading tw-pointer-events-auto tw-rounded-lg tw-border tw-border-gray-300 tw-bg-white tw-shadow-[0_0_15px_rgba(0,0,0,.1)] ${
              input.disabled ? "" : "loaded"
            }`}
          >
            <CodeMirror
              value={input.content}
              theme={theme}
              basicSetup={{ lineNumbers: false, foldGutter: false }}
              extensions={[
                EditorView.lineWrapping,
                EditorState.languageData.of(() => [
                  {
                    closeBrackets: {
                      brackets: [
                        "(",
                        "[",
                        "{",
                        "<",
                        "'",
                        '"',
                        "*",
                        "_",
                        "`",
                        "+",
                        "#",
                        "~",
                        "^",
                      ],
                      before: ")]}:;>*_`+#~^",
                      stringPrefixes: [],
                    },
                  },
                ]),
              ]}
              editable={!input.disabled}
              readOnly={input.disabled}
              maxHeight="30vh"
              onChange={(value, viewUpdate) => {
                setInput((prev) => ({
                  ...prev,
                  shouldSave: true,
                  content: value,
                }));
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AsciiDocPostPreview;

export const AsciiDocPostPreviewFallback = () => (
  <>
    <div className="tw-pointer-events-none tw-fixed tw-bottom-0 tw-w-full tw-min-w-[320px] tw-bg-gradient-to-t tw-from-white tw-to-transparent">
      <div className="tw-mx-auto tw-max-w-screen-md tw-px-4 tw-py-8 sm:tw-px-8 md:tw-px-12">
        <div className="loading tw-pointer-events-auto tw-rounded-lg tw-border tw-border-gray-300 tw-bg-white tw-shadow-[0_0_15px_rgba(0,0,0,.1)]">
          <textarea
            className="tw-block tw-w-full tw-resize-none tw-rounded-lg tw-border-none tw-px-3 tw-py-2 tw-font-mono tw-text-[0.875rem] tw-font-normal focus:tw-ring-0"
            value=""
            disabled={true}
            readOnly={true}
            style={{ height: "82.8px", maxHeight: "30vh" }}
          />
        </div>
      </div>
    </div>
  </>
);

const theme = createTheme({
  theme: "light",
  settings: {
    background: colors.white,
    foreground: colors.gray[900],
    selection: `${colors.blue[300]}80`,
    selectionMatch: `${colors.blue[100]}80`,
    lineHighlight: colors.transparent,
    gutterBackground: colors.gray[50],
    gutterForeground: colors.gray[500],
    gutterActiveForeground: colors.gray[900],
    gutterBorder: colors.gray[300],
  },
  styles: [],
});
