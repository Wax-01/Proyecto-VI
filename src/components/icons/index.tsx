import type { SVGProps } from "react";

/**
 * Iconos SVG en línea (basados en Lucide Icons, licencia ISC).
 * Mismo estilo "outline" que ya usa Search.jsx: stroke actual, trazo 2px, esquinas redondeadas.
 * Reemplazan los emojis nativos para mantener consistencia visual entre plataformas y temas.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function BaseIcon({ size = 20, children, ...props }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            {children}
        </svg>
    );
}

export function SunIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </BaseIcon>
    );
}

export function MoonIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
        </BaseIcon>
    );
}

export function ShoppingCartIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18" />
            <path d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25" />
            <circle cx="18" cy="20" r="2" />
            <circle cx="8" cy="20" r="2" />
        </BaseIcon>
    );
}

export function XIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </BaseIcon>
    );
}

export function HomeIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </BaseIcon>
    );
}

export function EggIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12" />
        </BaseIcon>
    );
}

export function BookOpenIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M12 5v16" />
            <path d="M20.001 19A2 2 0 0 0 22 17V5a2 2 0 0 0-1.999-2L16 3.002A5 5 0 0 0 12 5a5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 1.999 2H8a5 5 0 0 1 4 2 5 5 0 0 1 4-2z" />
        </BaseIcon>
    );
}

export function CameraIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
            <circle cx="12" cy="13" r="3" />
        </BaseIcon>
    );
}

export function MicIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M12 19v3" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <rect x="9" y="2" width="6" height="13" rx="3" />
        </BaseIcon>
    );
}

export function SquareIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <rect width="18" height="18" x="3" y="3" rx="2" />
        </BaseIcon>
    );
}

export function ArrowLeftIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </BaseIcon>
    );
}

export function PlusIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </BaseIcon>
    );
}

export function CheckIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M20 6 9 17l-5-5" />
        </BaseIcon>
    );
}
