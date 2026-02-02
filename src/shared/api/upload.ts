export type SignedUploadHeaders = Record<string, string>;

export interface SignedUploadUrlResponse {
	upload_url: string;
	required_headers_or_fields?: SignedUploadHeaders;
	storage_provider: string;
	storage_bucket: string;
	storage_key: string;
	file_name?: string | null;
}

export async function uploadFileToSignedUrl({
	uploadUrl,
	file,
	contentType,
	requiredHeaders,
}: {
	uploadUrl: string;
	file: File;
	contentType: string;
	requiredHeaders?: SignedUploadHeaders;
}): Promise<void> {
	const headers: SignedUploadHeaders = {};
	if (contentType) {
		headers["Content-Type"] = contentType;
	}
	if (requiredHeaders) {
		Object.entries(requiredHeaders).forEach(([key, value]) => {
			if (value) {
				headers[key] = value;
			}
		});
	}
	const response = await fetch(uploadUrl, {
		method: "PUT",
		headers,
		body: file,
	});
	if (!response.ok) {
		throw new Error("Upload failed.");
	}
}
