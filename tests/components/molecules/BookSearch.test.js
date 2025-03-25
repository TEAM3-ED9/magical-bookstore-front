import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookSearch from './BookSearch'; // Asegúrate de que la ruta sea correcta

describe('BookSearch Component', () => {
  const mockBooks = [
    { id: 1, title: 'Pociones Avanzadas', author: 'H. Granger', description: 'Un libro sobre pociones mágicas.', isLocked: false },
    { id: 2, title: 'Criaturas Mágicas', author: 'R. Hagrid', description: 'Guía de criaturas mágicas.', isLocked: true },
  ];

  beforeEach(() => {
    // Simular la llamada a la API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockBooks),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('debe renderizar el componente y mostrar la lista de libros', async () => {
    render(<BookSearch />);

    const input = screen.getByPlaceholderText(/Buscar por título o autor/i);
    expect(input).toBeInTheDocument();

    const bookTitle = await screen.findByText(/Pociones Avanzadas/i);
    expect(bookTitle).toBeInTheDocument();
  });

  test('debe filtrar libros por título', async () => {
    render(<BookSearch />);

    const input = screen.getByPlaceholderText(/Buscar por título o autor/i);
    fireEvent.change(input, { target: { value: 'Pociones' } });

    const bookTitle = await screen.findByText(/Pociones Avanzadas/i);
    expect(bookTitle).toBeInTheDocument();

    const lockedBook = screen.queryByText(/Criaturas Mágicas/i);
    expect(lockedBook).not.toBeInTheDocument();
  });

  test('debe filtrar libros por autor', async () => {
    render(<BookSearch />);

    const input = screen.getByPlaceholderText(/Buscar por título o autor/i);
    fireEvent.change(input, { target: { value: 'Hagrid' } });

    const bookTitle = await screen.findByText(/Criaturas Mágicas/i);
    expect(bookTitle).toBeInTheDocument();
  });
});