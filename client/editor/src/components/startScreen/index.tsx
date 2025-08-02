import { useCallback } from "react";
import "./StartScreen.css";
import { clickUpload } from "../../utils/upload";
import type { KaXingSaveFile } from "@shared/fileFormat";

export type StartScreenProps = {
  startNew: () => void;
  loadExisting: (f: FileSystemFileHandle, game: KaXingSaveFile) => void;
};

export default function StartScreen(props: StartScreenProps) {
  const { startNew, loadExisting } = props;
  const clickLoad = useCallback(async () => {
    const [fileHandle, game] = await clickUpload();
    loadExisting(fileHandle, game);
  }, [loadExisting]);

  return (
    <div className="card startCard">
      <h1>KaXing Editor</h1>
      <div className="btnWrap">
        <button className="bigbtn startbtn" onClick={startNew}>
          <div>🗋</div>
          Create New <span>KaXing</span>
        </button>
        <button className="bigbtn startbtn" onClick={clickLoad}>
          <div>🗀</div>
          Edit Existing <span>KaXing</span>
        </button>
      </div>
    </div>
  );
}
