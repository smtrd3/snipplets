import React, { useCallback, useEffect, useState } from "react";
import SearchWidget from "./components/SearchWidget";
import { Text, Box } from "ink";
import NewSnippet from "./components/NewSnippet";
import EditWidget from "./components/EditWidget";
import InitWidget from "./components/InitWidget";
import { ChunkEntry, GistStore } from "./gists";
import { getConfig, putConfig } from "./config";
import { useRootInputs } from "./useRootInputs";

export type ModuleTypes = "init" | "edit" | "delete" | "new" | "search";

export default function App() {
	const [gistId, setGistId] = useState<string | null>(null);
	const [module, setModule] = useState<ModuleTypes>("init");
	const [gistStore, setGistStore] = useState<GistStore | null>(null);
	const [chunksFetching, setChunksFetching] = useState(false);
	const [chunks, setChunks] = useState<ChunkEntry[]>([]);
	useRootInputs(setModule);

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
			setChunks([]);
			setModule("search");
			if (gistId) {
				await gistStore?.createChunk(content, gistId);
			}
		},
		[gistId]
	);

	const getToken = async (token: string) => {
		const store = new GistStore(token);
		setGistStore(store);
		const gistId = await store.createGist();
		setGistId(gistId);
		putConfig({ gistId, token });
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
						fetchChunks={fetchChunks}
						fetching={chunksFetching}
						items={chunks}
					/>
				);
			case "new":
				return <NewSnippet onCreate={onCreate} />;
			case "edit":
				return <EditWidget />;
		}
		return <Text>{module} module is not defined</Text>;
	};

	return (
		<>
			<Box width={100}>
				<Text>🏡 Esc </Text>
				<Text color="redBright">Ctrl + [n | d | e]</Text>
			</Box>
			{page()}
		</>
	);
}
