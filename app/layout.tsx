import { Metadata } from "next";

import { imgPrefix } from "@/app/lib/server/env";
import DefaultLayout from "./defaultLayout";
import StyledJsxRegistry from "./registry";

import "@/styles/globals.scss";

export const metadata: Metadata = {
  icons: {
    icon: [
      {
        url: new URL("favicon.png", imgPrefix),
        type: "image/png",
      },
      {
        url: new URL("favicon.svg", imgPrefix),
        type: "image/svg+xml",
      },
    ],
    apple: {
      url: new URL("favicon.png", imgPrefix),
      type: "image/png",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledJsxRegistry>
          <DefaultLayout>{children}</DefaultLayout>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
