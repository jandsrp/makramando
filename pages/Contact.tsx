
import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
      <div className="flex flex-col gap-12">
        <section className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight dark:text-white">
              Vamos criar algo <span className="text-primary relative inline-block">juntos?
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-40" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path>
                </svg>
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
              Tem dúvidas sobre uma peça ou quer encomendar um macramê personalizado? Preencha o formulário ou nos chame no WhatsApp.
            </p>
          </div>
          <div className="hidden lg:block w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl rotate-3">
            <img
              src="/assets/macrame-plant-hanger.jpg"
              alt="Suporte de Planta Macramê"
              className="w-full h-full object-cover scale-150 origin-right"
              style={{ objectPosition: '100% 50%' }}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Info Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h3 className="text-xl font-bold dark:text-white">Canais de Atendimento</h3>
            <div className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">E-mail</p>
                <p className="font-bold dark:text-white">oi@macramestore.com</p>
              </div>
            </div>
            <div className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">call</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">WhatsApp</p>
                <p className="font-bold dark:text-white">(11) 99999-9999</p>
              </div>
            </div>
            <div className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">share</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Redes Sociais</p>
                <p className="font-bold dark:text-white">@macramestore</p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden mt-6 aspect-video">
              <img src="/assets/macrame-panel.png" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <p className="text-white font-bold">Feito à mão com carinho e algodão natural.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-surface-dark p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">Envie sua mensagem</h2>
              <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold dark:text-white">Seu Nome</span>
                    <input className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white h-14" placeholder="fulana Silva" />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold dark:text-white">Seu E-mail</span>
                    <input className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white h-14" placeholder="fulana@email.com" />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold dark:text-white">Sobre o que vamos falar?</span>
                  <select className="form-select rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white h-14">
                    <option>Selecione um assunto</option>
                    <option>Encomenda Personalizada</option>
                    <option>Dúvida sobre Produto</option>
                    <option>Minha Compra</option>
                    <option>Parceria</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold dark:text-white">Sua Mensagem</span>
                  <textarea rows={5} className="form-textarea rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white" placeholder="Olá, gostaria de saber mais sobre..." />
                </label>
                <button className="bg-primary hover:bg-primary-dark text-black font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:translate-y-[-2px]">
                  Enviar Mensagem
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
