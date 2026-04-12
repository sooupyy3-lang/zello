
import myImage from '../assets/Components/Home.png'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { getToken, getUserId } from '../api'

function Home() {
     const navigate = useNavigate()
     useEffect(() => {
        const timer = setTimeout(() => {
          const token = getToken()
          const userId = getUserId()
          if (token && userId) {
            navigate('/Page3')   // 기존 유저 → 바로 메인으로
          } else {
            navigate('/Start')   // 처음 방문 → 온보딩으로
          }
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
