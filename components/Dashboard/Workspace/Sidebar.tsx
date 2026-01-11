export default function Sidebar() {
  return (
    <aside className="
      w-64
      shrink-0
      border-r border-base-300
      bg-base-100
      px-4 py-6
      text-sm
    ">
      <nav className="space-y-6">
        <div className="text-xs font-semibold uppercase text-base-content/50">
          Workspace
        </div>

        <ul className="space-y-1">
          {["Workspace Overview", "Pagina 1", "Pagina 2"].map((item) => (
            <li key={item}>
              <a
                href="#"
                className={`
                  block rounded px-2 py-1.5
                  text-base-content/80
                  hover:bg-base-200
                  hover:text-base-content
                  ${item === "Workspace Overview" ? "bg-base-200 font-medium" : ""}
                `}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}