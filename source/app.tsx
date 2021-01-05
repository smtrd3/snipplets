import React, { useCallback, useEffect, useRef, useState } from "react";
import SearchWidget from "./components/SearchWidget";
import { Text, Box, measureElement, DOMElement } from "ink";
import NewSnippet from "./components/NewSnippet";
import EditWidget from "./components/EditWidget";
import InitWidget from "./components/InitWidget";
import { ChunkEntry, GistStore } from "./gists";
import { getConfig, putConfig } from "./config";
import { useRootInputs } from "./useRootInputs";
import RemoveChunk from "./components/RemoveChunk";

export type ModuleTypes = "init" | "edit" | "delete" | "new" | "search";

export default function App() {
	const [gistId, setGistId] = useState<string | null>(null);
	const [module, setModule] = useState<ModuleTypes>("init");
	const [gistStore, setGistStore] = useState<GistStore | null>(null);
	const [chunksFetching, setChunksFetching] = useState(false);
	const [chunks, setChunks] = useState<ChunkEntry[]>([]);
	const [selectedChunkId, setSelectedChunkId] = useState<string>("");
	const noUpdateRef = useRef(false);

	useRootInputs(setModule, selectedChunkId);

	const fetchChunks = async () => {
		if (noUpdateRef.current) return;
		if (gistId) {
			setChunksFetching(true);
			const chunks = (await gistStore?.getChunks(gistId)) || [];
			setChunks(chunks);
			setChunksFetching(false);
		}
	};

	const onCreate = useCallback(
		async (content: string) => {
			noUpdateRef.current = true;
			setChunks([]);
			setChunksFetching(true);
			setModule("search");
			if (gistId) {
				await gistStore?.createChunk(content, gistId);
				noUpdateRef.current = false;
				await fetchChunks();
			} else {
				noUpdateRef.current = false;
			}
		},
		[gistId]
	);

	const onEdit = useCallback(
		async (content: string) => {
			noUpdateRef.current = true;
			setChunks([]);
			setChunksFetching(true);
			setModule("search");
			if (gistId) {
				await gistStore?.updateChunk(gistId, selectedChunkId, content);
				noUpdateRef.current = false;
				await fetchChunks();
			} else {
				noUpdateRef.current = false;
			}
		},
		[gistId, selectedChunkId]
	);

	const onRemove = async (intent: boolean) => {
		noUpdateRef.current = true;
		setChunks([]);
		setChunksFetching(true);
		setModule("search");
		if (intent && gistId && selectedChunkId && chunks.length > 0) {
			await gistStore?.removeChunk(gistId, selectedChunkId);
			noUpdateRef.current = false;
			await fetchChunks();
		} else {
			noUpdateRef.current = false;
		}
	};

	const getToken = async (token: string) => {
		const store = new GistStore(token);
		setGistStore(store);
		const gistId = await store.createGist();
		setGistId(gistId);
		putConfig({ gistId, token });
		setModule("search");
	};

	useEffect(() => {
		const config = getConfig();
		if (config) {
			const store = new GistStore(config.token);
			setGistStore(store);
			setGistId(config.gistId);
			setModule("search");
		} else {
			setModule("init");
		}
	}, []);

	const page = () => {
		if (!gistStore || !gistId) return <InitWidget onInit={getToken} />;
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
						onChange={onEdit}
						content={chunks.find((ch) => ch.id === selectedChunkId)?.content}
					/>
				);
			case "delete":
				return <RemoveChunk onConfirm={onRemove} />;
		}
	};

	return (
		<>
			<Box paddingLeft={1}>
				<Text color="green">
					Home <Text color="grey">(Esc) | </Text>
				</Text>
				<Text color="redBright">Ctrl + </Text>
				<Text color="blue">
					New <Text color="grey">(N) </Text>
				</Text>
				<Text color="blue">
					Update <Text color="grey">(E) </Text>
				</Text>
				<Text color="blue">
					Delete <Text color="grey">(D) </Text>
				</Text>
			</Box>
			{page()}
		</>
	);
}
