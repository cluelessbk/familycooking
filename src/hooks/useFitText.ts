import { useRef, useEffect } from "react";

/**
 * Returns a ref to attach to an <input>. Shrinks font-size so the value
 * always fits within the visible width, then restores it when text is shorter.
 */
export function useFitText(value: string, maxSize = 18, minSize = 11) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let size = maxSize;
    el.style.fontSize = `${size}px`;

    while (el.scrollWidth > el.clientWidth && size > minSize) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  }, [value, maxSize, minSize]);

  return ref;
}
