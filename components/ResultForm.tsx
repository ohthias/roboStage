"use client";

import { supabase } from "@/utils/supabase/client";
import { useState, useEffect, useRef } from "react";

export default function ModalResultForm() {
  const [tests, setTests] = useState<any[]>([]);
  const [testTypes, setTestTypes] = useState<any>({});
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [customVars, setCustomVars] = useState<
    { name: string; values: Record<number, string> }[]
  >([{ name: "", values: {} }]);
  const [parameters, setParameters] = useState<any[]>([]);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  // Buscar tipos de teste
  useEffect(() => {
    const fetchTypes = async () => {
      const { data, error } = await supabase.from("test_types").select("*");
      if (!error && data) {
        const typesMap: Record<string, string> = {};
        data.forEach((t: any) => (typesMap[t.id] = t.name));
        setTestTypes(typesMap);
      }
    };
    fetchTypes();
  }, []);

  // Buscar testes do usuário
  useEffect(() => {
    const fetchTests = async () => {
      const { data, error } = await supabase.from("tests").select("*");
      if (!error && data) setTests(data);
    };
    fetchTests();
  }, []);

  // Ao selecionar teste
  const handleTestChange = async (testId: string) => {
    const test = tests.find((t) => t.id === testId);
    if (!test) return;

    const typeName = testTypes[test.type_id];
    setSelectedTest({ ...test, type: typeName });

    // Buscar missões relacionadas
    try {
      const { data: testMissions } = await supabase
        .from("test_missions")
        .select("*")
        .eq("test_id", test.id);

      if (testMissions && testMissions.length > 0) {
        const season = testMissions[0].season;
        const res = await fetch("/data/missions.json");
        const missionsData = await res.json();
        const filteredMissions = testMissions
          .map((tm: any) =>
            missionsData[season]?.find((m: any) => m.id === tm.mission_key)
          )
          .filter(Boolean);
        setMissions(filteredMissions || []);
      } else {
        setMissions([]);
      }
    } catch (err) {
      console.error(err);
      setMissions([]);
    }

    // Buscar parâmetros se teste for personalizado
    if (typeName === "personalizado") {
      const { data: params } = await supabase
        .from("test_parameters")
        .select("*")
        .eq("test_id", test.id);
      setParameters(params || []);
      setCustomVars([{ name: "", values: {} }]); // reset
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleCustomVarChange = (index: number, value: string) => {
    const updated = [...customVars];
    updated[index].name = value;
    setCustomVars(updated);
  };

  const handleCustomParamChange = (
    varIndex: number,
    paramId: number,
    value: string
  ) => {
    const updated = [...customVars];
    updated[varIndex].values[paramId] = value;
    setCustomVars(updated);
  };

  const addCustomVar = () =>
    setCustomVars([...customVars, { name: "", values: {} }]);

  const handleSubmit = async () => {
    if (!selectedTest) return;

    let payload: any[] = [];

    if (selectedTest.type === "personalizado") {
      // Junta todas as variáveis e seus parâmetros em um único objeto
      const resultObj = customVars.map((v) => ({
        nome: v.name,
        parametros: v.values,
      }));

      payload.push({
        test_id: selectedTest.id,
        metric: "personalizado",
        value: resultObj, // jsonb
      });
    } else if (selectedTest.type === "grupo") {
      // Junta todas as missões em um único objeto
      const resultObj: Record<string, number> = {};
      for (const [missionKey, val] of Object.entries(formData)) {
        resultObj[missionKey] = val === "true" ? 1 : 0;
      }

      payload.push({
        test_id: selectedTest.id,
        metric: "grupo",
        value: resultObj, // jsonb
      });
    } else if (selectedTest.type === "missao_individual") {
      const missionKey = formData.mission;
      const doneValue = formData.done === "true" ? 1 : 0;

      payload.push({
        test_id: selectedTest.id,
        mission_key: missionKey,
        metric: "missao_individual",
        value: doneValue,
      });
    }

    const { error } = await supabase.from("results").insert(payload);

    if (!error) {
      alert("Resultado salvo com sucesso!");
      setFormData({});
      setCustomVars([{ name: "", values: {} }]);
      setSelectedTest(null);
      setMissions([]);
      setParameters([]);
      modalRef.current?.close();
    } else {
      console.error(error);
      alert("Erro ao salvar resultado.");
    }
  };

  const openModal = () => modalRef.current?.showModal();
  const closeModal = () => {
    modalRef.current?.close();
    setFormData({});
    setCustomVars([{ name: "", values: {} }]);
    setSelectedTest(null);
    setMissions([]);
    setParameters([]);
  };

  return (
    <>
      <button className="btn btn-neutral btn-outline btn-sm" onClick={openModal}>
        Adicionar Resultado
      </button>

      <dialog ref={modalRef} className="modal">
        <form
          method="dialog"
          className="modal-box w-11/12 max-w-3xl max-h-[80vh] overflow-y-auto"
        >
          <h2 className="text-xl font-bold mb-4">Adicionar Resultado</h2>

          {/* Select de testes */}
          <select
            className="select select-bordered w-full mb-4"
            onChange={(e) => handleTestChange(e.target.value)}
          >
            <option value="">Selecione um teste</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name_test} ({testTypes[test.type_id]})
              </option>
            ))}
          </select>

          {/* missao_individual */}
          {selectedTest?.type === "missao_individual" && (
            <div>
              <h3 className="font-semibold">Missão</h3>
              <select
                className="select select-bordered w-full"
                onChange={(e) => handleChange("mission", e.target.value)}
              >
                <option value="">Selecione a missão</option>
                {missions.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <label className="label mt-2">Concluiu?</label>
              <select
                className="select select-bordered w-full"
                onChange={(e) => handleChange("done", e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          )}

          {/* grupo */}
          {selectedTest?.type === "grupo" && (
            <div>
              <h3 className="font-semibold mb-2">Missões</h3>
              {missions.map((m: any) => (
                <div key={m.id} className="border p-2 mb-2 rounded">
                  <p className="font-medium">{m.name}</p>
                  <select
                    className="select select-bordered w-full mt-1"
                    onChange={(e) => handleChange(m.id, e.target.value)}
                  >
                    <option value="">Concluiu?</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* personalizado */}
          {selectedTest?.type === "personalizado" && (
            <div>
              <h3 className="font-semibold mb-2">Variáveis</h3>
              {customVars.map((v, idx) => (
                <div key={idx} className="border p-2 mb-2 rounded">
                  <input
                    type="text"
                    placeholder="Nome da variável"
                    className="input input-bordered w-full mb-2"
                    value={v.name}
                    onChange={(e) => handleCustomVarChange(idx, e.target.value)}
                  />
                  {parameters.map((p) => (
                    <input
                      key={p.id}
                      type="text"
                      placeholder={p.name}
                      className="input input-bordered w-full mb-1"
                      value={v.values[p.id] || ""}
                      onChange={(e) =>
                        handleCustomParamChange(idx, p.id, e.target.value)
                      }
                    />
                  ))}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={addCustomVar}
              >
                + Adicionar variável
              </button>
            </div>
          )}

          <div className="modal-action mt-4">
            <button type="button" className="btn" onClick={closeModal}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Salvar Resultado
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}