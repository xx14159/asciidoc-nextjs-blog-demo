/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tw-",
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: [
        'SSans3VF-anbd, SHSansSCVF-anbd, SourceSans3VF, "Source Sans 3", "Source Han Sans SC VF", "Source Han Sans SC", "Noto Sans CJK SC", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, emoji-font',
        {
          fontFeatureSettings: "normal",
          fontVariationSettings: "normal",
        },
      ],
      serif: [
        'SSerif4VF-anbd, SHSerifSCVF-anbd, "Source Serif 4 Variable", "Source Serif 4", "Source Han Serif SC VF", "Source Han Serif SC", "Noto Serif CJK SC", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif, emoji-font',
        {
          fontFeatureSettings: "normal",
          fontVariationSettings: "normal",
        },
      ],
      mono: [
        'FCVF-anbd, SHSansSCVF-anbd, "Fira Code", "Source Han Sans SC VF", "Source Han Sans SC", "Noto Sans CJK SC", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace, emoji-font',
        {
          fontFeatureSettings: '"ss08"',
          fontVariationSettings: "normal",
        },
      ],
      icon: [
        'MSS-anbd, "Material Symbols Sharp"',
        {
          fontFeatureSettings: '"liga"',
          fontVariationSettings: "normal",
        },
      ],
      inter: [
        'IVF-anbd, SHSansSCVF-anbd, "Inter Variable", Inter, "Source Han Sans SC VF", "Source Han Sans SC", "Noto Sans CJK SC", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, emoji-font',
        {
          fontFeatureSettings: "normal",
          fontVariationSettings: "normal",
        },
      ],
      plex: [
        'IPS-anbd, SHSansSCVF-anbd, "IBM Plex Sans", "Source Han Sans SC VF", "Source Han Sans SC", "Noto Sans CJK SC", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, emoji-font',
        {
          fontFeatureSettings: "normal",
          fontVariationSettings: "normal",
        },
      ],
      "cjk-sans": [
        'SHSansSCVF-anbd, SSans3VF-anbd, "Source Han Sans SC VF", "Source Han Sans SC", "Noto Sans CJK SC", SourceSans3VF, "Source Sans 3", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, emoji-font',
        {
          fontFeatureSettings: "normal",
          fontVariationSettings: "normal",
        },
      ],
      "cjk-serif": [
        'SHSerifSCVF-anbd, SSerif4VF-anbd, "Source Han Serif SC VF", "Source Han Serif SC", "Noto Serif CJK SC", "Source Serif 4 Variable", "Source Serif 4", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif, emoji-font',
        {
          fontFeatureSettings: "normal",
          fontVariationSettings: "normal",
        },
      ],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
