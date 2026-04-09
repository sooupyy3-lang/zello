
import myImage from '../assets/Components/Home.png'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function Home() {
     const navigate = useNavigate()
     useEffect(() => {
        const timer = setTimeout(() => {
      navigate('/Start')
    }, 2000)
    return () => clearTimeout(timer)
  })
  return (
    <div>
  
      <img src={myImage} alt="홈화면" />
      
    </div>
  );
}

export default Home