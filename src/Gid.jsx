import { useMemo, useState } from "react";
import "./Gib.css";

export default function Gib() {
  const [method, setMethod] = useState("hour");

  // ผู้เล่น
  const [players, setPlayers] = useState([]);

  // ค่าใช้จ่ายหลัก
  const [courtCost, setCourtCost] = useState("");        // ค่าสนามจ่ายจริง (รวม)
  const [ballCost, setBallCost] = useState("");          // ค่าลูกจ่ายจริง (รวม)
  const [otherCost, setOtherCost] = useState("");        // ไม่ใช้ในสูตรกำไรสุทธิ

  // โหมดตามเกม
  const [courtPerPerson, setCourtPerPerson] = useState(""); // ค่าเปิดสนามต่อคน
  const [shuttlePerGame, setShuttlePerGame] = useState(""); // ค่าลูกต่อเกม

  // โหมดหารเท่า
  const [shuttleSellRevenue, setShuttleSellRevenue] = useState(""); // ค่าลูกขายรวม
  const [hours, setHours] = useState([{ id: 1, shuttles: "" }]);     // [{id, shuttles}]

  // ตั้งค่าทั้งแถวในตาราง
  const [extraBulk, setExtraBulk] = useState(""); // hour mode: กำไรเพิ่มทั้งแถว
  const [gameBulk, setGameBulk]   = useState(""); // game mode: เกมทั้งแถว

  // ---------- ผู้เล่น ----------
  const addPlayer = () => {
    setPlayers((prev) => [
      ...prev,
      { name: "", unit: "", extra: "", hours: [], amount: 0 },
    ]);
  };

  const updatePlayer = (index, key, value) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const removePlayer = (index) =>
    setPlayers((prev) => prev.filter((_, i) => i !== index));

  const applyExtraToAll = () => {
    const v = Number(extraBulk) || 0;
    setPlayers((prev) => prev.map((p) => ({ ...p, extra: v })));
  };

  const applyGamesToAll = () => {
    const v = Number(gameBulk) || 0;
    setPlayers((prev) => prev.map((p) => ({ ...p, unit: v })));
  };

  // ---------- ชั่วโมง ----------
  const addHour = () =>
    setHours((prev) => [...prev, { id: prev.length + 1, shuttles: "" }]);

  const removeLastHour = () => {
    setHours((prev) => {
      if (prev.length <= 1) return prev;
      const lastId = prev[prev.length - 1].id;
      setPlayers((pPrev) =>
        pPrev.map((p) => ({ ...p, hours: (p.hours || []).filter((h) => h !== lastId) }))
      );
      return prev.slice(0, -1);
    });
  };

  const updateHourShuttles = (idx, value) => {
    setHours((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], shuttles: value };
      return copy;
    });
  };

  const togglePlayerHour = (playerIndex, hourId) => {
    setPlayers((prev) => {
      const copy = [...prev];
      const p = { ...copy[playerIndex] };
      const setH = new Set(p.hours || []);
      setH.has(hourId) ? setH.delete(hourId) : setH.add(hourId);
      p.hours = Array.from(setH).sort((a, b) => a - b);
      copy[playerIndex] = p;
      return copy;
    });
  };

  // ---------- ตัวช่วยคำนวณ ----------
  const participantsPerHour = useMemo(() => {
    const map = {};
    for (const h of hours) map[h.id] = 0;
    for (const p of players) (p.hours || []).forEach((hId) => (map[hId] = (map[hId] || 0) + 1));
    return map;
  }, [players, hours]);

  const totalShuttlesUsed = useMemo(
    () => hours.reduce((sum, h) => sum + (Number(h.shuttles) || 0), 0),
    [hours]
  );

  const avgShuttlePrice =
    totalShuttlesUsed > 0 ? (Number(shuttleSellRevenue) || 0) / totalShuttlesUsed : 0;

  // คำนวณยอดเรียกเก็บต่อคน
  const calcPlayerAmount = (p) => {
    const extra = Number(p.extra) || 0;

    if (method === "game") {
      const games = Number(p.unit) || 0;
      return {
        amount:
          (Number(courtPerPerson) || 0) +
          games * (Number(shuttlePerGame) || 0) +
          extra,
      };
    }

    // ===== โหมดหารเท่า =====
    // ค่าสนาม: แบ่งเท่ากันทุกคน
    const playerCount = Math.max(players.length, 1);
    const courtShare = (Number(courtCost) || 0) / playerCount;

    // ค่าลูก: แบ่งตามชม.ที่เล่น
    let shuttleShareBaht = 0;
    for (const hId of p.hours || []) {
      const usedInHour = Number(hours.find((h) => h.id === hId)?.shuttles) || 0;
      const ppl = participantsPerHour[hId] || 0;
      if (ppl > 0) shuttleShareBaht += (usedInHour * avgShuttlePrice) / ppl;
    }

    return { amount: courtShare + shuttleShareBaht + extra };
  };

  const computedPlayers = players.map((p) => ({ ...p, ...calcPlayerAmount(p) }));

  // ---------- SUMMARY ----------
  // ยอดเก็บรวม
  const totalCollected = computedPlayers.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  // กำไรจากสนาม = ค่าเปิดสนาม − ค่าสนามจริง
  const courtOpenRevenue =
    method === "game"
      ? players.length * (Number(courtPerPerson) || 0)
      : (Number(courtCost) || 0);
  const profitCourt = courtOpenRevenue - (Number(courtCost) || 0);
  // กำไรจากลูก = ค่าลูกที่ขาย − ค่าลูกที่จ่ายจริง
  const profitBall = (Number(shuttleSellRevenue) || 0) - (Number(ballCost) || 0);
  // กำไรสุทธิ = ยอดเก็บรวม − ค่าสนาม − ค่าลูกที่จ่ายจริง
  const netProfit = totalCollected - (Number(courtCost) || 0) - (Number(ballCost) || 0);
  // ทุน (ตามที่กำหนด) = ยอดเก็บรวม − ค่าสนาม − ค่าลูกที่จ่ายจริง (เท่ากับ netProfit)
  const capital = netProfit;

  // ---------- COPY HELPERS (ให้สอดคล้องกับ "สรุปเก็บเงิน" ที่ไม่โชว์กำไรเพิ่ม/โหมด) ----------
  const copySummaryText = () => {
    const lines = computedPlayers.map(
      (p, i) => `${i + 1}. ${p.name || "ไม่ระบุ"} — ${new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(p.amount || 0)} ฿`
    );
    const text = [
      "สรุปเก็บเงิน",
      `รวมทั้งหมด: ${new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(totalCollected)} ฿`,
      ...lines,
    ].join("\n");
    navigator.clipboard.writeText(text);
    alert("คัดลอกข้อความสรุปแล้ว");
  };

  const copyCSV = () => {
    const header =
      method === "game"
        ? ["ลำดับ", "ชื่อ", "เกม", "ยอดเก็บ(฿)"]
        : ["ลำดับ", "ชื่อ", "ยอดเก็บ(฿)"];

    const rows = [
      header,
      ...computedPlayers.map((p, i) =>
        method === "game"
          ? [i + 1, p.name || "", Number(p.unit || 0), Number(p.amount || 0)]
          : [i + 1, p.name || "", Number(p.amount || 0)]
      ),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    navigator.clipboard.writeText(csv);
    alert("คัดลอก CSV แล้ว (วางใน Excel/Sheets ได้)");
  };

  return (
    <div className="pj-root">
      <div className="pj-card">
        <h1 className="pj-title">POKJOK COST</h1>

        {/* Toolbar */}
        <div className="pj-toolbar">
          <div className="pj-radio-row">
            <label className={`pj-radio ${method === 'hour' ? 'is-on' : ''}`}>
              <input
                type="radio"
                value="hour"
                checked={method === "hour"}
                onChange={() => setMethod("hour")}
              />
              หารเท่า
            </label>
            <label className={`pj-radio ${method === 'game' ? 'is-on' : ''}`}>
              <input
                type="radio"
                value="game"
                checked={method === "game"}
                onChange={() => setMethod("game")}
              />
              ตามเกม
            </label>
          </div>
          
        </div>

        {/* Expenses + Parameters */}
        <div className="pj-grid-2">
          <div className="pj-card-mini">
            <h2 className="pj-section-title">ค่าใช้จ่ายหลัก</h2>
            <div className="pj-grid">
              <div className="pj-field">
                <label className="pj-label">ค่าสนามที่จ่ายจริง</label>
                <input
                  type="number"
                  value={courtCost}
                  onChange={(e) => setCourtCost(e.target.value)}
                  className="pj-input"
                  placeholder="0"
                />
              </div>
              <div className="pj-field">
                <label className="pj-label">ค่าลูกที่จ่ายจริง</label>
                <input
                  type="number"
                  value={ballCost}
                  onChange={(e) => setBallCost(e.target.value)}
                  className="pj-input"
                  placeholder="0"
                />
              </div>
              <div className="pj-field">
                <label className="pj-label">ค่าลูกที่ขายจริง (รวม)</label>
                <input
                  type="number"
                  value={shuttleSellRevenue}
                  onChange={(e) => setShuttleSellRevenue(e.target.value)}
                  className="pj-input"
                  placeholder="0"
                />
              </div>
              <div className="pj-field">
                <label className="pj-label">อื่น ๆ (ไม่หักในกำไรสุทธิ)</label>
                <input
                  type="number"
                  value={otherCost}
                  onChange={(e) => setOtherCost(e.target.value)}
                  className="pj-input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="pj-card-mini">
            <h2 className="pj-section-title">พารามิเตอร์</h2>
            {method === "game" ? (
              <div className="pj-grid">
                <div className="pj-field">
                  <label className="pj-label">ค่าเปิดสนามต่อคน</label>
                  <input
                    type="number"
                    value={courtPerPerson}
                    onChange={(e) => setCourtPerPerson(e.target.value)}
                    className="pj-input"
                    placeholder="0"
                  />
                </div>
                <div className="pj-field">
                  <label className="pj-label">ค่าลูกต่อเกม</label>
                  <input
                    type="number"
                    value={shuttlePerGame}
                    onChange={(e) => setShuttlePerGame(e.target.value)}
                    className="pj-input"
                    placeholder="0"
                  />
                </div>
              </div>
            ) : (
              <p className="pj-note">ค่าสนามหารเท่ากันทุกคน • ค่าลูกแบ่งตามชั่วโมงที่เล่น</p>
            )}
          </div>
        </div>

        {/* Hours (hour mode) */}
        {method === "hour" && (
          <div className="pj-card-mini" style={{ marginTop: 12 }}>
            <h2 className="pj-section-title">บันทึกการใช้ลูก/ชั่วโมง</h2>
            <div className="pj-hours">
              {hours.map((h, idx) => (
                <div key={h.id} className="pj-hour-row">
                  <span className="pj-hour-label">ชม.{h.id}</span>
                  <input
                    type="number"
                    value={h.shuttles}
                    onChange={(e) => updateHourShuttles(idx, e.target.value)}
                    className="pj-input pj-hour-input"
                    placeholder="ลูกที่ใช้"
                  />
                </div>
              ))}
            </div>
            <div className="pj-hour-tools">
              <span className="pj-hour-total">
                ลูกใช้รวม: <b>{new Intl.NumberFormat("th-TH").format(totalShuttlesUsed)}</b> ลูก
              </span>
              <div className="pj-hour-buttons">
                <button className="pj-button pj-button-sm" onClick={addHour}>+ เพิ่มชม.</button>
                <button className="pj-button pj-button-sm pj-button-outline" onClick={removeLastHour}>− ลบชม.ล่าสุด</button>
              </div>
            </div>
          </div>
        )}

        {/* Players Table */}
        <div className="pj-table-wrap" style={{ marginTop: 16 }}>
          <table className="pj-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>ชื่อ</th>

                {method === "game" && (
                  <th style={{ width: '130px' }}>
                    <div className="pj-th-flex">
                      <span>เกม</span>
                      <div className="pj-th-tools">
                        <input
                          type="number"
                          value={gameBulk}
                          onChange={(e) => setGameBulk(e.target.value)}
                          className="pj-input pj-input-sm"
                          placeholder="ทั้งแถว"
                        />
                        <button className="pj-button pj-button-xxs" onClick={applyGamesToAll}>ตั้ง</button>
                      </div>
                    </div>
                  </th>
                )}

                {method === "hour" && <th>ชั่วโมงที่เล่น</th>}

                <th style={{ width: '160px' }}>
                  <div className="pj-th-flex">
                    <span>กำไรเพิ่ม</span>
                    {method === "hour" && (
                      <div className="pj-th-tools">
                        <input
                          type="number"
                          value={extraBulk}
                          onChange={(e) => setExtraBulk(e.target.value)}
                          className="pj-input pj-input-sm"
                          placeholder="ทั้งแถว"
                        />
                        <button className="pj-button pj-button-xxs" onClick={applyExtraToAll}>ตั้ง</button>
                      </div>
                    )}
                  </div>
                </th>

                <th style={{ width: '120px' }}>ยอดเก็บ (฿)</th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </thead>

            <tbody>
              {computedPlayers.map((p, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updatePlayer(i, "name", e.target.value)}
                      className="pj-input"
                      placeholder="ชื่อ"
                    />
                  </td>

                  {method === "game" && (
                    <td>
                      <input
                        type="number"
                        value={p.unit || ""}
                        onChange={(e) => updatePlayer(i, "unit", e.target.value)}
                        className="pj-input"
                        placeholder="เกม"
                      />
                    </td>
                  )}

                  {method === "hour" && (
                    <td>
                      <div className="pj-hour-chips">
                        {hours.map((h) => (
                          <label
                            key={h.id}
                            className={`pj-chip ${(p.hours || []).includes(h.id) ? 'on' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={(p.hours || []).includes(h.id)}
                              onChange={() => togglePlayerHour(i, h.id)}
                            />
                            ชม.{h.id}
                          </label>
                        ))}
                      </div>
                    </td>
                  )}

                  <td>
                    <input
                      type="number"
                      value={p.extra || ""}
                      onChange={(e) => updatePlayer(i, "extra", e.target.value)}
                      className="pj-input"
                      placeholder="กำไรเพิ่ม"
                    />
                  </td>

                  <td className="pj-amount">
                    {new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(p.amount || 0)}
                  </td>

                  <td>
                    <button className="pj-link-danger" onClick={() => removePlayer(i)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ปุ่มผู้เล่น: เหลือเฉพาะเพิ่มผู้เล่น (ปุ่มคัดลอก/พิมพ์ถูกย้ายไปที่สรุปเก็บเงิน) */}
          <div className="pj-row-tools">
            <button className="pj-button" onClick={addPlayer}>+ เพิ่มผู้เล่น</button>
            <div style={{ flex: 1 }} />
          </div>
        </div>

        {/* Summary (KPI) */}
        <div className="pj-summary-grid" style={{ marginTop: 12 }}>
          <div className="pj-kpi">
            <h3 className="pj-kpi-head">ยอดเก็บรวม</h3>
            <p className="pj-kpi-value">{new Intl.NumberFormat("th-TH").format(totalCollected)} ฿</p>
          </div>
          <div className="pj-kpi">
            <h3 className="pj-kpi-head">กำไรจากสนาม</h3>
            <p className={`pj-kpi-value ${profitCourt >= 0 ? 'pj-green' : 'pj-red'}`}>
              {profitCourt >= 0 ? '+' : ''}{new Intl.NumberFormat("th-TH").format(profitCourt)} ฿
            </p>
            <p className="pj-kpi-sub">ค่าเปิดสนาม − ค่าสนามจริง</p>
          </div>
          <div className="pj-kpi">
            <h3 className="pj-kpi-head">กำไรจากลูก</h3>
            <p className={`pj-kpi-value ${profitBall >= 0 ? 'pj-green' : 'pj-red'}`}>
              {profitBall >= 0 ? '+' : ''}{new Intl.NumberFormat("th-TH").format(profitBall)} ฿
            </p>
            <p className="pj-kpi-sub">ค่าลูกที่ขาย − ค่าลูกที่จ่ายจริง</p>
          </div>
          <div className="pj-kpi">
            <h3 className="pj-kpi-head">ทุน</h3>
            <p className="pj-kpi-value">
              {new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(capital)} ฿
            </p>
            <p className="pj-kpi-sub">ยอดเก็บรวม − ค่าสนาม − ค่าลูกที่จ่ายจริง</p>
          </div>
          <div className={`pj-netcard-mini ${netProfit >= 0 ? 'pos' : 'neg'}`}>
            <h3 className="pj-net-mini-head">กำไรสุทธิ</h3>
            <p className="pj-net-mini-val">
              {netProfit >= 0 ? '+' : ''}{new Intl.NumberFormat("th-TH").format(netProfit)} ฿
            </p>
          </div>
        </div>

        {/* Bill Section (สำหรับส่งให้ลูกค้า/แคป/พิมพ์) */}
        <div className="pj-bill print-area" style={{ marginTop: 16 }}>
          <div className="pj-bill-head">
            <div>
              <h2 className="pj-bill-title">สรุปเก็บเงิน</h2>
              {/* ซ่อนบรรทัดโหมดตามคำขอ (ไม่แสดง) */}
            </div>
            <p className="pj-bill-total">
              รวมทั้งหมด: <span className="pj-bill-total-value">
                {new Intl.NumberFormat("th-TH").format(totalCollected)} ฿
              </span>
            </p>
          </div>

          {/* ปุ่มที่ย้ายมาไว้ในสรุปเก็บเงิน */}
          <div className="pj-bill-actions">
            <button className="pj-button pj-button-sm" onClick={copySummaryText}>คัดลอกข้อความ</button>
            <button className="pj-button pj-button-sm" onClick={copyCSV}>คัดลอก CSV</button>
            <button className="pj-button pj-button-sm pj-button-outline" onClick={() => window.print()}>
              พิมพ์ / PDF
            </button>
          </div>

          <table className="pj-bill-table">
            <thead>
              <tr>
                <th style={{ width: '56px' }}>ลำดับ</th>
                <th>ชื่อ</th>
                {method === "game" && <th style={{ width: '90px' }}>เกม</th>}
                {/* ซ่อนคอลัมน์กำไรเพิ่มในสรุปเก็บเงิน */}
                <th style={{ width: '160px' }}>ยอดเก็บ (฿)</th>
              </tr>
            </thead>
            <tbody>
              {computedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={method === "game" ? 4 : 3} className="pj-bill-empty">
                    ยังไม่มีรายชื่อผู้เล่น
                  </td>
                </tr>
              ) : (
                computedPlayers.map((p, i) => (
                  <tr key={i}>
                    <td className="pj-bill-center">{i + 1}</td>
                    <td>{p.name || <span className="pj-mute">ไม่ระบุ</span>}</td>
                    {method === "game" && <td className="pj-bill-center">{Number(p.unit || 0)}</td>}
                    <td className="pj-bill-right pj-strong">
                      {new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(Number(p.amount) || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {computedPlayers.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={method === "game" ? 3 : 2} className="pj-bill-right pj-strong">
                    รวมทั้งหมด
                  </td>
                  <td className="pj-bill-right pj-strong">
                    {new Intl.NumberFormat("th-TH").format(totalCollected)} ฿
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
