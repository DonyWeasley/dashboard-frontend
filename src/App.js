import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import SlipUpload from "./scenes/slipUpload";
import Invoices from "./scenes/invoices";
import Transactions from "./scenes/transactions";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import SlipResult from "./scenes/slipUpload/SlipResult";


import Login from "./scenes/auth/Login";
import Register from "./scenes/auth/Register";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);


  const [isLogin, setIsLogin] = useState(
    Boolean(localStorage.getItem("mock_user"))
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />


        {!isLogin && (
          <Routes>
            <Route path="/login" element={<Login setIsLogin={setIsLogin} />} />
            <Route path="/register" element={<Register />} />
            {/* เข้า path อื่นๆ ให้เด้งมา login */}
            <Route path="*" element={<Login setIsLogin={setIsLogin} />} />
          </Routes>
        )}

   
        {isLogin && (
          <div className="app">
            <Sidebar isSidebar={isSidebar} />
            <main className="content">
              {/* ส่ง setIsLogin ไป Topbar เพื่อทำปุ่ม Logout ได้ */}
              <Topbar setIsSidebar={setIsSidebar} setIsLogin={setIsLogin} />

              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/slip-upload" element={<SlipUpload />} />
                <Route path="/slip/result" element={<SlipResult />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/form" element={<Form />} />
                <Route path="/bar" element={<Bar />} />
                <Route path="/pie" element={<Pie />} />
                <Route path="/line" element={<Line />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/geography" element={<Geography />} />

                {/* ถ้าเข้า /login หรือ /register ตอน login แล้ว ให้กลับหน้าแรก */}
                <Route path="/login" element={<Dashboard />} />
                <Route path="/register" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;