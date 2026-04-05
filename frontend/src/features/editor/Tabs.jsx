import { useEditorStore } from "../../store/useEditorStore";
import { useFileStore } from "../../store/useFileStore";

export default function Tabs() {
  const { openTabs, activeFileId, setActiveFile, closeFile } =
    useEditorStore();

  const getFileById = useFileStore((s) => s.getFileById);

  return (
    <div className="flex items-end bg-[#131317] px-2 h-10 border-b border-[#ffffff05] selection:bg-transparent overflow-x-auto no-scrollbar">
      {openTabs.map((id) => {
        const file = getFileById(id);
        const isActive = activeFileId === id;

        return (
          <div
            key={id}
            onClick={() => setActiveFile(id)}
            className={`group relative flex items-center gap-2 px-4 h-9 cursor-pointer transition-all duration-150 rounded-t-lg select-none ${
               isActive 
               ? 'bg-[#0e0e12] text-[#ff9249]' 
               : 'bg-transparent text-[#acaab0] hover:text-[#fcf8fe] hover:bg-[#ffffff03]'
            }`}
          >
            {/* Active Indicator Line */}
            {isActive && (
               <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#ff9249] shadow-[0_0_10px_rgba(255,146,73,0.5)] z-10"></div>
            )}

            {/* File Icon */}
            <svg className={`w-3.5 h-3.5 ${isActive ? 'text-[#ff9249]' : 'text-[#acaab0] group-hover:text-[#fcf8fe]'} opacity-70`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>

            <span className={`text-[12px] font-bold tracking-tight font-[Space_Grotesk] ${isActive ? 'neon-text-orange' : ''}`}>
              {file?.name || "untitled"}
            </span>

            {/* Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                closeFile(id);
              }}
              className={`p-0.5 rounded transition-all transform hover:scale-110 ${isActive ? 'text-[#ff924966] hover:text-[#ff9249] hover:bg-[#ff924911]' : 'text-[#acaab044] hover:text-[#fcf8fe] hover:bg-[#ffffff11] opacity-0 group-hover:opacity-100'}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}