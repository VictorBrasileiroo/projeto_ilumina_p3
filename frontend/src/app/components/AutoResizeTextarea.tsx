import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from "react";

type AutoResizeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
};

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ minRows = 1, className = "", value, defaultValue, onChange, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    function setRefs(node: HTMLTextAreaElement | null) {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    }

    function resize() {
      const node = innerRef.current;
      if (!node) return;
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    }

    useEffect(() => {
      resize();
    }, [value, defaultValue]);

    return (
      <textarea
        ref={setRefs}
        rows={minRows}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          onChange?.(event);
          resize();
        }}
        onInput={resize}
        className={`resize-none overflow-hidden ${className}`}
        {...props}
      />
    );
  },
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";
