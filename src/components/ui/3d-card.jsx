import { cn } from '@/lib/utils'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

/**
 * Context for tracking mouse enter state in 3D card components
 * @type {React.Context<boolean>}
 */
const MouseEnterContext = createContext(undefined)

/**
 * Container component for 3D card effects that responds to mouse movement
 *
 * @example
 * <CardContainer>
 *   <CardBody>
 *     <CardItem translateZ={50}>Content</CardItem>
 *   </CardBody>
 * </CardContainer>
 *
 * @module CardContainer
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.className=''] - Additional classes for the inner container
 * @param {string} [props.containerClassName=''] - Additional classes for the outer container
 * @returns {React.ReactElement} A 3D card container component
 */
export const CardContainer = ({ children, className = '', containerClassName = '' }) => {
  const containerRef = useRef(null)
  const [isMouseEntered, setIsMouseEntered] = useState(false)

  /**
   * Handles mouse movement to create 3D tilt effect
   * @param {React.MouseEvent<HTMLDivElement>} e - React mouse event
   */
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / 10
    const y = -(e.clientY - rect.top - rect.height / 2) / 10
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`
  }

  /**
   * Handles mouse enter event
   */
  const handleMouseEnter = () => {
    setIsMouseEntered(true)
  }

  /**
   * Handles mouse leave event and resets transform
   */
  const handleMouseLeave = () => {
    setIsMouseEntered(false)
    if (containerRef.current) {
      containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`
    }
  }

  return (
    <MouseEnterContext.Provider value={isMouseEntered}>
      <div
        className={cn('flex items-center justify-center', containerClassName)}
        style={{ perspective: '1000px' }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn('relative transition-transform duration-300 ease-out', className)}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  )
}

/**
 * Body component for 3D cards that establishes dimensions
 *
 * @module CardBody
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.className=''] - Additional classes
 * @returns {React.ReactElement} A 3D card body component
 */
export const CardBody = ({ children, className = '' }) => {
  return <div className={cn('h-96 w-96', className)}>{children}</div>
}

/**
 * Item component for 3D cards with transform effects
 *
 * @module CardItem
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.className=''] - Additional classes
 * @param {number} [props.translateZ=0] - Z-axis translation in pixels
 * @param {number} [props.rotateX=0] - X-axis rotation in degrees
 * @param {number} [props.rotateY=0] - Y-axis rotation in degrees
 * @param {number} [props.rotateZ=0] - Z-axis rotation in degrees
 * @returns {React.ReactElement} A 3D card item component
 */
export const CardItem = ({
  children,
  className = '',
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0
}) => {
  /**
   * Reference to the item DOM element
   * @type {React.RefObject<HTMLDivElement>}
   */
  const ref = useRef(null)

  /**
   * Context value tracking mouse enter state
   * @type {boolean}
   */
  const isMouseEntered = useContext(MouseEnterContext)

  /**
   * Effect that applies 3D transforms when mouse enters
   */
  useEffect(() => {
    if (!ref.current) return
    if (isMouseEntered) {
      ref.current.style.transform = `translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
      ref.current.style.transition = 'transform 0.5s ease-out'
    } else {
      ref.current.style.transform = `translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`
    }
  }, [isMouseEntered])

  return (
    <div
      ref={ref}
      className={cn('transition-transform duration-500', className)}
    >
      {children}
    </div>
  )
}
