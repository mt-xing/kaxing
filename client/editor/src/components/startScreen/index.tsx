import { useCallback } from "react";
import "./StartScreen.css";
import { clickUpload } from "../../utils/upload";

export type StartScreenProps = {
  startNew: () => void;
  loadExisting: (fileString: string) => void;
};

export default function StartScreen(props: StartScreenProps) {
  const { startNew, loadExisting } = props;
  const clickLoad = useCallback(async () => {
    const f = await clickUpload();
    let reader = new FileReader();
    reader.onload = function (e) {
      if (e.target?.result && typeof e.target.result === "string") {
        loadExisting(e.target.result);
      } else {
        alert("Could not read file");
      }
    };
    reader.readAsText(f);
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
