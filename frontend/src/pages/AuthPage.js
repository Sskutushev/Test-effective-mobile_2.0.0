import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../AuthPage.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  const leftPanelStyle = {
    backgroundImage: `url(/favicon.ico)`
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-left-panel" style={leftPanelStyle}>
          <Link to="/" className="btn btn-back">
            &larr; Назад
          </Link>
        </div>
        <div className="auth-right-panel">
          <div className="auth-tabs">
            <button onClick={() => setActiveTab('login')} className={activeTab === 'login' ? 'active' : ''}>Авторизация</button>
            <button onClick={() => setActiveTab('register')} className={activeTab === 'register' ? 'active' : ''}>Регистрация</button>
          </div>
          {activeTab === 'login' ? (
            <div className="auth-form">
              <h2>Авторизация</h2>
              <input type="text" placeholder="Логин" />
              <input type="password" placeholder="Пароль" />
              <div className="auth-options">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Сохранить данные для входа</label>
              </div>
              <button className="btn btn-primary">Войти</button>
            </div>
          ) : (
            <div className="auth-form">
              <h2>Регистрация</h2>
              <input type="text" placeholder="ФИО" />
              <input type="email" placeholder="Почта" />
              <input type="date" placeholder="Дата рождения" />
              <input type="password" placeholder="Пароль" />
              <input type="password" placeholder="Подтвердить пароль" />
              <div className="auth-options">
                <input type="checkbox" id="rules" />
                <label htmlFor="rules">Соглашаюсь с правилами платформы</label>
              </div>
              <div className="auth-options">
                <input type="checkbox" id="data" />
                <label htmlFor="data">Соглашаюсь на обработку данных</label>
              </div>
              <button className="btn btn-primary">Зарегистрироваться</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
