import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-slate-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 h-6 w-32 bg-slate-800 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="animate-pulse h-[500px] w-full bg-slate-800 rounded-2xl border border-slate-700" />
          <div className="space-y-6">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-800 animate-pulse rounded" />
              <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
            </div>
            <div className="h-12 w-3/4 bg-slate-800 animate-pulse rounded" />
            <div className="h-4 w-32 bg-slate-800 animate-pulse rounded" />
            <div className="h-32 w-full max-w-[300px] bg-slate-900 animate-pulse rounded-xl" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-900 animate-pulse rounded-lg" />
              <div className="h-20 bg-slate-900 animate-pulse rounded-lg" />
            </div>

            <div className="space-y-3">
              <div className="h-6 w-32 bg-slate-800 animate-pulse rounded" />
              <div className="h-24 w-full bg-slate-800 animate-pulse rounded" />
            </div>

            <div className="flex gap-4">
              <div className="h-14 flex-[1.5] bg-slate-800 animate-pulse rounded-xl" />
              <div className="h-14 flex-1 bg-slate-800 animate-pulse rounded-xl" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
