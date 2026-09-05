import { useState } from "react";
import { Package, IndianRupee, ShoppingBag, Tag, Pencil, Trash2 } from "lucide-react";
import DataTable from "@/admin/primitives/DataTable";
import FormField from "@/admin/primitives/FormField";
import StringArrayEditor from "@/admin/primitives/StringArrayEditor";
import ImageDropzone from "@/admin/primitives/ImageDropzone";
import StatCard from "@/admin/primitives/StatCard";
import RangePicker from "@/admin/primitives/RangePicker";
import EditorPanel from "@/admin/primitives/EditorPanel";
import ConfirmDialog from "@/admin/primitives/ConfirmDialog";

/**
 * KitchenSink — a working showcase of every reusable admin primitive.
 * Not linked from production nav; only visible in dev / directly.
 */
export default function KitchenSink() {
  const [text, setText] = useState("Clarity");
  const [num, setNum] = useState(1499);
  const [longText, setLongText] = useState("A composed morning ritual…");
  const [category, setCategory] = useState("duet");
  const [enquire, setEnquire] = useState(false);
  const [fragrances, setFragrances] = useState(["White Sage", "Aqua"]);
  const [ritualSteps, setRitualSteps] = useState([
    "Light White Sage first. Let it fill the room.",
    "Then light Aqua alongside.",
  ]);
  const [images, setImages] = useState([]);
  const [range, setRange] = useState({ preset: "month" });

  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rows = [
    { id: 1, name: "Clarity", category: "Duet", mrp: 1899, sp: 1499, stock: "Live" },
    { id: 2, name: "Timeless", category: "Duet", mrp: 1899, sp: 1499, stock: "Live" },
    { id: 3, name: "Odyssey", category: "Perfumer's Library", mrp: 2299, sp: 1799, stock: "Low" },
    { id: 4, name: "Pillar · 4-inch", category: "Pillar", mrp: 799, sp: 599, stock: "Live" },
  ];

  return (
    <div>
      <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Development</p>
      <h1 className="font-display text-5xl mt-2 leading-none">Kitchen sink</h1>
      <p className="text-[#5c3e2b]/80 mt-3 max-w-xl text-sm">Every reusable admin primitive, side-by-side. Nothing here saves.</p>

      {/* Stat cards */}
      <section className="mt-12">
        <h2 className="font-display text-2xl mb-4">Stat cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard kicker="Revenue" value="₹1,24,900" sub="vs last month" delta={12.3} icon={IndianRupee} />
          <StatCard kicker="Orders" value="86" delta={-2.1} sub="vs last month" icon={ShoppingBag} accent="#395439" />
          <StatCard kicker="Products live" value="35" icon={Package} accent="#5c3e2b" />
          <StatCard kicker="Active offers" value="2" icon={Tag} accent="#9a3b2e" />
        </div>
      </section>

      {/* Range picker */}
      <section className="mt-14">
        <h2 className="font-display text-2xl mb-4">Range picker</h2>
        <RangePicker value={range} onChange={setRange} />
        <p className="text-xs text-[#5c3e2b]/60 mt-3">Current: {JSON.stringify(range)}</p>
      </section>

      {/* Data table */}
      <section className="mt-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Data table</h2>
          <button onClick={() => setEditorOpen(true)} className="text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-5 py-2 hover:bg-[#395439]">
            Add product
          </button>
        </div>
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            { key: "name", header: "Product", render: (r) => <span className="font-medium">{r.name}</span> },
            { key: "category", header: "Category" },
            { key: "mrp", header: "MRP", render: (r) => <span className="text-[#5c3e2b]/60 line-through">₹{r.mrp}</span> },
            { key: "sp", header: "SP", render: (r) => <span className="font-medium">₹{r.sp}</span> },
            { key: "stock", header: "Status", render: (r) => (
              <span className={`text-xs rounded-full px-2 py-0.5 ${r.stock === "Live" ? "bg-[#395439]/10 text-[#395439]" : "bg-[#d4a574]/20 text-[#5c3e2b]"}`}>{r.stock}</span>
            )},
          ]}
          actions={(r) => (
            <div className="inline-flex gap-1">
              <button onClick={() => setEditorOpen(true)} aria-label={`Edit ${r.name}`} className="h-8 w-8 rounded-full hover:bg-[#2b2320]/8 flex items-center justify-center"><Pencil size={13} /></button>
              <button onClick={() => setConfirmOpen(true)} aria-label={`Delete ${r.name}`} className="h-8 w-8 rounded-full hover:bg-[#9a3b2e]/10 flex items-center justify-center text-[#9a3b2e]"><Trash2 size={13} /></button>
            </div>
          )}
        />
      </section>

      {/* Form fields side-by-side */}
      <section className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
        <h2 className="font-display text-2xl lg:col-span-2">Form fields</h2>
        <FormField label="Product name" value={text} onChange={setText} required />
        <FormField as="number" label="SP (₹)" value={num} onChange={setNum} min={0} />
        <FormField as="select" label="Category" value={category} onChange={setCategory}
          options={[{value:"duet",label:"Duet"},{value:"pillar",label:"Pillar"},{value:"aroma-stones",label:"Aroma Stones"}]} />
        <FormField as="toggle" label="Enquire only" checked={enquire} onChange={setEnquire} hint="If on, this product cannot be added to cart." />
        <div className="lg:col-span-2">
          <FormField as="textarea" label="Long description" value={longText} onChange={setLongText} rows={4} />
        </div>
      </section>

      {/* String arrays */}
      <section className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        <StringArrayEditor label="Fragrances" value={fragrances} onChange={setFragrances} placeholder="Type a fragrance, press Enter" />
        <StringArrayEditor as="list" label="Ritual steps" value={ritualSteps} onChange={setRitualSteps} />
      </section>

      {/* Image dropzone */}
      <section className="mt-14">
        <ImageDropzone label="Product images" value={images} onChange={setImages} />
      </section>

      {/* Editor panel + Confirm dialog */}
      <EditorPanel
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        kicker="Products"
        title="Add product"
        footer={
          <>
            <button onClick={() => setEditorOpen(false)} className="text-sm border border-[#2b2320]/25 rounded-full px-5 py-2 hover:border-[#2b2320]">Cancel</button>
            <button onClick={() => setEditorOpen(false)} className="text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-6 py-2 hover:bg-[#395439]">Save</button>
          </>
        }
      >
        <div className="space-y-5">
          <FormField label="Product name" value={text} onChange={setText} required />
          <FormField as="textarea" label="Description" value={longText} onChange={setLongText} rows={4} />
          <FormField as="number" label="MRP" value={num} onChange={setNum} />
          <StringArrayEditor label="Fragrances" value={fragrances} onChange={setFragrances} />
          <ImageDropzone label="Images" value={images} onChange={setImages} />
        </div>
      </EditorPanel>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {}}
        title="Delete this product?"
        description="This will remove it from the store. You can always re-create it later."
      />
    </div>
  );
}
