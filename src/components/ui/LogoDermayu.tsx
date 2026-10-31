import Image from "next/image";

export interface LogoDermayuProps {
  variant?: "light" | "dark"; // "dark" untuk latar putih/terang, "light" untuk latar gelap/hijau
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function LogoDermayu({
  variant = "light",
  className = "w-8 h-8 object-contain shrink-0",
  width = 36,
  height = 36,
  priority = false,
}: LogoDermayuProps) {
  const src = variant === "dark" ? "/dermayu-logo-dark.webp" : "/dermayu-logo.webp";

  return (
    <Image
      src={src}
      alt="Logo DERMAYU"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}

