import { useState } from "react";
import { FacebookShareButton, FacebookIcon, WhatsappShareButton, WhatsappIcon, TwitterShareButton, TwitterIcon } from "react-share";
import QRCode from "qrcode.react";

export default function ShareOptions() {
  const [open, setOpen] = useState(false);
  const url = window.location.href;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    alert("Link copied");
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{
        position: "fixed", bottom: 20, right: 20, width: 60, height: 60, borderRadius: "50%", border: "none", background: "#2563eb", color: "#fff", fontSize: 22, cursor: "pointer"
      }}>🔗</button>

      {open && (
        <div style={{ position: "fixed", bottom: 100, right: 20, background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.12)", width: 220 }}>
          <h4 style={{ margin: 0, marginBottom: 10 }}>Share</h4>
          <div style={{ display: "flex", gap: 8 }}>
            <FacebookShareButton url={url}><FacebookIcon size={36} round /></FacebookShareButton>
            <WhatsappShareButton url={url}><WhatsappIcon size={36} round /></WhatsappShareButton>
            <TwitterShareButton url={url}><TwitterIcon size={36} round /></TwitterShareButton>
          </div>

          <button style={{ marginTop: 10, width: "100%", padding: 8 }} onClick={copy}>📋 Copy link</button>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
            <QRCode value={url} size={90} />
          </div>
          <button style={{ marginTop: 8, width: "100%", background: "transparent", border: "none", color: "red" }} onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </>
  );
}
