import React, { useState, useEffect } from 'react';

const BookSearch = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const response = await fetch('/api/books'); // Cambia esto por tu endpoint real
      const data = await response.json();
      setBooks(data);
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const results = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchTerm, books]);

  return (
    <div>
      <h1>Biblioteca Encantada</h1>
      <input
        type="text"
        placeholder="Buscar por título o autor"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredBooks.map(book => (
          <li key={book.id}>
            <h2>{book.title}</h2>
            <p>Autor: {book.author}</p>
            <p>{book.description}</p>
            <p>Estado: {book.isLocked ? 'Bloqueado' : 'Disponible'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookSearch;