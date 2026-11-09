export const metadata = {
  title: "KickVM DB E2E Test",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "monospace", background: "#0b0b0b", color: "#eee", padding: "2rem" }}>
        {children}
      </body>
    </html>
  );
}
