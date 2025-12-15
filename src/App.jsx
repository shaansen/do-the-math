import { useState, useMemo } from 'react'
import ImageUpload from './components/ImageUpload'
import VisualBillSplitter from './components/VisualBillSplitter'
import { createAvatar } from '@dicebear/core'
import { micah } from '@dicebear/collection'
import './App.css'

function App() {
  const [billImage, setBillImage] = useState(null)
  const [entryMode, setEntryMode] = useState(null) // null, 'image', or 'manual'
  const [billItems, setBillItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)
  const [person1Name, setPerson1Name] = useState('Shantanu')
  const [person2Name, setPerson2Name] = useState('Charlie')

  const handleImageSelect = (image) => {
    setBillImage(image)
    setEntryMode('image')
    setBillItems([])
    setSubtotal(0)
    setTax(0)
    setTotal(0)
  }

  const handleManualEntry = () => {
    setBillImage(null)
    setEntryMode('manual')
    setBillItems([])
    setSubtotal(0)
    setTax(0)
    setTotal(0)
  }

  const handleItemsReady = (items, subtotalAmount, taxAmount, totalAmount) => {
    setBillItems(items)
    setSubtotal(subtotalAmount)
    setTax(taxAmount)
    setTotal(totalAmount)
  }

  const resetBill = () => {
    setBillImage(null)
    setEntryMode(null)
    setBillItems([])
    setSubtotal(0)
    setTax(0)
    setTotal(0)
  }

  // Create avatars for header (memoized to avoid recreating on every render)
  const headerAvatar1Svg = useMemo(() => {
    try {
      const avatar = createAvatar(micah, {
        seed: 'Destiny',
        baseColor: ['ac6651'],
        hairColor: ['000000']
      })
      return avatar.toString()
    } catch (error) {
      console.error('Error creating avatar 1:', error)
      return ''
    }
  }, [])

  const headerAvatar2Svg = useMemo(() => {
    try {
      const avatar = createAvatar(micah, {
        seed: 'Alexander',
        baseColor: ['f9b9c6'],
        hairColor: ['f4d140'],
        mouth: ['nervous']
      })
      return avatar.toString()
    } catch (error) {
      console.error('Error creating avatar 2:', error)
      return ''
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          {headerAvatar1Svg && headerAvatar2Svg && (
            <div className="header-avatars">
              <div 
                className="header-avatar"
                dangerouslySetInnerHTML={{ __html: headerAvatar1Svg }}
                title={person1Name}
              />
              <div 
                className="header-avatar"
                dangerouslySetInnerHTML={{ __html: headerAvatar2Svg }}
                title={person2Name}
              />
            </div>
          )}
          Do the math
        </h1>
        <p>Help Charlie and Shantanu split bills</p>
      </header>

      <main className="app-main">
        {!entryMode ? (
          <div className="entry-mode-selector">
            <div className="mode-selection-card">
              <h2>How would you like to split your bill?</h2>
              <div className="mode-buttons">
                <button 
                  className="mode-button image-mode-button"
                  onClick={() => {
                    // This will show ImageUpload component
                    setEntryMode('image')
                  }}
                >
                  <div className="mode-icon">📸</div>
                  <div className="mode-title">Upload Image</div>
                  <div className="mode-description">Take a photo or upload a bill image</div>
                </button>
                <button 
                  className="mode-button manual-mode-button"
                  onClick={handleManualEntry}
                >
                  <div className="mode-icon">✏️</div>
                  <div className="mode-title">Enter Manually</div>
                  <div className="mode-description">Add all items manually</div>
                </button>
              </div>
            </div>
          </div>
        ) : entryMode === 'image' && !billImage ? (
          <ImageUpload
            onImageSelect={handleImageSelect}
            skipAutoProcess={true}
          />
        ) : (
          <div className="bill-container">
            <VisualBillSplitter
              billImage={billImage}
              onItemsReady={handleItemsReady}
              person1Name={person1Name}
              person2Name={person2Name}
              onReset={resetBill}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

