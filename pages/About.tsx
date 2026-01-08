
import React from 'react';
import { View } from '../types';
import { Reveal } from '../components/UI/Reveal';

interface AboutProps {
   navigateTo: (view: View) => void;
}

const About: React.FC<AboutProps> = ({ navigateTo }) => {
   return (
      <div className="flex flex-col">
         <section className="relative w-full">
            <Reveal>
               <div className="px-4 py-6 md:px-10 md:py-10 max-w-7xl mx-auto">
                  <div
                     className="flex min-h-[500px] flex-col bg-cover bg-center rounded-3xl items-center justify-center p-8 text-center relative overflow-hidden"
                     style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBAwQCAkOWgQRaRIq4bsQiovuD8Ge91Jl8uOM8Q82_tlzEPnEdDyU-xnnPH9xQQv8JUYgIfngWVfSzQg87ysiH24welQ140BWLI77Cv3vad1uNKonIACdIfkvIwtSyMT3vo6p4FAOYpixhx4pfFtziL7BWXGyviPl6LhrpkqbgtEmQu7y_OUKiyCK64DmTzU1K_BvkaaaM_8WONrOjZ03D_QcUdIDAYRyfuw2hp_4QtsVxTDViDiAOI2bdiRHmHBlCLaZxkM4xLiRc')` }}
                  >
                     <div className="z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-white text-4xl md:text-6xl font-black mb-4">Entre Nós e Nós</h1>
                        <p className="text-white/90 text-xl max-w-2xl mx-auto">Uma jornada de fios, paciência e muita paixão pelo feito à mão. Descubra a alma por trás de cada nó.</p>
                     </div>
                  </div>
               </div>
            </Reveal>
         </section>

         <section className="py-20 px-4 max-w-7xl mx-auto">
            <Reveal>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div className="order-2 md:order-1 flex flex-col gap-6">
                     <h2 className="text-4xl font-black dark:text-white">Nossa História</h2>
                     <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Tudo começou em uma tarde chuvosa, com apenas um rolo de barbante e muita curiosidade. O que era um passatempo para acalmar a mente virou nossa forma de expressar arte.
                     </p>
                     <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Descobrimos que entrelaçar fios é mais do que criar formas; é tecer conexões. Hoje, cada peça que sai do nosso ateliê leva um pouco dessa tranquilidade e beleza para lares em todo o país.
                     </p>
                     <div className="flex gap-4 pt-4">
                        <div className="flex flex-col items-center">
                           <span className="material-symbols-outlined text-primary text-4xl">eco</span>
                           <span className="text-xs font-bold mt-2 dark:text-white uppercase">Sustentável</span>
                        </div>
                        <div className="w-px h-12 bg-gray-100 dark:bg-gray-800 mx-4"></div>
                        <div className="flex flex-col items-center">
                           <span className="material-symbols-outlined text-primary text-4xl">favorite</span>
                           <span className="text-xs font-bold mt-2 dark:text-white uppercase">Afetivo</span>
                        </div>
                        <div className="w-px h-12 bg-gray-100 dark:bg-gray-800 mx-4"></div>
                        <div className="flex flex-col items-center">
                           <span className="material-symbols-outlined text-primary text-4xl">gesture</span>
                           <span className="text-xs font-bold mt-2 dark:text-white uppercase">Artesanal</span>
                        </div>
                     </div>
                  </div>
                  <div className="order-1 md:order-2">
                     <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                        <img src="https://picsum.photos/1000/1000?random=artisan" className="w-full h-full object-cover" alt="Artesã" />
                     </div>
                  </div>
               </div>
            </Reveal>
         </section>

         <section className="bg-text dark:bg-surface-dark py-20 px-4 text-white">
            <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
               <h2 className="text-4xl font-black mb-12">Nossos Valores</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <Reveal delay={0.1}>
                     <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <span className="material-symbols-outlined text-primary text-5xl mb-4">compost</span>
                        <h3 className="text-xl font-bold mb-2">Respeito à Natureza</h3>
                        <p className="text-gray-400">Usamos algodão 100% orgânico e madeiras de reflorestamento em todas as nossas peças.</p>
                     </div>
                  </Reveal>
                  <Reveal delay={0.2}>
                     <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <span className="material-symbols-outlined text-primary text-5xl mb-4">auto_awesome</span>
                        <h3 className="text-xl font-bold mb-2">Exclusividade</h3>
                        <p className="text-gray-400">Como nada é feito em série, cada nó tem sua própria tensão e história. Você leva uma peça única.</p>
                     </div>
                  </Reveal>
                  <Reveal delay={0.3}>
                     <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <span className="material-symbols-outlined text-primary text-5xl mb-4">volunteer_activism</span>
                        <h3 className="text-xl font-bold mb-2">Cuidado Humano</h3>
                        <p className="text-gray-400">Valorizamos o tempo do artesão e o carinho em cada detalhe, da tecelagem à embalagem final.</p>
                     </div>
                  </Reveal>
               </div>
            </div>
         </section>

         <section className="py-20 px-4 text-center">
            <Reveal>
               <div>
                  <h2 className="text-3xl font-black dark:text-white mb-6">Pronto para transformar seu lar?</h2>
                  <button
                     onClick={() => navigateTo('shop')}
                     className="bg-primary hover:bg-primary-dark text-black font-bold py-4 px-12 rounded-xl shadow-lg"
                  >
                     Explorar Coleção
                  </button>
               </div>
            </Reveal>
         </section>
      </div>
   );
};

export default About;
