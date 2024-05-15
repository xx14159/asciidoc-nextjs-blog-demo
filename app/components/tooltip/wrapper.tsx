const TooltipWrapper = ({
  className,
  ...divProps
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) => {
  return (
    <div
      className={`tw-group/tooltip tw-relative ${className ?? ""}`}
      {...divProps}
    ></div>
  );
};

export default TooltipWrapper;
