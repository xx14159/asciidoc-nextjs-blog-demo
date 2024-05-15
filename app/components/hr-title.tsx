type Props = {
  children: React.ReactNode;
  spacing?: string;
};

const HrTitle = ({ children, spacing = "0.3em" }: Props) => {
  return (
    <header className="tw-px-4 tw-pb-9 sm:tw-px-8 md:tw-px-12">
      <h2 className="tw-border-b tw-border-gray-900 tw-font-serif tw-text-lg tw-font-normal tw-uppercase tw-leading-tight tw-text-gray-900">
        <span className="tw--mb-2 tw-ml-6 tw-inline-block tw-border-l tw-border-gray-900 tw-pb-3 tw-pl-6 tw-pt-1 sm:tw-mx-12">
          <span
            className="tw-inline-block tw-border-r tw-border-gray-900"
            style={{
              paddingRight: `calc(1.5rem - ${spacing})`,
              letterSpacing: spacing,
            }}
          >
            {children}
          </span>
        </span>
      </h2>
    </header>
  );
};

export default HrTitle;
