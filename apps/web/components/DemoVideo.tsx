export interface DemoVideoProps {
  src?: string;
  poster?: string;
  caption?: string;
}

// 30-second autoplay muted loop demo of the Whimsy flow.
// The MP4 is expected at public/demo.mp4; until recorded, a static poster is shown.
export function DemoVideo({
  src = '/demo.mp4',
  poster = '/demo-poster.png',
  caption,
}: DemoVideoProps) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-black">
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          controls
          className="w-full h-full object-cover"
        >
          Your browser does not support embedded video.
        </video>
      </div>
      {caption && (
        <figcaption className="text-xs text-zinc-500 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}