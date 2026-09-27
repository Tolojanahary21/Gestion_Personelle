import QueryProvider from "../../providers/query-provider";
import { PreferencesProvider } from "./providers/PreferencesProvider";
import "./globals.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <PreferencesProvider>
          <QueryProvider>{children}</QueryProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
