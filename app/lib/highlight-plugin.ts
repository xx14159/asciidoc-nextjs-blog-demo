import { HLJSPlugin, HighlightResult } from "highlight.js";

export const mergeHTMLPluginFactory: (window: any) => HLJSPlugin = (
  window: any,
) => {
  const escapeHTML = (value: string) => {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  };

  /* plugin itself */

  class mergeHTMLPlugin {
    window: any;
    el!: Node;

    constructor() {
      this.window = window;
    }

    "before:highlightElement" = ({ el }: { el: Element; language: string }) => {
      this.el = el.cloneNode(true);
    };

    "after:highlightElement" = ({
      el,
      result,
      text,
    }: {
      el: Element;
      result: HighlightResult;
      text: string;
    }) => {
      const originalStream = nodeStream(this.el);
      if (!originalStream.length) return;

      const resultNode = this.window.document.createElement("div");
      resultNode.innerHTML = result.value;
      result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
      el.innerHTML = result.value;
    };
  }

  /* Stream merging support functions */

  type StreamEvent = {
    event: "start" | "stop";
    offset: number;
    node: Node;
  };

  const tag = (node: Node) => {
    return node.nodeName.toLowerCase();
  };

  const nodeStream = (node: Node) => {
    const result = [] as StreamEvent[];
    const _nodeStream = (node: Node, offset: number) => {
      for (let child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType === 3) {
          offset += child.nodeValue?.length ?? 0;
        } else if (child.nodeType === 1) {
          result.push({
            event: "start",
            offset: offset,
            node: child,
          });
          offset = _nodeStream(child, offset);
          // Prevent void elements from having an end tag that would actually
          // double them in the output. There are more void elements in HTML
          // but we list only those realistically expected in code display.
          if (!tag(child).match(/br|hr|img|input/)) {
            result.push({
              event: "stop",
              offset: offset,
              node: child,
            });
          }
        }
      }
      return offset;
    };
    _nodeStream(node, 0);
    return result;
  };

  const mergeStreams = (
    original: StreamEvent[],
    highlighted: StreamEvent[],
    value: string,
  ) => {
    let processed = 0;
    let result = "";
    const nodeStack = [];

    const selectStream = () => {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset !== highlighted[0].offset) {
        return original[0].offset < highlighted[0].offset
          ? original
          : highlighted;
      }

      /*
        To avoid starting the stream just before it should stop the order is
        ensured that original always starts first and closes last:
  
        if (event1 == 'start' && event2 == 'start')
          return original;
        if (event1 == 'start' && event2 == 'stop')
          return highlighted;
        if (event1 == 'stop' && event2 == 'start')
          return original;
        if (event1 == 'stop' && event2 == 'stop')
          return highlighted;
  
        ... which is collapsed to:
        */
      return highlighted[0].event === "start" ? original : highlighted;
    };

    const open = (node: Node) => {
      const attributeString = (attr: Attr) => {
        return " " + attr.nodeName + '="' + escapeHTML(attr.value) + '"';
      };
      result +=
        "<" +
        tag(node) +
        // @ts-ignore
        [].map.call(node.attributes, attributeString).join("") +
        ">";
    };

    const close = (node: Node) => {
      result += "</" + tag(node) + ">";
    };

    const render = (event: StreamEvent) => {
      (event.event === "start" ? open : close)(event.node);
    };

    while (original.length || highlighted.length) {
      let stream = selectStream();
      result += escapeHTML(value.substring(processed, stream[0].offset));
      processed = stream[0].offset;
      if (stream === original) {
        /*
          On any opening or closing tag of the original markup we first close
          the entire highlighted node stack, then render the original tag along
          with all the following original tags at the same offset and then
          reopen all the tags on the highlighted stack.
          */
        nodeStack.reverse().forEach(close);
        do {
          render(stream.splice(0, 1)[0]);
          stream = selectStream();
        } while (
          stream === original &&
          stream.length &&
          stream[0].offset === processed
        );
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event === "start") {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escapeHTML(value.substr(processed));
  };

  return new mergeHTMLPlugin();
};
