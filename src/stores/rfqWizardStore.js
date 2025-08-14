import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

// Zod schemas for steps (can be expanded)
export const rfqItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1),
  qty: z.number().positive(),
  uom: z.string().min(1),
  targetPrice: z.number().nonnegative().optional(),
  // Optional AI-enriched fields
  brand: z.string().optional(),
  model: z.string().optional(),
  articleNumber: z.string().optional(),
  productType: z.string().optional(),
  meta: z.object({
    aiConfidence: z.number().min(0).max(1).optional(),
    attributes: z.record(z.any()).optional()
  }).optional()
});

export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email().optional(),
});

export const termsSchema = z.object({
  currency: z.string().min(1),
  dueDate: z.string().optional(),
  incoterm: z.string().optional(),
});

const initialState = {
  step: 0,
  items: [],
  suppliers: [],
  terms: { currency: 'EUR' },
  meta: {},
};

export const useRFQWizardStore = create(persist((set, get) => ({
  ...initialState,
  setStep: (s) => set({ step: s }),
  addItem: (item) => set({ items: [...get().items, rfqItemSchema.parse(item)] }),
  addItemsBulk: (arr) => set(() => {
    const incoming = Array.isArray(arr) ? arr : [];
    const parsed = incoming.map(i=> { try { return rfqItemSchema.parse(i); } catch { return null; } }).filter(Boolean);
    return { items: [...get().items, ...parsed] };
  }),
  updateItem: (index, patch) => set({ items: get().items.map((it,i)=> i===index? { ...it, ...patch }: it) }),
  removeItem: (index) => set({ items: get().items.filter((_,i)=> i!==index) }),
  reorderItem: (from, to) => {
    const arr = [...get().items];
    const [moved] = arr.splice(from,1);
    arr.splice(to,0,moved);
    set({ items: arr });
  },
  addSupplier: (sup) => set({ suppliers: [...get().suppliers, supplierSchema.parse(sup)] }),
  addSuppliersBulk: (arr) => set(() => {
    const current = get().suppliers;
    const incoming = Array.isArray(arr) ? arr : [];
    const normalized = incoming
      .map(s => {
        try { return supplierSchema.parse(s); } catch { return null; }
      })
      .filter(Boolean);
    // de-duplicate by email or name (case-insensitive)
    const key = (s)=> (s.email?.toLowerCase() || '') + '|' + s.name.trim().toLowerCase();
    const seen = new Set(current.map(key));
    const merged = [...current];
    for (const s of normalized){
      const k = key(s);
      if (!seen.has(k)) { seen.add(k); merged.push(s); }
    }
    return { suppliers: merged };
  }),
  removeSupplier: (idx) => set({ suppliers: get().suppliers.filter((_,i)=> i!==idx) }),
  updateTerms: (patch) => set({ terms: termsSchema.partial().parse({ ...get().terms, ...patch }) }),
  reset: () => set(initialState),
  buildPayload: () => {
    // Validate all before send
    const items = get().items.map(i=> rfqItemSchema.parse(i));
    const suppliers = get().suppliers.map(s=> supplierSchema.parse(s));
    const terms = termsSchema.parse(get().terms);
    return { items, suppliers, terms, meta: get().meta };
  }
}), { name: 'rfq-wizard-v1' }));
