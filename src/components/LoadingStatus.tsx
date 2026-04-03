import { prepareWithSegments, walkLineRanges } from "@chenglou/pretext";
import { useEffect, useRef, useState } from "react";

const LOADING_PHRASES = [
  "전월 데이터를 읽는 중",
  "당월 시트를 정리하는 중",
  "차이를 꼼꼼히 비교하는 중",
  "결과 표를 예쁘게 준비하는 중",
];

const PHRASE_ROTATE_MS = 1600;

export function LoadingStatus() {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [phraseWidth, setPhraseWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!measureRef.current) {
      return;
    }

    const styles = window.getComputedStyle(measureRef.current);
    const font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

    let maxWidth = 0;

    for (const phrase of LOADING_PHRASES) {
      const prepared = prepareWithSegments(phrase, font);
      walkLineRanges(prepared, 9999, (line) => {
        maxWidth = Math.max(maxWidth, line.width);
      });
    }

    setPhraseWidth(Math.ceil(maxWidth));
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % LOADING_PHRASES.length);
    }, PHRASE_ROTATE_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const activePhrase = LOADING_PHRASES[activeIndex];

  return (
    <span className="flex items-center justify-center gap-4">
      <span className="comparison-loader-orb" aria-hidden="true">
        <span className="comparison-loader-orb-core" />
        <span className="comparison-loader-orb-ring comparison-loader-orb-ring-delay" />
      </span>

      <span className="comparison-loader-copy">
        <span className="comparison-loader-title">
          {"비교계산 중".split("").map((character, index) => (
            <span
              key={`${character}-${index}`}
              className="comparison-loader-letter"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              {character}
            </span>
          ))}
          <span className="comparison-loader-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </span>

        <span
          className="comparison-loader-phrase"
          style={phraseWidth ? { width: `${phraseWidth}px` } : undefined}
        >
          {activePhrase}
        </span>
      </span>

      <span ref={measureRef} className="comparison-loader-measure" aria-hidden="true">
        {LOADING_PHRASES.join("")}
      </span>
    </span>
  );
}
