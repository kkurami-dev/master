import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Main2 from './components/react_data_list';
import Main from './components/react_data_list_detail';
import Header from './Header';
import Hello2 from './components/hello';
import Hello from './components/login';

function App() {
  //console.log(process.env);
  //let AppData = {};

  // const callAppFunc = (param) => {
  //   switch(param.func){
  //   case 'get':
  //   case 'set':
  //   case 'exec':
  //   }
  // }

  return (
    <BrowserRouter>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Main/>} />
          <Route path="hello/*" element={<Hello />} />
        </ Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
