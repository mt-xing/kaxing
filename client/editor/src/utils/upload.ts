import type { KaXingSaveFile } from "@shared/fileFormat";
// TODO should use File API to allow in-place saving of game

/**
 * Spawns a file picker for levels and then returns the selected filehandle and its contents as a string
 */
export async function clickUpload(): Promise<
  [FileSystemFileHandle, KaXingSaveFile]
> {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: "KaXing Games",
        accept: {
          "application/kaxing": [".kaxing"],
        },
      },
    ],
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
 * @param defaultName Default file name without extension
 */
export function downloadFile(content: unknown, defaultName: string) {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(content));
  const dlAnchorElem = document.getElementById("downloadAnchorElem");
  if (!dlAnchorElem) {
    alert("Failed to download");
    return;
  }
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", defaultName + ".kaxing");
  dlAnchorElem.click();
}
