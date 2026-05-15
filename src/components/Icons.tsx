import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaults: IconProps = {
  width: 24,
  height: 24,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function icon(props: IconProps, ...children: ReactNode[]) {
  return (
    <svg
      viewBox="0 0 24 24"
      {...defaults}
      {...props}
      className={`inline-block shrink-0 transition-transform ${props.className ?? ""}`}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return icon(
    props,
    <circle key="c" cx="11" cy="11" r="7" />,
    <path key="l" d="M20 20l-4.197-4.197" />
  );
}

export function ListIcon(props: IconProps) {
  return icon(
    props,
    <path key="a" d="M8.25 6.75h10.5M8.25 12h10.5m-10.5 5.25h10.5M5.25 6.75h.01m-.01 5.25h.01m-.01 5.25h.01" />
  );
}

export function GridIcon(props: IconProps) {
  return icon(
    props,
    <rect key="a" x="4" y="4" width="6.5" height="6.5" rx="2" />,
    <rect key="b" x="13.5" y="4" width="6.5" height="6.5" rx="2" />,
    <rect key="c" x="4" y="13.5" width="6.5" height="6.5" rx="2" />,
    <rect key="d" x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
  );
}

export function CardsIcon(props: IconProps) {
  return <GridIcon {...props} />;
}

export function HeartIcon(props: IconProps) {
  return icon(
    props,
    <path
      key="a"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  );
}

export function HeartFilledIcon(props: IconProps) {
  return icon(
    { ...props, fill: "currentColor", stroke: "currentColor" },
    <path
      key="a"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      stroke="none"
    />
  );
}

export function PlayIcon(props: IconProps) {
  return icon(
    props,
    <path
      key="a"
      d="M6 5.513c0-1.42 1.543-2.31 2.766-1.583l10.422 6.182c1.19.706 1.19 2.47 0 3.176l-10.422 6.182C7.543 20.198 6 19.308 6 17.888V5.513z"
      fill="currentColor"
      stroke="none"
    />
  );
}

export function VolumeIcon(props: IconProps) {
  return icon(
    props,
    <path key="a" d="M11.25 19.5l-4.5-4.5H4.5a.75.75 0 0 1-.75-.75V9.75a.75.75 0 0 1 .75-.75h2.25l4.5-4.5v15z" />,
    <path key="b" d="M15.75 8.25a5.25 5.25 0 0 1 0 7.5" />,
    <path key="c" d="M18.75 5.25a9.75 9.75 0 0 1 0 13.5" />
  );
}

export function QuizIcon(props: IconProps) {
  return icon(
    props,
    <path key="a" d="M9 12.75L11.25 15 15 9.75" />,
    <path key="b" d="M19.5 5.25a2.25 2.25 0 0 0-2.25-2.25h-10.5a2.25 2.25 0 0 0-2.25 2.25v13.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-13.5z" />
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return icon(props, <path key="a" d="M15.75 19.5L8.25 12l7.5-7.5" />);
}

export function ChevronRightIcon(props: IconProps) {
  return icon(props, <path key="a" d="M8.25 4.5l7.5 7.5-7.5 7.5" />);
}

export function BookIcon(props: IconProps) {
  return icon(
    props,
    <path key="left" d="M4.5 5.25c2.4-.55 4.35-.1 7.5 1.65v12.6c-2.75-1.55-5.1-2.1-7.5-1.55V5.25Z" />,
    <path key="right" d="M19.5 5.25c-2.4-.55-4.35-.1-7.5 1.65v12.6c2.75-1.55 5.1-2.1 7.5-1.55V5.25Z" />,
    <path key="spine" d="M12 6.9v12.6" />
  );
}

export function GraduationCapIcon(props: IconProps) {
  return icon(
    props,
    <path key="top" d="M3 8.25 12 4l9 4.25-9 4.25L3 8.25Z" />,
    <path key="band" d="M6.75 10.1v4.45c1.45 1.2 3.2 1.8 5.25 1.8s3.8-.6 5.25-1.8V10.1" />,
    <path key="tassel" d="M19.5 9.25v4.2" />,
    <circle key="dot" cx="19.5" cy="15.4" r="0.65" fill="currentColor" stroke="none" />
  );
}

export function FileTextIcon(props: IconProps) {
  return icon(
    props,
    <rect key="paper" x="5.25" y="3.5" width="13.5" height="17" rx="2.25" />,
    <path key="title" d="M8.5 8h7" />,
    <path key="line-1" d="M8.5 11.25h7" />,
    <path key="line-2" d="M8.5 14.5h5" />
  );
}

export function CloseIcon(props: IconProps) {
  return icon(props, <path key="a" d="M6 18L18 6M6 6l12 12" />);
}

export function StarIcon(props: IconProps) {
  return icon(
    props,
    <path key="a" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z" />
  );
}

export function LogoIcon(props: IconProps) {
  return icon(
    { ...props, fill: "none", stroke: "currentColor" },
    <path
      key="spark-big"
      d="M4.5 1.5C4.5 3.15 3.15 4.5 1.5 4.5C3.15 4.5 4.5 5.85 4.5 7.5C4.5 5.85 5.85 4.5 7.5 4.5C5.85 4.5 4.5 3.15 4.5 1.5Z"
      fill="currentColor"
      stroke="none"
    />,
    <path
      key="spark-small"
      d="M21 18.5C21 19.33 20.33 20 19.5 20C20.33 20 21 20.67 21 21.5C21 20.67 21.67 20 22.5 20C21.67 20 21 19.33 21 18.5Z"
      fill="currentColor"
      stroke="none"
    />,
    <path
      key="back-card"
      d="M9 9V6.5A2.5 2.5 0 0 1 11.5 4h8A2.5 2.5 0 0 1 22 6.5v8A2.5 2.5 0 0 1 19.5 17H18"
    />,
    <rect key="front-card" x="5" y="9" width="13" height="13" rx="2.5" />,
    <path
      key="w-mark"
      d="M7.5 13.5L9.5 17.5L11.5 13.5L13.5 17.5L15.5 13.5"
    />
  );
}
