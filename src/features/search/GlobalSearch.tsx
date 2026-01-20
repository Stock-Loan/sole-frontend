import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogTrigger,
} from "@/shared/ui/Dialog/dialog";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import type { GlobalSearchProps, SearchItem } from "./types";

const orderedCategories = ["Navigation", "Account", "Support", "Public"];

export function GlobalSearch({
	compact = false,
	className,
	items = [],
}: GlobalSearchProps) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setQuery("");
		}
	};

	const handleSelect = (path: string) => {
		setOpen(false);
		setQuery("");
		navigate(path);
	};

	const results = useMemo(() => {
		const term = query.trim().toLowerCase();
		if (!term) {
			return items;
		}
		return items.filter(
			(item) =>
				item.title.toLowerCase().includes(term) ||
				item.description.toLowerCase().includes(term) ||
				item.category.toLowerCase().includes(term),
		);
	}, [query, items]);

	const groupedResults = useMemo(() => {
		const groups = new Map<string, SearchItem[]>();
		results.forEach((item) => {
			const list = groups.get(item.category) ?? [];
			list.push(item);
			groups.set(item.category, list);
		});

		const sorted = orderedCategories
			.filter((category) => groups.has(category))
			.map((category) => [category, groups.get(category) ?? []] as const);

		const extras = Array.from(groups.entries()).filter(
			([category]) => !orderedCategories.includes(category),
		);

		return [...sorted, ...extras];
	}, [results]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const triggerClasses = compact
		? "inline-flex h-10 items-center justify-center rounded border border-border/60 bg-background/80 text-muted-foreground shadow-sm transition hover:-translate-y-[1px] hover:text-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-0"
		: "group relative flex items-center justify-center xl:justify-start gap-3 rounded-xl border border-border/60 bg-background/80 px-3 text-left text-sm shadow-sm transition hover:-translate-y-[1px] hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-0 w-11 xl:w-full xl:max-w-md h-11";

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<button type="button" className={cn(triggerClasses, className)}>
					<Search className="h-4 w-4 text-muted-foreground shrink-0" />
					{!compact ? (
						<>
							<div className="hidden flex-1 flex-col xl:flex">
								<span className="text-sm font-semibold text-foreground">
									Search the portal
								</span>
							</div>
							<span className="hidden items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground xl:flex">
								Ctrl
								<span className="text-muted-foreground/80">+</span>
								<span>K</span>
							</span>
						</>
					) : null}
				</button>
			</DialogTrigger>
			<DialogContent className="h-[70vh] max-h-[70vh]">
				<DialogBody className="flex h-full flex-col gap-4 p-5 pt-10">
					<div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 shadow-inner">
						<Search className="h-4 w-4 text-muted-foreground" />
						<Input
							autoFocus
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							type="search"
							placeholder="Search pages, settings, or actions"
							className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
						/>
					</div>
					<div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1">
						{groupedResults.length === 0 ? (
							<div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
								No matches yet. Try a different term or browse a category.
							</div>
						) : (
							groupedResults.map(([category, items]) => (
								<div key={category} className="space-y-2">
									<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
										<span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
										{category}
									</div>
									<div className="grid gap-2 sm:grid-cols-2">
										{items.map((item) => (
											<button
												key={`${item.category}-${item.path}-${item.title}`}
												type="button"
												onClick={() => handleSelect(item.path)}
												className="flex items-start justify-between gap-3 rounded-lg border border-transparent bg-background/80 px-3 py-3 text-left transition hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
											>
												<div className="flex flex-col gap-1">
													<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
														<span>{item.title}</span>
														<ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
													</div>
													<p className="text-xs text-muted-foreground">
														{item.description}
													</p>
												</div>
												<span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
													{item.category}
												</span>
											</button>
										))}
									</div>
								</div>
							))
						)}
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
