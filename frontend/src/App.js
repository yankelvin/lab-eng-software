import React from "react";
import { BrowserRouter } from "react-router-dom";
import Header from "./layout/Header";
import Routes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes />
    </BrowserRouter>
  );
}
