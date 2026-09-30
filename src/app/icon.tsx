import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        {/* Teal cloud with network nodes — matches the OnCloudSwift logo mark */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cloud fill */}
          <path
            d="M25 21H9a5 5 0 1 1 .9-9.9 7 7 0 0 1 13.8 1.9H25a4 4 0 0 1 0 8Z"
            fill="#4DC8D0"
          />
          {/* Network nodes */}
          <circle cx="12" cy="17" r="1.5" fill="#0B1F44" />
          <circle cx="16" cy="14" r="1.5" fill="#0B1F44" />
          <circle cx="20" cy="17" r="1.5" fill="#0B1F44" />
          <circle cx="16" cy="20" r="1.5" fill="#0B1F44" />
          {/* Network lines */}
          <line x1="12" y1="17" x2="16" y2="14" stroke="#0B1F44" strokeWidth="1" />
          <line x1="16" y1="14" x2="20" y2="17" stroke="#0B1F44" strokeWidth="1" />
          <line x1="12" y1="17" x2="16" y2="20" stroke="#0B1F44" strokeWidth="1" />
          <line x1="20" y1="17" x2="16" y2="20" stroke="#0B1F44" strokeWidth="1" />
          <line x1="16" y1="14" x2="16" y2="20" stroke="#0B1F44" strokeWidth="0.8" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
