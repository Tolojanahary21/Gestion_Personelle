import type { Metadata } from "next";
import QueryProvider from "../../providers/query-provider";

export const metadata: Metadata = {
  title: "Personnel Management",
  description: "Personnel Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}