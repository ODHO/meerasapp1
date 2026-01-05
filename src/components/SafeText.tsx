import { useEffect, useRef } from "react";

export const SafeText: React.FC<{ children: string }> = ({ children }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Lock Google Translate from breaking this node
    ref.current.setAttribute("translate", "yes");
    ref.current.innerHTML = children;
  }, [children]);

  return <span ref={ref} />;
};
