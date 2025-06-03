"use client";

import DeleteModal from "@/components/ui/deleteModal";

export default function TestPage() {
  const deleteVoid = () => {
    alert("Item deleted");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Test Page</h1>
      <p className="text-lg text-gray-700">This is a test page.</p>
      <DeleteModal textBox="evento" onDelete={deleteVoid} />
    </div>
  );
}
