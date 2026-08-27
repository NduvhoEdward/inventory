'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, X, Pencil, Trash2, MapPin, Package, ExternalLink, AlertTriangle } from 'lucide-react';

const ACCENT = '#C8823C';
const BG = '#14171A';
const SURFACE = '#1C2024';
const SURFACE_2 = '#22262B';
const BORDER = '#2C3238';
const TEXT = '#E9EAE6';
const TEXT_DIM = '#8B948E';
const WARN = '#D9A441';
const DANGER = '#C05746';

const CATEGORIES = [
  { id: 'leds', label: 'LEDs' },
  { id: 'resistors', label: 'Resistors' },
  { id: 'capacitors', label: 'Capacitors' },
  { id: 'transistors', label: 'Transistors & MOSFETs' },
  { id: 'ics', label: 'ICs' },
  { id: 'devboards', label: 'Dev boards' },
  { id: 'connectors', label: 'Connectors' },
  { id: 'sensors', label: 'Sensors & modules' },
  { id: 'inductors', label: 'Inductors & coils' },
  { id: 'other', label: 'Other' },
];

function CategoryGlyph({ category, size = 20, color = TEXT_DIM }) {
  const s = { width: size, height: size, display: 'block' };
  const common = { fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (category) {
    case 'leds':
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <path d="M8 3 L8 15 L14 9 Z" />
          <line x1="8" y1="3" x2="8" y2="15" />
          <line x1="17" y1="6" x2="20" y2="3" />
          <line x1="17" y1="9" x2="20.5" y2="9" />
        </svg>
      );
    case 'resistors':
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <path d="M2 12 H6 L8 7 L11 17 L14 7 L17 17 L19 12 H22" />
        </svg>
      );
    case 'capacitors':
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <line x1="2" y1="12" x2="10" y2="12" />
          <line x1="10" y1="5" x2="10" y2="19" />
          <line x1="14" y1="5" x2="14" y2="19" />
          <line x1="14" y1="12" x2="22" y2="12" />
        </svg>
      );
    case 'transistors':
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="9" y1="7" x2="9" y2="17" />
          <line x1="9" y1="10" x2="16" y2="6" />
          <line x1="9" y1="14" x2="16" y2="18" />
          <path d="M13 15.5 L16 18 L15.3 14.8" />
        </svg>
      );
    case 'ics':
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <rect x="6" y="6" width="12" height="12" rx="1" />
          <line x1="9" y1="2" x2="9" y2="6" />
          <line x1="15" y1="2" x2="15" y2="6" />
          <line x1="9" y1="18" x2="9" y2="22" />
          <line x1="15" y1="18" x2="15" y2="22" />
          <line x1="2" y1="9" x2="6" y2="9" />
          <line x1="2" y1="15" x2="6" y2="15" />
          <line x1="18" y1="9" x2="22" y2="9" />
          <line x1="18" y1="15" x2="22" y2="15" />
        </svg>
      );
    case 'devboards':
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <rect x="3" y="4" width="18" height="16" rx="1" />
          <circle cx="7" cy="8" r="0.8" fill={color} stroke="none" />
          <circle cx="10" cy="8" r="0.8" fill={color} stroke="none" />
          <circle cx="13" cy="8" r="0.8" fill={color} stroke="none" />
          <circle cx="16" cy="8" r="0.8" fill={color} stroke="none" />
          <rect x="6" y="12" width="6" height="6" />
        </svg>
      );
    case 'connectors':
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <rect x="3" y="8" width="10" height="8" rx="1" />
          <line x1="13" y1="10" x2="20" y2="10" />
          <line x1="13" y1="12" x2="20" y2="12" />
          <line x1="13" y1="14" x2="20" y2="14" />
        </svg>
      );
    case 'sensors':
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7 12 Q9 7 12 12 T17 12" />
        </svg>
      );
    case 'inductors':
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <path d="M2 12 H5 M5 12 a2.5 2.5 0 0 1 5 0 a2.5 2.5 0 0 1 5 0 a2.5 2.5 0 0 1 5 0 M19 12 H22" />
        </svg>
      );
    default:
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="16.5" r="0.6" fill={color} stroke="none" />
          <path d="M9.5 9.5 a2.5 2.5 0 1 1 3.6 2.3 c-1 0.5 -1.1 1 -1.1 2" />
        </svg>
      );
  }
}

const SEED = [
  { id: 's1', name: 'Arduino Uno R3', category: 'devboards', quantity: 2, location: 'Shelf A, box 1', pkg: '', supplier: '', partNumber: '', datasheetUrl: '', cost: '', lowStock: 1, specs: [{ key: 'MCU', value: 'ATmega328P' }, { key: 'Logic', value: '5V' }] },
  { id: 's2', name: 'ESP32 DevKit v1', category: 'devboards', quantity: 3, location: 'Shelf A, box 1', pkg: '', supplier: '', partNumber: '', datasheetUrl: '', cost: '', lowStock: 1, specs: [{ key: 'WiFi/BT', value: 'Yes' }, { key: 'Logic', value: '3.3V' }] },
  { id: 's3', name: 'LED, 5mm red diffused', category: 'leds', quantity: 40, location: 'Drawer 3', pkg: 'THT', supplier: '', partNumber: '', datasheetUrl: '', cost: '', lowStock: 10, specs: [{ key: 'Vf', value: '2.0V' }, { key: 'If', value: '20mA' }] },
  { id: 's4', name: 'Resistor 220\u03a9 1/4W', category: 'resistors', quantity: 85, location: 'Drawer 1', pkg: 'THT', supplier: '', partNumber: '', datasheetUrl: '', cost: '', lowStock: 20, specs: [{ key: 'Tolerance', value: '5%' }] },
  { id: 's5', name: '2N2222 NPN transistor', category: 'transistors', quantity: 6, location: 'Drawer 5', pkg: 'TO-92', supplier: '', partNumber: '2N2222', datasheetUrl: '', cost: '', lowStock: 5, specs: [{ key: 'Ic max', value: '600mA' }] },
  { id: 's6', name: 'Ceramic capacitor 100nF', category: 'capacitors', quantity: 50, location: 'Drawer 2', pkg: 'THT', supplier: '', partNumber: '', datasheetUrl: '', cost: '', lowStock: 15, specs: [{ key: 'Voltage', value: '50V' }] },
];

const uid = () => Math.random().toString(36).slice(2, 10);

function emptyForm() {
  return { id: null, name: '', category: 'other', quantity: '1', location: '', pkg: '', supplier: '', partNumber: '', datasheetUrl: '', cost: '', lowStock: '5', specs: [{ key: '', value: '' }] };
}

export default function Inventory() {
  const [parts, setParts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saveError, setSaveError] = useState('');
  const isEditing = form.id !== null;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/parts');
        const data = await res.json();
        if (data.parts) {
          setParts(data.parts);
        } else {
          setParts(SEED);
          await fetch('/api/parts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parts: SEED }) });
        }
      } catch (e) {
        setParts(SEED);
        setSaveError('Could not reach the database — showing sample data only.');
      }
      setLoaded(true);
    })();
  }, []);

  async function persist(next) {
    setParts(next);
    try {
      const res = await fetch('/api/parts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parts: next }) });
      if (!res.ok) setSaveError('Could not save — changes may not persist.');
      else setSaveError('');
    } catch (e) {
      setSaveError('Could not save — changes may not persist.');
    }
  }

  const counts = useMemo(() => {
    const c = {};
    for (const p of parts) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, [parts]);

  const filtered = useMemo(() => {
    let list = parts;
    if (activeCat !== 'all') list = list.filter((p) => p.category === activeCat);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const hay = [p.name, p.location, p.pkg, p.supplier, p.partNumber, ...(p.specs || []).flatMap((s) => [s.key, s.value])]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [parts, activeCat, query]);

  function openAdd() {
    setForm(emptyForm());
    setShowForm(true);
  }
  function openEdit(p) {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      quantity: String(p.quantity),
      location: p.location || '',
      pkg: p.pkg || '',
      supplier: p.supplier || '',
      partNumber: p.partNumber || '',
      datasheetUrl: p.datasheetUrl || '',
      cost: p.cost || '',
      lowStock: String(p.lowStock ?? 5),
      specs: p.specs && p.specs.length ? p.specs.map((s) => ({ ...s })) : [{ key: '', value: '' }],
    });
    setShowForm(true);
  }

  function updateSpec(idx, field, value) {
    setForm((f) => {
      const specs = f.specs.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
      return { ...f, specs };
    });
  }
  function addSpecRow() {
    setForm((f) => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }));
  }
  function removeSpecRow(idx) {
    setForm((f) => ({ ...f, specs: f.specs.filter((_, i) => i !== idx) }));
  }

  function submitForm(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const cleanSpecs = form.specs.filter((s) => s.key.trim() || s.value.trim());
    const qty = Math.max(0, parseInt(form.quantity, 10) || 0);
    const low = Math.max(0, parseInt(form.lowStock, 10) || 0);
    if (isEditing) {
      const next = parts.map((p) =>
        p.id === form.id
          ? { ...p, name: form.name.trim(), category: form.category, quantity: qty, location: form.location, pkg: form.pkg, supplier: form.supplier, partNumber: form.partNumber, datasheetUrl: form.datasheetUrl, cost: form.cost, lowStock: low, specs: cleanSpecs }
          : p
      );
      persist(next);
    } else {
      const newPart = { id: uid(), name: form.name.trim(), category: form.category, quantity: qty, location: form.location, pkg: form.pkg, supplier: form.supplier, partNumber: form.partNumber, datasheetUrl: form.datasheetUrl, cost: form.cost, lowStock: low, specs: cleanSpecs };
      persist([...parts, newPart]);
    }
    setShowForm(false);
  }

  function adjustQty(id, delta) {
    const next = parts.map((p) => (p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p));
    persist(next);
  }

  function doDelete(id) {
    persist(parts.filter((p) => p.id !== id));
    setConfirmDelete(null);
  }

  const totalParts = parts.length;
  const lowStockCount = parts.filter((p) => p.quantity <= (p.lowStock ?? 5)).length;

  if (!loaded) {
    return (
      <div style={{ background: BG, color: TEXT_DIM, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'IBM Plex Sans, ui-sans-serif, system-ui, sans-serif' }}>
        Loading inventory\u2026
      </div>
    );
  }

  return (
    <div style={{ background: BG, color: TEXT, minHeight: '100vh', fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
        .parts-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .parts-scroll::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 4px; }
        input, select, textarea { font-family: inherit; }
        .grid-bg {
          background-image: linear-gradient(${BORDER} 1px, transparent 1px), linear-gradient(90deg, ${BORDER} 1px, transparent 1px);
          background-size: 28px 28px;
          background-position: -1px -1px;
        }
        button { cursor: pointer; }
        .mobile-cat-select { display: none; }
        @media (max-width: 720px) {
          .sidebar { display: none !important; }
          .mobile-cat-select { display: block !important; }
        }
      `}</style>

      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: 0.2 }}>Bench Inventory</h1>
          <span className="mono" style={{ fontSize: 12, color: TEXT_DIM }}>{totalParts} parts</span>
          {lowStockCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: WARN, background: 'rgba(217,164,65,0.12)', padding: '3px 8px', borderRadius: 4 }}>
              <AlertTriangle size={12} /> {lowStockCount} low
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 320px', maxWidth: 480 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} color={TEXT_DIM} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, location, specs\u2026"
              style={{ width: '100%', boxSizing: 'border-box', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '9px 10px 9px 32px', color: TEXT, fontSize: 13, outline: 'none' }}
            />
          </div>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, background: ACCENT, border: 'none', color: '#1A1200', fontWeight: 600, fontSize: 13, padding: '9px 14px', borderRadius: 6, whiteSpace: 'nowrap' }}>
            <Plus size={15} /> Add part
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div className="sidebar" style={{ width: 210, borderRight: `1px solid ${BORDER}`, padding: '16px 10px', flexShrink: 0, overflowY: 'auto' }}>
          <SidebarItem label="All parts" count={parts.length} active={activeCat === 'all'} onClick={() => setActiveCat('all')} />
          <div style={{ height: 8 }} />
          {CATEGORIES.map((c) => (
            <SidebarItem key={c.id} label={c.label} count={counts[c.id] || 0} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} glyph={<CategoryGlyph category={c.id} size={16} color={activeCat === c.id ? ACCENT : TEXT_DIM} />} />
          ))}
        </div>

        <div className="parts-scroll grid-bg" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <select
            className="mobile-cat-select"
            value={activeCat}
            onChange={(e) => setActiveCat(e.target.value)}
            style={{ ...inputStyle, marginBottom: 14, maxWidth: 260 }}
          >
            <option value="all">All parts ({parts.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label} ({counts[c.id] || 0})</option>
            ))}
          </select>
          {saveError && (
            <div style={{ marginBottom: 14, fontSize: 12, color: DANGER, background: 'rgba(192,87,70,0.1)', border: `1px solid ${DANGER}`, borderRadius: 6, padding: '8px 10px' }}>{saveError}</div>
          )}
          {filtered.length === 0 ? (
            <div style={{ color: TEXT_DIM, fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
              {parts.length === 0 ? 'No parts yet \u2014 add your first one.' : 'Nothing matches that search.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {filtered.map((p) => (
                <PartCard
                  key={p.id}
                  part={p}
                  onEdit={() => openEdit(p)}
                  onDelete={() => setConfirmDelete(p.id)}
                  onAdjust={(d) => adjustQty(p.id, d)}
                  confirming={confirmDelete === p.id}
                  onConfirmDelete={() => doDelete(p.id)}
                  onCancelDelete={() => setConfirmDelete(null)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <FormModal
          form={form}
          setForm={setForm}
          isEditing={isEditing}
          onClose={() => setShowForm(false)}
          onSubmit={submitForm}
          updateSpec={updateSpec}
          addSpecRow={addSpecRow}
          removeSpecRow={removeSpecRow}
        />
      )}
    </div>
  );
}

function SidebarItem({ label, count, active, onClick, glyph }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: active ? SURFACE_2 : 'transparent',
        border: 'none',
        borderRadius: 6,
        padding: '8px 10px',
        marginBottom: 2,
        color: active ? TEXT : TEXT_DIM,
        fontSize: 13,
        textAlign: 'left',
      }}
    >
      {glyph}
      <span style={{ flex: 1 }}>{label}</span>
      <span className="mono" style={{ fontSize: 11, color: TEXT_DIM }}>{count}</span>
    </button>
  );
}

function PartCard({ part, onEdit, onDelete, onAdjust, confirming, onConfirmDelete, onCancelDelete }) {
  const low = part.quantity <= (part.lowStock ?? 5);
  const zero = part.quantity === 0;
  return (
    <div style={{ background: SURFACE, border: `1px solid ${zero ? DANGER : low ? WARN : BORDER}`, borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 30, height: 30, borderRadius: 6, background: SURFACE_2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CategoryGlyph category={part.category} size={16} color={ACCENT} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, wordBreak: 'break-word' }}>{part.name}</div>
          {part.partNumber && <div className="mono" style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}>{part.partNumber}</div>}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onEdit} title="Edit" style={{ background: 'transparent', border: 'none', color: TEXT_DIM, padding: 4 }}><Pencil size={14} /></button>
          <button onClick={onDelete} title="Delete" style={{ background: 'transparent', border: 'none', color: TEXT_DIM, padding: 4 }}><Trash2 size={14} /></button>
        </div>
      </div>

      {confirming && (
        <div style={{ background: 'rgba(192,87,70,0.12)', border: `1px solid ${DANGER}`, borderRadius: 6, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
          <span>Delete this part?</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onConfirmDelete} style={{ background: DANGER, border: 'none', color: '#fff', borderRadius: 4, padding: '4px 8px', fontSize: 11 }}>Delete</button>
            <button onClick={onCancelDelete} style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 4, padding: '4px 8px', fontSize: 11 }}>Cancel</button>
          </div>
        </div>
      )}

      {(part.location || part.pkg) && (
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: TEXT_DIM, flexWrap: 'wrap' }}>
          {part.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {part.location}</span>}
          {part.pkg && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Package size={12} /> {part.pkg}</span>}
        </div>
      )}

      {part.specs && part.specs.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {part.specs.map((s, i) => (
            <span key={i} className="mono" style={{ fontSize: 11, background: SURFACE_2, color: TEXT_DIM, padding: '3px 7px', borderRadius: 4 }}>
              {s.key ? `${s.key}: ` : ''}{s.value}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => onAdjust(-1)} style={{ width: 24, height: 24, background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 5, color: TEXT, fontSize: 14, lineHeight: 1 }}>\u2212</button>
          <span className="mono" style={{ fontSize: 15, fontWeight: 500, minWidth: 28, textAlign: 'center', color: zero ? DANGER : low ? WARN : TEXT }}>{part.quantity}</span>
          <button onClick={() => onAdjust(1)} style={{ width: 24, height: 24, background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 5, color: TEXT, fontSize: 14, lineHeight: 1 }}>+</button>
        </div>
        {part.datasheetUrl && (
          <a href={part.datasheetUrl} target="_blank" rel="noreferrer" style={{ color: ACCENT, fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
            Datasheet <ExternalLink size={11} />
          </a>
        )}
      </div>
      {(zero || low) && (
        <div style={{ fontSize: 11, color: zero ? DANGER : WARN }}>{zero ? 'Out of stock' : 'Low stock'}</div>
      )}
    </div>
  );
}

function FormModal({ form, setForm, isEditing, onClose, onSubmit, updateSpec, addSpecRow, removeSpecRow }) {
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current && nameRef.current.focus(); }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, width: 480, maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', padding: 20, color: TEXT, fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{isEditing ? 'Edit part' : 'Add part'}</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: TEXT_DIM }}><X size={18} /></button>
        </div>

        <Field label="Name">
          <input ref={nameRef} required value={form.name} onChange={set('name')} placeholder="e.g. LED, 5mm red diffused" style={inputStyle} />
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Category" style={{ flex: 1 }}>
            <select value={form.category} onChange={set('category')} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Package" style={{ flex: 1 }}>
            <input value={form.pkg} onChange={set('pkg')} placeholder="THT, SMD, DIP-8\u2026" style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Quantity" style={{ flex: 1 }}>
            <input type="number" min="0" value={form.quantity} onChange={set('quantity')} style={inputStyle} />
          </Field>
          <Field label="Low-stock alert at" style={{ flex: 1 }}>
            <input type="number" min="0" value={form.lowStock} onChange={set('lowStock')} style={inputStyle} />
          </Field>
        </div>

        <Field label="Location">
          <input value={form.location} onChange={set('location')} placeholder="e.g. Drawer 3, bin B" style={inputStyle} />
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Part number" style={{ flex: 1 }}>
            <input value={form.partNumber} onChange={set('partNumber')} style={inputStyle} />
          </Field>
          <Field label="Supplier" style={{ flex: 1 }}>
            <input value={form.supplier} onChange={set('supplier')} style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Datasheet URL" style={{ flex: 1 }}>
            <input value={form.datasheetUrl} onChange={set('datasheetUrl')} placeholder="https://\u2026" style={inputStyle} />
          </Field>
          <Field label="Cost each" style={{ flex: 1 }}>
            <input value={form.cost} onChange={set('cost')} placeholder="e.g. R2.50" style={inputStyle} />
          </Field>
        </div>

        <div style={{ marginTop: 4, marginBottom: 6 }}>
          <label style={labelStyle}>Specs</label>
          {form.specs.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input value={s.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} placeholder="Forward voltage" style={{ ...inputStyle, flex: 1 }} />
              <input value={s.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} placeholder="2.1V" style={{ ...inputStyle, flex: 1 }} />
              <button type="button" onClick={() => removeSpecRow(i)} style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT_DIM, width: 32 }}>\u00d7</button>
            </div>
          ))}
          <button type="button" onClick={addSpecRow} style={{ background: 'transparent', border: `1px dashed ${BORDER}`, color: TEXT_DIM, borderRadius: 6, padding: '6px 10px', fontSize: 12, width: '100%' }}>+ Add spec</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: '9px 16px', fontSize: 13 }}>Cancel</button>
          <button type="submit" style={{ background: ACCENT, border: 'none', color: '#1A1200', fontWeight: 600, borderRadius: 6, padding: '9px 16px', fontSize: 13 }}>{isEditing ? 'Save changes' : 'Add part'}</button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#22262B', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 10px', color: TEXT, fontSize: 13, outline: 'none' };
const labelStyle = { display: 'block', fontSize: 12, color: TEXT_DIM, marginBottom: 6 };

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
