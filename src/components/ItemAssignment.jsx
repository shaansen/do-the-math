import './ItemAssignment.css'

function ItemAssignment({ items, onItemAssignment, person1Name, person2Name }) {
  return (
    <div className="item-assignment-container">
      <h2>Assign Items</h2>
      <div className="items-list">
        {items.map((item, index) => (
          <div key={index} className="item-row">
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-price">${item.price.toFixed(2)}</span>
            </div>
            <div className="assignment-buttons">
              <button
                className={`assign-btn ${item.assignment === 'person1' ? 'active' : ''}`}
                onClick={() => onItemAssignment(index, 'person1')}
              >
                {person1Name}
              </button>
              <button
                className={`assign-btn ${item.assignment === 'both' ? 'active' : ''}`}
                onClick={() => onItemAssignment(index, 'both')}
              >
                Both
              </button>
              <button
                className={`assign-btn ${item.assignment === 'person2' ? 'active' : ''}`}
                onClick={() => onItemAssignment(index, 'person2')}
              >
                {person2Name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ItemAssignment


