"use client";

import colors from "tailwindcss/colors";

import { twGrays, twColors, colorVariant } from "@/app/lib/utils/color";

type Props = {
  kind?: Kind;
  colorVariant?: colorVariant;
  interactiveColorVariant?: colorVariant;
  border?: "thin" | "normal";
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const kinds = [
  "solid",
  "solid2ghost",
  "ghost2solid",
  "ghost2solidAlt",
  "ghost",
  "soft",
  "soft2solid",
  "soft2solidAlt",
  "softGhost",
  "softGhost2ghost",
] as const;

type Kind =
  | "none"
  | "swipeFromLeft"
  | "swipeFromBottom"
  | (typeof kinds)[number]
  | `${(typeof kinds)[number]}-trans`;

const Button = ({
  kind = "solid",
  colorVariant = "default",
  interactiveColorVariant = colorVariant,
  border = "thin",
  className,
  disabled,
  style,
  onClick,
  ...buttonProps
}: Props) => {
  return (
    <button
      className={
        kind === "none"
          ? className
          : `${
              border === "thin" ? "tw-border" : "tw-border-2"
            } tw-rounded-none tw-px-3 tw-py-2 tw-font-inter tw-text-base tw-font-medium tw-leading-normal ${
              kindMapping[kind].className ?? ""
            } ${disabled ? "" : kindMapping[kind].interactiveClassName ?? ""} ${
              className ?? ""
            }`
      }
      disabled={disabled}
      style={
        kind === "none"
          ? style
          : {
              ["--btn-color" as any]: colorVariantMapping[colorVariant].text,
              ["--btn-alt-color" as any]:
                colorVariantMapping[interactiveColorVariant].text,
              ["--btn-bg-color" as any]: colorVariantMapping[colorVariant].bg,
              ["--btn-bg-alt-color" as any]:
                colorVariantMapping[interactiveColorVariant].bg,
              ["--btn-bg-alt2-color" as any]:
                colorVariantMapping[interactiveColorVariant].bgAlt,
              ["--btn-soft-bg-color" as any]:
                colorVariantMapping[colorVariant].softBg,
              ["--btn-soft-bg-alt-color" as any]:
                colorVariantMapping[interactiveColorVariant].softBgAlt,
              ["--btn-soft2-bg-color" as any]:
                colorVariantMapping[colorVariant].softBgAlt,
              ["--btn-soft-border-color" as any]:
                colorVariantMapping[colorVariant].softBorder,
              ["--btn-soft-border-alt-color" as any]:
                colorVariantMapping[interactiveColorVariant].softBorder,
              ["--btn-soft3-bg-alt-color" as any]:
                colorVariantMapping[interactiveColorVariant].softBg,
              ...style,
            }
      }
      onClick={(event) => {
        try {
          if (onClick !== undefined) onClick(event);
        } catch {}
        event.currentTarget.blur();
      }}
      {...buttonProps}
    />
  );
};

export default Button;

const colorVariantMapping = (() => {
  const colorVariantMapping = {
    default: {
      text: colors.gray[900],
      bg: colors.neutral[900],
      bgAlt: colors.neutral[700],
      softBg: colors.gray[100],
      softBgAlt: colors.gray[200],
      softBorder: colors.gray[300],
    },
  } as {
    [key in colorVariant]: {
      text: string;
      bg: string;
      bgAlt: string;
      softBg: string;
      softBgAlt: string;
      softBorder: string;
    };
  };
  for (const grayName of twGrays) {
    colorVariantMapping[`dark-${grayName}`] = {
      text: colors[grayName][900],
      bg: colors[grayName][900],
      bgAlt: colors[grayName][700],
      softBg: colors[grayName][100],
      softBgAlt: colors[grayName][200],
      softBorder: colors[grayName][300],
    };
    colorVariantMapping[grayName] = {
      text: colors[grayName][700],
      bg: colors[grayName][700],
      bgAlt: colors[grayName][600],
      softBg: colors[grayName][100],
      softBgAlt: colors[grayName][200],
      softBorder: colors[grayName][300],
    };
  }
  for (const colorName of twColors) {
    colorVariantMapping[colorName] = {
      text: colors[colorName][600],
      bg: colors[colorName][600],
      bgAlt: colors[colorName][500],
      softBg: colors[colorName][50],
      softBgAlt: colors[colorName][100],
      softBorder: colors[colorName][200],
    };
  }
  return colorVariantMapping;
})();

const kindMapping = (() => {
  const swipeClassName =
    "tw-border-[--btn-color] tw-bg-gradient-to-r tw-from-[--btn-bg-color] tw-to-[--btn-bg-color] tw-text-[--btn-color] tw-transition-[background-size,border-color]";
  const swipeInteractiveClassName =
    "hover:tw-border-[--btn-bg-alt-color] hover:tw-from-[--btn-bg-alt-color] hover:tw-to-[--btn-bg-alt-color] hover:tw-text-white focus:tw-border-[--btn-bg-alt-color] focus:tw-from-[--btn-bg-alt-color] focus:tw-to-[--btn-bg-alt-color] focus:tw-text-white";

  const solidClassName =
    "tw-border-[--btn-bg-color] tw-bg-[--btn-bg-color] tw-text-white";
  const solidInteractiveClassName =
    "hover:tw-border-[--btn-bg-alt-color] hover:tw-bg-[--btn-bg-alt-color] hover:tw-text-white focus:tw-border-[--btn-bg-alt-color] focus:tw-bg-[--btn-bg-alt-color] focus:tw-text-white";
  const solidAltInteractiveClassName =
    "hover:tw-border-[--btn-bg-alt2-color] hover:tw-bg-[--btn-bg-alt2-color] hover:tw-text-white focus:tw-border-[--btn-bg-alt2-color] focus:tw-bg-[--btn-bg-alt2-color] focus:tw-text-white";

  const ghostClassName =
    "tw-border-[--btn-color] tw-bg-transparent tw-text-[--btn-color]";
  const ghostInteractiveClassName =
    "hover:tw-border-[--btn-alt-color] hover:tw-bg-transparent hover:tw-text-[--btn-alt-color] focus:tw-border-[--btn-alt-color] focus:tw-bg-transparent focus:tw-text-[--btn-alt-color]";

  const softClassName =
    "tw-border-[--btn-soft-bg-color] tw-bg-[--btn-soft-bg-color] tw-text-[--btn-color]";
  const softInteractiveClassName =
    "hover:tw-border-[--btn-soft-bg-alt-color] hover:tw-bg-[--btn-soft-bg-alt-color] hover:tw-text-[--btn-alt-color] focus:tw-border-[--btn-soft-bg-alt-color] focus:tw-bg-[--btn-soft-bg-alt-color] focus:tw-text-[--btn-alt-color]";

  const soft2ClassName =
    "tw-border-[--btn-soft2-bg-color] tw-bg-[--btn-soft2-bg-color] tw-text-[--btn-color]";

  const softGhostClassName =
    "tw-border-[--btn-soft-border-color] tw-bg-transparent tw-text-[--btn-color]";
  const softGhostInteractiveClassName =
    "hover:tw-border-[--btn-soft-border-alt-color] hover:tw-bg-[--btn-soft3-bg-alt-color] hover:tw-text-[--btn-alt-color] focus:tw-border-[--btn-soft-border-alt-color] focus-within::tw-bg-[--btn-soft3-bg-alt-color] focus-within::tw-text-[--btn-alt-color]";

  const kindMapping = {
    none: { className: "", interactiveClassName: "" },
    swipeFromLeft: {
      className: `bg-from-left ${swipeClassName}`,
      interactiveClassName: swipeInteractiveClassName,
    },
    swipeFromBottom: {
      className: `bg-from-bottom ${swipeClassName}`,
      interactiveClassName: swipeInteractiveClassName,
    },
    solid: {
      className: solidClassName,
      interactiveClassName: solidAltInteractiveClassName,
    },
    solid2ghost: {
      className: solidClassName,
      interactiveClassName: ghostInteractiveClassName,
    },
    ghost2solid: {
      className: ghostClassName,
      interactiveClassName: solidInteractiveClassName,
    },
    ghost2solidAlt: {
      className: ghostClassName,
      interactiveClassName: solidAltInteractiveClassName,
    },
    ghost: {
      className: ghostClassName,
      interactiveClassName: ghostInteractiveClassName,
    },
    soft: {
      className: softClassName,
      interactiveClassName: softInteractiveClassName,
    },
    soft2solid: {
      className: soft2ClassName,
      interactiveClassName: solidInteractiveClassName,
    },
    soft2solidAlt: {
      className: soft2ClassName,
      interactiveClassName: solidAltInteractiveClassName,
    },
    softGhost: {
      className: softGhostClassName,
      interactiveClassName: softGhostInteractiveClassName,
    },
    softGhost2ghost: {
      className: softGhostClassName,
      interactiveClassName: ghostInteractiveClassName,
    },
  } as {
    [key in Kind]: {
      className: string;
      interactiveClassName: string;
    };
  };
  for (const kind of kinds) {
    kindMapping[`${kind}-trans`] = {
      className: `${kindMapping[kind].className} tw-transition-[background-color,border-color]`,
      interactiveClassName: kindMapping[kind].interactiveClassName,
    };
  }
  return kindMapping;
})();
