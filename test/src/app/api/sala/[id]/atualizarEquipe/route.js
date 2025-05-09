import dbConnect from "@/lib/dbConnect";
import Sala from "@/models/Sala";

export default async function handler(req, res) {
  const { id } = req.query;
  const { _id, ...dadosAtualizados } = req.body;

  await dbConnect();

  if (req.method === "PUT") {
    try {
      const sala = await Sala.findById(id);
      if (!sala) return res.status(404).json({ error: "Sala não encontrada" });

      const equipeIndex = sala.equipes.findIndex((e) => e._id.toString() === _id);
      if (equipeIndex === -1) return res.status(404).json({ error: "Equipe não encontrada" });

      // Atualiza os campos desejados
      sala.equipes[equipeIndex] = {
        ...sala.equipes[equipeIndex]._doc,
        ...dadosAtualizados,
      };

      await sala.save();
      res.status(200).json({ sucesso: true });
    } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar equipe" });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
