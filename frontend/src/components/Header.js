import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="App-header">
      <h1><Link to="/">AlgoVerse</Link></h1>
      <nav>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/feed">Feed</Link>
        <Link to="/persons">Persons</Link>
        <Link to="/messages">Messages</Link>
        <Link to="/favorites">Favorites</Link>
        <Link to="/help">Help</Link>
      </nav>
    </header>
  );
};

export default Header;
