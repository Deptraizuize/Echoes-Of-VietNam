export const Divider = () => {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
        hoặc
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};
