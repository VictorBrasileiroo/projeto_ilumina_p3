import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "var(--color-neutral-800)",
          "--normal-border": "var(--color-neutral-100)",
          "--success-bg": "#ffffff",
          "--success-text": "var(--color-secondary-green-dark)",
          "--success-border": "var(--color-secondary-green)",
          "--error-bg": "#ffffff",
          "--error-text": "var(--color-error)",
          "--error-border": "var(--color-error)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
