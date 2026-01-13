
import React, { useState, useEffect } from 'react';

const SLIDES = [
    {
        id: 1,
        image: '/hero-wall-panel.png',
        title: 'Painel de Macramê Exclusivo',
        subtitle: 'Arte autêntica em nós e tramas, trazendo elegância e personalidade para sua sala.'
    },
    {
        id: 2,
        image: '/hero-plant-hanger.png',
        title: 'Suportes para Plantas',
        subtitle: 'Dê vida nova ao seu jardim interno com suportes tecidos à mão com alma.'
    },
    {
        id: 3,
        image: '/hero-table-set.png',
        title: 'Mesa Posta com Charme',
        subtitle: 'Sousplat, porta-talher e porta-copos em macramê para momentos inesquecíveis em família.'
    }
];

interface HeroSliderProps {
    onCtaClick: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onCtaClick }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="px-4 md:px-10 py-10">
            <div className="max-w-7xl mx-auto relative group">
                <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                    {SLIDES.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out"
                                style={{
                                    backgroundImage: `url('${slide.image}')`,
                                    transform: index === current ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                                <div className={`transition-all duration-1000 delay-300 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                    {index === 0 && <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-4 block">Feito à Mão com Alma</span>}
                                    <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight max-w-4xl mx-auto">
                                        {slide.title}
                                    </h1>
                                    <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                                        {slide.subtitle}
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={onCtaClick}
                                            className="bg-primary hover:bg-primary-dark text-black font-bold py-4 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(200,100,50,0.3)] hover:shadow-[0_0_30px_rgba(200,100,50,0.5)] hover:-translate-y-1"
                                        >
                                            Ver Coleção
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {SLIDES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === current ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Arrows */}
                    <button
                        onClick={() => setCurrent(prev => (prev - 1 + SLIDES.length) % SLIDES.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                        onClick={() => setCurrent(prev => (prev + 1) % SLIDES.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
        </section>
    );
};
