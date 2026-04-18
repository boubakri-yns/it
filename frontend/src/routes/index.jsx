import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

const HomePage = lazy(() => import('../pages/public/HomePage'));
const MenuPage = lazy(() => import('../pages/public/MenuPage'));
const ProductPage = lazy(() => import('../pages/public/ProductPage'));
const ReservationPage = lazy(() => import('../pages/public/ReservationPage'));
const CartPage = lazy(() => import('../pages/public/CartPage'));
const CheckoutPage = lazy(() => import('../pages/public/CheckoutPage'));
const OrderChoicePage = lazy(() => import('../pages/public/OrderChoicePage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));
const RegisterPage = lazy(() => import('../pages/public/RegisterPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));

const ClientDashboardPage = lazy(() => import('../pages/client/ClientDashboardPage'));
const ProfilePage = lazy(() => import('../pages/client/ProfilePage'));
const ClientOrdersPage = lazy(() => import('../pages/client/OrdersPage'));
const ClientReservationsPage = lazy(() => import('../pages/client/ReservationsPage'));

const CookDashboardPage = lazy(() => import('../pages/cook/CookDashboardPage'));
const CookOrdersPage = lazy(() => import('../pages/cook/CookOrdersPage'));
const CookHistoryPage = lazy(() => import('../pages/cook/CookHistoryPage'));

const DeliveryDashboardPage = lazy(() => import('../pages/delivery/DeliveryDashboardPage'));
const DeliveryAvailablePage = lazy(() => import('../pages/delivery/DeliveryAvailablePage'));
const DeliveryMinePage = lazy(() => import('../pages/delivery/DeliveryMinePage'));
const DeliveryDetailPage = lazy(() => import('../pages/delivery/DeliveryDetailPage'));
const DeliveryHistoryPage = lazy(() => import('../pages/delivery/DeliveryHistoryPage'));

const ServerDashboardPage = lazy(() => import('../pages/server/ServerDashboardPage'));
const ServerReservationsPage = lazy(() => import('../pages/server/ServerReservationsPage'));
const ServerTablesPage = lazy(() => import('../pages/server/ServerTablesPage'));
const ServerReadyPage = lazy(() => import('../pages/server/ServerReadyPage'));
const ServerOnsiteOrdersPage = lazy(() => import('../pages/server/ServerOnsiteOrdersPage'));

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminTablesPage = lazy(() => import('../pages/admin/AdminTablesPage'));
const AdminReservationsPage = lazy(() => import('../pages/admin/AdminReservationsPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminPaymentsPage = lazy(() => import('../pages/admin/AdminPaymentsPage'));
const AdminDeliveriesPage = lazy(() => import('../pages/admin/AdminDeliveriesPage'));
const AdminStatsPage = lazy(() => import('../pages/admin/AdminStatsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const AdminLogsPage = lazy(() => import('../pages/admin/AdminLogsPage'));

export const appRoutes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'menu/:id', element: <ProductPage /> },
      { path: 'reservation', element: <ReservationPage /> },
      {
        element: <ProtectedRoute roles={['client']} />,
        children: [
          { path: 'panier', element: <CartPage /> },
          { path: 'commande', element: <OrderChoicePage /> },
          { path: 'paiement', element: <CheckoutPage /> },
        ],
      },
      { path: 'connexion', element: <LoginPage /> },
      { path: 'inscription', element: <RegisterPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'a-propos', element: <AboutPage /> },
    ],
  },
  {
    element: <ProtectedRoute roles={['client']} />,
    children: [
      {
        path: '/client',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <ClientDashboardPage /> },
          { path: 'profil', element: <ProfilePage /> },
          { path: 'commandes', element: <ClientOrdersPage /> },
          { path: 'reservations', element: <ClientReservationsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['cook']} />,
    children: [
      {
        path: '/cook',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <CookDashboardPage /> },
          { path: 'production', element: <CookOrdersPage /> },
          { path: 'orders', element: <CookOrdersPage /> },
          { path: 'history', element: <CookHistoryPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['delivery']} />,
    children: [
      {
        path: '/delivery',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DeliveryDashboardPage /> },
          { path: 'available', element: <DeliveryAvailablePage /> },
          { path: 'active', element: <Navigate to="/delivery/detail" replace /> },
          { path: 'mine', element: <DeliveryMinePage /> },
          { path: 'detail', element: <DeliveryDetailPage /> },
          { path: 'history', element: <DeliveryHistoryPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['server']} />,
    children: [
      {
        path: '/server',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <ServerDashboardPage /> },
          { path: 'reservations', element: <ServerReservationsPage /> },
          { path: 'tables', element: <ServerTablesPage /> },
          { path: 'ready', element: <ServerReadyPage /> },
          { path: 'onsite', element: <ServerOnsiteOrdersPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['admin']} />,
    children: [
      {
        path: '/admin',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'categories', element: <AdminCategoriesPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'tables', element: <AdminTablesPage /> },
          { path: 'reservations', element: <AdminReservationsPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'payments', element: <AdminPaymentsPage /> },
          { path: 'deliveries', element: <AdminDeliveriesPage /> },
          { path: 'stats', element: <AdminStatsPage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
          { path: 'logs', element: <AdminLogsPage /> },
        ],
      },
    ],
  },
];
