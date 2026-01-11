import Sidebar from "@/components/Dashboard/Workspace/Sidebar";
import TextEditor from "@/components/Editor/TextEditor";

export default function EditorPage() {
  return (
    <main className="h-[calc(100vh-7rem)] w-full overflow-hidden bg-base-100 text-base-content">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <TextEditor />
        </div>
      </div>
    </main>
  );
}