import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Crops from "../pages/Crops";
import Expenses from "../pages/Expenses";
import Activities from "../pages/Activities";
import Profile from "../pages/Profile";
import AddCrop from "../pages/AddCrop";
import EditCrop from "../pages/EditCrop";
import CropDetails from "../pages/CropDetails";
import ProtectedRoute from "../components/ProtectedRoute";
import AddExpense from "../pages/AddExpense";
import AddActivity from "../pages/AddActivity";
import Harvests from "../pages/Harvests";
import AddHarvest from "../pages/AddHarvest";
import Reports from "../pages/Reports";
import FarmCalendar from "../pages/FarmCalendar";
import AddTask from "../pages/AddTask";
import Analytics from "../pages/Analytics";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crops"
          element={
            <ProtectedRoute>
              <Crops />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crops/add"
          element={
            <ProtectedRoute>
              <AddCrop />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crops/:id"
          element={
            <ProtectedRoute>
              <CropDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crops/:id/edit"
          element={
            <ProtectedRoute>
              <EditCrop />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
            
          }
        />
<Route
  path="/expenses/add"
  element={
    <ProtectedRoute>
      <AddExpense />
    </ProtectedRoute>
  }
/>
        <Route
          path="/activities"
          element={
            <ProtectedRoute>
              <Activities />
            </ProtectedRoute>
          }
        />
        <Route
  path="/activities/add"
  element={
    <ProtectedRoute>
      <AddActivity />
    </ProtectedRoute>
  }
/>
<Route
  path="/harvests"
  element={
    <ProtectedRoute>
      <Harvests />
    </ProtectedRoute>
  }
/>

<Route
  path="/harvests/add"
  element={
    <ProtectedRoute>
      <AddHarvest />
    </ProtectedRoute>
  }
/>

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><FarmCalendar /></ProtectedRoute>} />
          <Route path="/calendar/add" element={<ProtectedRoute><AddTask /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;