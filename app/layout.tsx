import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student XX-XXX-XXX",
  description: "sopra-fs26-template-client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              // general theme options are set in token, meaning all primary elements (button, menu, ...) will have this color
              colorPrimary: "#22426b", // selected input field boarder will have this color as well
              borderRadius: 8,
              colorText: "#fff",
              fontSize: 16,

              // Alias Token
              colorBgContainer: "#16181D",
            },
            // if a component type needs special styling, setting here will override default options set in token
            components: {
              Button: {
                colorPrimary: '#FF2D7E',
                colorPrimaryHover: '#C91F5E',
                fontWeight: 600,
                controlHeight: 38,
                algorithm: true,
              },
              Input: {
                colorBorder: "gray", // color boarder selected is not overridden but instead is set by primary color in line 35
                colorTextPlaceholder: "#888888",
                algorithm: false, // disable algorithm (line 32)
              },
              Form: {
                labelColor: "#fff",
                algorithm: theme.defaultAlgorithm, // specify a specifc algorithm instead of true/false
              },
              Card: {},
              Dropdown: {
                colorBgElevated: '#16181D',  // ← gleiche Farbe wie colorBgContainer
              },
            },
          }}
        >
          <AntdRegistry>
            <AntdApp>{children}</AntdApp>
          </AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
