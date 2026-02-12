import { useCallback, useEffect, useState } from "react";

export function useSessionStorage<T>(key: string, initialValue: T) {
	const readValue = useCallback(() => {
		if (typeof window === "undefined") return initialValue;
		try {
			const item = window.sessionStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : initialValue;
		} catch {
			return initialValue;
		}
	}, [initialValue, key]);

	const [storedValue, setStoredValue] = useState<T>(readValue);

	useEffect(() => {
		setStoredValue(readValue());
	}, [readValue]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			window.sessionStorage.setItem(key, JSON.stringify(storedValue));
		} catch {
			// ignore write errors
		}
	}, [key, storedValue]);

	return [storedValue, setStoredValue] as const;
}
