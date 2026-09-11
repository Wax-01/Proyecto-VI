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
