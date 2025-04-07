import React, { useState, useEffect } from "react";

const BookSearch = ({ setFilteredBooks }) => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const url = "http://localhost/books";

  useEffect(() => {
    const fetchBooks = async () => {
      if (searchTerm.trim() === "") {
        setBooks([]);
        return;
      }
      try {
        const [titleRes, authorRes] = await Promise.all([
          fetch(`${url}/title?title=${searchTerm}`),
          fetch(`${url}/author?author=${searchTerm}`),
        ]);

        const titleData = await titleRes.json();
        const authorData = await authorRes.json();

        const combinedData = [...titleData, ...authorData].filter(
          (book, index, self) =>
            index === self.findIndex((b) => b.id === book.id)
        );
        setBooks(combinedData);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, [searchTerm]);

  useEffect(() => {
    const results = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchTerm, books, setFilteredBooks]);

  return (
    <div className="mb-4 p-4 bg-[#5D4037] rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Search a book</h2>
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Search by title or author..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default BookSearch;
