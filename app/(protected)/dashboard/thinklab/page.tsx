import { createThinkLab, listThinkLabsByUserId } from "./actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThinkLabThumbnail } from "@/components/thinklab/ThinkLabThumbnail";
import { CanvasElement } from "@/types/thinklab.types";

export default async function ThinkLabDashboard() {
	const thinkLabs = await listThinkLabsByUserId();

	async function create() {
		"use server";
		const created = await createThinkLab();
		redirect(`/dashboard/thinklab/${created.id}`);
	}

	return (
		<main className="p-6 space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">ThinkLab</h1>
					<p className="text-sm opacity-70">Seus diagramas salvos no banco de dados.</p>
				</div>
				<form action={create}>
					<button className="btn btn-primary" type="submit">Novo Quadro</button>
				</form>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{thinkLabs.length > 0 ? (
					thinkLabs.map((thinkLab) => {
						const config = thinkLab.config as { elements?: CanvasElement[] } | null;
						const elements = Array.isArray(config?.elements) ? config.elements : [];

						return (
							<Link
								className="card overflow-hidden border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
								href={`/dashboard/thinklab/${thinkLab.id}`}
								key={thinkLab.id}
							>
								<ThinkLabThumbnail elements={elements} name={thinkLab.name} />
								<div className="p-4">
									<div className="flex items-start justify-between gap-3">
										<h2 className="font-semibold">{thinkLab.name}</h2>
										<span className="badge badge-ghost badge-sm shrink-0">
											{elements.length} {elements.length === 1 ? "item" : "itens"}
										</span>
									</div>
									<p className="mt-1 line-clamp-2 text-sm opacity-70">
										{thinkLab.description || "Sem descrição"}
									</p>
								</div>
							</Link>
						);
					})
				) : (
					<div className="card border border-dashed border-base-300 bg-base-100 p-6 sm:col-span-2 lg:col-span-3">
						<div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
							<div className="text-4xl opacity-50" aria-hidden="true">□</div>
							<div>
								<h2 className="font-semibold">Nenhum quadro criado ainda</h2>
								<p className="mt-1 text-sm opacity-70">
									Crie seu primeiro ThinkLab para começar a organizar suas ideias.
								</p>
							</div>
							<form action={create}>
								<button className="btn btn-primary btn-sm" type="submit">Criar primeiro quadro</button>
							</form>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
