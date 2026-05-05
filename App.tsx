import { useState, useRef, useEffect } from "react";

const DEFAULT_DISHES: string[] = [
  "Dosa / Idli",
  "Dudhi chana nu shak & roti",
  "Egg dishes",
  "Shakshuka",
  "GKC",
  "Pulao",
  "Khari bhaat",
  "Chicken fried rice / Schezwan rice",
  "Chinese noodles",
  "Kobi nu shak & roti",
  "Bhindi",
  "Bisibele",
  "Dal dhokdi",
  "Dal baati",
  "Bataka ni bhaji",
  "Chaat",
  "Sev usal",
  "Burger / Taco",
  "Aloo paratha",
  "Idada",
  "Kadhi khichdi",
  "Quesadilla",
  "Frankie / Burrito",
  "Lemon rice",
  "Mexican rice",
  "Dal fry jeera rice",
  "Sabudana wada / Khichdi",
  "Mattar malai",
  "Kathod",
  "Bhakhri pizza",
  "Ragda petis",
  "Puff",
];

const COLORS: string[] = [
  "#FF6B35", "#FF8C42", "#FFA559", "#FFB347",
  "#FF7043", "#FF6B6B", "#FF8E53", "#E64A19",
  "#FF6B35", "#FF5722", "#FF8C42", "#BF360C",
  "#FF9A3C", "#FF6B35", "#E64A19", "#FF7043",
];

function drawWheel(canvas: HTMLCanvasElement, dishes: string[], rotation: number) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(W, H) / 2 - 8;
  const n = dishes.length;
  const arc = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 36;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = "#222";
  ctx.fill();
  ctx.restore();

  for (let i = 0; i < n; i++) {
    const startAngle = rotation + i * arc;
    const endAngle = startAngle + arc;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    const fontSize = Math.max(8, Math.min(13, 180 / n));
    ctx.font = `bold ${fontSize}px 'DM Sans', sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 5;
    const label = dishes[i].length > 18 ? dishes[i].slice(0, 17) + "..." : dishes[i];
    ctx.fillText(label, r - 12, fontSize / 3);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF6B35";
  ctx.fill();
}

export default function App() {
  const [dishes, setDishes] = useState<string[]>([...DEFAULT_DISHES]);
  const [newDish, setNewDish] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const dishesRef = useRef<string[]>(dishes);

  useEffect(() => { dishesRef.current = dishes; }, [dishes]);

  useEffect(() => {
    if (canvasRef.current && dishes.length > 0) {
      drawWheel(canvasRef.current, dishes, rotation);
    }
  }, [dishes, rotation]);

  const spin = () => {
    if (spinning || dishes.length < 2) return;
    setSpinning(true);
    setShowResult(false);
    setResult(null);

    const extraSpins = 7 + Math.random() * 5;
    const targetAngle = extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const duration = 3800 + Math.random() * 900;
    const startTime = performance.now();
    const startRot = rotation;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const current = startRot + targetAngle * easeOut(t);
      setRotation(current);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const currentDishes = dishesRef.current;
        const n = currentDishes.length;
        const arc = (2 * Math.PI) / n;
        const normalized = ((current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (2 * Math.PI - normalized + 3 * Math.PI / 2) % (2 * Math.PI);
        const idx = Math.floor(pointerAngle / arc) % n;
        setResult(currentDishes[idx]);
        setTimeout(() => setShowResult(true), 100);
      }
    }

    animRef.current = requestAnimationFrame(animate);
  };

  const addDish = () => {
    const trimmed = newDish.trim();
    if (!trimmed || dishes.includes(trimmed)) return;
    setDishes([...dishes, trimmed]);
    setNewDish("");
    setResult(null);
    setShowResult(false);
  };

  const removeDish = (i: number) => {
    if (dishes.length <= 2) return;
    setDishes(dishes.filter((_, idx) => idx !== i));
    setResult(null);
    setShowResult(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: "28px 16px 52px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet" />

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 52,
          color: "#FF6B35",
          letterSpacing: 3,
          lineHeight: 1,
        }}>WHAT DO I EAT?</div>
        <div style={{ color: "#666", fontSize: 13, marginTop: 5 }}>
          {dishes.length} dishes on the wheel &middot; spin to decide
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 18 }}>
        <div style={{
          position: "absolute",
          top: -12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          width: 0,
          height: 0,
          borderLeft: "13px solid transparent",
          borderRight: "13px solid transparent",
          borderTop: "26px solid #FF6B35",
          filter: "drop-shadow(0 4px 10px rgba(255,107,53,0.7))",
        }} />
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          style={{
            borderRadius: "50%",
            display: "block",
            cursor: spinning ? "not-allowed" : "pointer",
          }}
          onClick={spin}
        />
      </div>

      <div style={{ minHeight: 68, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        {showResult && result && (
          <div style={{
            background: "linear-gradient(135deg, #FF6B35, #FF8C42)",
            borderRadius: 16,
            padding: "12px 28px",
            textAlign: "center",
            animation: "pop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              Today you are eating
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 30,
              color: "#fff",
              letterSpacing: 2,
              lineHeight: 1.15,
            }}>{result}</div>
          </div>
        )}
      </div>

      <button onClick={spin} disabled={spinning || dishes.length < 2} style={{
        background: spinning ? "#2a2a2a" : "linear-gradient(135deg, #FF6B35, #FF5722)",
        color: spinning ? "#555" : "#fff",
        border: "none",
        borderRadius: 50,
        padding: "14px 44px",
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 22,
        letterSpacing: 3,
        cursor: spinning ? "not-allowed" : "pointer",
        marginBottom: 30,
        boxShadow: spinning ? "none" : "0 8px 28px rgba(255,107,53,0.45)",
        transition: "all 0.2s",
      }}>
        {spinning ? "SPINNING..." : "SPIN THE WHEEL"}
      </button>

      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "#161616",
        borderRadius: 20,
        padding: 20,
        border: "1px solid #252525",
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 17,
          color: "#FF6B35",
          letterSpacing: 2,
          marginBottom: 14,
        }}>
          DISHES ({dishes.length})
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            value={newDish}
            onChange={e => setNewDish(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addDish()}
            placeholder="Add a dish..."
            style={{
              flex: 1,
              background: "#111",
              border: "1px solid #2e2e2e",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button onClick={addDish} style={{
            background: "#FF6B35",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            cursor: "pointer",
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1,
          }}>+</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 320, overflowY: "auto" }}>
          {dishes.map((d, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#111",
              borderRadius: 9,
              padding: "7px 12px",
              borderLeft: `3px solid ${COLORS[i % COLORS.length]}`,
            }}>
              <span style={{ color: "#ccc", fontSize: 13 }}>{d}</span>
              <button onClick={() => removeDish(i)} disabled={dishes.length <= 2} style={{
                background: "none",
                border: "none",
                color: dishes.length <= 2 ? "#2a2a2a" : "#555",
                cursor: dishes.length <= 2 ? "not-allowed" : "pointer",
                fontSize: 18,
                padding: "0 4px",
                lineHeight: 1,
                flexShrink: 0,
              }}>x</button>
            </div>
          ))}
        </div>

        {dishes.length <= 2 && (
          <div style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 10 }}>
            Add more dishes to enable removing
          </div>
        )}
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        input::placeholder { color: #3a3a3a !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
      `}</style>
    </div>
  );
}
