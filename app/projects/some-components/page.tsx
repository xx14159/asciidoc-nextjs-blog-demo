import { Metadata } from "next";

import Button from "@/app/components/button";
import Form from "@/app/components/forms/form";
import InputGroup from "@/app/components/forms/input-group";
import Tooltip from "@/app/components/tooltip";
import TooltipWrapper from "@/app/components/tooltip/wrapper";
import { basePrefix, imgPrefix } from "@/app/lib/server/env";

export const generateMetadata = (): Metadata => {
  const title = "Buttons";
  const url = new URL("projects/buttons", basePrefix);
  return {
    title,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      images: new URL("og.png", imgPrefix),
      url,
    },
  };
};

const Page = () => {
  return (
    <article className="tw-mx-auto tw-max-w-screen-lg tw-px-4 tw-pb-32 tw-pt-16 sm:tw-px-8 md:tw-px-12">
      <div className="tw-pb-8 tw-font-inter tw-text-base tw-font-normal tw-leading-relaxed tw-text-gray-900">
        <h1 className="tw-text-2xl tw-font-bold">Some components</h1>
      </div>

      <Form className="tw-mb-6 tw-flex tw-flex-row tw-flex-wrap tw-items-start tw-justify-start tw-gap-x-4 tw-gap-y-4 sm:tw-gap-x-6">
        <InputGroup label="Field" helpMessage="Some help message." />
        <InputGroup label="Field" colorVariant="blue">
          <TooltipWrapper className="tw-ml-1 tw-inline-block">
            <span className="font-icon tw-text-gray-500 hover:tw-text-gray-700 focus:tw-text-gray-700">
              {"\ue887"}
            </span>
            <Tooltip>Some help?</Tooltip>
          </TooltipWrapper>
          <TooltipWrapper className="tw-ml-1 tw-inline-block">
            <span className="font-icon tw-text-gray-500 hover:tw-text-gray-700 focus:tw-text-gray-700">
              {"\ue026"}
            </span>
            <Tooltip position="top-left" caretPosition="8.75px">
              Some help?
            </Tooltip>
          </TooltipWrapper>
          <TooltipWrapper className="tw-ml-1 tw-inline-block">
            <span className="font-icon tw-text-gray-500 hover:tw-text-gray-700 focus:tw-text-gray-700">
              {"\ue1bd"}
            </span>
            <Tooltip position="right">Some help?</Tooltip>
          </TooltipWrapper>
        </InputGroup>
        <InputGroup label="Field" borderColorVariant="blue" />
        <InputGroup label="Field" interactiveBorderColorVariant="blue" />
        <InputGroup
          label="Field"
          borderColorVariant="teal"
          interactiveBorderColorVariant="blue"
          helpMessage="Some help message."
        />
        <InputGroup
          label="Field"
          colorVariant="blue"
          errorMessage="Some error message"
        />
      </Form>

      <div className="tw-mb-6 tw-flex tw-flex-row tw-flex-wrap tw-items-center tw-justify-start tw-gap-x-4 tw-gap-y-4 tw-font-inter tw-text-base tw-font-normal tw-leading-relaxed tw-text-gray-900 sm:tw-gap-x-6">
        <TooltipWrapper className="tw-inline-block">
          Hover over me.
          <Tooltip position="bottom-left">Some help?</Tooltip>
        </TooltipWrapper>
        <TooltipWrapper className="tw-inline-block">
          Hover over me.
          <Tooltip position="top-right">Some help?</Tooltip>
        </TooltipWrapper>
        <TooltipWrapper className="tw-inline-block">
          Hover over me.
          <Tooltip position="right">Some help?</Tooltip>
        </TooltipWrapper>
        <TooltipWrapper className="tw-inline-block">
          Hover over me.
          <Tooltip position="left">Some help?</Tooltip>
        </TooltipWrapper>
      </div>

      <Form className="tw-flex tw-flex-row tw-flex-wrap tw-items-start tw-justify-start tw-gap-x-4 tw-gap-y-4 sm:tw-gap-x-6">
        <Button kind="swipeFromLeft">Button</Button>
        <Button kind="swipeFromBottom">Button</Button>

        <Button kind="solid-trans" colorVariant="blue">
          Button
        </Button>
        <Button kind="solid2ghost-trans" colorVariant="blue">
          Button
        </Button>
        <Button kind="ghost2solid-trans" colorVariant="blue">
          Button
        </Button>
        <Button kind="ghost2solidAlt-trans" colorVariant="blue">
          Button
        </Button>

        <Button
          kind="ghost-trans"
          border="normal"
          interactiveColorVariant="teal"
        >
          Button
        </Button>
        <Button
          kind="soft-trans"
          border="normal"
          interactiveColorVariant="teal"
        >
          Button
        </Button>
        <Button
          kind="soft2solid-trans"
          border="normal"
          interactiveColorVariant="teal"
        >
          Button
        </Button>
        <Button
          kind="soft2solidAlt-trans"
          border="normal"
          interactiveColorVariant="teal"
        >
          Button
        </Button>

        <Button
          kind="softGhost-trans"
          colorVariant="blue"
          interactiveColorVariant="pink"
        >
          Button
        </Button>
        <Button
          kind="softGhost2ghost-trans"
          colorVariant="blue"
          interactiveColorVariant="pink"
        >
          Button
        </Button>
        <Button
          kind="solid-trans"
          colorVariant="blue"
          interactiveColorVariant="pink"
        >
          Button
        </Button>
      </Form>
    </article>
  );
};

export default Page;
