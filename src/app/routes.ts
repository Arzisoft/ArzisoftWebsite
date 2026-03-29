import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { ProductsPage } from "./components/ProductsPage";
import { ServicesPage } from "./components/ServicesPage";
import { AIChatPage } from "./components/AIChatPage";
import { HardwarePage } from "./components/HardwarePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "products", Component: ProductsPage },
      { path: "services", Component: ServicesPage },
      { path: "ai-chat", Component: AIChatPage },
      { path: "hardware", Component: HardwarePage },
    ],
  },
]);
