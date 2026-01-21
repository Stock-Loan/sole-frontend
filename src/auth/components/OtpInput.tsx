import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import type { OtpInputProps } from "../types";
import { normalize } from "../hooks/hooks";

const DIGIT_RE = /\d/;

export function OtpInput({
	value,
	onChange,
	disabled = false,
	length = 6,
	autoFocus = false,
	className,
	inputClassName,
}: OtpInputProps) {
	const refs = useRef<Array<HTMLInputElement | null>>([]);

	const digits = useMemo(() => {
		const normalized = normalize(value ?? "", length);
		return Array.from({ length }, (_, index) => normalized[index] ?? "");
	}, [value, length]);

	useEffect(() => {
		if (!autoFocus || disabled) return;
		const first = refs.current[0];
		if (first) {
			first.focus();
			first.select();
		}
	}, [autoFocus, disabled]);

	const setAtIndex = (index: number, nextChar: string) => {
		const current = normalize(value ?? "", length).padEnd(length, " ");
		const next = current.split("");
		next[index] = nextChar;
		const joined = next.join("").replace(/\s/g, "");
		onChange(joined);
	};

	const focusIndex = (index: number) => {
		const target = refs.current[index];
		if (target) {
			target.focus();
			target.select();
		}
	};

	return (
		<div className={cn("flex items-center justify-center gap-2", className)}>
			{digits.map((digit, index) => (
				<input
					key={index}
					ref={(node) => {
						refs.current[index] = node;
					}}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					autoComplete={index === 0 ? "one-time-code" : "off"}
					value={digit}
					disabled={disabled}
					className={cn(
						"h-12 w-11 rounded-md border border-input bg-background text-center text-lg font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
						inputClassName,
					)}
					onChange={(event) => {
						const raw = event.target.value;
						const cleaned = raw.replace(/\D/g, "");
						if (!cleaned) {
							setAtIndex(index, "");
							return;
						}
						const nextChar = cleaned[cleaned.length - 1];
						if (!DIGIT_RE.test(nextChar)) return;
						setAtIndex(index, nextChar);
						if (index < length - 1) {
							focusIndex(index + 1);
						}
					}}
					onKeyDown={(event) => {
						if (event.key !== "Backspace") return;
						if (digits[index]) {
							setAtIndex(index, "");
							return;
						}
						if (index > 0) {
							setAtIndex(index - 1, "");
							focusIndex(index - 1);
						}
					}}
					onPaste={(event) => {
						event.preventDefault();
						const paste = event.clipboardData.getData("text");
						const cleaned = normalize(paste, length - index);
						if (!cleaned) return;
						const current = normalize(value ?? "", length)
							.padEnd(length, " ")
							.split("");
						cleaned.split("").forEach((char, offset) => {
							current[index + offset] = char;
						});
						onChange(current.join("").replace(/\s/g, ""));
						const nextIndex = Math.min(index + cleaned.length, length - 1);
						focusIndex(nextIndex);
					}}
				/>
			))}
		</div>
	);
}
