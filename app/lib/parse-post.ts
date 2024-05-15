import type { Document as ADocument } from "asciidoctor";
import asciidoctor from "asciidoctor";
import hljs from "highlight.js";
import type { JSDOM } from "jsdom";
import uniq from "lodash/uniq";
import { mathjax } from "mathjax-full/js/mathjax";
import type { MathDocument } from "mathjax-full/js/core/MathDocument";
import type { MinDOMParser } from "mathjax-full/js/adaptors/HTMLAdaptor";
import { browserAdaptor } from "mathjax-full/js/adaptors/browserAdaptor";
import { jsdomAdaptor } from "mathjax-full/js/adaptors/jsdomAdaptor";
import { TeX } from "mathjax-full/js/input/tex";
import { CHTML } from "mathjax-full/js/output/chtml";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html";
import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages";
import "mathjax-full/js/util/entities/all";

import { CustomConverter } from "@/app/lib/asciidoctor-custom-converter";
import { mergeHTMLPluginFactory } from "@/app/lib/highlight-plugin";
import { getPageLead } from "@/app/lib/parse-post-lead";
import type getLocalImageImport from "./server/local-image";

interface JSDOMInterface {
  new (name: string): JSDOM;
}

export const getContext = (
  JSDOM: JSDOMInterface | null,
  getLocalImage: typeof getLocalImageImport | null,
  img_prefix: string,
  static_prefix: string,
  dev: boolean,
) => {
  // mathjax

  const adaptor = JSDOM !== null ? jsdomAdaptor(JSDOM) : browserAdaptor();
  AssistiveMmlHandler(RegisterHTMLHandler(adaptor) as any);
  const chtml = new CHTML<HTMLElement, Text, Document>({
    fontURL: new URL("fonts/MathJax", static_prefix).href,
  });

  // highlight.js

  hljs.configure({
    ignoreUnescapedHTML: true,
    noHighlightRe: /\bnohighlight\b/,
  });
  hljs.registerAliases("none", { languageName: "plaintext" });
  hljs.addPlugin(mergeHTMLPluginFactory(adaptor.window));

  // asciidoctor

  const adocConverter = asciidoctor();
  adocConverter.ConverterFactory.register(
    new CustomConverter(adocConverter, img_prefix, getLocalImage),
    ["html5-custom"],
  );
  const registry = adocConverter.Extensions.create();
  const asciidoctorProcessorOptions = {
    attributes: {
      icons: "font",
      iconsdir: new URL("_icons@", img_prefix).href,
      icontype: "svg@",
      imagesdir: new URL("@", img_prefix).href,
      stem: "latexmath",
      "source-highlighter": "highlight.js",
      "source-language": "plaintext@",
      "title-separator": "::@",
    },
    backend: "html5-custom",
    extension_registry: registry,
    safe: "server",
    standalone: false,
  };

  const domParser =
    JSDOM !== null ? new adaptor.window.DOMParser() : new DOMParser();
  return {
    adaptor,
    chtml,
    hljs,
    adocConverter,
    getLocalImage,
    asciidoctorProcessorOptions,
    domParser,
    img_prefix,
    static_prefix,
    dev,
  };
};

export const getTitle = (
  doc: ADocument,
  domParser: MinDOMParser<Document> | DOMParser,
) => {
  const defaultMain = "Untitled post";
  const defaultSubtitle = "";
  const defaultMainText = "Untitled post";

  const title = doc.getDocumentTitle({ partition: true }) as
    | ADocument.Title
    | undefined;
  if (title === undefined) {
    return {
      main: defaultMain,
      subtitle: defaultSubtitle,
      mainText: defaultMainText,
    };
  } else {
    const main = title.getMain() || defaultMain;
    const subtitle = title.getSubtitle() || defaultSubtitle;
    return {
      main,
      subtitle,
      mainText:
        domParser.parseFromString(main, "text/html").body.textContent ??
        defaultMainText,
    };
  }
};

export const getLang = (doc: ADocument) => {
  const lang = doc.getAttribute("lang", "en") as string;
  return lang;
};

export const getPagePublic = (doc: ADocument, dev: boolean) => {
  const pagePublic = doc.getAttribute("page-public", "false");
  return dev
    ? ["", "1", "true", "True", "TRUE", "test", "Test", "TEST"].includes(
        pagePublic,
      )
    : ["", "1", "true", "True", "TRUE"].includes(pagePublic);
};

export const getPageCTime = (doc: ADocument, slug: string) => {
  const ctime = new Date(doc.getAttribute("page-ctime", ""));
  if (!isNaN(ctime.getTime())) {
    return ctime;
  }
  const nameDate = new Date(slug.split("-").slice(0, 3).join("-"));
  if (!isNaN(nameDate.getTime())) {
    return nameDate;
  }
  return null;
};

export const getPageTags = (
  doc: ADocument,
  domParser: MinDOMParser<Document> | DOMParser,
) => {
  return uniq(
    (
      domParser.parseFromString(doc.getAttribute("page-tags", ""), "text/html")
        .body.textContent ?? ""
    )
      .toLowerCase()
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  );
};

export const getPageHeadingStyle = (doc: ADocument) => {
  const defaultHeadingStyle = {
    big: false,
    center: false,
    hr: false,
    sans: false,
    smallCaps: false,
  };

  const headingStyleStr = (doc.getAttribute("page-heading-style", "") as string)
    .toLowerCase()
    .split(" ")
    .map((s) => s.trim());
  let big: boolean = false;
  let center: boolean = false;
  let hr: boolean = false;
  let sans: boolean = false;
  let smallCaps: boolean = false;

  for (const s of headingStyleStr) {
    switch (s) {
      case "big":
        if (big) return defaultHeadingStyle;
        big = true;
        break;

      case "center":
        if (center) return defaultHeadingStyle;
        center = true;
        break;

      case "hr":
        if (hr) return defaultHeadingStyle;
        hr = true;
        break;

      case "sans":
        if (sans) return defaultHeadingStyle;
        sans = true;
        break;

      case "small-caps":
        if (smallCaps) return defaultHeadingStyle;
        smallCaps = true;
        break;

      case "":
        break;

      default:
        return defaultHeadingStyle;
    }
  }

  return { big, center, hr, sans, smallCaps };
};

export const doc2Post = (
  doc: ADocument,
  slug: string | null,
  ctx: ReturnType<typeof getContext>,
) => {
  const pagePublic = slug === null ? true : getPagePublic(doc, ctx.dev);
  const pageCTime = getPageCTime(doc, slug ?? "1999-12-31");

  if (!pagePublic || pageCTime === null) return null;

  const tex = new TeX<HTMLElement, Text, Document>({
    packages: AllPackages,
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: false,
    processEnvironments: false,
    processRefs: false,
    tags: doc.getAttribute("eqnums", "none") || "ams",
  });
  ctx.chtml.clearCache();
  const mathHtml = mathjax.document(doc.convert(), {
    InputJax: tex,
    OutputJax: ctx.chtml,
    ignoreHtmlClass: "nostem",
  }) as MathDocument<HTMLElement, Text, Document>;
  mathHtml.render();
  const noMath = Array.from(mathHtml.math).length === 0;

  const lang = getLang(doc);
  mathHtml.document.body.setAttribute("lang", lang);
  mathHtml.document
    .querySelectorAll('[class^="lang-"],[class*=" lang-"]')
    .forEach((el) => {
      const lang = Array.from(el.classList)
        .find((c) => c.startsWith("lang-") && c.length >= 7)
        ?.slice(5);
      if (lang !== undefined) {
        el.setAttribute("lang", lang);
      }
    });
  mathHtml.document.querySelectorAll("pre.highlight > code").forEach((el) => {
    hljs.highlightElement(el as HTMLElement);
  });
  mathHtml.document.querySelectorAll("div.attribution").forEach((el) => {
    let dash: string;
    if (el.matches(":is(:lang(zh), :lang(ja), :lang(ko))")) {
      dash = "⸺";
    } else {
      dash = "—";
    }
    el.innerHTML = el.innerHTML.replace(/(?<=^\n)— /, dash);
    console.log(el.innerHTML);
  });
  const html = ctx.adaptor.innerHTML(ctx.adaptor.body(mathHtml.document));
  const mathjaxStyles = noMath
    ? null
    : ctx.adaptor.textContent(ctx.chtml.styleSheet(mathHtml));

  const { main, subtitle, mainText } = getTitle(doc, ctx.domParser);
  const authors = doc
    .getAuthors()
    .map((author) => author.getName())
    .filter((name) => name !== undefined) as string[];
  const description: string = doc.getAttribute("description", "");
  const keywords: string = doc.getAttribute("keywords", "");

  const pageTags = getPageTags(doc, ctx.domParser);
  const pageUpdateDate = (() => {
    const revDate = new Date(doc.getRevisionDate() ?? "");
    if (!isNaN(revDate.getTime()) && pageCTime != null && revDate > pageCTime) {
      return revDate;
    }
    return null;
  })();
  const lead = getPageLead(doc, ctx);
  const pageHeadingStyle = getPageHeadingStyle(doc);

  return {
    slug,
    html,
    mathjaxStyles,
    main,
    subtitle,
    mainText,
    authors,
    lang,
    description,
    keywords,
    pageCTime,
    pageTags,
    pageUpdateDate,
    lead,
    pageHeadingStyle,
  };
};

export const getPostFromString = (
  text: string,
  ctx: ReturnType<typeof getContext>,
) => {
  const doc = ctx.adocConverter.load(text, ctx.asciidoctorProcessorOptions);
  return doc2Post(doc, null, ctx);
};
