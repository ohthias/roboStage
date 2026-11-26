import assert from "node:assert/strict";
import { breakdown, emptyRound } from "./scoring";

// 1) Arredondamento: 100 x 1,3 x 1,3 = 169 (não 170 por erro de float)
{
  const r = emptyRound();
  r.startTile = false;
  r.hazards.gangorras = 5; // 100
  r.vivasVerde = 1;
  r.mortasVermelha = 1;
  assert.equal(breakdown(r).total, 169);
}
// 2) Ladrilho de chegada: 60 - 5 x falhas, nunca negativo
{
  const r = emptyRound();
  r.startTile = false;
  r.chegada = true;
  r.falhas = 2;
  assert.equal(breakdown(r).chegada, 50);
  r.falhas = 20;
  assert.equal(breakdown(r).chegada, 0);
}
// 3) Checkpoints: 5/3/1/0 por ladrilho
{
  const r = emptyRound();
  r.startTile = true; // 5
  r.checkpoints = [
    { tiles: 4, attempt: 1 }, // 20
    { tiles: 3, attempt: 2 }, // 9
    { tiles: 5, attempt: 3 }, // 5
    { tiles: 6, attempt: 4 }, // 0
  ];
  assert.equal(breakdown(r).total, 5 + 20 + 9 + 5);
}
// 4) Multiplicadores combinados e arredondamento para cima
{
  const r = emptyRound();
  r.startTile = false;
  r.hazards.intersecoes = 1; // 10
  r.invertidas = 1; // x1,1
  r.surpresa = true; // x1,5
  assert.equal(breakdown(r).total, Math.ceil(10 * 1.1 * 1.5)); // 17
}
// 5) Tempo: sem chegada/desistência => 300 s
{
  const r = emptyRound();
  r.tempo = 120;
  assert.equal(breakdown(r).tempo, 300);
  r.chegada = true;
  assert.equal(breakdown(r).tempo, 120);
  r.desistiu = true;
  assert.equal(breakdown(r).tempo, 300);
}
console.log("OK: todos os testes passaram");
