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

export interface ModalResultFormRef {
  openWithTest: (testId: string) => void;
}

const ModalResultForm = forwardRef<ModalResultFormRef>((_, ref) => {
  const [tests, setTests] = useState<any[]>([]);
  const [testTypes, setTestTypes] = useState<any>({});
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [customVars, setCustomVars] = useState<
    { name: string; values: Record<number, string> }[]
  >([{ name: "", values: {} }]);
  const [parameters, setParameters] = useState<any[]>([]);
  const [season, setSeason] = useState<string | null>(null);
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
        const { data: testMissions, error: missionsErr } = await supabase
          .from("test_missions")
          .select("*")
          .eq("test_id", test.id);

        if (missionsErr) throw missionsErr;

        if (testMissions?.length) {
          const season = testMissions[0].season; // pegar a season aqui
          setSeason(season); // salvar no estado

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

  // Função recursiva para renderizar sub-missões
  const renderMissionFields = (mission: any, missionKey: string) => {
    const isMainMission = !missionKey.includes("-sub-");

    const content = (
      <>
        <div className="flex flex-col mb-2">
          <div className="flex items-center justify-between">
            <p className="font-medium flex-1 text-left">
              {mission.name || mission.submission}
            </p>
            {isMainMission && (
              <span className="badge badge-primary badge-outline ml-2">
                {missionKey}
              </span>
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

    // Aplica borda e fundo apenas na missão principal
    if (isMainMission) {
      return (
        <div
          key={missionKey}
          className="mb-4 border rounded-lg p-4 bg-base-100 border-base-300 shadow-sm"
        >
          {content}
        </div>
      );
    }

    return <div key={missionKey}>{content}</div>;
  };

  const renderFieldInput = (field: any, missionKey: string, index: number) => {
    if (field.type?.[0] === "range") {
      return (
        <RangeInput
          missionId={missionKey}
          index={index}
          points={field.type[1] || 1}
          start={field.type[1] || 0}
          end={field.type[2] || 10}
          value={formData[missionKey]?.[index]}
          onSelect={(mId, idx, val) =>
            setFormData((prev: any) => ({
              ...prev,
              [mId]: { ...(prev[mId] || {}), [idx]: val },
            }))
          }
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
    console.log(missions[0]?.season);

    const payload: any[] = [
      {
        test_id: selectedTest.id,
        metric: selectedTest.type,
        value: formData,
        created_at: new Date(),
        season: season,
      },
    ];

    const { error } = await supabase.from("results").insert(payload);

    if (!error) {
      alert("Resultado salvo com sucesso!");
      closeModal();
      window.location.reload();
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
      <button
        className="btn btn-neutral btn-outline btn-sm"
        onClick={openModal}
      >
        Adicionar Resultado
      </button>

      <dialog ref={modalRef} className="modal">
        <form
          method="dialog"
          className="modal-box w-11/12 max-w-3xl max-h-[80vh] overflow-y-auto"
        >
          <h2 className="text-xl font-bold mb-4">Adicionar Resultado</h2>

          {!selectedTest && (
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
          )}

          {selectedTest && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Teste selecionado:{" "}
                <span className="font-semibold">{selectedTest.name_test}</span>{" "}
                ({selectedTest.type})
              </p>
            </div>
          )}

          {/* Renderizar missões e sub-missões */}
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
});

export default ModalResultForm;
