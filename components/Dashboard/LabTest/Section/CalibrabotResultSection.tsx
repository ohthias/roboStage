export function CalibrabotResultSection({
  test,
  variables,
  setVariables,
}: any) {
  return (
    <div className="space-y-4">
      {test.test_variables.map(
        (variable: any) => (
          <div
            key={variable.id}
            className="form-control"
          >
            <label className="label">
              <span className="label-text">
                {variable.name}
              </span>
            </label>

            <input
              type="text"
              className="input input-bordered"
              value={
                variables[
                  variable.name
                ] ?? ""
              }
              onChange={(e) =>
                setVariables({
                  ...variables,
                  [variable.name]:
                    e.target.value,
                })
              }
            />
          </div>
        )
      )}
    </div>
  );
}