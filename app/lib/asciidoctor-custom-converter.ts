import type {
  Asciidoctor,
  AbstractNode,
  Html5Converter,
  Inline,
  Section,
  Table,
} from "asciidoctor";

import type getLocalImageImport from "@/app/lib/server/local-image";

const escapeHTMLAttr = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export class CustomConverter {
  baseConverter: Html5Converter;
  imgPrefix: string;
  getLocalImage: typeof getLocalImageImport | null;

  constructor(
    asciidoctor: Asciidoctor,
    imgPrefix: string,
    getLocalImage: typeof getLocalImageImport | null,
  ) {
    this.baseConverter = asciidoctor.Html5Converter.create();
    this.imgPrefix = imgPrefix;
    this.getLocalImage = getLocalImage;
  }

  convert(node: AbstractNode, transform?: string) {
    if (
      node.getNodeName() === "section" &&
      (node as Section).getLevel() === 0 &&
      node.getAttribute("data-letter")
    ) {
      return this.baseConverter
        .convert(node, transform)
        .replace(
          /(class="sect0[^"]*?")>/,
          `$1 data-letter="${escapeHTMLAttr(
            node.getAttribute("data-letter"),
          )}">`,
        );
    }

    if (
      node.getNodeName() === "inline_image" &&
      (node as Inline).getType() === "icon" &&
      node.getDocument().getAttribute("icons") === "font"
    ) {
      return this.baseConverter
        .convert(node, transform)
        .replace(
          /<i class="fa/,
          `<i data-target="${(node as Inline).getTarget()}" class="fa`,
        );
    }

    if (
      node.getNodeName() === "inline_image" ||
      node.getNodeName() === "image"
    ) {
      const target = (
        node.getNodeName() === "inline_image"
          ? (node as Inline).getTarget()
          : node.getAttribute("target")
      )
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
      const imageUri = node.getImageUri(target);

      const toURL = (maybe_url: string) => {
        try {
          return new URL(maybe_url);
        } catch {
          return null;
        }
      };

      const url = toURL(imageUri);
      if (url !== null) {
        if (
          url.href.startsWith(this.imgPrefix) &&
          [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".avif",
            ".tif",
            ".tiff",
            ".gif",
          ].filter((ext) => target.toLowerCase().endsWith(ext)).length > 0
        ) {
          const res =
            this.getLocalImage !== null
              ? this.getLocalImage(target)
              : { data: url.href, srcset: null, failed: false };
          if (res.failed !== true) {
            const wrapperTag =
              node.getNodeName() === "inline_image" ? "span" : "div";
            return this.baseConverter
              .convert(node, transform)
              .replace(
                /<img src="[^"]*"([^>]*>)/,
                `<${wrapperTag} class="lazyload-img-wrapper"><img class="lazyload blur-up" data-sizes="auto" data-srcset="${escapeHTMLAttr(
                  res.srcset ?? "",
                )}" src="${escapeHTMLAttr(
                  res.data,
                )}"$1<${wrapperTag} class="overlay"></${wrapperTag}></${wrapperTag}>`,
              );
          }
        }
      }
    }

    if (node.getNodeName() === "table") {
      const result = [];
      result.push(`<div class="tableblock-wrapper">`);
      if ((node as Table).getTitle()) {
        result.push(
          `<div class="tableblock-title">${(
            node as Table
          ).getCaptionedTitle()}</div>`,
        );
      }
      result.push(`<div class="tableblock-content">`);
      result.push(this.baseConverter.convert(node, "table"));
      result.push(`</div>`);
      result.push(`</div>`);
      return result.join(`\n`);
    }

    return this.baseConverter.convert(node, transform);
  }
}
