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
  title: "Group-22",
  description: "very-cool-karaoke-client",
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
                colorPrimary: "#FF2D7E", // this will color all buttons in #75bd9d, overriding the default primaryColor #22426b set in token line 35
                colorPrimaryHover: '#C91F5E',
                algorithm: true, // enable algorithm (redundant with line 33 but here for demo purposes)
                controlHeight: 38,
                fontWeight: 600,
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
                colorBgElevated: '#16181D',
              },
              Tabs: {
                inkBarColor: '#FF2D7E',
                itemActiveColor: '#FF2D7E',
                itemSelectedColor: '#FF2D7E',
                itemHoverColor: '#FF2D7E',
              },
              Alert: {
                colorErrorBg: 'rgba(255, 45, 126, 0.15)',
                colorErrorBorder: 'rgba(255, 45, 126, 0.4)',
              },
              Drawer: {
                colorBgElevated: '#16181D',
                colorText: '#fff',
                colorIcon: 'rgba(255, 255, 255, 0.65)',
                colorIconHover: '#fff',
              },
              Notification: {
                colorBgElevated: '#16181D',
                colorText: '#fff',
                colorTextHeading: '#fff',
                colorIcon: 'rgba(255, 255, 255, 0.65)',
                colorIconHover: '#fff',
                colorBorder: 'rgba(255, 255, 255, 0.1)',
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
