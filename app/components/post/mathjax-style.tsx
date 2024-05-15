"use client";

type Props = { mathjaxStyles: string };

const MathJaxStyle = ({ mathjaxStyles }: Props) => (
  <style jsx>{`
    ${mathjaxStyles}
  `}</style>
);

export default MathJaxStyle;
