import "@/styles/globals.css";
import "@/styles/highlight.css";
import "github-markdown-css/github-markdown.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/lib/theme";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
