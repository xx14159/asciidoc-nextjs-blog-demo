type Props = {
  position?:
    | "top"
    | "top-left"
    | "top-right"
    | "bottom"
    | "bottom-left"
    | "bottom-right"
    | "left"
    | "left-top"
    | "left-bottom"
    | "right"
    | "right-top"
    | "right-bottom";
  caretPosition?: string;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const Tooltip = ({
  children,
  className,
  position = "bottom",
  caretPosition,
  ...divProps
}: Props) => {
  return (
    <div
      className={`tw-invisible tw-absolute tw-z-0 ${
        position.startsWith("top")
          ? "tw-bottom-full tw-mb-2"
          : position.startsWith("bottom")
          ? "tw-top-full tw-mt-2"
          : position.startsWith("left")
          ? "tw-right-full tw-mr-2"
          : position.startsWith("right")
          ? "tw-left-full tw-ml-2"
          : ""
      } ${
        position.endsWith("-left")
          ? "tw-left-0"
          : position.endsWith("-right")
          ? "tw-right-0"
          : position.endsWith("-top")
          ? "tw-top-0"
          : position.endsWith("-bottom")
          ? "tw-bottom-0"
          : position.startsWith("top") || position.startsWith("bottom")
          ? "tw-left-1/2 tw--translate-x-1/2"
          : position.startsWith("left") || position.startsWith("right")
          ? "tw-top-1/2 tw--translate-y-1/2"
          : ""
      } tw-rounded-sm tw-bg-neutral-600 tw-px-1.5 tw-py-1 tw-text-sm tw-font-normal tw-leading-normal tw-text-white group-hover/tooltip:tw-visible ${
        className ?? ""
      }`}
      {...divProps}
    >
      <div
        className={`tw-absolute tw--z-10 tw-mx-auto ${
          position.startsWith("top")
            ? "tw--bottom-1 tw-h-1.5 tw-w-3"
            : position.startsWith("bottom")
            ? "tw--top-1 tw-h-1.5 tw-w-3"
            : position.startsWith("left")
            ? "tw--right-1 tw-h-3 tw-w-1.5"
            : position.startsWith("right")
            ? "tw--left-1 tw-h-3 tw-w-1.5"
            : ""
        } ${
          position.endsWith("-left")
            ? "tw-left-[--ttp-crt-ps,1rem] tw--translate-x-1.5"
            : position.endsWith("-right")
            ? "tw-right-[--ttp-crt-ps,1rem] tw-translate-x-1.5"
            : position.endsWith("-top")
            ? "tw-top-[--ttp-crt-ps,1rem] tw--translate-y-1.5"
            : position.endsWith("-bottom")
            ? "tw-bottom-[--ttp-crt-ps,1rem] tw-translate-y-1.5"
            : position.startsWith("top") || position.startsWith("bottom")
            ? "tw-left-0 tw-right-0 tw-mx-auto"
            : position.startsWith("left") || position.startsWith("right")
            ? "tw-bottom-0 tw-top-0 tw-my-auto"
            : ""
        } tw-bg-neutral-600`}
        style={{
          clipPath: position.startsWith("top")
            ? "polygon(0% 0%,50% 100%,100% 0%)"
            : position.startsWith("bottom")
            ? "polygon(0% 100%,50% 0%,100% 100%)"
            : position.startsWith("left")
            ? "polygon(0% 0%,100% 50%,0% 100%)"
            : position.startsWith("right")
            ? "polygon(100% 0%,0% 50%,100% 100%)"
            : "",
          ["--ttp-crt-ps" as any]: caretPosition,
        }}
      ></div>
      {children}
    </div>
  );
};

export default Tooltip;
