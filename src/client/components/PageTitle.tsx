export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-[20px] font-bold tracking-[-0.3px] text-base-content">
      {children}
    </h1>
  );
}
