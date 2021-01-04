import fetch from "node-fetch";
import { GH_TOKEN, GIST_FILE } from "./constants";
import { removeStopwords } from "stopword";
import shortid from "shortid";

type GistType = {
	id: string;
	url: string;
	html_url: string;
	public: boolean;
	created_at: string;
	updated_at: string;
	description: string;
	comments: number;
	files: {
		[fileName: string]: {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
	};
	owner: {
		login: string;
		id: number;
		node_id: string;
		avatar_url: string;
		gravatar_id: string;
		url: string;
		html_url: string;
		followers_url: string;
		following_url: string;
		gists_url: string;
		starred_url: string;
		subscriptions_url: string;
		organizations_url: string;
		repos_url: string;
		events_url: string;
		received_events_url: string;
		type: string;
		site_admin: boolean;
	};
};

type CreateGistResponse = {
	id: string;
};

const API_EP = "https://api.github.com/gists";

async function getGist(gistId: string) {
	return (await fetch(`${API_EP}/${gistId}`, {
		headers: {
			Accept: "application/vnd.github.v3+json",
			Authorization: `token ${GH_TOKEN}`,
		},
	}).then((response) => response.json())) as GistType;
}

export type ChunkEntry = {
	id: string;
	tags: string[];
	label: string;
	content: string;
};

export class GistStore {
	constructor(private token: string) {}

	async fetch(url: string, options: RequestInit = {}) {
		return fetch(url, {
			...options,
			headers: {
				...options.headers,
				Authorization: `token ${this.token}`,
				Accept: "application/vnd.github.v3+json",
			},
		} as any);
	}

	makeEntry(content: string) {
		const id = shortid.generate();
		const label = content
			.replace(/(?:\r\n|\r|\n)/g, " ")
			.replace(/[^1-z0-9 ]/g, "")
			.replace(/`/g, "")
			.slice(0, 100)
			.trim();
		const tags = removeStopwords(content.split(" "));
		return {
			id,
			label,
			tags,
			content,
		} as ChunkEntry;
	}

	async getFileContent(fileName: string, gistId: string) {
		const gist: GistType = await getGist(gistId);
		const content = gist.files[fileName]?.content;
		if (!content) {
			throw new Error("File lookup failed inside gist");
		}
		return JSON.parse(content);
	}

	async getChunks(gistId: string): Promise<ChunkEntry[]> {
		const currentContent = await this.getFileContent(GIST_FILE, gistId);
		return currentContent.chunks || [];
	}

	async createGist(): Promise<string> {
		return await this.fetch(`${API_EP}`, {
			method: "POST",
			body: JSON.stringify({
				files: {
					[GIST_FILE]: {
						content: JSON.stringify({
							chunks: [],
						}),
					},
				},
			}),
		})
			.then((r) => r.json())
			.then((json) => json.id);
	}

	async createChunk(content: string, gistId: string) {
		const chunks = await this.getChunks(gistId);
		const newEntry: ChunkEntry = this.makeEntry(content);
		chunks.push(newEntry);
		return this.fetch(`${API_EP}/${gistId}`, {
			method: "PATCH",
			body: JSON.stringify({
				files: {
					[GIST_FILE]: {
						content: JSON.stringify({
							chunks,
						}),
					},
				},
			}),
		}).then((resp) => resp.json());
	}

	async updateChunk(gistId: string, chunkId: string, content: string) {
		const chunks = await this.getChunks(gistId);

		const updatedChunks = chunks.map((chunk) => {
			if (chunk.id === chunkId) {
				return this.makeEntry(content);
			}
			return chunk;
		});

		return this.fetch(`${API_EP}/${gistId}`, {
			method: "PATCH",
			body: JSON.stringify({
				files: {
					[GIST_FILE]: {
						content: JSON.stringify({
							updatedChunks,
						}),
					},
				},
			}),
		}).then((resp) => resp.json());
	}

	async removeChunk(gistId: string, chunkId: string) {
		const chunks = await this.getChunks(gistId);

		const updatedChunks = chunks.filter((chunk) => {
			return chunk.id !== chunkId;
		});

		return this.fetch(`${API_EP}/${gistId}`, {
			method: "PATCH",
			body: JSON.stringify({
				files: {
					[GIST_FILE]: {
						content: JSON.stringify({
							updatedChunks,
						}),
					},
				},
			}),
		}).then((resp) => resp.json());
	}
}
