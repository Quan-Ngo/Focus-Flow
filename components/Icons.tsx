
import React from 'react';

// Add key to IconProps to support React 19 where key is a regular prop
type IconProps = { className?: string; style?: React.CSSProperties; key?: React.Key };

export const CheckIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export const TrashIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const PlusIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const UserIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const LightBulbIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-3m0 0a6 6 0 10-9.354-4.993C2.41 10.33 3.5 12.68 5.512 14.13L12 15zm0 0c2.012-1.45 3.102-3.8 2.866-5.123A6 6 0 1012 15zm0 3v3m-3-3h6" />
  </svg>
);

export const PlayIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className} style={style}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const PauseIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className} style={style}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export const ClockIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const FireIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className} style={style}>
    <path d="M17.684 10.421c-.482-.676-.948-1.258-1.554-1.854a6.6 6.6 0 00-1.822-1.28c-.286-.14-.58-.266-.88-.376.128-.318.257-.64.382-.962.148-.373.284-.754.406-1.144.11-.34.197-.692.259-1.05.034-.194.043-.393.024-.59-.015-.145-.045-.286-.104-.417a.64.64 0 00-.23-.277.625.625 0 00-.323-.105.62.620 0 00-.401.107c-.12.083-.223.195-.306.32a9.66 9.66 0 00-.737 1.34 11.5 11.5 0 01-.69 1.137c-.312.457-.665.885-1.054 1.28-.49.497-1.018.95-1.583 1.357-.456.33-.93.633-1.42.906-.234.13-.474.25-.72.36-.576.257-1.187.438-1.815.54a6.73 6.73 0 01-1.102.049 6.74 6.74 0 01-1.09-.13c-.365-.067-.723-.16-1.071-.28a6.3 6.3 0 01-1-.44c-.213-.12-.416-.252-.61-.397-.184-.136-.35-.294-.497-.47a1.47 1.47 0 01-.264-.536.85.85 0 01.013-.42.94.94 0 01.173-.356c.158-.2.378-.344.623-.41a1.2 1.2 0 01.442-.012c.16.024.316.066.467.126.12.048.237.104.351.168.106.06.21.124.311.192l.144.102c.045.033.1.05.155.05a.25.25 0 00.177-.073.25.25 0 00.073-.177.25.25 0 00-.033-.122c-.066-.123-.133-.245-.202-.365a10.12 10.12 0 00-.868-1.29 13.06 13.06 0 00-1.137-1.306c-.457-.44-.943-.85-1.454-1.23a10.4 10.4 0 00-1.722-1.054c-.318-.152-.647-.285-.986-.4a11.1 11.1 0 01-.64-.225c-.218-.084-.44-.16-.665-.228a4.95 4.95 0 00-.7-.168 2.2 2.2 0 00-.74.024c-.123.024-.243.062-.355.114a.65.65 0 00-.323.364.64.64 0 00-.005.41c.046.136.12.26.218.36.19.197.414.358.66.474.254.12.518.22.791.3.29.083.585.15.885.2.327.054.656.094.987.12.224.017.448.028.673.033l.678.01c.214.004.428.004.642.002h.643l.322-.01c.107-.004.214-.01.32-.018l.32-.025.16-.015a.24.24 0 01.12.015.26.26 0 01.13.125.25.25 0 01.02.162c-.01.05-.03.097-.063.136-.18.22-.38.423-.594.613-.213.19-.443.364-.683.523a6.1 6.1 0 01-.767.433 7.2 7.2 0 01-.84.34c-.3.1-.606.182-.916.246-.327.068-.658.114-.99.14a7.92 7.92 0 01-1.006.01 7.96 7.96 0 01-1.003-.12 7.7 7.7 0 01-.98-.246 7.42 7.42 0 01-.937-.367c-.29-.14-.572-.295-.843-.465-.26-.164-.506-.342-.74-.533a3.5 3.5 0 01-.58-.584 2.2 2.2 0 01-.35-.742 2.1 2.1 0 01-.013-.82c.046-.264.148-.514.298-.74a3.86 3.86 0 01.815-1.127 8.08 8.08 0 011.082-.84c.39-.247.794-.467 1.209-.66.44-.204.89-.382 1.348-.535.485-.162.978-.293 1.478-.393.535-.107 1.075-.182 1.62-.224l.825-.045c.277-.01.554-.014.832-.01h.835c.278.004.557.014.835.03l.835.048c.556.044 1.11.117 1.662.217.523.096 1.04.223 1.547.38a11.16 11.16 0 012.8 1.23c.433.264.843.56 1.23 0a6.6 6.6 0 01-1.822-1.28l.406-1.144z" />
  </svg>
);

export const TrophyIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.503-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a4.502 4.502 0 01-5.007 0M12 18.75v-5.25m0 0a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
  </svg>
);

export const SparklesIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

export const DragHandleIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const DownloadIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const UploadIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
