import { Routes, Route } from "react-router-dom";
import { ThemeModeProvider } from "./utils/theme/ThemeModeProvider.jsx";
import ScrollToTop from "./components/common/ScrollToTop.jsx";

// User store
import UserLayout from "./layouts/UserLayout.jsx";
import Home from "./pages/home/Home.jsx";
import About from "./pages/about/About.jsx";
import Blog from "./pages/blog/Blog.jsx";
import BlogDetails from "./pages/blog/BlogDetails.jsx";
import Accessories from "./pages/accessories/Accessories.jsx";
import Cart from "./pages/cart/Cart.jsx";
import CategoryPage from "./pages/categoryPage/CategoryPage.jsx";
import Favorites from "./pages/favorites/Favorites.jsx";
import ProductDetails from "./pages/productDetails/ProductDetails.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Contact from "./pages/contact/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import { RequireAuth, RequireAdmin } from "./routes/guards.jsx";

// Admin (bgadmin)
import AdminLayout from "./admin/layouts/AdminLayout.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import AdminProducts from "./admin/pages/Products.jsx";
import AdminCategories from "./admin/pages/Categories.jsx";
import AdminOrders from "./admin/pages/Orders.jsx";
import AdminBlogs from "./admin/pages/Blogs.jsx";
import AdminUsers from "./admin/pages/Users.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ---------- store pages ---------- */}
        <Route
          element={
            <ThemeModeProvider variant="user">
              <UserLayout />
            </ThemeModeProvider>
          }
        >
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogDetails />} />
          <Route path="accessories" element={<Accessories />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="product/:slug" element={<ProductDetails />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* pages that require authentication */}
          <Route element={<RequireAuth />}>
            <Route path="cart" element={<Cart />} />
            <Route path="favorites" element={<Favorites />} />
          </Route>
        </Route>

        {/* ---------- admin panel (different theme) ---------- */}
        <Route
          element={
            <ThemeModeProvider variant="admin">
              <Routes>
                <Route path="login" element={<AdminLogin />} />
                <Route element={<RequireAdmin />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>
                </Route>
              </Routes>
            </ThemeModeProvider>
          }
          path="bgadmin/*"
        />
        {/* ---------- fallback ---------- */}
        <Route
          path="*"
          element={
            <ThemeModeProvider variant="user">
              <UserLayout />
            </ThemeModeProvider>
          }
        >
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
