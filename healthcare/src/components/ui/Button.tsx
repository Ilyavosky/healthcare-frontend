import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "block";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy/90",
  outline: "bg-surface text-navy border border-border hover:bg-bg",
  ghost: "text-muted hover:text-navy",
  block: "bg-navy text-white hover:bg-navy/90 w-full",
};

const sizes: Record<Size, string> = {
  md: "px-[18px] py-[12px] text-sm leading-none rounded-[10px]",
  sm: "px-3.5 py-[9px] text-sm leading-none rounded-lg",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className, ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}