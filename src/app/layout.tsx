'use client'

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import '@mantine/core/styles.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme="light">
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
