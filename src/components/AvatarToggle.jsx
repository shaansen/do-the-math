import { useMemo } from 'react'
import './AvatarToggle.css'
import { createAvatar } from '@dicebear/core'
import { micah } from '@dicebear/collection'

function AvatarToggle({ assignment, person1Name, person2Name, onClick }) {
  // Create avatars for each person using their names as seeds for consistency (memoized)
  const avatar1Svg = useMemo(() => {
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

  const avatar2Svg = useMemo(() => {
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

  const getAvatars = () => {
    
    if (!avatar1Svg || !avatar2Svg) {
      return null
    }

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

