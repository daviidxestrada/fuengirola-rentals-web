import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AdminLayout, MainLayout } from "../layouts";
import {
  AdminApartmentsPage,
  AdminBlocksPage,
  AdminDashboardPage,
  AdminLoginPage,
  AdminReservationsPage,
  ApartmentDetailPage,
  ApartmentsPage,
  HomePage,
  NotFoundPage,
  RegisterPage,
  ReservationPage,
  UserAccountPage,
} from "../pages";
import { ProtectedRoute } from "./";

function AppRouter() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route path="login" element={<AdminLoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route index element={<HomePage />} />
                <Route path="apartments" element={<ApartmentsPage />} />
                <Route path="apartments/:id" element={<ApartmentDetailPage />} />
                <Route path="account" element={<ProtectedRoute><UserAccountPage /></ProtectedRoute>} />
                <Route path="reserve" element={<ReservationPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route
                path="/admin"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboardPage />} />
                <Route path="apartments" element={<AdminApartmentsPage />} />
                <Route path="reservations" element={<AdminReservationsPage />} />
                <Route path="blocks" element={<AdminBlocksPage />} />
            </Route>
        </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;
