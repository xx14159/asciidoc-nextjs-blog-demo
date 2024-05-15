const Form = ({
  className,
  onSubmit,
  ...formProps
}: React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>) => {
  return (
    <form
      className={`tw-font-inter tw-text-base tw-font-normal tw-leading-normal ${
        className ?? ""
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        try {
          if (onSubmit !== undefined) onSubmit(event);
        } catch {}
        return false;
      }}
      {...formProps}
    />
  );
};

export default Form;
