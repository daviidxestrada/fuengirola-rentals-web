function StateMsg({ kind = "empty", title, desc, action, imageSrc, imageAlt = "" }) {
  return (
    <div className={`state-msg state-${kind}`}>
      <div className="state-icon" aria-hidden="true">
        {imageSrc ? <img src={imageSrc} alt={imageAlt} /> : null}
        {kind === "loading" ? <span className="spinner" /> : null}
        {!imageSrc && kind === "empty" ? (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <path d="M9 9h.01" />
            <path d="M15 9h.01" />
          </svg>
        ) : null}
        {!imageSrc && kind === "error" ? (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        ) : null}
      </div>
      <h3>{title}</h3>
      {desc ? <p>{desc}</p> : null}
      {action}
    </div>
  );
}

export default StateMsg;
