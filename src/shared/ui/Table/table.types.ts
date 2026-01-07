import type { HTMLAttributes } from "react";

export type TableProps = HTMLAttributes<HTMLTableElement> & {
	containerClassName?: string;
};
