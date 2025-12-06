import { useState } from 'react'
import ImageUpload from './components/ImageUpload'
import VisualBillSplitter from './components/VisualBillSplitter'
import { createAvatar } from '@dicebear/core'
import { micah } from '@dicebear/collection'
import './App.css'

function App() {
  const [billImage, setBillImage] = useState(null)
  const [billItems, setBillItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)
  const [person1Name, setPerson1Name] = useState('Shantanu')
  const [person2Name, setPerson2Name] = useState('Charlie')

  const handleImageSelect = (image) => {
    setBillImage(image)
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
    setBillItems([])
    setSubtotal(0)
    setTax(0)
    setTotal(0)
  }

  // Create avatars for header
  const headerAvatar1 = createAvatar(micah, {
    seed: 'Destiny',
    baseColor: ['ac6651'],
    hairColor: ['000000']
  })

  const headerAvatar2 = createAvatar(micah, {
    seed: 'Alexander',
    baseColor: ['f9b9c6'],
    hairColor: ['f4d140'],
    mouth: ['nervous']
  })

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <div className="header-avatars">
            <div 
              className="header-avatar"
              dangerouslySetInnerHTML={{ __html: headerAvatar1.toSvg() }}
              title={person1Name}
            />
            <div 
              className="header-avatar"
              dangerouslySetInnerHTML={{ __html: headerAvatar2.toSvg() }}
              title={person2Name}
            />
          </div>
          Bill Splitter
        </h1>
        <p>Split your bills easily with your partner</p>
      </header>

      <main className="app-main">
        {!billImage ? (
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

