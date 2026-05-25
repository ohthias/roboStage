interface Props {
  children: React.ReactNode;
}

export default function ShowLiveLayout({
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-base-200">
      {children}
    </main>
  );
}