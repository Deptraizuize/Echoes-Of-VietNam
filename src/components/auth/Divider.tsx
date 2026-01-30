export const Divider = () => {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-card px-4 text-muted-foreground font-medium">
          hoặc
        </span>
      </div>
    </div>
  );
};
