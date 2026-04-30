"use client";

import { useActionState, useMemo, useState } from "react";
import { Minus, Plus, Trash2, Search, X } from "lucide-react";

import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialAdminFormState, type AdminFormState } from "@/actions/admin-state";
import { formatCurrencyFromCents } from "@/lib/utils";

type ProductOption = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  sku: string | null;
};

type SaleLine = {
  productId: string | null;
  name: string;
  priceCents: number;
  quantity: number;
};

type NewSaleFormProps = {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  products: ProductOption[];
};

export function NewSaleForm({ action, products }: NewSaleFormProps) {
  const [state, formAction] = useActionState(action, initialAdminFormState);
  const [items, setItems] = useState<SaleLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // States para manual item
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualQuantity, setManualQuantity] = useState("1");

  // States para pagos
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "MIXED">("CASH");
  const [paidCashInput, setPaidCashInput] = useState("");
  const [paidTransferInput, setPaidTransferInput] = useState("");
  const [amountReceivedInput, setAmountReceivedInput] = useState("");

  const productMap = useMemo(() => {
    const map = new Map<string, ProductOption>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const term = productSearch.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term));
  }, [products, productSearch]);

  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  function addProduct() {
    if (!selectedProductId) return;
    const product = productMap.get(selectedProductId);
    if (!product) return;

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          quantity: 1,
        },
      ];
    });
    setSelectedProductId("");
    setProductSearch("");
    setIsProductDropdownOpen(false);
  }

  function addManualProduct() {
    if (!manualName.trim() || !manualPrice) return;
    const priceCents = Math.max(0, Math.round(Number(manualPrice) * 100));
    const qty = Math.max(1, Number(manualQuantity) || 1);

    setItems((prev) => [
      ...prev,
      {
        productId: null,
        name: manualName.trim(),
        priceCents,
        quantity: qty,
      },
    ]);
    setManualName("");
    setManualPrice("");
    setManualQuantity("1");
  }

  function updateQuantity(index: number, delta: number) {
    setItems((prev) =>
      prev
        .map((item, i) => (i === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  function updatePrice(index: number, value: string) {
    const cents = Math.max(0, Math.round(Number(value || 0) * 100));
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, priceCents: cents } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  // Cálculos de montos derivados
  const receivedRaw = Math.max(0, Math.round(Number(amountReceivedInput || 0) * 100));
  const changeCents = paymentMethod === "CASH" && receivedRaw >= total ? receivedRaw - total : 0;
  
  const cashPaidCents = paymentMethod === "CASH" ? total : paymentMethod === "MIXED" ? Math.max(0, Math.round(Number(paidCashInput || 0) * 100)) : 0;
  const transferPaidCents = paymentMethod === "TRANSFER" ? total : paymentMethod === "MIXED" ? Math.max(0, Math.round(Number(paidTransferInput || 0) * 100)) : 0;
  const mixedChangeCents = paymentMethod === "MIXED" && receivedRaw > cashPaidCents ? receivedRaw - cashPaidCents : 0;
  const finalChangeToGive = paymentMethod === "CASH" ? changeCents : mixedChangeCents;

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Hidden serialized items and payments */}
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />
      <input type="hidden" name="paidWithCash" value={cashPaidCents} />
      <input type="hidden" name="paidWithTransfer" value={transferPaidCents} />
      <input type="hidden" name="amountReceived" value={receivedRaw} />

      <div className="space-y-6 lg:col-span-2">
        {/* Producto picker */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-slate-800">
            Productos del catálogo
          </h3>

          <div className="flex flex-col gap-2 sm:flex-row relative">
            <div className="relative flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  className="pl-9 pr-8 bg-slate-50 border-slate-200"
                  placeholder="Buscar por nombre o variante..."
                  value={productSearch}
                  onFocus={() => setIsProductDropdownOpen(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setIsProductDropdownOpen(true);
                  }}
                />
                {(productSearch || selectedProductId) && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      setProductSearch("");
                      setSelectedProductId("");
                      setIsProductDropdownOpen(false);
                    }}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {isProductDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProductDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 z-50 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-slate-500 text-center">No se encontraron productos.</p>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className={`w-full flex flex-col justify-start rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedProductId === product.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                          onClick={() => {
                            setSelectedProductId(product.id);
                            setProductSearch(product.name);
                            setIsProductDropdownOpen(false);
                          }}
                        >
                          <div className="flex justify-between w-full">
                            <span>{product.name}</span>
                            <span className="font-semibold">{formatCurrencyFromCents(product.priceCents)}</span>
                          </div>
                          <span className="text-xs text-slate-400 mt-0.5">Stock disponible: {product.stock} {product.sku && `| SKU: ${product.sku}`}</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedProductId}
              onClick={addProduct}
              type="button"
            >
              <Plus className="size-4" />
              Agregar
            </button>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-700">Producto manual (fuera de catálogo)</h4>
            <div className="flex flex-col gap-2 sm:flex-row items-end">
              <label className="flex-1 space-y-1">
                <span className="text-xs text-slate-500">Nombre</span>
                <Input
                  placeholder="Ej. Accesorio custom"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </label>
              <label className="w-24 space-y-1 shrink-0">
                <span className="text-xs text-slate-500">Precio ($)</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                />
              </label>
              <label className="w-20 space-y-1 shrink-0">
                <span className="text-xs text-slate-500">Cant.</span>
                <Input
                  type="number"
                  min="1"
                  value={manualQuantity}
                  onChange={(e) => setManualQuantity(e.target.value)}
                />
              </label>
              <button
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                disabled={!manualName || !manualPrice}
                onClick={addManualProduct}
                type="button"
              >
                <Plus className="size-4" />
                Añadir
              </button>
            </div>
          </div>

          <h3 className="mt-6 mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Detalle de la venta
          </h3>

          {items.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-400">
              Agrega productos a la venta.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {items.map((item, index) => (
                <li key={`${item.productId ?? "manual"}-${index}`} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <label className="text-[11px] uppercase tracking-wider text-slate-400">Precio</label>
                      <input
                        className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        min={0}
                        onChange={(e) => updatePrice(index, e.target.value)}
                        step="0.01"
                        type="number"
                        value={(item.priceCents / 100).toString()}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white">
                    <button
                      aria-label="Restar"
                      className="flex size-8 items-center justify-center text-slate-500 hover:text-slate-800"
                      onClick={() => updateQuantity(index, -1)}
                      type="button"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                    <button
                      aria-label="Sumar"
                      className="flex size-8 items-center justify-center text-slate-500 hover:text-slate-800"
                      onClick={() => updateQuantity(index, 1)}
                      type="button"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <p className="w-24 text-right text-sm font-bold text-slate-800">
                    {formatCurrencyFromCents(item.priceCents * item.quantity)}
                  </p>

                  <button
                    aria-label="Quitar"
                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    onClick={() => removeItem(index)}
                    type="button"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Métodos de Pago */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-slate-800">
            Método de Pago
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              className={`rounded-xl border p-3 font-medium transition text-sm ${paymentMethod === "CASH" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              onClick={() => setPaymentMethod("CASH")}
              type="button"
            >
              Efectivo
            </button>
            <button
              className={`rounded-xl border p-3 font-medium transition text-sm ${paymentMethod === "TRANSFER" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              onClick={() => setPaymentMethod("TRANSFER")}
              type="button"
            >
              Transferencia
            </button>
            <button
              className={`rounded-xl border p-3 font-medium transition text-sm ${paymentMethod === "MIXED" ? "border-purple-500 bg-purple-50 text-purple-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              onClick={() => setPaymentMethod("MIXED")}
              type="button"
            >
              Mixto
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {paymentMethod === "CASH" && (
              <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600">El cliente pagó con... ($)</span>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="Total entregado por cliente" 
                    value={amountReceivedInput}
                    onChange={(e) => setAmountReceivedInput(e.target.value)} 
                  />
                </label>
                {finalChangeToGive > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block mb-1">Vuelto a entregar</span>
                    <span className="font-bold text-lg text-emerald-600">{formatCurrencyFromCents(finalChangeToGive)}</span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "TRANSFER" && (
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 flex items-center justify-between">
                <span>Total a recibir por transferencia:</span>
                <span className="font-bold text-lg">{formatCurrencyFromCents(total)}</span>
              </div>
            )}

            {paymentMethod === "MIXED" && (
              <div className="bg-purple-50/50 rounded-xl p-4 space-y-4 border border-purple-100">
                <div className="flex gap-4">
                  <label className="flex-1 space-y-1">
                    <span className="text-xs font-semibold text-slate-600">Monto en Efectivo ($)</span>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="Efvo. a cobrar" 
                      value={paidCashInput}
                      onChange={(e) => setPaidCashInput(e.target.value)} 
                    />
                  </label>
                  <label className="flex-1 space-y-1">
                    <span className="text-xs font-semibold text-slate-600">Monto en Transferencia ($)</span>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="Transf. a recibir" 
                      value={paidTransferInput}
                      onChange={(e) => setPaidTransferInput(e.target.value)} 
                    />
                  </label>
                </div>

                <div className="border-t border-purple-200/60 pt-3">
                  <label className="space-y-1 block max-w-xs">
                    <span className="text-xs font-semibold text-slate-600">El cliente entregó en Efectivo... ($)</span>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="Total efectivo entregado" 
                      value={amountReceivedInput}
                      onChange={(e) => setAmountReceivedInput(e.target.value)} 
                    />
                  </label>
                </div>

                {finalChangeToGive > 0 && (
                  <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-800 tracking-wide">Vuelto parcial a entregar (Efectivo)</span>
                    <span className="font-bold text-lg text-emerald-600">{formatCurrencyFromCents(finalChangeToGive)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cliente */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-slate-800">
            Cliente (opcional)
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Nombre</span>
              <Input maxLength={120} name="customerName" placeholder="Mostrador" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Teléfono</span>
              <Input maxLength={20} name="customerPhone" placeholder="+54 11 ..." />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Notas</span>
              <Textarea maxLength={500} name="notes" placeholder="Observaciones internas" rows={2} />
            </label>
          </div>
        </div>
      </div>

      {/* Resumen + acciones */}
      <aside className="lg:sticky lg:top-6 lg:h-fit">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-800">Resumen</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Items</span>
              <span className="font-semibold text-slate-800">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-slate-500">Total</span>
              <span className="font-[family-name:var(--font-display)] text-xl font-bold text-emerald-600">
                {formatCurrencyFromCents(total)}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Entrega</span>
              <Select defaultValue="pickup" name="deliveryMethod">
                <option value="pickup">Retira en local</option>
                <option value="delivery">Delivery</option>
                <option value="shipping">Envío</option>
                <option value="other">Otro</option>
              </Select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Estado</span>
              <Select defaultValue="COMPLETED" name="status">
                <option value="COMPLETED">Completada</option>
                <option value="PENDING">Pendiente</option>
                <option value="CANCELLED">Cancelada</option>
              </Select>
            </label>
          </div>

          <FormSubmitButton
            className="mt-5 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={items.length === 0}
            pendingLabel="Registrando..."
          >
            Registrar venta
          </FormSubmitButton>

          {state.status === "error" && state.message ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              {state.message}
            </p>
          ) : null}
        </div>
      </aside>
    </form>
  );
}
