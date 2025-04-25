/**
 * A functional React component that displays a message indicating that no books were found.
 *
 * @component
 * @returns {React.ReactElement} A styled div containing a message for when books are not found.
 */
export default function BooksNotFound() {
  return (
    <div className='col-span-full rounded-md w-full text-lg bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm'>
      <p>Magical books not found at the library, try another name</p>
    </div>
  )
}
