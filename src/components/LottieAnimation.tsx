"use client";

interface LottieAnimationProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  dataWId?: string;
  dataIsIx2Target?: string;
  style?: React.CSSProperties;
  defaultDuration?: string;
}

export function LottieAnimation({
  src,
  loop = true,
  autoplay = true,
  className,
  dataWId,
  dataIsIx2Target,
  style,
  defaultDuration = "30",
}: LottieAnimationProps): React.ReactElement {
  return (
    <div
      className={className}
      data-w-id={dataWId}
      data-is-ix2-target={dataIsIx2Target || "0"}
      data-animation-type="lottie"
      data-src={src}
      data-loop={loop ? "1" : "0"}
      data-direction="1"
      data-autoplay={autoplay ? "1" : "0"}
      data-renderer="svg"
      data-default-duration={defaultDuration}
      data-duration="0"
      style={style}
    />
  );
}
