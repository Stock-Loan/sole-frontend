export type TokenResolver = () => string | null;

export type TokenUpdater = (tokens: {
	access_token: string;
	refresh_token: string;
}) => void;

export type VoidHandler = () => void;
