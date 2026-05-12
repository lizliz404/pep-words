import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// 【设计细节优化1】: 将 strokeWidth 从 2 改为 1.5。这是目前顶尖 UI 的黄金比例，显得更精致、更现代。
// 【设计细节优化2】: 默认宽高建议使用 24 或 1em 配合 viewBox，但我保留了你原有的逻辑结构。
const defaults: IconProps = {
  width: 24, // 建议默认使用 24，或者用 "1em" 让它跟随字体大小
  height: 24,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5, // 高级感的灵魂
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
  // 优化：放大圆的比例，缩短手柄，符合现代极简放大镜比例
  return icon(
    props,
    <circle key="c" cx="11" cy="11" r="7" />,
    <path key="l" d="M20 20l-4.197-4.197" />
  );
}

export function ListIcon(props: IconProps) {
  // 优化：拉长线条，增加留白，点阵与线条对齐更加精准
  return icon(
    props,
    <path key="a" d="M8.25 6.75h10.5M8.25 12h10.5m-10.5 5.25h10.5M5.25 6.75h.01m-.01 5.25h.01m-.01 5.25h.01" />
  );
}

export function GridIcon(props: IconProps) {
  // 优化：rx="2" 增加柔和的圆角，避免直角带来的生硬感，类似 iOS 的 App 图标弧度
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
  // 优化：重新绘制贝塞尔曲线，使心形上部更饱满，底部收尾更优雅
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
  // 优化：废弃生硬的 <polygon>，改为带有圆角（c0-1.42...）的平滑路径
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
  // 优化：喇叭口线条更流畅，声波弧度完美居中同心
  return icon(
    props,
    <path key="a" d="M11.25 19.5l-4.5-4.5H4.5a.75.75 0 0 1-.75-.75V9.75a.75.75 0 0 1 .75-.75h2.25l4.5-4.5v15z" />,
    <path key="b" d="M15.75 8.25a5.25 5.25 0 0 1 0 7.5" />,
    <path key="c" d="M18.75 5.25a9.75 9.75 0 0 1 0 13.5" />
  );
}

export function QuizIcon(props: IconProps) {
  // 优化：改为更具隐喻的“带打勾的精致测试板”，识别度更高
  return icon(
    props,
    <path key="a" d="M9 12.75L11.25 15 15 9.75" />,
    <path key="b" d="M19.5 5.25a2.25 2.25 0 0 0-2.25-2.25h-10.5a2.25 2.25 0 0 0-2.25 2.25v13.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-13.5z" />
  );
}

export function ChevronLeftIcon(props: IconProps) {
  // 优化：完美对称的折线
  return icon(props, <path key="a" d="M15.75 19.5L8.25 12l7.5-7.5" />);
}

export function ChevronRightIcon(props: IconProps) {
  // 优化：完美对称的折线
  return icon(props, <path key="a" d="M8.25 4.5l7.5 7.5-7.5 7.5" />);
}

export function BookIcon(props: IconProps) {
  // 优化：打开的书本具有真实的页面下坠弧度（贝塞尔曲线），而不是简单的方块
  return icon(
    props,
    <path key="a" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  );
}

export function GraduationCapIcon(props: IconProps) {
  // 优化：立体感重构，学术帽的下垂流苏更加生动
  return icon(
    props,
    <path key="a" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  );
}

export function FileTextIcon(props: IconProps) {
  // 优化：文档右上角采用了高级的“折角”设计，文字排版对齐更紧凑
  return icon(
    props,
    <path key="a" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5-3h7.5m-7.5-3h3m-9 9.75h14.25c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H9.75c-.299 0-.586.119-.797.33l-5.25 5.25c-.21.21-.33.498-.33.798v10.5c0 .621.504 1.125 1.125 1.125z" />
  );
}

export function CloseIcon(props: IconProps) {
  // 优化：完美的正方形对角线切割
  return icon(props, <path key="a" d="M6 18L18 6M6 6l12 12" />);
}

export function StarIcon(props: IconProps) {
  // 优化：废弃了极其廉价的锐角多边形（polygon），引入了带有 .56 微圆角的五角星路径
  // 这正是 Apple App Store 和 Google Play 里星星图标的画法。
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
