import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Play } from 'lucide-react';

const DRIVE_FILE_ID = '1yssis0_xg8i8-l9tOn8Pr0adkPlYd_DN';
const DRIVE_PREVIEW_URL = `https://drive.google.com/file/d/${DRIVE_FILE_ID}/preview`;
const VIDEO_DURATION_MS = 44_000; // known duration of the demo video

export default function Demo() {
  const location = useLocation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (location.hash === '#demo-video' && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [location.hash]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    // Start a timer to detect when the video ends (Drive embed doesn't fire standard events)
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVideoEnded(true);
    }, VIDEO_DURATION_MS);
  }, []);

  const handleReplay = useCallback(() => {
    setVideoEnded(false);
    setIframeLoaded(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setIframeKey((k) => k + 1);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_demo_tsx_6271">
      <div className="space-y-2 text-center" data-icod-id="src_pages_demo_tsx_ec0e">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_demo_tsx_a2c7">See LaunchLens AI in Action</h1>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_demo_tsx_6892">
          From Product Idea to Smarter Launch Decisions.
        </p>
      </div>
      {/* Video embed */}
      <div
        id="demo-video"
        ref={sectionRef}
        className="mx-auto mt-10 max-w-[960px] overflow-hidden rounded-xl shadow-2xl"
        data-icod-id="src_pages_demo_tsx_f7aa">
        <div
          className="aspect-video relative w-full overflow-hidden drive-video-crop"
          data-icod-id="src_pages_demo_tsx_289f">
          {/* Branded loading placeholder — visible until iframe loads */}
          {!iframeLoaded && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#2A1F2E] to-[#3D2B52]"
              data-icod-id="src_pages_demo_tsx_loading_overlay">
              <div
                className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"
                data-icod-id="src_pages_demo_tsx_9f8b" />
              <p
                className="text-sm font-medium text-white/80"
                data-icod-id="src_pages_demo_tsx_a164">Loading video...</p>
            </div>
          )}

          {/* Replay overlay — shown when video has ended */}
          {videoEnded && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#2A1F2E]/90"
              data-icod-id="src_pages_demo_tsx_replay_overlay">
              <button
                onClick={handleReplay}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Replay video"
                data-icod-id="src_pages_demo_tsx_replay_btn">
                <Play
                  className="ml-1 h-8 w-8 fill-current"
                  data-icod-id="src_pages_demo_tsx_6c35" />
              </button>
              <p
                className="text-sm font-medium text-white/80"
                data-icod-id="src_pages_demo_tsx_b7b8">Watch again</p>
            </div>
          )}

          {/* Google Drive preview iframe — scaled to eliminate letterboxing at narrow widths */}
          <div
            className="drive-iframe-wrapper absolute inset-0"
            data-icod-id="src_pages_demo_tsx_27f9">
            <iframe
              key={iframeKey}
              src={DRIVE_PREVIEW_URL}
              title="LaunchLens AI Demo Video"
              allow="autoplay"
              onLoad={handleIframeLoad}
              className="h-full w-full border-0"
              data-icod-id="src_pages_demo_tsx_video_iframe" />
          </div>
        </div>
      </div>
      <p
        className="mx-auto mt-4 max-w-[960px] text-center text-xs italic text-muted-foreground"
        data-icod-id="src_pages_demo_tsx_caption">
        Dashboard figures shown are an illustrative example using the demo product (Premium Skincare Serum).
      </p>
      {/* Feature highlights below video */}
      <div
        className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3"
        data-icod-id="src_pages_demo_tsx_052f">
        {[
          { label: 'Comprehensive Metrics Evaluated', value: 'Full Analysis' },
          { label: 'Fast Product Analysis', value: 'Quick Results' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: '#F3EEFF' }}
            data-icod-id={`src_pages_demo_tsx_09ad_${stat.label}`}>
            <p
              className="text-2xl font-bold"
              style={{ color: '#201034' }}
              data-icod-id={`src_pages_demo_tsx_5c9e_${stat.label}`}>{stat.value}</p>
            <p
              className="text-xs text-[#555]"
              data-icod-id={`src_pages_demo_tsx_9039_${stat.label}`}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
