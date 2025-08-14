import type { KaXingSaveFile } from "@shared/fileFormat";
import { showSaveFilePicker, showOpenFilePicker } from "file-system-access";

const types = [
  {
    description: "KaXing Games",
    accept: {
      "application/kaxing": [".kaxing" as const],
    },
  },
];

/**
 * Spawns a file picker for levels and then returns the selected filehandle and its contents as a string
 */
export async function clickUpload(): Promise<
  [FileSystemFileHandle, KaXingSaveFile]
> {
  const [fileHandle] = await showOpenFilePicker({
    types,
    excludeAcceptAllOption: false,
    multiple: false,
  });

  const file = await fileHandle.getFile();
  const fileText = await file.text();
  // TODO: verify valid game
  return [fileHandle, JSON.parse(fileText)];
}

/**
 * Download the level
 * @param content Object with content to turn into JSON and download
 */
export async function downloadFile(
  content: unknown,
): Promise<FileSystemFileHandle> {
  const handle = await showSaveFilePicker({
    types,
  });
  const ws = await handle.createWritable();
  ws.write(JSON.stringify(content));
  ws.close();
  return handle;
}
