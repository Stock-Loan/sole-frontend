declare module "qrcode.react" {
	import type { ComponentType } from "react";

	export interface QRCodeCanvasProps {
		value: string;
		size?: number;
		bgColor?: string;
		fgColor?: string;
		level?: "L" | "M" | "Q" | "H";
		includeMargin?: boolean;
		className?: string;
	}

	export const QRCodeCanvas: ComponentType<QRCodeCanvasProps>;
}
