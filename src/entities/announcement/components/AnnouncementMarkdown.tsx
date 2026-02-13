import { Fragment, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import type { AnnouncementMarkdownProps } from "../types";

const INLINE_TOKEN_REGEX =
	/(`[^`\n]+`|\[[^\]\n]+\]\((?:https?:\/\/|mailto:)[^)]+\)|\*\*[^*\n]+\*\*|\*[^*\n]+\*|~~[^~\n]+~~)/g;

function isSafeHref(value: string) {
	return /^(https?:\/\/|mailto:)/i.test(value);
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	let index = 0;
	let match: RegExpExecArray | null;
	let part = 0;
	const regex = new RegExp(INLINE_TOKEN_REGEX);

	match = regex.exec(text);
	while (match) {
		const token = match[0];
		if (match.index > index) {
			nodes.push(text.slice(index, match.index));
		}

		const key = `${keyPrefix}-token-${part}`;
		if (token.startsWith("`") && token.endsWith("`")) {
			nodes.push(
				<code
					key={key}
					className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
				>
					{token.slice(1, -1)}
				</code>,
			);
		} else if (token.startsWith("**") && token.endsWith("**")) {
			nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
		} else if (token.startsWith("*") && token.endsWith("*")) {
			nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
		} else if (token.startsWith("~~") && token.endsWith("~~")) {
			nodes.push(<s key={key}>{token.slice(2, -2)}</s>);
		} else if (token.startsWith("[")) {
			const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
			if (linkMatch) {
				const [, label, href] = linkMatch;
				if (isSafeHref(href)) {
					nodes.push(
						<a
							key={key}
							href={href}
							target="_blank"
							rel="noreferrer noopener"
							className="text-primary underline underline-offset-2"
						>
							{label}
						</a>,
					);
				} else {
					nodes.push(token);
				}
			} else {
				nodes.push(token);
			}
		} else {
			nodes.push(token);
		}

		index = match.index + token.length;
		part += 1;
		match = regex.exec(text);
	}

	if (index < text.length) {
		nodes.push(text.slice(index));
	}

	return nodes;
}

export function AnnouncementMarkdown({
	value,
	className,
}: AnnouncementMarkdownProps) {
	const source = (value ?? "").trim();
	if (!source) {
		return <p className={cn("text-sm text-muted-foreground", className)}>No content.</p>;
	}

	const lines = source.split(/\r?\n/);
	const blocks: ReactNode[] = [];
	let i = 0;
	let blockIndex = 0;

	while (i < lines.length) {
		const line = lines[i];
		const trimmed = line.trim();

		if (!trimmed) {
			i += 1;
			continue;
		}

		if (/^#{1,3}\s+/.test(trimmed)) {
			const depth = trimmed.startsWith("###")
				? 3
				: trimmed.startsWith("##")
					? 2
					: 1;
			const content = trimmed.replace(/^#{1,3}\s+/, "");
			if (depth === 1) {
				blocks.push(
					<h1 key={`block-${blockIndex}`} className="text-xl font-semibold">
						{renderInline(content, `h1-${blockIndex}`)}
					</h1>,
				);
			} else if (depth === 2) {
				blocks.push(
					<h2 key={`block-${blockIndex}`} className="text-lg font-semibold">
						{renderInline(content, `h2-${blockIndex}`)}
					</h2>,
				);
			} else {
				blocks.push(
					<h3 key={`block-${blockIndex}`} className="text-base font-semibold">
						{renderInline(content, `h3-${blockIndex}`)}
					</h3>,
				);
			}
			i += 1;
			blockIndex += 1;
			continue;
		}

		if (/^>\s+/.test(trimmed)) {
			const quoteLines: string[] = [];
			while (i < lines.length && /^>\s+/.test(lines[i].trim())) {
				quoteLines.push(lines[i].trim().replace(/^>\s+/, ""));
				i += 1;
			}
			blocks.push(
				<blockquote
					key={`block-${blockIndex}`}
					className="border-l-2 border-border pl-3 text-muted-foreground"
				>
					{quoteLines.map((quoteLine, quoteIndex) => (
						<Fragment key={`quote-${blockIndex}-${quoteIndex}`}>
							{renderInline(quoteLine, `quote-${blockIndex}-${quoteIndex}`)}
							{quoteIndex < quoteLines.length - 1 ? <br /> : null}
						</Fragment>
					))}
				</blockquote>,
			);
			blockIndex += 1;
			continue;
		}

		if (/^[-*]\s+/.test(trimmed)) {
			const items: string[] = [];
			while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
				items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
				i += 1;
			}
			blocks.push(
				<ul
					key={`block-${blockIndex}`}
					className="list-disc space-y-1 pl-5 text-sm leading-6"
				>
					{items.map((item, itemIndex) => (
						<li key={`ul-${blockIndex}-${itemIndex}`}>
							{renderInline(item, `ul-${blockIndex}-${itemIndex}`)}
						</li>
					))}
				</ul>,
			);
			blockIndex += 1;
			continue;
		}

		if (/^\d+\.\s+/.test(trimmed)) {
			const items: string[] = [];
			while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
				items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
				i += 1;
			}
			blocks.push(
				<ol
					key={`block-${blockIndex}`}
					className="list-decimal space-y-1 pl-5 text-sm leading-6"
				>
					{items.map((item, itemIndex) => (
						<li key={`ol-${blockIndex}-${itemIndex}`}>
							{renderInline(item, `ol-${blockIndex}-${itemIndex}`)}
						</li>
					))}
				</ol>,
			);
			blockIndex += 1;
			continue;
		}

		const paragraphLines: string[] = [];
		while (
			i < lines.length &&
			lines[i].trim() &&
			!/^#{1,3}\s+/.test(lines[i].trim()) &&
			!/^>\s+/.test(lines[i].trim()) &&
			!/^[-*]\s+/.test(lines[i].trim()) &&
			!/^\d+\.\s+/.test(lines[i].trim())
		) {
			paragraphLines.push(lines[i].trim());
			i += 1;
		}

		blocks.push(
			<p key={`block-${blockIndex}`} className="text-sm leading-6 whitespace-pre-wrap">
				{paragraphLines.map((segment, segmentIndex) => (
					<Fragment key={`p-${blockIndex}-${segmentIndex}`}>
						{renderInline(segment, `p-${blockIndex}-${segmentIndex}`)}
						{segmentIndex < paragraphLines.length - 1 ? <br /> : null}
					</Fragment>
				))}
			</p>,
		);
		blockIndex += 1;
	}

	return <div className={cn("space-y-3 text-foreground", className)}>{blocks}</div>;
}
