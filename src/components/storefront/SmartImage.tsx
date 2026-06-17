"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { PackageOpen } from "lucide-react";

/**
 * next/image wrapper with a graceful fallback. If the remote image fails to
 * load (404, timeout, optimization error), a neutral placeholder is shown
 * instead of a blank box — so product cards never look broken.
 */
type SmartImageProps = Omit<ImageProps, "onError"> & {
  fallbackLabel?: string;
};

export function SmartImage({
  alt,
  className,
  fallbackLabel,
  ...props
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ""}`}
        role="img"
        aria-label={alt}
      >
        <div className="flex flex-col items-center gap-1.5 p-4 text-center">
          <PackageOpen className="size-8 opacity-50" />
          {fallbackLabel && (
            <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
              {fallbackLabel}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}

export default SmartImage;
