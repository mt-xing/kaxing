// TODO should use File API to allow in-place saving of game

/**
 * Spawns a file picker for levels and then returns the selected file
 */
export function clickUpload(): Promise<File> {
  return new Promise<File>((r) => {
    const newUpload = document.createElement("INPUT") as HTMLInputElement;
    newUpload.type = "file";
    newUpload.style.position = "fixed";
    newUpload.style.bottom = "101vh";
    newUpload.setAttribute("accept", ".kaxing");
    document.body.appendChild(newUpload);
    newUpload.addEventListener("change", function(){
      const file = newUpload.files?.[0];
      if (file) {
        r(file);
      }
      newUpload.outerHTML = "";
    });
    newUpload.click();
  });
}


/**
 * Download the level
 * @param content Object with content to turn into JSON and download
 * @param defaultName Default file name without extension
 */
export function downloadFile(content: unknown, defaultName: string) {
	const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content));
	const dlAnchorElem = document.getElementById('downloadAnchorElem');
  if (!dlAnchorElem) {
    alert("Failed to download");
    return;
  }
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", defaultName + ".kaxing");
	dlAnchorElem.click();
}