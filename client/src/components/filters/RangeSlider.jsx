import { useState, useEffect, useRef } from 'react'

/**
 * RangeSlider - Dual thumb range slider component
 * 
 * Props:
 * - min: minimum value (default 0)
 * - max: maximum value (default 100)
 * - step: step value (default 1)
 * - minValue: current min value
 * - maxValue: current max value
 * - onChange: callback({ min, max })
 * - prefix: prefix for display (e.g., "$")
 * - suffix: suffix for display (e.g., " cm")
 */

function RangeSlider({ 
  min = 0, 
  max = 100, 
  step = 1,
  minValue,
  maxValue,
  onChange,
  prefix = '',
  suffix = ''
}) {
  const [minVal, setMinVal] = useState(minValue || min)
  const [maxVal, setMaxVal] = useState(maxValue || max)
  const minValRef = useRef(minValue || min)
  const maxValRef = useRef(maxValue || max)
  const range = useRef(null)

  // Convert value to percentage
  const getPercent = (value) => {
    return Math.round(((value - min) / (max - min)) * 100)
  }

  // Update range fill when min changes
  useEffect(() => {
    const minPercent = getPercent(minVal)
    const maxPercent = getPercent(maxValRef.current)

    if (range.current) {
      range.current.style.left = `${minPercent}%`
      range.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [minVal, min, max])

  // Update range fill when max changes
  useEffect(() => {
    const minPercent = getPercent(minValRef.current)
    const maxPercent = getPercent(maxVal)

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [maxVal, min, max])

  // Sync with parent props
  useEffect(() => {
    if (minValue !== undefined && minValue !== minVal) {
      setMinVal(minValue)
      minValRef.current = minValue
    }
    if (maxValue !== undefined && maxValue !== maxVal) {
      setMaxVal(maxValue)
      maxValRef.current = maxValue
    }
  }, [minValue, maxValue])

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxVal - step)
    setMinVal(value)
    minValRef.current = value
  }

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minVal + step)
    setMaxVal(value)
    maxValRef.current = value
  }

  const handleMouseUp = () => {
    onChange({ min: minVal, max: maxVal })
  }

  return (
    <div className="range-slider">
      {/* Slider track */}
      <div className="slider-track">
        <div ref={range} className="slider-range"></div>
      </div>

      {/* Min thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="thumb thumb-min"
      />

      {/* Max thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="thumb thumb-max"
      />

      {/* Values display */}
      <div className="slider-values">
        <span>{prefix}{minVal}{suffix}</span>
        <span>{prefix}{maxVal}{suffix}</span>
      </div>
    </div>
  )
}

export default RangeSlider
