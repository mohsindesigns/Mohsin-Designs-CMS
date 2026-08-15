// The login page is a standalone full-screen page.
// This layout acts as a passthrough so it doesn't inherit the admin sidebar.
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
