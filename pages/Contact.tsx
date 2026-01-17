import React from 'react';
import { supabase } from '../services/supabase';

interface ContactProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Contact: React.FC<ContactProps> = ({ showToast }) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Selecione um assunto',
    message: ''
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);

    // Mask: (99) 99999-9999
    let masked = val;
    if (val.length > 2) {
      masked = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    if (val.length > 7) {
      masked = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    }

    setFormData({ ...formData, phone: masked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Subjects
    if (formData.subject === 'Selecione um assunto') {
      showToast('Por favor, selecione um assunto.', 'info');
      return;
    }

    // 2. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Por favor, insira um e-mail válido.', 'error');
      return;
    }

    setLoading(true);
    try {
      // 3. Web3Forms Submission
      const web3Key = import.meta.env.VITE_WEB3FORMS_KEY;
      if (web3Key && web3Key !== 'YOUR_KEY_HERE') {
        const web3Response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: web3Key,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: `Novo Contato: ${formData.subject}`,
            message: formData.message,
            from_name: 'Makramando Site',
            replyto: formData.email
          })
        });

        const web3Result = await web3Response.json();
        if (!web3Result.success) {
          console.warn('Web3Forms failed:', web3Result.message);
        }
      }

      // 4. Define Recipients (for database logging)
      const notificationRecipients = ['sandrareginarr@gmail.com', 'jandsrp@gmail.com'];

      // 5. Save Message to Supabase (Backup & Log)
      const { error: msgError } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          recipients: notificationRecipients
        }]);

      if (msgError) throw msgError;

      // 6. Manage Lead
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (!existingLead) {
        await supabase
          .from('leads')
          .insert([{
            name: formData.name,
            email: formData.email.toLowerCase(),
            phone: formData.phone
          }]);
      }

      showToast('Mensagem enviada com sucesso! Você receberá um e-mail em breve.', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Selecione um assunto',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Erro ao enviar mensagem. Tente novamente mais tarde.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
                <p className="font-bold dark:text-white">sandrareginarr@gmail.com</p>
              </div>
            </div>
            <a
              href="https://wa.me/5521997657494"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <div className="size-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                <svg className="size-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">WhatsApp</p>
                <p className="font-bold dark:text-white">(21) 99765-7494</p>
              </div>
            </a>
            <div className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">share</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Instagram</p>
                <p className="font-bold dark:text-white">@makramando.rj</p>
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
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold dark:text-white">Seu Nome</span>
                    <input
                      required
                      className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white h-14"
                      placeholder="Fulana Silva"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold dark:text-white">Seu E-mail</span>
                    <input
                      required
                      type="email"
                      className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white h-14"
                      placeholder="fulana@email.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold dark:text-white">WhatsApp / Telefone</span>
                    <input
                      required
                      className="form-input rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white h-14"
                      placeholder="(21) 99999-9999"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold dark:text-white">Sobre o que vamos falar?</span>
                    <select
                      required
                      className="form-select rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white h-14"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option disabled value="Selecione um assunto">Selecione um assunto</option>
                      <option>Encomenda Personalizada</option>
                      <option>Dúvida sobre Produto</option>
                      <option>Minha Compra</option>
                      <option>Parceria</option>
                    </select>
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold dark:text-white">Sua Mensagem</span>
                  <textarea
                    required
                    rows={5}
                    className="form-textarea rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white"
                    placeholder="Olá, gostaria de saber mais sobre..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-black font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:translate-y-[-2px] disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Mensagem'}
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
