import React from 'react';
import './LandingScreen.css';

interface LandingScreenProps {
  onEnterApp: () => void;
}

export function LandingScreen({ onEnterApp }: LandingScreenProps) {
  const scrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper">
      <header>
        <nav>
          <div className="logo">
            AngraFit <span>Trainer</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="#inicio" onClick={(e) => scrollTo('inicio', e)}>
                Início
              </a>
            </li>
            <li>
              <a href="#recursos" onClick={(e) => scrollTo('recursos', e)}>
                Recursos
              </a>
            </li>
            <li>
              <a href="#precos" onClick={(e) => scrollTo('precos', e)}>
                Planos
              </a>
            </li>
            <li>
              <button onClick={onEnterApp} className="btn-header">
                Acessar App
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-content">
          <h1>
            Domine seu Negócio de <span>Personal Trainer</span>
          </h1>
          <p>A plataforma completa para gerenciar alunos, treinos, dietas e pagamentos com uma interface de alta performance.</p>
          <div className="hero-buttons">
            <button onClick={(e) => scrollTo('precos', e as any)} className="btn btn-primary">
              Começar Agora
            </button>
            <button onClick={(e) => scrollTo('recursos', e as any)} className="btn btn-secondary">
              Ver Recursos
            </button>
          </div>
        </div>
      </section>

      <section className="features" id="recursos">
        <div className="section-title">
          <h2>
            Tecnologia para sua <span>Consultoria</span>
          </h2>
          <p>Tudo o que você precisa em um único ecossistema integrado.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-dumbbell feature-icon"></i>
            <h3>Gestão de Treinos</h3>
            <p>Crie planos de treinamento personalizados ou utilize nossa IA para gerar rotinas otimizadas em segundos.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-apple-alt feature-icon"></i>
            <h3>Planos Alimentares</h3>
            <p>Controle de dietas e macronutrientes com banco de dados de alimentos integrado para seus alunos.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-qrcode feature-icon"></i>
            <h3>Pagamentos Instantâneos</h3>
            <p>Gestão de mensalidades via Pix e links de pagamento com notificação automática de recebimento.</p>
          </div>
        </div>
      </section>

      <section className="pricing" id="precos">
        <div className="section-title">
          <h2>
            Planos que <span>Evoluem</span> com Você
          </h2>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Bronze</h3>
            <div className="price">
              R$ 19,99<span>/mês</span>
            </div>
            <ul className="pricing-features">
              <li>
                <i className="fas fa-check"></i> Até 10 Alunos
              </li>
              <li>
                <i className="fas fa-check"></i> Gestão de Treinos
              </li>
              <li>
                <i className="fas fa-check"></i> Suporte via Chat
              </li>
            </ul>
            <button className="btn btn-secondary">Selecionar</button>
          </div>
          <div className="pricing-card featured">
            <h3>Ouro (Recomendado)</h3>
            <div className="price">
              R$ 29,99<span>/mês</span>
            </div>
            <ul className="pricing-features">
              <li>
                <i className="fas fa-check"></i> Alunos Ilimitados
              </li>
              <li>
                <i className="fas fa-check"></i> IA de Treinos e Dietas
              </li>
              <li>
                <i className="fas fa-check"></i> Gestão Financeira Completa
              </li>
              <li>
                <i className="fas fa-check"></i> Editor de PDF Personalizado
              </li>
            </ul>
            <button className="btn btn-primary">Começar Teste Grátis</button>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Pronto para elevar seu nível?</h2>
        <button onClick={onEnterApp} className="btn btn-primary">
          Entrar no Sistema Profissional
        </button>
      </section>

      <footer>
        <p>&copy; 2026 AngraFit Trainer. Desenvolvido para os melhores profissionais do fitness.</p>
      </footer>

      {/* Botão WhatsApp */}
      <a href="https://wa.me/5551997222728" className="whatsapp-btn" target="_blank" rel="noopener noreferrer" aria-label="Fale conosco no WhatsApp">
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  );
}
