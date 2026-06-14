export default function SubredditLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
  modal: React.ReactNode;
}) {
  void params;
  const isModalOpen = modal !== null;

  return (
    <div
      className={
        isModalOpen
          ? "min-h-0 min-w-0 flex-1 overflow-hidden lg:h-screen"
          : "min-w-0 flex-1"
      }
    >
      {children}
      {isModalOpen ? modal : null}
    </div>
  );
}
