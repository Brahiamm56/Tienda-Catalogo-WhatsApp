import { redirect } from "next/navigation";

// Legacy route — now opens as a left drawer in /admin/ventas
export default function NuevaVentaPage() {
  redirect("/admin/ventas?new=1");
}
