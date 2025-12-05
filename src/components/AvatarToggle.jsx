import './AvatarToggle.css'

function AvatarToggle({ assignment, person1Name, person2Name, onClick }) {
  const getAvatars = () => {
    if (assignment === 'person1') {
      return (
        <div className="avatar-single">
          <div className="avatar avatar-person1" title={person1Name}>
            👤🏽
          </div>
        </div>
      )
    } else if (assignment === 'person2') {
      return (
        <div className="avatar-single">
          <div className="avatar avatar-person2" title={person2Name}>
            👩🏻
          </div>
        </div>
      )
    } else {
      return (
        <div className="avatar-both">
          <div className="avatar avatar-person1" title={person1Name}>
            👤🏽
          </div>
          <div className="avatar avatar-person2" title={person2Name}>
            👩🏻
          </div>
        </div>
      )
    }
  }

  return (
    <button
      className={`avatar-toggle ${assignment}`}
      onClick={onClick}
      title={
        assignment === 'person1'
          ? `${person1Name} - Click to change`
          : assignment === 'person2'
          ? `${person2Name} - Click to change`
          : `Both - Click to change`
      }
    >
      {getAvatars()}
    </button>
  )
}

export default AvatarToggle

