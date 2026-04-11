import { useNavigate } from 'react-router-dom'
import OnButton from '../assets/Components/OnButton.svg'
import myImage from '../assets/Components/Start.svg'

function Start() {
  const navigate = useNavigate()
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundImage: `url(${myImage})`, 
      backgroundSize: '100% 100%',       
      position: 'relative'
    }}>
      
      {}
      <button 
        onClick={() => navigate('/Page2')} 
        style={{ 
          position: 'absolute', 
          left: '126px',   
          top: '681px',       
          padding: 0,       
          background: 'none', 
          border: 'none', 
          cursor: 'pointer' 
        }}
      >
        
        <img src={OnButton} alt="다음으로 이동" style={{ width: '150px' }} />
      </button>

    </div>
  )
}

export default Start