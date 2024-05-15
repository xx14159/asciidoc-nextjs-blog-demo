import type { Document as ADocument } from "asciidoctor";

import { getContext } from "@/app/lib/parse-post";

type Lead = {
  imageSrc: string;
  imageSrcset: string | null;
  imageOG: string;
  layout: LeadLayout;
  align: AlignVariant | null;
  dark: boolean;
  color: string | null;
  blur: boolean;
};
type AlignVariant = "align-left" | "align-center" | "align-right";
type LeadLayout =
  | { type: "banner"; variant: null }
  | { type: "immersive"; variant: ImmersiveVariant }
  | { type: "side"; variant: SideVariant };
type ImmersiveVariant =
  | "left top"
  | "left"
  | "left bottom"
  | "top"
  | ""
  | "bottom"
  | "right top"
  | "right"
  | "right bottom";
type SideVariant =
  | "left top"
  | "left"
  | "left bottom"
  | "right top"
  | "right"
  | "right bottom";

export const getPageLead = (
  doc: ADocument,
  ctx: ReturnType<typeof getContext>,
) => {
  const pageLeadImage: string | undefined = doc.getAttribute("page-lead-image");

  if (!pageLeadImage) return null;

  const toURL = (maybe_url: string) => {
    try {
      return new URL(maybe_url);
    } catch {
      return null;
    }
  };

  const imageURL = toURL(pageLeadImage);
  const imageRes =
    ctx.getLocalImage !== null && imageURL === null
      ? ctx.getLocalImage(pageLeadImage)
      : {
          data: imageURL?.href ?? pageLeadImage,
          srcset: null,
          og: imageURL?.href ?? pageLeadImage,
        };

  const dark = ["", "1", "true", "True", "TRUE"].includes(
    doc.getAttribute("page-lead-dark", "false"),
  );

  const colorStr = (doc.getAttribute("page-lead-color", "") as string)
    .toLowerCase()
    .split(",")
    .map((s) => s.trim());
  const color =
    /^#[0-9a-fA-F]{8}$/
      .exec(colorStr.at(0) ?? "")
      ?.at(0)
      ?.toLowerCase() ?? null;
  const blur = colorStr.at(1) === "blur";

  let align: AlignVariant | null = null;
  const getAlignVariant = (alignVariantStr: string) => {
    switch (alignVariantStr) {
      case "left":
        return "align-left";
      case "center":
        return "align-center";
      case "right":
        return "align-right";
      default:
        return null;
    }
  };

  const layout: LeadLayout = (() => {
    const defaultLayout: LeadLayout = { type: "banner", variant: null };

    const layoutStr = (doc.getAttribute("page-lead-layout", "banner") as string)
      .toLowerCase()
      .split(",")
      .map((tag) => tag.trim());
    const layoutVariantStr = layoutStr[0];
    const alignVariantStr = layoutStr.at(1) || "";

    if (layoutVariantStr.startsWith("immersive")) {
      const fragment = layoutVariantStr.replace(/^immersive/, "");
      let variant: ImmersiveVariant;
      switch (fragment) {
        case "-left-top":
        case "-top-left":
          variant = "left top";
          align = "align-left";
          break;

        case "-left":
        case "-left-center":
        case "-center-left":
          variant = "left";
          align = "align-left";
          break;

        case "-left-bottom":
        case "-bottom-left":
          variant = "left bottom";
          align = "align-left";
          break;

        case "-top":
        case "-center-top":
        case "-top-center":
          variant = "top";
          align = "align-center";
          break;

        case "":
        case "-center":
        case "-center-center":
          variant = "";
          align = "align-center";
          break;

        case "-bottom":
        case "-center-bottom":
        case "-bottom-center":
          variant = "bottom";
          align = "align-center";
          break;

        case "-right-top":
        case "-top-right":
          variant = "right top";
          align = "align-left";
          break;

        case "-right":
        case "-right-center":
        case "-center-right":
          variant = "right";
          align = "align-left";
          break;

        case "-right-bottom":
        case "-bottom-right":
          variant = "right bottom";
          align = "align-left";
          break;

        default:
          return defaultLayout;
      }
      align = getAlignVariant(alignVariantStr) ?? align;
      const layout: LeadLayout = { type: "immersive", variant };

      return layout;
    } else if (layoutVariantStr.startsWith("side")) {
      const fragment = layoutVariantStr.replace(/^side/, "");
      let variant: SideVariant;
      switch (fragment) {
        case "-left-top":
        case "-top-left":
          variant = "left top";
          break;

        case "-left":
        case "-left-center":
          variant = "left";
          break;

        case "-left-bottom":
        case "-bottom-left":
          variant = "left bottom";
          break;

        case "-right-top":
        case "-top-right":
          variant = "right top";
          break;

        case "":
        case "-right":
        case "-right-center":
          variant = "right";
          break;

        case "-right-bottom":
        case "-bottom-right":
          variant = "right bottom";
          break;

        default:
          return defaultLayout;
      }
      align = getAlignVariant(alignVariantStr) ?? "align-left";
      const layout: LeadLayout = { type: "side", variant };

      return layout;
    } else {
      return defaultLayout;
    }
  })();

  return {
    imageSrc: imageRes.data,
    imageSrcset: imageRes.srcset,
    imageOG: imageRes.og,
    layout,
    align,
    dark,
    color,
    blur,
  } as Lead;
};
