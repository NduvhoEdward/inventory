"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Folder,
  Home,
  Wrench,
  Cpu,
  ArrowRight,
  Settings,
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  MapPin,
  Package,
  ExternalLink,
  AlertTriangle,
  Download,
} from "lucide-react";

import {
  collectionPath,
  descendantIds,
  validateInventory,
} from "../lib/workspace.mjs";

const ACCENT = "#C8823C";
const BG = "#14171A";
const SURFACE = "#1C2024";
const SURFACE_2 = "#22262B";
const BORDER = "#2C3238";
const TEXT = "#E9EAE6";
const TEXT_DIM = "#8B948E";
const WARN = "#D9A441";
const DANGER = "#C05746";

const CATEGORIES = [
  { id: "leds", label: "LEDs" },
  { id: "resistors", label: "Resistors" },
  { id: "capacitors", label: "Capacitors" },
  { id: "transistors", label: "Transistors & MOSFETs" },
  { id: "ics", label: "ICs" },
  { id: "devboards", label: "Dev boards" },
  { id: "connectors", label: "Connectors" },
  { id: "sensors", label: "Sensors & modules" },
  { id: "inductors", label: "Inductors & coils" },
  { id: "tools", label: "Tools" },
  { id: "equipment", label: "Equipment" },
  { id: "consumables", label: "Consumables" },
  { id: "spares", label: "Spare parts" },
  { id: "other", label: "Other" },
];

function CategoryGlyph({ category, size = 20, color = TEXT_DIM }) {
  const s = { width: size, height: size, display: "block" };
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (category) {
    case "leds":
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <path d="M8 3 L8 15 L14 9 Z" />
          <line x1="8" y1="3" x2="8" y2="15" />
          <line x1="17" y1="6" x2="20" y2="3" />
          <line x1="17" y1="9" x2="20.5" y2="9" />
        </svg>
      );
    case "resistors":
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <path d="M2 12 H6 L8 7 L11 17 L14 7 L17 17 L19 12 H22" />
        </svg>
      );
    case "capacitors":
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <line x1="2" y1="12" x2="10" y2="12" />
          <line x1="10" y1="5" x2="10" y2="19" />
          <line x1="14" y1="5" x2="14" y2="19" />
          <line x1="14" y1="12" x2="22" y2="12" />
        </svg>
      );
    case "transistors":
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="9" y1="7" x2="9" y2="17" />
          <line x1="9" y1="10" x2="16" y2="6" />
          <line x1="9" y1="14" x2="16" y2="18" />
          <path d="M13 15.5 L16 18 L15.3 14.8" />
        </svg>
      );
    case "ics":
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
    case "devboards":
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
    case "connectors":
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <rect x="3" y="8" width="10" height="8" rx="1" />
          <line x1="13" y1="10" x2="20" y2="10" />
          <line x1="13" y1="12" x2="20" y2="12" />
          <line x1="13" y1="14" x2="20" y2="14" />
        </svg>
      );
    case "sensors":
      return (
        <svg style={s} viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7 12 Q9 7 12 12 T17 12" />
        </svg>
      );
    case "inductors":
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

const uid = () => Math.random().toString(36).slice(2, 10);

function emptyForm() {
  return {
    id: null,
    name: "",
    category: "other",
    quantity: "1",
    location: "",
    pkg: "",
    supplier: "",
    partNumber: "",
    datasheetUrl: "",
    cost: "",
    lowStock: "0",
    specs: [{ key: "", value: "" }],
  };
}

export default function Inventory() {
  const [owner, setOwner] = useState(false),
    [unlockOpen, setUnlockOpen] = useState(false),
    [authBusy, setAuthBusy] = useState(false),
    [authError, setAuthError] = useState("");
  async function authenticate(e) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    const fields = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          password: fields.get("password"),
          remember: fields.get("remember") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      setUnlockOpen(false);
      await loadParts();
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthBusy(false);
    }
  }
  async function lock() {
    setAuthBusy(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      if (!response.ok) throw Error();
      setOwner(false);
      setData({ parts: [], collections: [], revision: 0 });
      setShowForm(false);
      setCollectionForm(null);
      setActive("home");
      setQuery("");
      window.location.reload();
    } catch {
      setSaveError("Could not lock. Please try again.");
      setAuthBusy(false);
    }
  }

  const [data, setData] = useState({ parts: [], collections: [], revision: 0 });
  const { parts, collections } = data;
  const [loaded, setLoaded] = useState(false),
    [loadError, setLoadError] = useState(""),
    [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false),
    [exporting, setExporting] = useState(false);
  const savingRef = useRef(false);
  const [active, setActive] = useState("home"),
    [preferred, setPreferred] = useState("home"),
    [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all"),
    [sortBy, setSortBy] = useState("name"),
    [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false),
    [form, setForm] = useState(emptyForm()),
    [confirmDelete, setConfirmDelete] = useState(null);
  const [collectionForm, setCollectionForm] = useState(null),
    [collectionError, setCollectionError] = useState("");
  const [deleteCollection, setDeleteCollection] = useState(false);
  const isEditing = form.id !== null;
  async function loadParts() {
    setLoadError("");
    try {
      const r = await fetch("/api/inventory", { cache: "no-store" });
      if (!r.ok) throw Error();
      const d = await r.json();
      validateInventory(d);
      setOwner(d.owner === true);
      setData(d);
      return d;
    } catch {
      setLoadError("Your inventory could not be loaded. Please try again.");
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    loadParts().then((d) => {
      try {
        const start = localStorage.getItem("inventory-start") || "home";
        setPreferred(start);
        if (d?.collections.some((c) => c.id === start)) setActive(start);
      } catch {}
    });
  }, []);
  async function persist(next) {
    if (!owner || savingRef.current || loadError) return false;
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    try {
      validateInventory(next);
      const r = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...next, revision: data.revision }),
      });
      const result = await r.json();
      if (!r.ok) throw Error(result.error);
      setData({ ...next, revision: result.revision, owner: true });
      return true;
    } catch (e) {
      setSaveError(e.message || "Could not save. Please try again.");
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }
  function navigate(id) {
    setActive(id);
    setQuery("");
    setStockFilter("all");
    setCategoryFilter("all");
    setConfirmDelete(null);
    setDeleteCollection(false);
  }
  function chooseStart(id) {
    try {
      localStorage.setItem("inventory-start", id);
      setPreferred(id);
    } catch {
      setSaveError("Your browser could not remember the starting page.");
    }
  }
  const current = collections.find((c) => c.id === active);
  const scopedIds = useMemo(
    () => descendantIds(collections, active),
    [collections, active],
  );
  const scoped =
    active === "home" || active === "all"
      ? parts
      : parts.filter((p) => scopedIds.has(p.collectionId));
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const needsAttention = (p) =>
    p.quantity <= (p.lowStock ?? 5) ||
    (p.maintenanceDue && p.maintenanceDue <= today);
  const low = parts.filter(needsAttention);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped
      .filter((p) => categoryFilter === "all" || p.category === categoryFilter)
      .filter(
        (p) =>
          !q ||
          [
            p.name,
            p.location,
            p.brand,
            p.model,
            p.serialNumber,
            p.notes,
            p.pkg,
            p.partNumber,
            p.supplier,
            collectionPath(collections, p.collectionId),
            ...(p.specs || []).flatMap((s) => [s.key, s.value]),
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
      )
      .filter(
        (p) =>
          stockFilter === "all" ||
          (stockFilter === "low" ? needsAttention(p) : p.quantity === 0),
      )
      .slice()
      .sort((a, b) =>
        sortBy === "quantity"
          ? a.quantity - b.quantity || a.name.localeCompare(b.name)
          : sortBy === "location"
            ? (a.location || "").localeCompare(b.location || "") ||
              a.name.localeCompare(b.name)
            : a.name.localeCompare(b.name),
      );
  }, [scoped, query, stockFilter, sortBy, collections, today, categoryFilter]);
  function openAdd() {
    if (!owner) return;
    setSaveError("");
    setForm({
      ...emptyForm(),
      category:
        current && descendantIds(collections, "garage").has(current.id)
          ? "tools"
          : "other",
      collectionId:
        current?.id ||
        collections.find((c) => c.id === "electronics")?.id ||
        collections[0]?.id ||
        "",
      lowStock: "0",
      notes: "",
      brand: "",
      model: "",
      serialNumber: "",
      condition: "",
      purchaseDate: "",
      warrantyUntil: "",
      maintenanceDue: "",
    });
    setShowForm(true);
  }
  function openEdit(p) {
    if (!owner) {
      navigate(p.collectionId);
      return;
    }
    setSaveError("");
    setForm({
      ...emptyForm(),
      ...p,
      quantity: String(p.quantity),
      lowStock: String(p.lowStock ?? 5),
      specs: p.specs?.length
        ? p.specs.map((s) => ({ ...s }))
        : [{ key: "", value: "" }],
    });
    setShowForm(true);
  }
  async function submitForm(e) {
    e.preventDefault();
    const item = {
      ...form,
      id: form.id || crypto.randomUUID(),
      name: form.name.trim(),
      quantity: Number(form.quantity),
      lowStock: Number(form.lowStock),
      specs: form.specs.filter((s) => s.key.trim() || s.value.trim()),
      createdAt: form.createdAt || new Date().toISOString(),
    };
    if (
      await persist({
        ...data,
        parts: isEditing
          ? parts.map((p) => (p.id === item.id ? item : p))
          : [...parts, item],
      })
    )
      setShowForm(false);
  }
  function updateSpec(i, k, v) {
    setForm((f) => ({
      ...f,
      specs: f.specs.map((s, j) => (i === j ? { ...s, [k]: v } : s)),
    }));
  }
  function addSpecRow() {
    setForm((f) => ({ ...f, specs: [...f.specs, { key: "", value: "" }] }));
  }
  function removeSpecRow(i) {
    setForm((f) => ({ ...f, specs: f.specs.filter((_, j) => i !== j) }));
  }
  function adjustQty(id, delta) {
    persist({
      ...data,
      parts: parts.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p,
      ),
    });
  }
  async function doDelete(id) {
    if (await persist({ ...data, parts: parts.filter((p) => p.id !== id) }))
      setConfirmDelete(null);
  }
  function editCollection(c = null) {
    setCollectionError("");
    setSaveError("");
    setCollectionForm(
      c ? { ...c } : { id: null, name: "", parentId: current?.id || null },
    );
  }
  async function submitCollection(e) {
    e.preventDefault();
    const c = {
      ...collectionForm,
      id: collectionForm.id || crypto.randomUUID(),
      name: collectionForm.name.trim(),
    };
    const next = {
      ...data,
      collections: collectionForm.id
        ? collections.map((x) => (x.id === c.id ? c : x))
        : [...collections, c],
    };
    try {
      validateInventory(next);
    } catch (e) {
      setCollectionError(e.message);
      return;
    }
    if (await persist(next)) {
      setCollectionForm(null);
      navigate(c.id);
    }
  }
  async function removeCollection() {
    if (scoped.length || collections.some((c) => c.parentId === active)) return;
    const parent = current.parentId;
    if (
      await persist({
        ...data,
        collections: collections.filter((c) => c.id !== active),
      })
    ) {
      if (preferred === active) chooseStart("home");
      navigate(parent || "home");
    }
  }
  async function downloadBackup(format) {
    setExporting(true);
    setSaveError("");
    try {
      const r = await fetch("/api/backup?format=" + format, {
        cache: "no-store",
      });
      if (!r.ok) throw Error();
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download =
        "inventory-" + new Date().toISOString().slice(0, 10) + "." + format;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setSaveError("Could not download your backup. Please try again.");
    } finally {
      setExporting(false);
    }
  }
  const ordered = collections
    .slice()
    .sort((a, b) =>
      collectionPath(collections, a.id).localeCompare(
        collectionPath(collections, b.id),
      ),
    );
  const children = collections.filter(
    (c) => c.parentId === (current?.id || null),
  );
  const home = active === "home" && !query;
  function collectionCard(c) {
    const ids = descendantIds(collections, c.id),
      items = parts.filter((p) => ids.has(p.collectionId));
    const Icon =
      c.id === "electronics" ? Cpu : c.id === "garage" ? Wrench : Folder;
    return (
      <button
        className="collection-card"
        key={c.id}
        onClick={() => navigate(c.id)}
      >
        <Icon size={25} />
        <span className="collection-card-title">{c.name}</span>
        <span className="muted">
          {items.length} item types ·{" "}
          {items.reduce((n, p) => n + p.quantity, 0)} on hand
        </span>
        <span className="collection-card-bottom">
          {items.filter(needsAttention).length
            ? `${items.filter(needsAttention).length} need attention`
            : "Everything in order"}
          <ArrowRight size={18} />
        </span>
      </button>
    );
  }
  function card(p) {
    return (
      <div key={p.id} className="item-wrap">
        <button className="item-path" onClick={() => navigate(p.collectionId)}>
          {collectionPath(collections, p.collectionId)}
        </button>
        <PartCard
          saving={saving || !owner}
          part={p}
          onEdit={() => openEdit(p)}
          onDelete={() => setConfirmDelete(p.id)}
          confirming={confirmDelete === p.id}
          onConfirmDelete={() => doDelete(p.id)}
          onCancelDelete={() => setConfirmDelete(null)}
          onAdjust={(d) => adjustQty(p.id, d)}
        />
      </div>
    );
  }
  if (!loaded)
    return <div className="loading-screen">Loading your inventory…</div>;
  return (
    <div className={owner ? "workspace" : "workspace is-locked"}>
      <header className="app-header workspace-header">
        <button className="brand-button" onClick={() => navigate("home")}>
          <Package size={24} />
          <span>
            My Inventory<small>Your things, in their place.</small>
          </span>
        </button>
        <div className="header-actions">
          <button
            className="secondary-button"
            disabled={authBusy}
            onClick={() => (owner ? lock() : setUnlockOpen(true))}
          >
            {owner ? "Lock" : "Unlock"}
          </button>
          <div className="search-box">
            <Search size={18} />
            <input
              aria-label="Search inventory"
              type="search"
              placeholder={
                current ? "Search this collection…" : "Search everything…"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            className="primary-button"
            disabled={!!loadError || saving || !collections.length || !owner}
            onClick={openAdd}
          >
            <Plus size={17} /> Add item
          </button>
        </div>
      </header>
      <div className="workspace-layout">
        <aside className="workspace-nav">
          <SidebarItem
            label="Overview"
            active={active === "home"}
            onClick={() => navigate("home")}
            glyph={<Home size={17} />}
          />
          <SidebarItem
            label="All items"
            count={parts.length}
            active={active === "all"}
            onClick={() => navigate("all")}
            glyph={<Package size={17} />}
          />
          <div className="nav-heading">COLLECTIONS</div>
          {ordered.map((c) => (
            <SidebarItem
              key={c.id}
              label={collectionPath(collections, c.id)}
              active={active === c.id}
              onClick={() => navigate(c.id)}
              glyph={<Folder size={16} />}
            />
          ))}
          <button
            className="text-button"
            disabled={saving || !!loadError || !owner}
            onClick={() => {
              setCollectionError("");
              setSaveError("");
              setCollectionForm({ id: null, name: "", parentId: null });
            }}
          >
            <Plus size={16} /> Add collection
          </button>
        </aside>
        <main className="workspace-main">
          <nav className="mobile-collection-nav">
            <label htmlFor="collection-nav">Browse</label>
            <select
              id="collection-nav"
              value={active}
              onChange={(e) => navigate(e.target.value)}
              style={inputStyle}
            >
              <option value="home">Overview</option>
              <option value="all">All items</option>
              {ordered.map((c) => (
                <option key={c.id} value={c.id}>
                  {collectionPath(collections, c.id)}
                </option>
              ))}
            </select>
          </nav>
          {(loadError || saveError) && (
            <div className="error-banner" role="alert">
              {loadError || saveError}
              <button className="secondary-button" onClick={loadParts}>
                Reload inventory
              </button>
            </div>
          )}
          <div className="workspace-heading">
            <div>
              <div className="eyebrow">
                {current ? "COLLECTION" : "YOUR INVENTORY"}
              </div>
              <h1>
                {home
                  ? "A place for everything."
                  : current
                    ? current.name
                    : query
                      ? "Search results"
                      : "All items"}
              </h1>
              <p className="muted">
                {home
                  ? "From the electronics bench to the garage. Pick a collection to get started."
                  : current
                    ? collectionPath(collections, current.id)
                    : "Tools, components and equipment across all your collections."}
              </p>
            </div>
            <div className="heading-actions">
              {current && (
                <>
                  <button
                    className="secondary-button"
                    disabled={saving || !owner}
                    onClick={() => editCollection(current)}
                  >
                    <Settings size={16} /> Edit collection
                  </button>
                  <button
                    className="secondary-button"
                    disabled={saving || !owner}
                    onClick={() => editCollection()}
                  >
                    <Plus size={16} /> Subcollection
                  </button>
                </>
              )}
              {!current && (
                <button
                  className="secondary-button"
                  disabled={saving || !!loadError || !owner}
                  onClick={() => {
                    setCollectionError("");
                    setSaveError("");
                    setCollectionForm({ id: null, name: "", parentId: null });
                  }}
                >
                  <Plus size={16} /> Add collection
                </button>
              )}
            </div>
          </div>
          {home && (
            <>
              <div className="overview-stats">
                <span>
                  <strong>{parts.length}</strong> item types
                </span>
                <span>
                  <strong>
                    {collections.filter((c) => !c.parentId).length}
                  </strong>{" "}
                  collections
                </span>
                <button
                  onClick={() => {
                    navigate("all");
                    setStockFilter("low");
                  }}
                >
                  <strong>{low.length}</strong> need attention
                </button>
              </div>
              <div className="collection-grid">
                {children.map(collectionCard)}
              </div>
              {!children.length && !loadError && (
                <p className="empty-state">
                  Create your first collection to start organising your
                  inventory.
                </p>
              )}
              <div className="home-lists">
                <section>
                  <h2>Recently added</h2>
                  {parts.length ? (
                    <div className="compact-list">
                      {parts
                        .slice()
                        .sort((a, b) =>
                          (b.createdAt || "").localeCompare(a.createdAt || ""),
                        )
                        .slice(0, 5)
                        .map((p) => (
                          <button key={p.id} onClick={() => openEdit(p)}>
                            <span>
                              {p.name}
                              <small>
                                {collectionPath(collections, p.collectionId)}
                              </small>
                            </span>
                            <span>
                              {p.quantity} on hand <ArrowRight size={14} />
                            </span>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <p className="empty-state">
                      Your new items will appear here. Add a component, tool or
                      piece of equipment to get started.
                    </p>
                  )}
                </section>
                <section>
                  <h2>Needs attention</h2>
                  {low.length ? (
                    <div className="compact-list">
                      {low.slice(0, 5).map((p) => (
                        <button key={p.id} onClick={() => openEdit(p)}>
                          <span>
                            {p.name}
                            <small>
                              {p.maintenanceDue && p.maintenanceDue <= today
                                ? "Maintenance due " + p.maintenanceDue
                                : p.quantity === 0
                                  ? "Out of stock"
                                  : "Low stock"}
                            </small>
                          </span>
                          <ArrowRight size={16} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">
                      No low stock or overdue maintenance.
                    </p>
                  )}
                </section>
              </div>
            </>
          )}
          {!home && (
            <>
              {!!children.length && current && (
                <div className="collection-grid subcollection-grid">
                  {children.map(collectionCard)}
                </div>
              )}
              <div className="inventory-toolbar">
                <p className="muted" role="status">
                  {filtered.length} item types ·{" "}
                  {filtered.reduce((n, p) => n + p.quantity, 0)} on hand
                  {current ? " · includes subcollections" : ""}
                </p>
                <div className="filter-controls">
                  <select
                    aria-label="Category filter"
                    style={inputStyle}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All categories</option>
                    {CATEGORIES.filter((c) =>
                      scoped.some((p) => p.category === c.id),
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Stock status"
                    style={inputStyle}
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                  >
                    <option value="all">All stock</option>
                    <option value="low">Needs attention</option>
                    <option value="out">Out of stock</option>
                  </select>
                  <select
                    aria-label="Sort items"
                    style={inputStyle}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Name A–Z</option>
                    <option value="quantity">Lowest quantity</option>
                    <option value="location">Storage location</option>
                  </select>
                </div>
              </div>
              <div
                className="parts-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill,minmax(min(100%,310px),1fr))",
                  gap: 16,
                }}
              >
                {!loadError && filtered.map(card)}
              </div>
              {!loadError && !filtered.length && (
                <div className="empty-state">
                  <h2>
                    {query || stockFilter !== "all" || categoryFilter !== "all"
                      ? "No matching items"
                      : "Nothing here yet"}
                  </h2>
                  <p>
                    {query || stockFilter !== "all" || categoryFilter !== "all"
                      ? "Try another search or stock filter."
                      : "Add an item here, or move an existing item using its edit form."}
                  </p>
                </div>
              )}
              {current && (
                <div className="collection-settings">
                  <button
                    className="text-button"
                    disabled={saving || !owner}
                    onClick={() => setDeleteCollection(!deleteCollection)}
                  >
                    Delete collection
                  </button>
                  {deleteCollection &&
                    (scoped.length || children.length ? (
                      <p className="muted">
                        Move items and subcollections elsewhere before deleting
                        this collection.
                      </p>
                    ) : (
                      <div>
                        <p>Delete “{current.name}”? This cannot be undone.</p>
                        <button
                          className="secondary-button"
                          disabled={saving || !owner}
                          onClick={removeCollection}
                        >
                          Confirm delete collection
                        </button>{" "}
                        <button
                          className="secondary-button"
                          onClick={() => setDeleteCollection(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
          <footer className="workspace-footer">
            <div className="backup-tools">
              <button
                className="secondary-button"
                disabled={!!loadError || saving || exporting || !owner}
                onClick={() => downloadBackup("json")}
              >
                <Download size={15} /> Download backup
              </button>
              <button
                className="secondary-button"
                disabled={!!loadError || saving || exporting || !owner}
                onClick={() => downloadBackup("csv")}
              >
                Export CSV
              </button>
              <span>
                {owner
                  ? "All collections and items are included."
                  : "Public view. Unlock to edit, view private items and download backups."}
              </span>
            </div>
            <label className="start-setting">
              Start this device on
              <select
                style={inputStyle}
                value={preferred}
                onChange={(e) => chooseStart(e.target.value)}
              >
                <option value="home">Overview</option>
                {ordered.map((c) => (
                  <option key={c.id} value={c.id}>
                    {collectionPath(collections, c.id)}
                  </option>
                ))}
              </select>
            </label>
          </footer>
        </main>
      </div>
      {unlockOpen && (
        <UnlockDialog
          busy={authBusy}
          error={authError}
          onSubmit={authenticate}
          onClose={() => {
            if (!authBusy) {
              setUnlockOpen(false);
              setAuthError("");
            }
          }}
        />
      )}
      <div className="save-status" role="status">
        {saving ? "Saving changes…" : exporting ? "Preparing download…" : ""}
      </div>
      {owner && showForm && (
        <FormModal
          saving={saving}
          saveError={saveError}
          form={form}
          setForm={setForm}
          collections={ordered}
          isEditing={isEditing}
          onClose={() => {
            if (!savingRef.current) setShowForm(false);
          }}
          onSubmit={submitForm}
          updateSpec={updateSpec}
          addSpecRow={addSpecRow}
          removeSpecRow={removeSpecRow}
        />
      )}
      {owner && collectionForm && (
        <CollectionModal
          form={collectionForm}
          setForm={setCollectionForm}
          collections={ordered}
          saving={saving}
          error={collectionError || saveError}
          onClose={() => {
            if (!savingRef.current) setCollectionForm(null);
          }}
          onSubmit={submitCollection}
        />
      )}
    </div>
  );
}

function CollectionModal({
  form,
  setForm,
  collections,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  const ref = useRef(null),
    closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current.querySelector("input").focus();
    function key(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key === "Tab") {
        const els = [
          ...ref.current.querySelectorAll(
            "input:not(:disabled),select:not(:disabled),button:not(:disabled)",
          ),
        ];
        if (!els.length) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey && document.activeElement === els[0]) {
          e.preventDefault();
          els.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
          e.preventDefault();
          els[0].focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  const excluded = form.id ? descendantIds(collections, form.id) : new Set();
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-title"
        className="part-form collection-form"
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-heading">
          <h2 id="collection-title">
            {form.id
              ? "Edit collection"
              : form.parentId
                ? "Add subcollection"
                : "Add collection"}
          </h2>
          <button
            className="text-button"
            type="button"
            disabled={saving}
            aria-label="Close collection form"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {error && (
          <p role="alert" className="error-banner">
            {error}
          </p>
        )}
        <fieldset disabled={saving}>
          <PrivacyField
            value={
              form.visibility || (form.id === "garage" ? "private" : "public")
            }
            onChange={(value) => setForm({ ...form, visibility: value })}
          />
          <Field label="Collection name">
            <input
              required
              maxLength={120}
              style={inputStyle}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Woodworking tools"
            />
          </Field>
          <Field label="Inside">
            <select
              style={inputStyle}
              value={form.parentId || ""}
              onChange={(e) =>
                setForm({ ...form, parentId: e.target.value || null })
              }
            >
              <option value="">Homepage — top-level collection</option>
              {collections
                .filter((c) => !excluded.has(c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {collectionPath(collections, c.id)}
                  </option>
                ))}
            </select>
          </Field>
          <p className="muted">
            Rename or move a collection at any time. Its items and
            subcollections stay with it.
          </p>
          <div className="dialog-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="primary-button" type="submit">
              {saving ? "Saving…" : "Save collection"}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

function SidebarItem({ label, count, active, onClick, glyph }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: active ? SURFACE_2 : "transparent",
        border: "none",
        borderRadius: 6,
        padding: "8px 10px",
        marginBottom: 2,
        color: active ? TEXT : TEXT_DIM,
        fontSize: 13,
        textAlign: "left",
      }}
    >
      {glyph}
      <span style={{ flex: 1 }}>{label}</span>
      <span className="mono" style={{ fontSize: 11, color: TEXT_DIM }}>
        {count}
      </span>
    </button>
  );
}

function PartCard({
  saving,
  part,
  onEdit,
  onDelete,
  onAdjust,
  confirming,
  onConfirmDelete,
  onCancelDelete,
}) {
  const low = part.quantity <= (part.lowStock ?? 5);
  const zero = part.quantity === 0;
  return (
    <article
      className="part-card"
      style={{
        background: SURFACE,
        border: `1px solid ${zero ? DANGER : low ? WARN : BORDER}`,
        borderRadius: 8,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: SURFACE_2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {["tools", "equipment", "consumables", "spares"].includes(
            part.category,
          ) ? (
            <Wrench size={16} color={ACCENT} />
          ) : (
            <CategoryGlyph category={part.category} size={16} color={ACCENT} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.3,
              wordBreak: "break-word",
            }}
          >
            {part.name}
          </div>
          {part.partNumber && (
            <div
              className="mono"
              style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}
            >
              {part.partNumber}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            disabled={saving}
            onClick={onEdit}
            aria-label={`Edit ${part.name}`}
            title="Edit"
            style={{
              background: "transparent",
              border: "none",
              color: TEXT_DIM,
              padding: 4,
            }}
          >
            <Pencil size={14} />
          </button>
          <button
            disabled={saving}
            onClick={onDelete}
            aria-label={`Delete ${part.name}`}
            title="Delete"
            style={{
              background: "transparent",
              border: "none",
              color: TEXT_DIM,
              padding: 4,
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {confirming && (
        <div
          style={{
            background: "rgba(192,87,70,0.12)",
            border: `1px solid ${DANGER}`,
            borderRadius: 6,
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
          }}
        >
          <span>Delete this item?</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={saving}
              onClick={onConfirmDelete}
              style={{
                background: DANGER,
                border: "none",
                color: "#fff",
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 11,
              }}
            >
              Delete
            </button>
            <button
              onClick={onCancelDelete}
              style={{
                background: "transparent",
                border: `1px solid ${BORDER}`,
                color: TEXT,
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 11,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {(part.location || part.pkg) && (
        <div
          style={{
            display: "flex",
            gap: 12,
            fontSize: 12,
            color: TEXT_DIM,
            flexWrap: "wrap",
          }}
        >
          {part.location && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={12} /> {part.location}
            </span>
          )}
          {part.pkg && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Package size={12} /> {part.pkg}
            </span>
          )}
        </div>
      )}

      {part.specs && part.specs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {part.specs.map((s, i) => (
            <span
              key={i}
              className="mono"
              style={{
                fontSize: 11,
                background: SURFACE_2,
                color: TEXT_DIM,
                padding: "3px 7px",
                borderRadius: 4,
              }}
            >
              {s.key ? `${s.key}: ` : ""}
              {s.value}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            disabled={saving || zero}
            aria-label={`Use one ${part.name}`}
            onClick={() => onAdjust(-1)}
            style={{
              width: 24,
              height: 24,
              background: SURFACE_2,
              border: `1px solid ${BORDER}`,
              borderRadius: 5,
              color: TEXT,
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            −
          </button>
          <span
            className="mono"
            style={{
              fontSize: 15,
              fontWeight: 500,
              minWidth: 28,
              textAlign: "center",
              color: zero ? DANGER : low ? WARN : TEXT,
            }}
          >
            {part.quantity}
          </span>
          <button
            disabled={saving}
            aria-label={`Add one ${part.name}`}
            onClick={() => onAdjust(1)}
            style={{
              width: 24,
              height: 24,
              background: SURFACE_2,
              border: `1px solid ${BORDER}`,
              borderRadius: 5,
              color: TEXT,
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            +
          </button>
        </div>
        {part.datasheetUrl && (
          <a
            href={part.datasheetUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: ACCENT,
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              gap: 3,
              textDecoration: "none",
            }}
          >
            Datasheet <ExternalLink size={11} />
          </a>
        )}
      </div>
      {part.brand && (
        <div className="muted">
          {part.brand} {part.model}
        </div>
      )}
      {part.maintenanceDue && (
        <div className="muted">Maintenance: {part.maintenanceDue}</div>
      )}
      {(zero || low) && (
        <div style={{ fontSize: 11, color: zero ? DANGER : WARN }}>
          {zero ? "Out of stock" : "Low stock"}
        </div>
      )}
    </article>
  );
}

function FormModal({
  collections,
  saving,
  saveError,
  form,
  setForm,
  isEditing,
  onClose,
  onSubmit,
  updateSpec,
  addSpecRow,
  removeSpecRow,
}) {
  const nameRef = useRef(null);
  const modalRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();
    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const controls = [
        ...modalRef.current.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]',
        ),
      ];
      if (!controls.length) {
        event.preventDefault();
        return;
      }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <form
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="part-form-title"
        className="part-form"
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          width: 480,
          maxWidth: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: 20,
          color: TEXT,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2
            id="part-form-title"
            style={{ margin: 0, fontSize: 16, fontWeight: 600 }}
          >
            {isEditing ? "Edit item" : "Add item"}
          </h2>
          <button
            disabled={saving}
            aria-label="Close item form"
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: TEXT_DIM,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {saveError && (
          <p role="alert" style={{ color: WARN }}>
            {saveError}
          </p>
        )}
        <fieldset
          disabled={saving}
          style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}
        >
          <PrivacyField
            value={form.visibility || "public"}
            onChange={(value) => setForm((f) => ({ ...f, visibility: value }))}
          />
          <Field label="Name">
            <input
              ref={nameRef}
              required
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Cordless drill or 220Ω resistor"
              style={inputStyle}
            />
          </Field>

          <Field label="Collection">
            <select
              required
              value={form.collectionId}
              onChange={set("collectionId")}
              style={inputStyle}
            >
              <option value="" disabled>
                Choose a collection
              </option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {collectionPath(collections, c.id)}
                </option>
              ))}
            </select>
          </Field>
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Category" style={{ flex: 1 }}>
              <select
                value={form.category}
                onChange={set("category")}
                style={inputStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Package / format" style={{ flex: 1 }}>
              <input
                value={form.pkg}
                onChange={set("pkg")}
                placeholder="THT, SMD, DIP-8…"
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Quantity" style={{ flex: 1 }}>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={set("quantity")}
                style={inputStyle}
              />
            </Field>
            <Field label="Low-stock alert at" style={{ flex: 1 }}>
              <input
                type="number"
                min="0"
                value={form.lowStock}
                onChange={set("lowStock")}
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Location">
            <input
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. Garage / Cabinet 2 / Shelf 1"
              style={inputStyle}
            />
          </Field>

          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Part number" style={{ flex: 1 }}>
              <input
                value={form.partNumber}
                onChange={set("partNumber")}
                style={inputStyle}
              />
            </Field>
            <Field label="Supplier" style={{ flex: 1 }}>
              <input
                value={form.supplier}
                onChange={set("supplier")}
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Manual / datasheet URL" style={{ flex: 1 }}>
              <input
                type="url"
                value={form.datasheetUrl}
                onChange={set("datasheetUrl")}
                placeholder="https://…"
                style={inputStyle}
              />
            </Field>
            <Field label="Cost each" style={{ flex: 1 }}>
              <input
                value={form.cost}
                onChange={set("cost")}
                placeholder="e.g. R2.50"
                style={inputStyle}
              />
            </Field>
          </div>

          <details
            className="item-details"
            open={
              !!(
                form.brand ||
                form.model ||
                form.serialNumber ||
                form.maintenanceDue
              )
            }
          >
            <summary>Tool & equipment details</summary>
            {[
              ["brand", "Brand"],
              ["model", "Model"],
              ["serialNumber", "Serial number"],
              ["condition", "Condition"],
              ["purchaseDate", "Purchase date"],
              ["warrantyUntil", "Warranty until"],
              ["maintenanceDue", "Next maintenance"],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  type={
                    [
                      "purchaseDate",
                      "warrantyUntil",
                      "maintenanceDue",
                    ].includes(key)
                      ? "date"
                      : "text"
                  }
                  style={inputStyle}
                  value={form[key] || ""}
                  onChange={set(key)}
                />
              </Field>
            ))}
          </details>
          <Field label="Notes">
            <textarea
              style={{ ...inputStyle, minHeight: 88 }}
              value={form.notes || ""}
              onChange={set("notes")}
              placeholder="Accessories, condition, reminders…"
            />
          </Field>
          <div style={{ marginTop: 4, marginBottom: 6 }}>
            <label style={labelStyle}>Specs</label>
            {form.specs.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input
                  aria-label={`Specification ${i + 1} name`}
                  value={s.key}
                  onChange={(e) => updateSpec(i, "key", e.target.value)}
                  placeholder="Forward voltage"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  aria-label={`Specification ${i + 1} value`}
                  value={s.value}
                  onChange={(e) => updateSpec(i, "value", e.target.value)}
                  placeholder="2.1V"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  aria-label={`Remove specification ${i + 1}`}
                  onClick={() => removeSpecRow(i)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 6,
                    color: TEXT_DIM,
                    width: 32,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecRow}
              style={{
                background: "transparent",
                border: `1px dashed ${BORDER}`,
                color: TEXT_DIM,
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 12,
                width: "100%",
              }}
            >
              + Add spec
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 18,
            }}
          >
            <button
              disabled={saving}
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: `1px solid ${BORDER}`,
                color: TEXT,
                borderRadius: 6,
                padding: "9px 16px",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: ACCENT,
                border: "none",
                color: "#1A1200",
                fontWeight: 600,
                borderRadius: 6,
                padding: "9px 16px",
                fontSize: 13,
              }}
            >
              {saving ? "Saving…" : isEditing ? "Save changes" : "Add item"}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#22262B",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  padding: "8px 10px",
  color: TEXT,
  fontSize: 13,
  outline: "none",
};
const labelStyle = {
  display: "block",
  fontSize: 12,
  color: TEXT_DIM,
  marginBottom: 6,
};

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <label style={{ ...labelStyle, marginBottom: 0 }}>
        {label}
        <span style={{ display: "block", marginTop: 6 }}>{children}</span>
      </label>
    </div>
  );
}

function PrivacyField({ value, onChange }) {
  return (
    <Field label="Visibility">
      <select
        style={inputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="public">
          Public unless inside a private collection
        </option>
        <option value="private">Private — unlock required</option>
      </select>
      <span className="muted">
        A private parent collection always keeps its contents private.
      </span>
    </Field>
  );
}
function UnlockDialog({ busy, error, onClose, onSubmit }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => previous?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      className="unlock-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form onSubmit={onSubmit}>
        <h2>Unlock your inventory</h2>
        <p className="muted">View private items and enable editing.</p>
        {error && (
          <p role="alert" className="error-banner">
            {error}
          </p>
        )}
        <fieldset disabled={busy} style={{ border: 0, padding: 0 }}>
          <Field label="Passphrase">
            <input
              autoFocus
              required
              type="password"
              name="password"
              autoComplete="current-password"
              maxLength={256}
              style={inputStyle}
            />
          </Field>
          <label>
            <input type="checkbox" name="remember" /> Stay signed in for 30 days
            on this device
          </label>
          <div className="dialog-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="primary-button" type="submit">
              {busy ? "Unlocking…" : "Unlock"}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
