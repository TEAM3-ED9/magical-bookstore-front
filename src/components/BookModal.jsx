import { useEffect, useState } from "react"; // ✅ Importa useState
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BookModal({ isOpen, onClose, book, isBlocked, onAnswerSubmit }) {

  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [errorLoadingQuestion, setErrorLoadingQuestion] = useState(null);
  const isBloqued = book.status = 1;

  const getBookSize = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) {
        return { width: "95vw", height: "80vh" };
      } else if (window.innerWidth < 768) {
        return { width: "90vw", height: "70vh" };
      }
    }
    return { width: "700px", height: "450px" };
  };

  const bookSize = getBookSize();

  const bookContent = [
    {
      leftPage: {
        title: book?.title ?? "",
        content: `By ${book?.author ?? ""}`,
        index: 1,
      },
      rightPage: {
        title: isBlocked? "Hello, young wizard! This book is not for beginners. You must answer this question before to read it..." : "Description", // ✅ Título de la página derecha cambia si está bloqueado
        content: isBlocked
          ? question // ✅ Si está bloqueado, muestra la pregunta
            ? question
            : isLoadingQuestion
              ? "Loading question..." // ✅ Mensaje de carga
              : errorLoadingQuestion
                ? `Error: ${errorLoadingQuestion}` // ✅ Mensaje de error
                : "This book is locked. Answer the question to unlock it." // ✅ Mensaje inicial si no hay pregunta
          : book?.description ?? "", // ✅ Si no está bloqueado, muestra la descripción
        index: 2,
      },
    },
  ];

  // ✅ useEffect para cargar la pregunta cuando el modal se abre y el libro está bloqueado
  useEffect(() => {
    if (isOpen && book && isBlocked) {
      setIsLoadingQuestion(true);
      setErrorLoadingQuestion(null);
      fetch(`/api/books/${book.id}/question`) // ⚠️ Reemplaza con tu endpoint real
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setQuestion(data.question);
          setIsLoadingQuestion(false);
        })
        .catch((error) => {
          console.error("Error fetching question:", error);
          setErrorLoadingQuestion(error.message);
          setIsLoadingQuestion(false);
        });
    } else {
      setQuestion(null);
      setAnswer(''); // ✅ Resetear la respuesta al cerrar o si no está bloqueado
      setIsLoadingQuestion(false);
      setErrorLoadingQuestion(null);
    }
  }, [isOpen, book, isBlocked]); // ✅ Dependencias del useEffect incluyen isBlocked

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ✅ Función para manejar el envío de la respuesta
  const handleAnswerSubmit = () => {
    if (book && onAnswerSubmit && answer) {
      onAnswerSubmit(book.id, answer);
      setAnswer(''); // ✅ Limpiar el input después de enviar
    }
  };

  // ✅ Función para actualizar el estado de la respuesta
  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          key="modal-container"
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50 cursor-pointer"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-label="Close book"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onClose();
            }}
          />

          {/* Book Container */}
          <motion.div
            className="relative z-10"
            style={{ perspective: "2000px" }}
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{
              scale: 0.8,
              y: 50,
              opacity: 0,
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
          >
            <motion.div
              className="relative flex bg-amber-900 px-4 py-2 rounded-sm"
              style={{
                width: bookSize.width,
                height: bookSize.height,
                transformStyle: "preserve-3d",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
              }}
              initial={{ rotateX: 30, rotateY: 0 }}
              animate={{ rotateX: 0, rotateY: 0 }}
              exit={{
                rotateX: 30,
                transition: { duration: 0.3, ease: "easeIn" },
              }}
            >
              <div
                className="absolute inset-0 shadow-inner"
                style={{ zIndex: -1 }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key="spread-0"
                  className="flex w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Left Page */}
                  <motion.div
                    className="w-1/2 h-full bg-amber-50 p-8 flex flex-col border-r-2 rounded-xl border-amber-900/20 overflow-y-auto"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 70,
                      damping: 15,
                      mass: 0.8,
                      delay: 0.15,
                    }}
                    style={{ transformOrigin: "right center" }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-4">
                      {bookContent[0].leftPage.title}
                    </h2>
                    <p className="text-emerald-900 font-serif flex-grow">
                      {bookContent[0].leftPage.content}
                    </p>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-amber-900/10">
                      <button
                        onClick={() => {}}
                        disabled
                        className="p-2 rounded-full text-emerald-900 opacity-30 cursor-not-allowed"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-sm text-emerald-800 font-serif">
                        {bookContent[0].leftPage.index}
                      </span>
                    </div>
                  </motion.div>

                  {/* Right Page */}
                  <motion.div
                    className="w-1/2 h-full bg-amber-50 p-8 flex flex-col border-l-2 rounded-xl border-amber-900/20 overflow-y-auto"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 70,
                      damping: 15,
                      mass: 0.8,
                      delay: 0.15,
                    }}
                    style={{ transformOrigin: "left center" }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-4">
                      {bookContent[0].rightPage.title}
                    </h2>
                    <p className="text-emerald-900 font-serif flex-grow mb-4">
                      {bookContent[0].rightPage.content}
                    </p>

                    {/* ✅ Sección para la respuesta si el libro está bloqueado y la pregunta está cargada */}
                    {isBlocked && question && (
                      <div className="mb-4">
                        <label
                          htmlFor="answer"
                          className="block text-gray-700 text-sm font-bold mb-2 font-serif"
                        >
                          Your Answer:
                        </label>
                        <input
                          type="text"
                          id="answer"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-serif"
                          value={answer}
                          onChange={handleAnswerChange}
                        />
                      </div>
                    )}

                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-amber-900/10">
                      <span className="text-sm text-emerald-800 font-serif">
                        {bookContent[0].rightPage.index}
                      </span>
                      <button
                        onClick={isBlocked && question ? handleAnswerSubmit : () => {}} // ✅ Llama a handleAnswerSubmit si está bloqueado y hay pregunta
                        disabled={isBlocked && !question} // ✅ Deshabilita el botón si está bloqueado pero no hay pregunta
                        className={`p-2 rounded-full text-emerald-900 ${
                          isBlocked && question ? "cursor-pointer" : "opacity-30 cursor-not-allowed"
                        }`}
                        aria-label={isBlocked ? "Submit Answer" : "Next page"}
                      >
                        {isBlocked && question ? "Submit" : <ChevronRight size={20} />}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}