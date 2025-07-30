export type StartScreenProps = {
  close: () => void;
};

export default function StartScreen(props: StartScreenProps) {
  const { close } = props;
  return (
    <div className="card">
      <h1 style={{ fontWeight: 900 }}>KaXing Editor</h1>
      <button className="bigbtn">Create New KaXing</button>
      <button className="bigbtn" onClick={close}>
        Edit Existing KaXing
      </button>
    </div>
  );
}
