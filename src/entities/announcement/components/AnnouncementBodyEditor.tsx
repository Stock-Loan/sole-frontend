import { useRef, useState, type KeyboardEventHandler } from "react";
import {
	Bold,
	Code,
	Heading1,
	Heading2,
	Italic,
	Link2,
	List,
	ListOrdered,
	Quote,
} from "lucide-react";
import { Toolbar, ToolbarButton, ToolbarGroup } from "@/shared/ui/toolbar";
import { Switch } from "@/shared/ui/switch";
import { cn } from "@/shared/lib/utils";
import { AnnouncementMarkdown } from "./AnnouncementMarkdown";
import type { AnnouncementBodyEditorProps } from "../types";

type EditorMode = "write" | "preview";

function insertWrappedText(
	value: string,
	start: number,
	end: number,
	prefix: string,
	suffix: string,
	placeholder: string,
) {
	const selectedText = value.slice(start, end);
	const wrapped = `${prefix}${selectedText || placeholder}${suffix}`;
	const nextValue = `${value.slice(0, start)}${wrapped}${value.slice(end)}`;
	const selectionStart = start + prefix.length;
	const selectionEnd = selectionStart + (selectedText || placeholder).length;
	return { nextValue, selectionStart, selectionEnd };
}

function insertLinePrefix(
	value: string,
	start: number,
	end: number,
	getPrefix: (lineIndex: number) => string,
) {
	const blockStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
	const blockEnd = (() => {
		const idx = value.indexOf("\n", end);
		return idx === -1 ? value.length : idx;
	})();
	const target = value.slice(blockStart, blockEnd);
	if (target.length === 0) {
		const prefix = getPrefix(0);
		const nextValue = `${value.slice(0, blockStart)}${prefix}${value.slice(blockEnd)}`;
		return {
			nextValue,
			selectionStart: blockStart + prefix.length,
			selectionEnd: blockStart + prefix.length,
		};
	}
	const lines = target.split("\n");
	const formattedLines = lines.map((line, index) =>
		line.trim().length === 0 ? line : `${getPrefix(index)}${line}`,
	);
	const replacement = formattedLines.join("\n");
	const nextValue = `${value.slice(0, blockStart)}${replacement}${value.slice(blockEnd)}`;
	return {
		nextValue,
		selectionStart: blockStart,
		selectionEnd: blockStart + replacement.length,
	};
}

export function AnnouncementBodyEditor({
	value,
	onChange,
	disabled = false,
}: AnnouncementBodyEditorProps) {
	const [mode, setMode] = useState<EditorMode>("write");
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const withSelection = (
		transform: (
			start: number,
			end: number,
		) => {
			nextValue: string;
			selectionStart: number;
			selectionEnd: number;
		},
	) => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const start = textarea.selectionStart ?? 0;
		const end = textarea.selectionEnd ?? 0;
		const next = transform(start, end);
		onChange(next.nextValue);
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(next.selectionStart, next.selectionEnd);
		});
	};

	const applyWrap = (prefix: string, suffix: string, placeholder: string) => {
		withSelection((start, end) =>
			insertWrappedText(value, start, end, prefix, suffix, placeholder),
		);
	};

	const applyLinePrefix = (getPrefix: (lineIndex: number) => string) => {
		withSelection((start, end) =>
			insertLinePrefix(value, start, end, getPrefix),
		);
	};

	const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
		if (!(event.metaKey || event.ctrlKey)) return;
		if (event.key.toLowerCase() === "b") {
			event.preventDefault();
			applyWrap("**", "**", "bold text");
		}
		if (event.key.toLowerCase() === "i") {
			event.preventDefault();
			applyWrap("*", "*", "italic text");
		}
	};

	return (
		<div className="rounded-md border border-input bg-background">
			<div className="border-b border-border/70 bg-muted/30 px-1.5 py-1">
				<div className="flex items-center gap-0.5">
					<div className="min-w-0 flex-1">
						<Toolbar className="w-full !flex-wrap gap-0">
							<ToolbarGroup className="flex-wrap gap-3 md:gap-4">
								<ToolbarButton
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-12 px-3"
									onClick={() => applyWrap("**", "**", "bold text")}
									disabled={disabled}
									title="Bold (Ctrl/Cmd+B)"
								>
									<Bold className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-12 px-3"
									onClick={() => applyWrap("*", "*", "italic text")}
									disabled={disabled}
									title="Italic (Ctrl/Cmd+I)"
								>
									<Italic className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-12 px-3"
									onClick={() => applyWrap("`", "`", "inline code")}
									disabled={disabled}
									title="Inline code"
								>
									<Code className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-12 px-3"
									onClick={() =>
										applyWrap("[", "](https://example.com)", "Link text")
									}
									disabled={disabled}
									title="Link"
								>
									<Link2 className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-12 px-3"
									onClick={() => applyWrap("# ", "", "Heading")}
									disabled={disabled}
									title="Heading 1"
								>
									<Heading1 className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-12 px-3"
									onClick={() => applyWrap("## ", "", "Subheading")}
									disabled={disabled}
									title="Heading 2"
								>
									<Heading2 className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-12 px-3"
									onClick={() => applyLinePrefix(() => "- ")}
									disabled={disabled}
									title="Bullet list"
								>
									<List className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-12 px-3"
									onClick={() => applyLinePrefix((index) => `${index + 1}. `)}
									disabled={disabled}
									title="Numbered list"
								>
									<ListOrdered className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									type="button"
									size="icon"
									variant="ghost"
									className="h-7 w-12 px-3"
									onClick={() => applyLinePrefix(() => "> ")}
									disabled={disabled}
									title="Quote"
								>
									<Quote className="h-4 w-4" />
								</ToolbarButton>
							</ToolbarGroup>
						</Toolbar>
					</div>
				</div>
			</div>

			{mode === "write" ? (
				<div className="p-2">
					<textarea
						ref={textareaRef}
						value={value}
						onChange={(event) => onChange(event.target.value)}
						onKeyDown={handleKeyDown}
						className={cn(
							"flex h-56 w-full resize-none overflow-y-auto rounded-md border border-input bg-background px-2.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
						)}
						placeholder="Write announcement details..."
						disabled={disabled}
					/>
				</div>
			) : (
				<div className="p-2">
					<div className="h-56 overflow-y-auto rounded-md border border-border/70 bg-muted/20 p-3">
						<AnnouncementMarkdown value={value} />
					</div>
				</div>
			)}
			<div className="flex items-center justify-between gap-2 border-t border-border/70 px-2 py-1.5">
				<p className="text-xs text-muted-foreground">
					{mode === "write"
						? "Supports markdown formatting: bold, italic, links, headings, lists, and quotes."
						: "This is how the announcement will appear to users."}
				</p>
				<div className="flex shrink-0 items-center gap-1">
					<span
						className={cn(
							"text-xs",
							mode === "write"
								? "font-medium text-foreground"
								: "text-muted-foreground",
						)}
					>
						Write
					</span>
					<Switch
						checked={mode === "preview"}
						onCheckedChange={(checked) =>
							setMode(checked ? "preview" : "write")
						}
						disabled={disabled}
						aria-label="Toggle announcement preview mode"
					/>
					<span
						className={cn(
							"text-xs",
							mode === "preview"
								? "font-medium text-foreground"
								: "text-muted-foreground",
						)}
					>
						Preview
					</span>
				</div>
			</div>
		</div>
	);
}
