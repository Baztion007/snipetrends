"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { PackageOpen } from "lucide-react";

/**
 * next/image wrapper with a graceful fallback. If the remote image fails to
 * load (404, timeout, optimization error, non-image URL), a neutral
 * placeholder is shown instead of a blank box.
 *
 * Also catches the case where a user pastes an Unsplash *page* URL
 * (https://unsplash.com/photos/...) instead of the actual image URL
 * (https://images.unsplash.com/photo-...). In that case, the next/image
 * optimizer will fail and we show the fallback.
 */
type SmartImageProps = Omit<ImageProps, "onError"> & {
  fallbackLabel?: string;
};

export function SmartImage({
  alt,
  className,
  fallbackLabel,
  src,
  ...props
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  // Validate the src — if it's not a string or not an http(s) URL, show fallback.
  const srcStr = typeof src === "string" ? src : "";
  const isValidUrl = srcStr.startsWith("http://") || srcStr.startsWith("https://");

  if (failed || !isValidUrl) {
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
      src={src}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}

export default SmartImage;
