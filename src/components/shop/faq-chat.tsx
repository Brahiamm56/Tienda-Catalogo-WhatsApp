"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ChevronDown, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── FAQ DATA ──────────────────────────────────────────────────────────────── */

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "envio",
    question: "¿Cuánto tarda el envío?",
    answer:
      "En Resistencia hacemos entrega el mismo día 🏍️. Para envíos nacionales el tiempo estimado es de 2 a 3 días hábiles. Te enviamos el número de seguimiento por WhatsApp en cuanto despachamos tu pedido. 🚚",
  },
  {
    id: "pago",
    question: "¿Métodos de pago?",
    answer:
      "Aceptamos transferencia bancaria y Mercado Pago 💳, efectivo en efectivo 💵 y tarjetas de crédito/débito. Coordinamos el pago directamente por WhatsApp de forma rápida y segura. ✅",
  },
  {
    id: "originales",
    question: "¿Son originales?",
    answer:
      "¡Sí, 100%! Todos nuestros perfumes son originales y certificados. Trabajamos directamente con distribuidores autorizados para garantizarte calidad y autenticidad en cada compra. ✅",
  },
  {
    id: "devolucion",
    question: "¿Puedo devolver?",
    answer:
      "Aceptamos devoluciones dentro de los 7 días posteriores a la entrega, siempre que el producto esté sin usar y en su empaque original. Contáctanos por WhatsApp para iniciar el proceso. 📦",
  },
  {
    id: "pedido",
    question: "¿Cómo hago un pedido?",
    answer:
      "Es muy sencillo: elige tu fragancia favorita, agrégala al carrito y al finalizar se abrirá WhatsApp con tu pedido listo. Nuestro equipo lo confirmará en minutos. 🛒",
  },
  {
    id: "mayoreo",
    question: "¿Precios por mayor?",
    answer:
      "¡Sí! Ofrecemos descuentos especiales para compras al por mayor. Escríbenos directamente por WhatsApp indicando las cantidades y te enviamos cotización personalizada. 📊",
  },
];

/* ─── MESSAGE TYPES ─────────────────────────────────────────────────────────── */

interface Message {
  id: string;
  type: "bot" | "user";
  text: string;
  timestamp: Date;
}

/* ─── COMPONENT ─────────────────────────────────────────────────────────────── */

export function FaqChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "¡Hola! 👋 Soy tu asistente virtual. Selecciona una pregunta frecuente o escríbenos directamente por WhatsApp para ayudarte.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* Show notification dot after 3 s if user hasn't opened yet */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setHasNew(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  /* Focus input when chat opens */
  useEffect(() => {
    if (isOpen) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  /* Prevent body scroll when open on mobile */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function formatTime(date: Date) {
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function addMessage(text: string, type: "bot" | "user") {
    const msg: Message = {
      id: `${type}-${Date.now()}`,
      type,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }

  function handleFaqClick(faq: FaqItem) {
    addMessage(faq.question, "user");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(faq.answer, "bot");
    }, 900);
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    addMessage(text, "user");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(
        "Gracias por tu mensaje. Para una respuesta más rápida y personalizada, escríbenos directamente por WhatsApp — nuestro equipo te atiende en minutos. 💬",
        "bot",
      );
    }, 1200);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <>
      {/* ── Backdrop — sin blur, solo overlay oscuro muy sutil ── */}
      {isOpen && (
        <div
          className="faq-backdrop fixed inset-0 z-[9998] bg-black/30"
          style={{ animation: "backdropFade 0.2s ease-out" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Bottom Sheet ── */}
      <div
        aria-label="Chat de preguntas frecuentes"
        aria-modal="true"
        className={cn(
          // Mobile: full-width bottom sheet
          "fixed inset-x-0 bottom-0 z-[9999] flex flex-col",
          // Desktop: anchored bottom-right, floating panel
          "sm:inset-x-auto sm:bottom-[5.5rem] sm:right-4 sm:w-[26rem] sm:rounded-xl",
          "transition-[transform,opacity] duration-300 ease-out",
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
        role="dialog"
        style={{ borderRadius: "1.25rem 1.25rem 0 0" }}
      >
        <div
          className="flex flex-col overflow-hidden"
          style={{
            background: "linear-gradient(170deg, #0d0c0a 0%, #080706 100%)",
            border: "1px solid rgba(201,169,110,0.22)",
            borderRadius: "inherit",
            boxShadow:
              "0 -8px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(201,169,110,0.08)",
            // Taller chat: more space for messages
            maxHeight: "min(80dvh, 620px)",
            height: "min(80dvh, 620px)",
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex shrink-0 items-center gap-3 px-4 py-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(201,169,110,0.12) 0%, rgba(201,169,110,0.04) 100%)",
              borderBottom: "1px solid rgba(201,169,110,0.14)",
            }}
          >
            {/* Avatar */}
            <div
              className="relative flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                boxShadow: "0 0 16px rgba(201,169,110,0.3)",
              }}
            >
              <Sparkles className="size-4 text-[#0a0809]" />
              <span
                className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-400"
                style={{ border: "2px solid #0d0c0a" }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="truncate text-sm font-semibold leading-tight"
                style={{ color: "var(--foreground)" }}
              >
                Asistente de Tienda
              </p>
              <p className="text-[11px] leading-tight" style={{ color: "rgba(240,235,226,0.4)" }}>
                Preguntas frecuentes · En línea
              </p>
            </div>

            <button
              aria-label="Cerrar chat"
              className="flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 active:scale-90"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-3.5" style={{ color: "rgba(240,235,226,0.55)" }} />
            </button>
          </div>

          {/* ── Messages — flex-1 so it takes all available vertical space ── */}
          <div
            className="hide-scrollbar flex-1 overflow-y-auto px-4 py-4"
            style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.type === "user" ? "flex-row-reverse" : "flex-row",
                )}
                style={{ animation: "slideInRight 0.18s ease-out" }}
              >
                {msg.type === "bot" && (
                  <div
                    className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                    }}
                  >
                    <Sparkles className="size-3 text-[#0a0809]" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.type === "bot" ? "rounded-tl-sm" : "rounded-tr-sm",
                  )}
                  style={
                    msg.type === "bot"
                      ? {
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(201,169,110,0.14)",
                          color: "var(--foreground)",
                        }
                      : {
                          background:
                            "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                          color: "#0a0809",
                          fontWeight: 500,
                        }
                  }
                >
                  <p>{msg.text}</p>
                  <p
                    className="mt-1 text-right text-[10px]"
                    style={{
                      color:
                        msg.type === "bot"
                          ? "rgba(240,235,226,0.28)"
                          : "rgba(10,8,9,0.4)",
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2" style={{ animation: "fadeInUp 0.18s ease-out" }}>
                <div
                  className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                  }}
                >
                  <Sparkles className="size-3 text-[#0a0809]" />
                </div>
                <div
                  className="flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(201,169,110,0.14)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full"
                      style={{
                        background: "var(--accent)",
                        animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── FAQ Quick Replies — single horizontal scrollable row ── */}
          <div
            className="hide-scrollbar shrink-0 overflow-x-auto px-4 pb-2.5 pt-2"
            style={{ borderTop: "1px solid rgba(201,169,110,0.1)" }}
          >
            <p className="mb-1.5 text-[10px] uppercase tracking-wide" style={{ color: "rgba(240,235,226,0.3)" }}>
              Preguntas frecuentes
            </p>
            {/* Single scrollable row — no wrapping */}
            <div className="flex gap-1.5" style={{ width: "max-content" }}>
              {FAQ_ITEMS.map((faq) => (
                <button
                  key={faq.id}
                  className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={() => handleFaqClick(faq)}
                  style={{
                    background: "rgba(201,169,110,0.08)",
                    border: "1px solid rgba(201,169,110,0.22)",
                    color: "var(--accent)",
                  }}
                  type="button"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* ── Input ── */}
          <div
            className="flex shrink-0 items-center gap-2 px-4 py-3"
            style={{ borderTop: "1px solid rgba(201,169,110,0.1)" }}
          >
            <input
              ref={inputRef}
              aria-label="Escribe tu pregunta"
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none transition-colors placeholder:opacity-30"
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta…"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,169,110,0.15)",
                color: "var(--foreground)",
              }}
              type="text"
              value={inputValue}
            />
            <button
              aria-label="Enviar mensaje"
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                inputValue.trim()
                  ? "scale-100 opacity-100 hover:scale-110 active:scale-90"
                  : "scale-90 opacity-35",
              )}
              disabled={!inputValue.trim()}
              onClick={handleSend}
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
              }}
              type="button"
            >
              <Send className="size-3.5 text-[#0a0809]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating Trigger Button — encima del botón WhatsApp ── */}
      {/*
        WhatsApp button sits at: bottom-20 right-4 (mobile) / bottom-6 right-6 (sm)
        We stack this button directly above it with enough gap.
      */}
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar chat de ayuda" : "Abrir chat de ayuda"}
        className={cn(
          "fixed z-[9997] flex items-center justify-center rounded-full",
          "transition-all duration-300 hover:-translate-y-0.5 active:scale-90",
          // same right-4/right-6 as WhatsApp, stacked above (bottom-36 / sm:bottom-24)
          "bottom-36 right-4 size-12 sm:bottom-24 sm:right-6 sm:size-[52px]",
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          background: isOpen
            ? "rgba(201,169,110,0.12)"
            : "linear-gradient(135deg, #1a1612 0%, #0f0d0a 100%)",
          border: "1px solid rgba(201,169,110,0.35)",
          boxShadow: isOpen
            ? "0 4px 20px rgba(201,169,110,0.18)"
            : "0 4px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,169,110,0.12)",
        }}
        type="button"
      >
        {/* Notification dot */}
        {hasNew && !isOpen && (
          <span
            className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-[var(--accent)]"
            style={{
              border: "2px solid #020202",
              animation: "softPulse 2.4s ease-in-out infinite",
            }}
          />
        )}

        {isOpen ? (
          <ChevronDown
            className="size-5 transition-all duration-200"
            style={{ color: "var(--accent)", opacity: 0.8 }}
          />
        ) : (
          <MessageCircle
            className="size-5 transition-all duration-200"
            style={{ color: "var(--accent)" }}
          />
        )}
      </button>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}
