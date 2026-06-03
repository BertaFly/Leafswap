export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>Nav placeholder</nav>
      <main>{children}</main>
    </div>
  )
}
