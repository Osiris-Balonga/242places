export function Brand() {
  return (
    <span className="brand" role="img" aria-label="242Places">
      <img
        className="brand-mark brand-mark-light"
        src="/brand/mark-light.svg"
        alt=""
        width="78"
        height="32"
      />
      <img
        className="brand-mark brand-mark-dark"
        src="/brand/mark-dark.svg"
        alt=""
        width="78"
        height="32"
      />
      <span aria-hidden="true">Places</span>
    </span>
  );
}
