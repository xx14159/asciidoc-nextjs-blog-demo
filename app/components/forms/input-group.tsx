"use client";

import { useId, useRef, useState } from "react";

import colors from "tailwindcss/colors";

import { twGrays, twColors, colorVariant } from "@/app/lib/utils/color";

type Props = {
  label: string;
  colorVariant?: colorVariant;
  borderColorVariant?: colorVariant;
  interactiveBorderColorVariant?: colorVariant;
  helpMessage?: string;
  errorMessage?: string;
  labelWrapperProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  labelProps?: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >;
  inputWrapperProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & {
    onStep?: (newValue: number) => void;
  };
  messageProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const InputGroup = ({
  children,
  label,
  colorVariant = "default",
  borderColorVariant = colorVariant,
  interactiveBorderColorVariant = borderColorVariant,
  helpMessage,
  errorMessage,
  labelWrapperProps,
  labelProps,
  inputWrapperProps,
  inputProps,
  messageProps,
  ...divProps
}: Props) => {
  const { className: labelWrapperClassName, ...restLabelWrapperProps } =
    labelWrapperProps ?? {};
  const {
    children: labelChildren,
    className: labelClassName,
    htmlFor: labelHtmlFor,
    ...restLabelProps
  } = labelProps ?? {};

  const {
    className: inputWrapperClassName,
    style: inputWrapperStyle,
    ...restInputWrapperProps
  } = inputWrapperProps ?? {};
  const {
    id: inputId,
    className: inputClassName,
    type: inputType,
    value: inputValue,
    disabled: inputDisabled,
    onStep,
    onBlur: inputOnBlur,
    ...restInputProps
  } = inputProps ?? {};

  const {
    className: messageClassName,
    style: messageStyle,
    ...restMessageProps
  } = messageProps ?? {};

  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [state, setState] = useState<"init" | "normal">(() =>
    inputValue === undefined || inputValue === "" ? "init" : "normal",
  );

  const error = state === "normal" && errorMessage !== undefined;
  const message = error ? errorMessage : helpMessage;
  if (error) {
    colorVariant = "red";
    borderColorVariant = "red";
    interactiveBorderColorVariant = "red";
  }

  return (
    <div {...divProps}>
      <div
        className={`tw-whitespace-nowrap tw-text-sm tw-font-medium tw-leading-normal tw-text-gray-900 ${
          labelWrapperClassName ?? ""
        }`}
        {...restLabelWrapperProps}
      >
        <label
          className={`tw-inline-block tw-pb-2 ${labelClassName ?? ""}`}
          htmlFor={labelHtmlFor ?? id}
          {...restLabelProps}
        >
          {label}
          {labelChildren}
        </label>
        {children}
      </div>

      <div
        className={`tw-flex tw-items-stretch tw-justify-stretch tw-border-0 tw-border-b-2 tw-border-[--ipt-grp-border-color] tw-bg-[--ipt-grp-bg-color] tw-text-[--ipt-grp-text-color] ${
          inputDisabled
            ? ""
            : "focus-within:tw-border-[--ipt-grp-text-alt-color] focus-within:tw-bg-transparent focus-within:tw-text-[--ipt-grp-text-alt-color] hover:tw-border-[--ipt-grp-border-alt-color] hover:tw-text-[--ipt-grp-text-alt-color] focus-within:hover:tw-border-[--ipt-grp-border-alt2-color] focus-within:hover:tw-text-[--ipt-grp-text-alt-color]"
        } ${inputWrapperClassName ?? ""}`}
        style={{
          ["--ipt-grp-text-color" as any]:
            colorVariantMapping[colorVariant].text,
          ["--ipt-grp-text-alt-color" as any]:
            colorVariantMapping[colorVariant].textAlt,
          ["--ipt-grp-bg-color" as any]: colorVariantMapping[colorVariant].bg,
          ["--ipt-grp-bg-alt-color" as any]:
            colorVariantMapping[colorVariant].bgAlt,
          ["--ipt-grp-border-color" as any]:
            colorVariantMapping[borderColorVariant].border,
          ["--ipt-grp-border-alt-color" as any]:
            colorVariantMapping[interactiveBorderColorVariant].borderAlt,
          ["--ipt-grp-border-alt2-color" as any]:
            colorVariantMapping[interactiveBorderColorVariant].textAlt,
          ...inputWrapperStyle,
        }}
        {...restInputWrapperProps}
      >
        <input
          ref={inputRef}
          id={inputId ?? id}
          className={`plain-number-input tw-min-w-0 tw-flex-auto tw-border-0 tw-bg-transparent tw-px-3 tw-pb-1.5 tw-pt-2 focus:tw-ring-0 ${
            inputClassName ?? ""
          }`}
          type={inputType}
          value={inputValue}
          disabled={inputDisabled}
          onBlur={(event) => {
            if (state === "init") setState("normal");
            if (inputOnBlur !== undefined) inputOnBlur(event);
          }}
          {...restInputProps}
        />
        {inputType === "number" && onStep !== undefined ? (
          <>
            <button
              className="tw-relative tw-w-[2.375rem] tw-flex-none tw-text-center hover:tw-bg-[--ipt-grp-bg-alt-color]"
              type="button"
              onClick={() => {
                if (inputRef.current === null) return;
                inputRef.current.stepDown();
                onStep(Number(inputRef.current.value));
              }}
            >
              -
            </button>
            <div className="tw-h-4 tw-w-0 tw-self-center tw-border-l tw-border-gray-300"></div>
            <button
              className="tw-relative tw-w-[2.375rem] tw-flex-none tw-text-center hover:tw-bg-[--ipt-grp-bg-alt-color]"
              type="button"
              onClick={() => {
                if (inputRef.current === null) return;
                inputRef.current.stepUp();
                onStep(Number(inputRef.current.value));
              }}
            >
              +
            </button>
          </>
        ) : null}
      </div>

      <p
        className={`tw-text-sm tw-leading-normal ${
          error ? "tw-text-red-600" : "tw-text-gray-700"
        } ${messageClassName ?? ""}`}
        style={{
          paddingTop: message ? "0.25rem" : "0rem",
          ...messageStyle,
        }}
        {...restMessageProps}
      >
        {message}
      </p>
    </div>
  );
};

export default InputGroup;

const colorVariantMapping = (() => {
  const colorVariantMapping = {
    default: {
      text: colors.gray[700],
      textAlt: colors.gray[900],
      bg: colors.gray[50],
      bgAlt: colors.gray[100],
      border: colors.gray[300],
      borderAlt: colors.gray[400],
    },
  } as {
    [key in colorVariant]: {
      text: string;
      textAlt: string;
      bg: string;
      bgAlt: string;
      border: string;
      borderAlt: string;
    };
  };
  for (const grayName of twGrays) {
    colorVariantMapping[`dark-${grayName}`] = {
      text: colors[grayName][700],
      textAlt: colors[grayName][900],
      bg: colors[grayName][50],
      bgAlt: colors[grayName][100],
      border: colors[grayName][300],
      borderAlt: colors[grayName][400],
    };
    colorVariantMapping[grayName] = {
      text: colors[grayName][600],
      textAlt: colors[grayName][700],
      bg: colors[grayName][50],
      bgAlt: colors[grayName][100],
      border: colors[grayName][300],
      borderAlt: colors[grayName][400],
    };
  }
  for (const colorName of twColors) {
    colorVariantMapping[colorName] = {
      text: colors[colorName][500],
      textAlt: colors[colorName][600],
      bg: colors[colorName][50],
      bgAlt: colors[colorName][100],
      border: colors[colorName][300],
      borderAlt: colors[colorName][400],
    };
  }
  return colorVariantMapping;
})();
