import { useFileStore } from "../../store/useFileStore";
import FileNode from "./FileNode";

export default function FileExplorer() {
  const tree = useFileStore((state) => state.tree);

  if (!tree) {
    return (
      <div className="h-full bg-[#131317] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#ff9249] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#acaab0]">Loading Explorer</span>
        </div>
      </div>
    );
  }

  if (!tree.id) {
    return (
      <div className="h-full bg-[#131317] p-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-red-500/50 italic">Invalid Architecture</span>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#131317] flex flex-col select-none">
      {/* Explorer Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#ffffff05]">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#acaab0]">Explorer</h2>
        <div className="flex items-center gap-2">
           <button className="text-[#acaab0] hover:text-[#ff9249] transition-colors p-1" title="New Project File">
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
           </button>
           <button className="text-[#acaab0] hover:text-[#ff9249] transition-colors p-1" title="New Directory">
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
             </svg>
           </button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        <FileNode node={tree} level={0} />
      </div>
    </div>
  );
}