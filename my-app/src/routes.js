/* eslint-disable react/jsx-no-bind */
//import {
  //Routes,
  //Route,
  //Button
//} from 'react';
import {
  useRoutes,
  //useNavigate,
  //Outlet
} from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import SamplePage1 from "./pages/SamplePage1.tsx";
import SamplePage2 from "./pages/SamplePage2";
import SamplePage3 from "./pages/SamplePage3.tsx";

// function Top() {
//   const navigate = useNavigate();
//   return (
//     <>
//       <h2>ログイン画面</h2>
//       <Button onClick={() => navigate("/home")}>ログイン</Button>
//       <hr/>
//     </>
//   );
// }

// function Home2() {
//   const navigate = useNavigate();
//   return (
//     <>
//       <h2>ホーム画面</h2>
//       <table>
//         <tbody>
//           <tr>
//             <td>
//             </td>
//           </tr>
//           <tr>
//             <td>
//             </td>
//             <td>
//             </td>
//           </tr>
//         </ tbody>
//       </ table>
//       <Button onClick={() => navigate("/home")}>ログイン</Button>
//       <Outlet />
//       <hr/>
//     </>
//   );
// }
// const App2 = () => {
//   return (
//     <div className="App">
//       <Routes >
//         <Route path="/" element={<Top />} />
//         <Route path="/home" element={<Home />} >
//           <Route path="page1" element={<SamplePage1 />} />
//           <Route path="page2" element={<SamplePage2 />} />
//         </Route>
//       </Routes>
//     </div>
//   );
// }

export default function Router() {
  const element = useRoutes([
    {
      element: <AuthLayout />,
      children: [
        { path: "/", element: <Login /> },
        { path: "signup", element: <SignUp /> }
      ]
    },
    {
      path: '/*',
      element: <MainLayout />,
      children: [
        { path: "home/*", element: <Home />,
          children:[
            { path: "page1", element: <SamplePage1 /> },
            { path: "page2/:id", element: <SamplePage2 /> },
            { path: "page3", element: <SamplePage3 /> },
          ]},
        { path: "page11", element: <SamplePage1 /> },
        { path: "page12", element: <SamplePage2 /> },
        { path: "page13", element: <SamplePage3 /> },
        { path: "about", element: <About /> }
      ]
    }
  ]);

  return element;
}
