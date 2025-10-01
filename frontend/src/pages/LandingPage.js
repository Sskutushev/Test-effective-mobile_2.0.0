import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo">
          {/* Logo will be here */}
          <img src="/logo.png" alt="Logo" style={{height: '40px'}} />
        </div>
        <Link to="/auth" className="btn btn-login">Войти</Link>
      </header>
      <main className="hero-section">
        <h1>Превращая идеи в элегантные решения</h1>
        <p>Создаю удобные и красивые пользовательские интерфейсы (UI/UX), уделяя внимание каждой детали. Я специализируюсь на фронтенд-разработке, превращая дизайн-макеты в живые, интерактивные веб-страницы и приложения.</p>
        <Link to="/auth" className="btn btn-auth">Авторизоваться</Link>
      </main>
    </div>
  );
};

export default LandingPage;
