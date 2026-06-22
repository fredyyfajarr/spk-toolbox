import Link from "next/link";
import { ArrowRight, BarChart3, Layers, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1 relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:bg-slate-950 dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-30" />
        
        {/* Hero Section */}
        <div className="container mx-auto flex flex-col items-center justify-center pt-32 pb-20 text-center relative z-10 px-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-600 drop-shadow-sm pb-2 animate-in slide-in-from-bottom-3 duration-500 max-w-5xl">
            Sistem Penunjang Keputusan Terlengkap
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto font-medium animate-in slide-in-from-bottom-4 duration-700">
            Hitung, evaluasi, dan bandingkan alternatif secara instan dengan 13 metode SPK termasuk <span className="font-bold text-foreground">Profile Matching, MOORA, SAW, TOPSIS, WP, AHP, SMART, WASPAS, ARAS, VIKOR, EDAS, PROMETHEE, hingga ELECTRE.</span>
          </p>
          
          <div className="mt-10 shrink-0 flex items-center justify-center animate-in slide-in-from-bottom-5 duration-1000">
            <Link 
              href="/projects" 
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-medium text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:bg-primary/90 hover:-translate-y-0.5"
            >
              Mulai Analisis Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">13 Metode SPK</h3>
                <p className="text-muted-foreground">Mendukung berbagai macam algoritma pengambilan keputusan terbaik, dari metode klasik hingga modern.</p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Layers className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Dinamis & Fleksibel</h3>
                <p className="text-muted-foreground">Kelola kriteria benefit/cost, target profil (Profile Matching), serta bobot yang dapat disesuaikan.</p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Akurasi & Perbandingan</h3>
                <p className="text-muted-foreground">Bandingkan hasil dari setiap metode untuk memastikan akurasi dan presisi keputusan Anda.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
