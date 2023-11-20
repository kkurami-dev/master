/* eslint-disable react/jsx-no-bind */
import {
  useState,
  useEffect,
} from 'react';
import {
  useNavigate,
  //useParams,
  //useRoutes,
  //useLocation,
  Outlet,
} from 'react-router-dom';
import {
  Box,
  Button,
} from '@mui/material';
const data = {};
export default function Home() {
  // const { id } = useParams();
  // const { data } = useRoutes();
  const [MinView, setMinView ] = useState(true);
  const [ID, setID ] = useState(0);
  const navigate = useNavigate();

  const handleClick1 = () => {
    navigate("page1", { state: {
      id: 1,
      data,
    }});
  }
  const handleClick2 = () => {
    navigate("page2/2", { state: {
      id: 2,
      data,
    }});
    setMinView(false);
  }
  const handleClick3 = () => {
    navigate("page3", { state: {
      id: 3,
      data,
    }});
  }
  const handleClick4 = () => {
    setID(ID + 1);
    console.log("Home", data);
  }
  useEffect(() => {
    console.log("Home useEffect []");
  },[]);

  return (
    <div className="App">
      <Box sx={{ display: MinView ? 'disp' : 'none' }}>
        <h1>ホームページ</h1>
        <Button onClick={handleClick1}>ページ１</Button>
        <Button onClick={handleClick2}>ページ２</Button>
        <Button onClick={handleClick3}>ページ３</Button>
        <Button onClick={handleClick4}>表示</Button>
        <hr/>
        {ID}
      </ Box>
      <Outlet />
    </div>
  );
}
