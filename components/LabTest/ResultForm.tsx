"use client";

import { supabase } from "@/utils/supabase/client";
import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
  useCallback,
} from "react";
import { RangeInput } from "../FormMission/RangeInput";
import { SwitchInput } from "../FormMission/SwitchInput";
import { useToast } from "@/app/context/ToastContext";

export interface ModalResultFormRef {
  openWithTest: (testId: string) => void;
}

const ModalResultForm = forwardRef<ModalResultFormRef>((_, ref) => {
  const [tests, setTests] = useState<any[]>([]);
  const [testTypes, setTestTypes] = useState<any>({});
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [customVars, setCustomVars] = useState<{ name: string; values: Record<number, string> }[]>([{ name: "", values: {} }]);
  const [parameters, setParameters] = useState<any[]>([]);
  const [season, setSeason] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const { addToast } = useToast();
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

  // Selecionar teste
  const handleTestChange = useCallback(
    async (testId: string) => {
      const test = tests.find((t) => t.id === testId);
      if (!test) return;

      const typeName = testTypes[test.type_id] || "";
      setSelectedTest({ ...test, type: typeName });

      try {
        // Buscar missões do teste
        const { data: testMissions, error: missionsErr } = await supabase
          .from("test_missions")
          .select("*")
          .eq("test_id", test.id);

        if (missionsErr) throw missionsErr;

        if (testMissions?.length) {
          const season = testMissions[0].season;
          setSeason(season);

          // Buscar missões do JSON
          const res = await fetch("/api/data/missions");
          const missionsData = await res.json();

          const filteredMissions = testMissions
            .map((tm: any) => {
              const missionData = missionsData[season]?.find((m: any) => m.id === tm.mission_key);
              if (!missionData) return null;
              return {
                ...missionData,
                maxValue: tm.max_value ?? missionData.type?.[2] ?? null // usa max_value do banco ou default
              };
            })
            .filter(Boolean);

          setMissions(filteredMissions || []);
        } else {
          setMissions([]);
          setSeason(null);
        }

        if (typeName === "personalizado") {
          const { data: params, error: paramErr } = await supabase
            .from("test_parameters")
            .select("*")
            .eq("test_id", test.id);

          if (paramErr) throw paramErr;

          setParameters(params || []);
          setCustomVars([{ name: "", values: {} }]);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do teste:", err);
        setMissions([]);
        setSeason(null);
      }
    },
    [tests, testTypes]
  );

  useImperativeHandle(ref, () => ({
    openWithTest: async (testId: string) => {
      await handleTestChange(testId);
      modalRef.current?.showModal();
    },
  }));

  const handleCustomVarChange = (index: number, value: string) => {
    const updated = [...customVars];
    updated[index].name = value;
    setCustomVars(updated);
  };

  const handleCustomParamChange = (varIndex: number, paramId: number, value: string) => {
    const updated = [...customVars];
    updated[varIndex].values[paramId] = value;
    setCustomVars(updated);
  };

  const addCustomVar = () =>
    setCustomVars([...customVars, { name: "", values: {} }]);

  // Renderiza missões e sub-missões
  const renderMissionFields = (mission: any, missionKey: string) => {
    const isMainMission = !missionKey.includes("-sub-");

    const content = (
      <>
        <div className="flex flex-col mb-2">
          <div className="flex items-center justify-between">
            <p className="font-medium flex-1 text-left">{mission.name || mission.submission}</p>
            {isMainMission && (
              <span className="badge badge-primary badge-outline ml-2">{missionKey}</span>
            )}
          </div>
          <p>{mission.mission}</p>
        </div>

        {(mission.type?.[0] === "range" || mission.type?.[0] === "switch") && (
          <div className="mb-2">{renderFieldInput(mission, missionKey, 0)}</div>
        )}

        {mission["sub-mission"]?.length > 0 && (
          <div className="ml-4 border-l-2 border-primary pl-4 mt-2">
            {mission["sub-mission"].map((sub: any, subIdx: number) =>
              renderMissionFields(sub, `${missionKey}-sub-${subIdx}`)
            )}
          </div>
        )}
      </>
    );

    if (isMainMission) {
      return (
        <div key={missionKey} className="mb-4 border rounded-lg p-4 bg-base-100 border-base-300 shadow-sm">
          {content}
        </div>
      );
    }

    return <div key={missionKey}>{content}</div>;
  };

  const renderFieldInput = (field: any, missionKey: string, index: number) => {
    if (field.type?.[0] === "range") {
      const max = field.maxValue ?? field.type[2] ?? 10;
      return (
        <RangeInput
          missionId={missionKey}
          index={index}
          points={field.type[1] || 1}
          start={field.type[1] || 0}
          end={max}
          value={formData[missionKey]?.[index]}
          onSelect={(mId, idx, val) => {
            const clamped = Math.min(val, max);
            setFormData((prev: any) => ({
              ...prev,
              [mId]: { ...(prev[mId] || {}), [idx]: clamped },
            }));
          }}
        />
      );
    }

    if (field.type?.[0] === "switch") {
      return (
        <SwitchInput
          missionId={missionKey}
          index={index}
          points={field.type[1] || 1}
          options={field.type.slice(1).filter(Boolean).map(String)}
          value={formData[missionKey]?.[index]}
          onSelect={(mId, idx, val) =>
            setFormData((prev: any) => ({
              ...prev,
              [mId]: { ...(prev[mId] || {}), [index]: val },
            }))
          }
        />
      );
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!selectedTest) return;

    // Validar campos obrigatórios
    if (selectedTest.type === "personalizado") {
      for (const v of customVars) {
        if (!v.name || parameters.some((p) => !v.values[p.id])) {
          addToast("Por favor, preencha todas as variáveis e valores.", "error");
          return;
        }
      }
    } else {
      // Verificar missões
      for (const m of missions) {
        if (m.type?.[0] === "range") {
          const val = formData[m.id]?.[0];
          if (val === undefined || val === null || val === "") {
            addToast(`Preencha o valor da missão ${m.name || m.id}`, "error");
            return;
          }
        }
        if (m.type?.[0] === "switch") {
          const val = formData[m.id]?.[0];
          if (val === undefined || val === null || val === "") {
            addToast(`Selecione uma opção para a missão ${m.name || m.id}`, "error");
            return;
          }
        }
      }
    }

    const payload: any[] = [
      {
        test_id: selectedTest.id,
        metric: selectedTest.type,
        value: formData,
        created_at: new Date(),
        season: season,
        description: description,
      },
    ];

    const { error } = await supabase.from("results").insert(payload);

    if (!error) {
      addToast("Resultado salvo com sucesso!", "success");
      closeModal();
      window.location.reload();
    } else {
      console.error(error);
      addToast("Erro ao salvar resultado.", "error");
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
    setDescription("");
    setSeason(null);
  };

  return (
    <>
      <button className="btn btn-neutral btn-outline btn-sm" onClick={openModal}>
        Adicionar Resultado
      </button>

      <dialog ref={modalRef} className="modal">
        <form method="dialog" className="modal-box w-11/12 max-w-3xl max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Adicionar Resultado</h2>

          {!selectedTest && (
            <select
              className="select select-bordered w-full mb-4"
              onChange={(e) => handleTestChange(e.target.value)}
              required
            >
              <option value="">Selecione um teste</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.name_test} ({testTypes[test.type_id]})
                </option>
              ))}
            </select>
          )}

          {selectedTest && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Teste selecionado: <span className="font-semibold">{selectedTest.name_test}</span> ({selectedTest.type})
              </p>
            </div>
          )}

          {/* Renderizar missões */}
          {missions.map((m) => renderMissionFields(m, m.id))}

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
                    required
                  />
                  {parameters.map((p) => (
                    <input
                      key={p.id}
                      type="text"
                      placeholder={p.name}
                      className="input input-bordered w-full mb-1"
                      value={v.values[p.id] || ""}
                      onChange={(e) => handleCustomParamChange(idx, p.id, e.target.value)}
                      required
                    />
                  ))}
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-outline" onClick={addCustomVar}>
                + Adicionar variável
              </button>
            </div>
          )}

          {/* Descrição */}
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Descrição do que foi mudado (opcional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Digite aqui uma descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={450}
            />
            {description.length >= 450 && (
              <span className="text-error text-xs mt-1 block">
                Limite máximo de 450 caracteres atingido.
              </span>
            )}
          </div>

          <div className="modal-action mt-4">
            <button type="button" className="btn" onClick={closeModal}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              Salvar Resultado
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
});

export default ModalResultForm;