import React, { useCallback, useEffect, useState } from "react";
import { Text, Box } from "ink";
import { getConfig, putConfig } from "./config";
import { useRootInputs } from "./useRootInputs";
import InitWidget from "./components/InitWidget";
import NewSnippet from "./components/NewSnippet";
import EditWidget from "./components/EditWidget";
import RemoveChunk from "./components/RemoveChunk";
import SearchWidget from "./components/SearchWidget";
import BusyWidget from "./components/BusyWidget";
import { ChunkEntry, GistStore } from "./GistStore";

export type ModuleTypes =
	| "init"
	| "edit"
	| "delete"
	| "new"
	| "search"
	| "busy";

export default function App() {
	const [gistId, setGistId] = useState<string | null>(null);
	const [module, setModule] = useState<ModuleTypes>("busy");
	const [gistStore, setGistStore] = useState<GistStore | null>(null);
	const [chunksFetching, setChunksFetching] = useState(true);
	const [chunks, setChunks] = useState<ChunkEntry[]>([]);
	const [selectedChunkId, setSelectedChunkId] = useState<string>("");
	useRootInputs(setModule, selectedChunkId);

	const fetchChunks = async () => {
		if (gistId) {
			setChunksFetching(true);
			const chunks = (await gistStore?.getChunks(gistId)) || [];
			setChunks(chunks);
			setChunksFetching(false);
		}
	};

	const onCreate = useCallback(
		async (content: string) => {
			setModule("busy");
			if (gistId) {
				await gistStore?.createChunk(content, gistId);
			}
			setChunksFetching(true);
			setModule("search");
		},
		[gistId]
	);

	const onEdit = async (chunkId: string, content: string) => {
		setModule("busy");
		if (gistId) {
			await gistStore?.updateChunk(gistId, chunkId, content);
		}
		setChunksFetching(true);
		setModule("search");
	};

	const onRemove = async (chunkId: string, intent: boolean) => {
		setModule("busy");
		if (intent && gistId && chunkId && chunks.length > 0) {
			await gistStore?.removeChunk(gistId, chunkId);
		}
		setChunksFetching(true);
		setModule("search");
	};

	const getToken = async (token: string) => {
		const store = new GistStore(token);
		setGistStore(store);
		const gistId = await store.createGist();
		if (!gistId) {
			console.error("Invalid token!");
			process.exit(1);
		}
		setGistId(gistId);
		putConfig({ gistId, token });
		setChunksFetching(true);
		setModule("search");
	};

	useEffect(() => {
		const config = getConfig();
		if (config) {
			const store = new GistStore(config.token);
			setGistStore(store);
			setGistId(config.gistId);
			setChunksFetching(true);
			setModule("search");
		} else {
			setModule("init");
		}
	}, []);

	const page = () => {
		if (!(gistStore && gistId) && module !== "busy")
			return <InitWidget onInit={getToken} />;

		switch (module) {
			case "init":
				return <InitWidget onInit={getToken} />;
			case "search":
				return (
					<SearchWidget
						items={chunks}
						fetchChunks={fetchChunks}
						fetching={chunksFetching}
						setSelectedId={setSelectedChunkId}
					/>
				);
			case "new":
				return <NewSnippet onCreate={onCreate} />;
			case "edit":
				return (
					<EditWidget
						chunkId={selectedChunkId}
						onChange={onEdit}
						content={chunks.find((ch) => ch.id === selectedChunkId)?.content}
					/>
				);
			case "delete":
				return <RemoveChunk chunkId={selectedChunkId} onConfirm={onRemove} />;
			case "busy":
				return <BusyWidget />;
		}
	};

	return (
		<>
			<Box paddingLeft={1}>
				<Text color="green">
					Home<Text color="grey">(Esc) | </Text>
				</Text>
				<Text color="redBright">Ctrl + </Text>
				<Text color="blue">
					New<Text color="grey">(N) </Text>
				</Text>
				<Text color="blue">
					Update<Text color="grey">(E) </Text>
				</Text>
				<Text color="blue">
					Delete<Text color="grey">(D) </Text>
				</Text>
				<Text color="blue">
					Exit<Text color="grey">(C) </Text>
				</Text>
			</Box>
			{page()}
		</>
	);
}
