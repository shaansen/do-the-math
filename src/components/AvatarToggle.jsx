import './AvatarToggle.css'
import { createAvatar } from '@dicebear/core'
import { micah } from '@dicebear/collection'

function AvatarToggle({ assignment, person1Name, person2Name, onClick }) {
  // Create avatars for each person using their names as seeds for consistency
  const avatar1 = createAvatar(micah, {
    seed: 'Destiny',
    baseColor: ['ac6651'],
    hairColor: ['000000']
  })

  const avatar2 = createAvatar(micah, {
    seed: 'Alexander',
    baseColor: ['f9b9c6'],
    hairColor: ['f4d140'],
    mouth: ['nervous']
  })

  const getAvatars = () => {
    const avatar1Svg = avatar1.toString()
    const avatar2Svg = avatar2.toString()
    
    if (assignment === 'person1') {
      return (
        <div className="avatar-single">
          <div 
            className="avatar avatar-person1" 
            title={person1Name}
            dangerouslySetInnerHTML={{ __html: avatar1Svg }}
          />
        </div>
      )
    } else if (assignment === 'person2') {
      return (
        <div className="avatar-single">
          <div 
            className="avatar avatar-person2" 
            title={person2Name}
            dangerouslySetInnerHTML={{ __html: avatar2Svg }}
          />
        </div>
      )
    } else {
      return (
        <div className="avatar-both">
          <div 
            className="avatar avatar-person1" 
            title={person1Name}
            dangerouslySetInnerHTML={{ __html: avatar1Svg }}
          />
          <div 
            className="avatar avatar-person2" 
            title={person2Name}
            dangerouslySetInnerHTML={{ __html: avatar2Svg }}
          />
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

