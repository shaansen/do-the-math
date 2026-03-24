import { useMemo } from 'react'
import './AvatarToggle.css'
import { createAvatar } from '@dicebear/core'
import { micah } from '@dicebear/collection'

function AvatarToggle({ assignment, person1Name, person2Name, onClick }) {
  const avatar1Svg = useMemo(() => {
    try {
      return createAvatar(micah, {
        seed: 'Destiny',
        baseColor: ['ac6651'],
        hairColor: ['000000']
      }).toString()
    } catch {
      return ''
    }
  }, [])

  const avatar2Svg = useMemo(() => {
    try {
      return createAvatar(micah, {
        seed: 'Alexander',
        baseColor: ['f9b9c6'],
        hairColor: ['f4d140'],
        mouth: ['nervous']
      }).toString()
    } catch {
      return ''
    }
  }, [])

  if (!avatar1Svg || !avatar2Svg) return null

  const renderAvatars = () => {
    if (assignment === 'person1') {
      return (
        <div className="avatar-single">
          <div className="avatar avatar-person1" title={person1Name} dangerouslySetInnerHTML={{ __html: avatar1Svg }} />
        </div>
      )
    }
    if (assignment === 'person2') {
      return (
        <div className="avatar-single">
          <div className="avatar avatar-person2" title={person2Name} dangerouslySetInnerHTML={{ __html: avatar2Svg }} />
        </div>
      )
    }
    return (
      <div className="avatar-both">
        <div className="avatar avatar-person1" title={person1Name} dangerouslySetInnerHTML={{ __html: avatar1Svg }} />
        <div className="avatar avatar-person2" title={person2Name} dangerouslySetInnerHTML={{ __html: avatar2Svg }} />
      </div>
    )
  }

  return (
    <button
      className={`avatar-toggle ${assignment}`}
      onClick={onClick}
      title={
        assignment === 'person1' ? `${person1Name} - Click to change`
          : assignment === 'person2' ? `${person2Name} - Click to change`
          : 'Both - Click to change'
      }
    >
      {renderAvatars()}
    </button>
  )
}

export default AvatarToggle
