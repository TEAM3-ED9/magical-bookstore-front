import { useState } from "react"
import BookSpine from "@/components/BookSpine"
import BookPopup from "@/components/BookPopup"

const magicBooks = [
  {
    id: 1,
    title: "Encantamientos Avanzados",
    author: "Filius Flitwick",
    year: "1876",
    house: "Ravenclaw",
    color: "#0A1428", // Darker Ravenclaw blue
    accent: "#704D1F", // Darker Ravenclaw bronze
    description:
      "Una colección de hechizos complejos para magos avanzados. Incluye encantamientos de levitación de nivel superior y hechizos de transformación parcial.",
  },
  {
    id: 2,
    title: "Teoría de la Transfiguración",
    author: "Minerva McGonagall",
    year: "1956",
    house: "Gryffindor",
    color: "#4A0000", // Darker Gryffindor red
    accent: "#9E7A1D", // Darker Gryffindor gold
    description:
      "Un tratado completo sobre los principios de la transfiguración y sus aplicaciones prácticas en el combate mágico.",
  },
  {
    id: 3,
    title: "Astronomía Mágica",
    author: "Aurora Sinistra",
    year: "1923",
    house: "Ravenclaw",
    color: "#071022", // Darker Ravenclaw blue
    accent: "#7D6530", // Darker Ravenclaw bronze
    description:
      "Un estudio detallado sobre la influencia de los cuerpos celestes en la magia y pociones. Incluye mapas estelares encantados.",
  },
  {
    id: 4,
    title: "Runas Antiguas",
    author: "Bathsheda Babbling",
    year: "1782",
    house: "Ravenclaw",
    color: "#1A2A4D", // Darker Ravenclaw blue
    accent: "#9E7F28", // Darker Ravenclaw bronze
    description:
      "La guía definitiva para traducir y comprender runas mágicas antiguas y sus aplicaciones en hechizos modernos.",
  },
  {
    id: 5,
    title: "Pociones Avanzadas",
    author: "Severus Snape",
    year: "1985",
    house: "Slytherin",
    color: "#0A2415", // Darker Slytherin green
    accent: "#707070", // Darker Slytherin silver
    description:
      "Manual de preparación de pociones complejas con anotaciones personales del Maestro de Pociones de Hogwarts.",
  },
  {
    id: 6,
    title: "Historia de Hogwarts",
    author: "Bathilda Bagshot",
    year: "1899",
    house: "Hufflepuff",
    color: "#AA8800", // Darker Hufflepuff yellow
    accent: "#000000", // Hufflepuff black
    description:
      "La edición completa sobre la historia de Hogwarts, sus fundadores y las cuatro casas a lo largo de los siglos.",
  },
  {
    id: 7,
    title: "Criaturas Fantásticas",
    author: "Newt Scamander",
    year: "1927",
    house: "Hufflepuff",
    color: "#A67D26", // Darker Hufflepuff gold
    accent: "#1A1A1A", // Hufflepuff black
    description:
      "Enciclopedia ilustrada de criaturas mágicas con anotaciones especiales sobre sus propiedades mágicas y usos en pociones.",
  },
  {
    id: 8,
    title: "Venenos y Antídotos",
    author: "Horace Slughorn",
    year: "1957",
    house: "Slytherin",
    color: "#1A3A25", // Darker Slytherin green
    accent: "#808080", // Darker Slytherin silver
    description:
      "Compendio detallado de venenos mágicos y sus antídotos, con notas sobre ingredientes raros y técnicas de preparación.",
  },
  {
    id: 9,
    title: "Adivinación Avanzada",
    author: "Sybill Trelawney",
    year: "1993",
    house: "Ravenclaw",
    color: "#0A1530", // Darker Ravenclaw blue
    accent: "#A67D15", // Darker Ravenclaw bronze
    description:
      "Métodos de adivinación poco conocidos y técnicas para potenciar la visión interior, con un capítulo especial sobre profecías.",
  },
  {
    id: 10,
    title: "Herbología Mágica",
    author: "Pomona Sprout",
    year: "1976",
    house: "Hufflepuff",
    color: "#AA8C42", // Darker Hufflepuff yellow
    accent: "#252015", // Darker Hufflepuff dark
    description:
      "Guía completa de plantas mágicas raras y sus propiedades, con énfasis en especies que potencian la concentración y sabiduría.",
  },
  {
    id: 11,
    title: "Defensa Contra Artes Oscuras",
    author: "Remus Lupin",
    year: "1993",
    house: "Gryffindor",
    color: "#6A0000", // Darker Gryffindor red
    accent: "#AA8522", // Darker Gryffindor gold
    description:
      "Tratado académico sobre defensas mágicas avanzadas, con capítulos sobre contra-maldiciones y escudos protectores.",
  },
  {
    id: 12,
    title: "Secretos de la Magia Oscura",
    author: "Salazar Slytherin",
    year: "1032",
    house: "Slytherin",
    color: "#073A0E", // Darker Slytherin green
    accent: "#707070", // Darker Slytherin silver
    description:
      "Un antiguo manuscrito con hechizos y encantamientos de magia oscura, conservado a través de los siglos por los descendientes de Slytherin.",
  },
]

export default function BookShelf() {
  const [activeBook, setActiveBook] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  const handleBookHover = (id, event) => {
    const element = event
    const rect = element.currentTarget.getBoundingClientRect()

    setActiveBook(id)
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleBookLeave = () => {
    setActiveBook(null)
  }

  return (
    <div className="relative">
      <div className="bg-[#5D4037] p-4 rounded-lg shadow-xl">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1 md:gap-2">
          {magicBooks.map((book) => (
            <BookSpine
              key={book.id}
              book={book}
              onMouseEnter={(e) => handleBookHover(book.id, e)}
              onMouseLeave={handleBookLeave}
            />
          ))}
        </div>
      </div>

      {activeBook !== null && magicBooks.find((b) => b.id === activeBook) && (
        <BookPopup
          book={magicBooks.find((b) => b.id === activeBook)}
          position={popupPosition}
        />
      )}
    </div>
  )
}
