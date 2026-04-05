import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e12] overflow-x-hidden selection:bg-[#ff9249] selection:text-[#0e0e12]">
      {/* --- Atmospheric Lighting (Glows) --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff924911] rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#f9cc6109] rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* --- Navbar --- */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-br from-[#ff9249] to-[#ff7b04] rounded-lg flex items-center justify-center font-bold text-[#0e0e12] text-xl shadow-[0_0_15px_rgba(255,146,73,0.3)] transition-transform group-hover:scale-105">
            C
          </div>
          <span className="text-xl font-bold tracking-tight font-[Space_Grotesk]">Collab<span className="text-[#ff9249]">Code</span></span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-[#acaab0] hover:text-[#fcf8fe] transition-colors">Features</a>
          <a href="#docs" className="text-sm font-medium text-[#acaab0] hover:text-[#fcf8fe] transition-colors">Documentation</a>
          <Link 
            to="/login" 
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#19191e] border border-[#ffffff11] hover:bg-[#25252b] transition-all hover:border-[#ffffff22]"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center pt-20 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff924915] border border-[#ff924922] mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff9249] animate-pulse"></span>
          <span className="text-[11px] font-bold tracking-wider text-[#ff9249] uppercase">The Neon Architect v2.0</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter font-[Space_Grotesk] bg-clip-text text-transparent bg-gradient-to-b from-[#fcf8fe] to-[#acaab0]">
          CODE BEYOND <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff9249] via-[#f9cc61] to-[#ff9249] bg-[length:200%_auto] animate-gradient-flow">THE MARGIN.</span>
        </h1>

        <p className="text-lg md:text-xl text-[#acaab0] max-w-2xl mb-12 font-medium leading-relaxed">
          The ultimate hacker playground for high-stakes collaboration. Build, debug, and ship with the intensity of a midnight hackathon.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link 
            to="/login" 
            className="group relative px-8 py-4 bg-gradient-to-r from-[#ff9249] to-[#ff7b04] text-[#0e0e12] font-bold rounded-xl shadow-[0_0_25px_rgba(255,146,73,0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(255,146,73,0.4)]"
          >
            Enter Workspace
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <a 
            href="https://github.com" 
            className="px-8 py-4 bg-[#19191e] border border-[#ffffff11] text-[#fcf8fe] font-bold rounded-xl transition-all hover:bg-[#25252b] hover:border-[#ffffff22]"
          >
            Star on GitHub
          </a>
        </div>

        {/* --- Visual Element: Floating Code Card --- */}
        <div className="mt-24 relative w-full max-w-4xl rounded-2xl border border-[#ffffff08] bg-[#0e0e12] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           <div className="flex items-center px-4 py-2 bg-[#131317] border-bottom border-[#ffffff08] gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff735144]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#f9cc6144]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#4caf5044]"></div>
              <div className="ml-4 text-[10px] text-[#acaab0] tracking-widest font-bold uppercase opacity-50">main.py</div>
           </div>
           <div className="p-8 text-left font-mono text-sm sm:text-base leading-relaxed overflow-x-auto whitespace-pre">
              <span className="text-[#ffcd63]">async def</span> <span className="text-[#ff9249]">initialize_workspace</span>():<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#acaab0] opacity-50"># Establish real-time sync with high-energy accents</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;engine = await <span className="text-[#ff9249]">NeonArchitect</span>.boot()<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#ffcd63]">print</span>(f<span className="text-[#f9cc61]">"System Online: &#123;engine.status&#125;"</span>)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#ffcd63]">return</span> engine
           </div>
        </div>
      </main>

      {/* --- Features Mini Grid --- */}
      <section id="features" className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 px-8 max-w-7xl mx-auto pb-32">
        <div className="p-8 rounded-2xl bg-[#131317] border border-[#ffffff08] hover:border-[#ff924922] transition-all group">
          <div className="w-12 h-12 bg-[#ff924915] rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">⚡</div>
          <h3 className="text-xl font-bold mb-3 font-[Space_Grotesk]">Zero-Lag Sync</h3>
          <p className="text-[#acaab0] text-sm leading-relaxed">Multi-user cursor tracking and text synchronization powered by CRDTs.</p>
        </div>
        <div className="p-8 rounded-2xl bg-[#131317] border border-[#ffffff08] hover:border-[#f9cc6122] transition-all group">
          <div className="w-12 h-12 bg-[#f9cc6115] rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">🛰️</div>
          <h3 className="text-xl font-bold mb-3 font-[Space_Grotesk]">Cloud Execution</h3>
          <p className="text-[#acaab0] text-sm leading-relaxed">Run and preview your code instantly in isolated secure browser environments.</p>
        </div>
        <div className="p-8 rounded-2xl bg-[#131317] border border-[#ffffff08] hover:border-[#ffcd6322] transition-all group">
          <div className="w-12 h-12 bg-[#ffcd6315] rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">⚔️</div>
          <h3 className="text-xl font-bold mb-3 font-[Space_Grotesk]">Team Pair-Play</h3>
          <p className="text-[#acaab0] text-sm leading-relaxed">Integrated voice, chat, and presence to solve the hardest bugs together.</p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 px-8 py-16 border-t border-[#ffffff08] max-w-7xl mx-auto w-full text-center">
        <p className="text-[#acaab0] text-xs font-semibold tracking-widest uppercase mb-4">Handcrafted by CollabCode Engineers</p>
        <div className="flex justify-center gap-6 text-[#acaab0] text-[10px] font-bold tracking-widest uppercase">
          <a href="#" className="hover:text-[#ff9249]">Status</a>
          <a href="#" className="hover:text-[#ff9249]">Terms</a>
          <a href="#" className="hover:text-[#ff9249]">Discord</a>
        </div>
      </footer>

      {/* --- Styles for Animations --- */}
      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          background-size: 200% auto;
          animation: gradient-flow 6s linear infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}