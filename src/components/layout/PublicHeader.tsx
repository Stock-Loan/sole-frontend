import { Logo } from "@/components/common/Logo";
import type { PublicHeaderProps } from "./types";

export function PublicHeader({ actions }: PublicHeaderProps) {
	return (
		<header className="w-full">
			<div className="px-6 py-8 sm:px-6 lg:px-10">
				<Logo />
				{actions}
			</div>
		</header>
	);
}
